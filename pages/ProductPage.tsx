import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, ExternalLink, ShoppingBag, Star, Heart, Shield,
    Instagram, Share2, ChevronRight, Award, CheckCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { analytics } from '../lib/analytics';

interface TrackingEventData {
    id: string;
    event_name: string;
    is_standard_meta: boolean;
    meta_params: Record<string, any>;
    ga4_params: Record<string, any>;
}

interface Product {
    id: string;
    name: string;
    description: string | null;
    extended_description: string | null;
    image_url: string | null;
    affiliate_url: string;
    badge: string | null;
    slug: string;
    price: string | null;
    instagram_url: string | null;
    meta_title: string | null;
    meta_description: string | null;
    tracking_events: TrackingEventData | null;
}

function renderSimpleMarkdown(md: string): string {
    return md
        .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-white mt-6 mb-2">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-8 mb-3">$1</h2>')
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em class="text-zinc-300">$1</em>')
        .replace(/^- (.+)$/gm, '<li class="ml-4 text-zinc-300 leading-relaxed flex items-start gap-2"><span class="text-emerald-400 mt-1">✓</span><span>$1</span></li>')
        .replace(/\n\n/g, '</p><p class="text-zinc-300 leading-relaxed mb-3">')
        .replace(/^/, '<p class="text-zinc-300 leading-relaxed mb-3">')
        .replace(/$/, '</p>')
        .replace(/(<li[^>]*>.*?<\/li>\s*)+/g, (match) =>
            '<ul class="space-y-2 my-4">' + match + '</ul>'
        );
}

export default function ProductPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [otherProducts, setOtherProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [ctaClicked, setCTAClicked] = useState(false);

    useEffect(() => {
        if (slug) fetchProduct(slug);
        window.scrollTo(0, 0);
    }, [slug]);

    async function fetchProduct(slug: string) {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('affiliate_products')
                .select('id, name, description, extended_description, image_url, affiliate_url, badge, slug, price, instagram_url, meta_title, meta_description, tracking_events(id, event_name, is_standard_meta, meta_params, ga4_params)')
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            if (error || !data) {
                navigate('/');
                return;
            }

            // Supabase FK join returns array, normalize to single object
            const normalized = {
                ...data,
                tracking_events: Array.isArray(data.tracking_events) ? data.tracking_events[0] || null : data.tracking_events,
            };

            setProduct(normalized as Product);

            // SEO
            document.title = data.meta_title || `${data.name} — Henrique Fujimoto`;
            setMetaTag('description', data.meta_description || data.description || '');
            setOGTag('og:title', data.meta_title || data.name);
            setOGTag('og:description', data.meta_description || data.description || '');
            setOGTag('og:type', 'product');
            setOGTag('og:url', `https://henriquefujimoto.com.br/produto/${data.slug}`);
            if (data.image_url) setOGTag('og:image', data.image_url);

            // JSON-LD Product
            addJsonLd(data);

            // Track ViewContent (Meta standard event)
            analytics.trackEvent('ViewContent', {
                content_name: data.name,
                content_ids: [data.id],
                content_type: 'product',
                value: data.price ? parseFloat(data.price.replace(/[^\d.,]/g, '').replace(',', '.')) : 0,
                currency: 'BRL',
            });

            // Fetch other products
            const { data: others } = await supabase
                .from('affiliate_products')
                .select('id, name, description, image_url, affiliate_url, badge, slug, price, instagram_url, meta_title, meta_description, tracking_events(id, event_name, is_standard_meta, meta_params, ga4_params)')
                .eq('is_active', true)
                .neq('id', data.id)
                .order('display_order', { ascending: true })
                .limit(4);

            setOtherProducts(others || []);
        } catch (err) {
            console.error('Error fetching product:', err);
            navigate('/');
        } finally {
            setLoading(false);
        }
    }

    function setMetaTag(name: string, content: string) {
        let el = document.querySelector(`meta[name="${name}"]`);
        if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
        el.setAttribute('content', content);
    }

    function setOGTag(property: string, content: string) {
        let el = document.querySelector(`meta[property="${property}"]`);
        if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
        el.setAttribute('content', content);
    }

    function addJsonLd(p: Product) {
        const existing = document.querySelector('#product-jsonld');
        if (existing) existing.remove();

        const script = document.createElement('script');
        script.id = 'product-jsonld';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": p.name,
            "description": p.meta_description || p.description || '',
            "image": p.image_url || '',
            "url": `https://henriquefujimoto.com.br/produto/${p.slug}`,
            "brand": { "@type": "Person", "name": "Henrique Fujimoto" },
            ...(p.price ? {
                "offers": {
                    "@type": "Offer",
                    "price": p.price.replace(/[^\d.,]/g, '').replace(',', '.'),
                    "priceCurrency": "BRL",
                    "availability": "https://schema.org/InStock",
                    "url": p.affiliate_url
                }
            } : {}),
        });
        document.head.appendChild(script);
    }

    function handleBuyClick() {
        if (!product) return;

        setCTAClicked(true);

        // Track the click
        if (product.tracking_events) {
            analytics.trackDynamicEvent(product.tracking_events, {
                product_name: product.name,
                product_id: product.id,
            }, {
                source_type: 'product',
                source_id: product.id,
                source_label: product.name,
            });
        } else {
            analytics.trackAffiliateClick(product.name, product.id);
        }

        // Supabase RPC
        supabase.rpc('track_affiliate_click', {
            p_product_id: product.id,
            p_referrer: document.referrer || null,
            p_user_agent: navigator.userAgent || null,
        }).then(() => { });

        // Open affiliate link
        window.open(product.affiliate_url, '_blank');
    }

    function handleShare() {
        if (navigator.share) {
            navigator.share({ title: product?.name, text: product?.description || '', url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            {/* Top Bar */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/[0.06]">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Voltar</span>
                    </Link>
                    <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 text-zinc-400 hover:text-white border border-white/[0.08] rounded-lg text-sm transition-colors">
                        <Share2 className="w-3.5 h-3.5" />
                        Compartilhar
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="max-w-5xl mx-auto px-4 pt-6 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Product Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative"
                    >
                        <div className="aspect-square rounded-3xl overflow-hidden bg-white/[0.03] border border-white/[0.06] shadow-2xl">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag className="w-20 h-20 text-zinc-700" />
                                </div>
                            )}
                        </div>
                        {product.badge && (
                            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/90 backdrop-blur rounded-full text-xs font-bold text-white shadow-lg">
                                <Star className="w-3 h-3" />
                                {product.badge}
                            </div>
                        )}
                    </motion.div>

                    {/* Product Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col gap-5"
                    >
                        {/* Trust badge */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-wider w-fit">
                            <Award className="w-3 h-3" />
                            Recomendado por Henrique Fujimoto
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                            {product.name}
                        </h1>

                        {product.description && (
                            <p className="text-zinc-400 text-base leading-relaxed">
                                {product.description}
                            </p>
                        )}

                        {product.price && (
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-emerald-400">{product.price}</span>
                                <span className="text-sm text-zinc-500">no Mercado Livre</span>
                            </div>
                        )}

                        {/* Trust Points */}
                        <div className="space-y-2.5 py-3">
                            {[
                                'Produto que eu uso nos meus treinos',
                                'Compra segura pelo Mercado Livre',
                                'Você me apoia comprando por esse link',
                            ].map((text, i) => (
                                <div key={i} className="flex items-center gap-2.5 text-sm text-zinc-300">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                    {text}
                                </div>
                            ))}
                        </div>

                        {/* CTA Button */}
                        <motion.button
                            onClick={handleBuyClick}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`group flex items-center justify-center gap-3 w-full px-8 py-5 rounded-2xl font-bold text-lg transition-all shadow-xl ${ctaClicked
                                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                                : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-emerald-500/20 hover:shadow-emerald-500/40'
                                }`}
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {ctaClicked ? 'Aberto! Clique novamente se precisar' : 'Comprar no Mercado Livre'}
                            <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </motion.button>

                        <div className="flex items-center gap-1.5 justify-center text-[11px] text-zinc-600">
                            <Heart className="w-3 h-3 text-pink-400/50" />
                            Cada compra é um apoio direto ao meu sonho olímpico
                        </div>

                        {/* Instagram link */}
                        {product.instagram_url && (
                            <a
                                href={product.instagram_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all text-sm"
                            >
                                <Instagram className="w-5 h-5 text-pink-400" />
                                <span className="text-zinc-300">Veja meu review no Instagram</span>
                                <ChevronRight className="w-4 h-4 text-zinc-500 ml-auto" />
                            </a>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Extended Description */}
            {product.extended_description && (
                <section className="max-w-3xl mx-auto px-4 py-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-emerald-400" />
                            Por que eu recomendo
                        </h2>
                        <div
                            className="prose prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(product.extended_description) }}
                        />
                    </motion.div>
                </section>
            )}

            {/* Second CTA (after description) */}
            <section className="max-w-3xl mx-auto px-4 pb-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-center"
                >
                    <p className="text-white font-semibold mb-2">Pronto para garantir o seu?</p>
                    <p className="text-zinc-400 text-sm mb-5">Compra segura pelo Mercado Livre com frete para todo o Brasil</p>
                    <button
                        onClick={handleBuyClick}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-black rounded-2xl font-bold hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        Comprar Agora
                        <ExternalLink className="w-4 h-4" />
                    </button>
                </motion.div>
            </section>

            {/* Other Products */}
            {otherProducts.length > 0 && (
                <section className="max-w-5xl mx-auto px-4 py-10 border-t border-white/[0.06]">
                    <h2 className="text-xl font-bold text-white mb-6">Veja também</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {otherProducts.map((other, index) => (
                            <motion.div
                                key={other.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    to={`/produto/${other.slug}`}
                                    className="group block bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all"
                                >
                                    <div className="aspect-square bg-white/[0.02] overflow-hidden">
                                        {other.image_url ? (
                                            <img src={other.image_url} alt={other.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ShoppingBag className="w-8 h-8 text-zinc-700" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <h4 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-emerald-300 transition-colors">{other.name}</h4>
                                        {other.price && (
                                            <p className="text-xs text-emerald-400 font-bold mt-1">{other.price}</p>
                                        )}
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="max-w-5xl mx-auto px-4 py-8 border-t border-white/[0.06] text-center">
                <p className="text-xs text-zinc-600">
                    Este é um link de afiliado. Ao comprar por aqui, você não paga nada a mais e me ajuda a continuar treinando e competindo.
                </p>
                <Link to="/" className="inline-flex items-center gap-1 mt-3 text-xs text-zinc-500 hover:text-white transition-colors">
                    <ArrowLeft className="w-3 h-3" />
                    Voltar para henriquefujimoto.com.br
                </Link>
            </footer>
        </div>
    );
}
