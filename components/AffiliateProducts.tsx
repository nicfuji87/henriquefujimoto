import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ExternalLink, Star, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { analytics } from '../lib/analytics';

interface TrackingEventData {
    id: string;
    event_name: string;
    is_standard_meta: boolean;
    meta_params: Record<string, any>;
    ga4_params: Record<string, any>;
}

interface AffiliateProduct {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    affiliate_url: string;
    badge: string | null;
    display_order: number;
    tracking_events: TrackingEventData | null;
}

function trackClick(product: AffiliateProduct) {
    try {
        if (product.tracking_events) {
            // Disparo dinâmico com evento personalizado
            analytics.trackDynamicEvent(product.tracking_events, {
                product_name: product.name,
                product_id: product.id,
            }, {
                source_type: 'product',
                source_id: product.id,
                source_label: product.name,
            });
        } else {
            // Fallback: evento padrão (já loga no Supabase internamente)
            analytics.trackAffiliateClick(product.name, product.id);
        }

        // Disparo interno no Supabase
        supabase.rpc('track_affiliate_click', {
            p_product_id: product.id,
            p_referrer: document.referrer || null,
            p_user_agent: navigator.userAgent || null,
        }).then(() => { });
    } catch (_) {
        // fire-and-forget, don't block the user
    }
}

export default function AffiliateProducts() {
    const [products, setProducts] = useState<AffiliateProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const { data } = await supabase
                    .from('affiliate_products')
                    .select('id, name, description, image_url, affiliate_url, badge, display_order, tracking_events(id, event_name, is_standard_meta, meta_params, ga4_params)')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true });
                setProducts(data || []);
            } catch (err) {
                console.error('Error loading affiliate products:', err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading || products.length === 0) return null;

    return (
        <section className="py-6 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
                        <ShoppingBag className="w-3 h-3" />
                        Produtos que eu uso e recomendo
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white">
                        Meus Produtos Favoritos
                    </h3>
                    <p className="text-sm text-gray-400 mt-2 max-w-xl mx-auto">
                        Esses são os produtos que uso no meu dia a dia de treino e competição. Ao comprar pelos links abaixo, além de garantir qualidade, você me ajuda diretamente na minha carreira — eu recebo uma comissão por cada compra!
                    </p>
                    <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] text-gray-500">
                        <Heart className="w-3 h-3 text-pink-400" />
                        Cada compra é um apoio direto ao meu sonho olímpico
                    </div>
                </motion.div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((product, index) => (
                        <motion.a
                            key={product.id}
                            href={product.affiliate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackClick(product)}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className="group relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.06)]"
                        >
                            {/* Badge */}
                            {product.badge && (
                                <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 bg-emerald-500/90 backdrop-blur rounded-full text-[10px] font-bold text-white">
                                    <Star className="w-2.5 h-2.5" />
                                    {product.badge}
                                </div>
                            )}

                            {/* Image */}
                            <div className="aspect-square bg-white/[0.02] flex items-center justify-center overflow-hidden">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <ShoppingBag className="w-10 h-10 text-gray-700" />
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-3">
                                <h4 className="text-sm font-semibold text-white line-clamp-2 leading-tight mb-1 group-hover:text-emerald-300 transition-colors">
                                    {product.name}
                                </h4>
                                {product.description && (
                                    <p className="text-[11px] text-gray-500 line-clamp-2 mb-2">
                                        {product.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-bold group-hover:gap-2 transition-all">
                                    Comprar
                                    <ExternalLink className="w-3 h-3" />
                                </div>
                            </div>

                            {/* Bottom accent */}
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left bg-gradient-to-r from-emerald-500 to-teal-400" />
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
}
