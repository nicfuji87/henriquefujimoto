import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ExternalLink, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface AffiliateProduct {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    affiliate_url: string;
    badge: string | null;
    slug: string | null;
    display_order: number;
}

export default function AffiliateProducts() {
    const [products, setProducts] = useState<AffiliateProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const { data } = await supabase
                    .from('affiliate_products')
                    .select('id, name, description, image_url, affiliate_url, badge, slug, display_order')
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
        <section className="bg-night px-6 py-20 md:py-28">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-10"
                >
                    <h2 className="font-grotesk text-[2rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-[2.75rem]">
                        Meus produtos <span className="font-editorial font-normal italic text-lime">favoritos</span>
                    </h2>
                    <p className="mx-auto mt-5 max-w-xl font-grotesk text-base leading-relaxed text-white/60 sm:text-lg">
                        Esses são os produtos que uso no meu dia a dia de treino e competição. Ao comprar pelos links abaixo, além de garantir qualidade, você me ajuda diretamente na minha carreira — eu recebo uma comissão por cada compra.
                    </p>
                </motion.div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((product, index) => {
                        const hasLandingPage = !!product.slug;
                        const content = (
                            <>
                                {/* Badge */}
                                {product.badge && (
                                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-0.5 bg-lime rounded-full font-grotesk text-[10px] font-semibold text-night">
                                        <Star className="w-2.5 h-2.5" />
                                        {product.badge}
                                    </div>
                                )}

                                {/* Image */}
                                <div className="aspect-square bg-coal-2 flex items-center justify-center overflow-hidden">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <ShoppingBag className="w-10 h-10 text-white/15" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <h4 className="font-grotesk text-sm font-semibold text-white line-clamp-2 leading-tight mb-1 group-hover:text-lime transition-colors">
                                        {product.name}
                                    </h4>
                                    {product.description && (
                                        <p className="font-grotesk text-[11px] text-white/45 line-clamp-2 mb-2">
                                            {product.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-1 text-lime font-grotesk text-[11px] font-semibold group-hover:gap-2 transition-all">
                                        {hasLandingPage ? 'Ver detalhes' : 'Comprar'}
                                        <ExternalLink className="w-3 h-3" />
                                    </div>
                                </div>
                            </>
                        );

                        const cardClasses = "group relative bg-coal border border-white/[0.07] rounded-3xl overflow-hidden transition-all duration-300 hover:border-lime/30";

                        if (hasLandingPage) {
                            return (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                >
                                    <Link to={`/produto/${product.slug}`} className={cardClasses}>
                                        {content}
                                    </Link>
                                </motion.div>
                            );
                        }

                        return (
                            <motion.a
                                key={product.id}
                                href={product.affiliate_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                className={cardClasses}
                            >
                                {content}
                            </motion.a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
