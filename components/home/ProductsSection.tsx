import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, ExternalLink, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import SectionHeading from './SectionHeading';

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

export default function ProductsSection() {
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
        <section id="produtos" className="scroll-mt-16 bg-night px-6 py-14 sm:py-20 md:py-28">
            <div className="mx-auto max-w-6xl">
                <SectionHeading
                    title={<>O que ele usa <span className="font-editorial font-normal italic text-lime">de verdade</span></>}
                    lead="Aqui não tem propaganda. São os equipamentos que fazem parte do treino do Henrique de verdade — cada item foi escolhido porque realmente é usado por ele. Comprando pelos links você não paga nada a mais e ainda ajuda diretamente."
                />

                <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {products.map((product, index) => {
                        const hasLandingPage = !!product.slug;
                        const content = (
                            <>
                                {product.badge && (
                                    <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-lime px-2 py-0.5 font-grotesk text-[10px] font-semibold text-night">
                                        <Star className="h-2.5 w-2.5" />
                                        {product.badge}
                                    </div>
                                )}
                                <div className="flex aspect-square items-center justify-center overflow-hidden bg-coal-2">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    ) : (
                                        <ShoppingBag className="h-10 w-10 text-white/15" />
                                    )}
                                </div>
                                <div className="p-4">
                                    <h4 className="mb-1 line-clamp-2 font-grotesk text-sm font-semibold leading-tight text-white transition-colors group-hover:text-lime">{product.name}</h4>
                                    {product.description && <p className="mb-2 line-clamp-2 font-grotesk text-[11px] text-white/45">{product.description}</p>}
                                    <div className="flex items-center gap-1 font-grotesk text-[11px] font-semibold text-lime transition-all group-hover:gap-2">
                                        {hasLandingPage ? 'Ver detalhes' : 'Comprar'}
                                        <ExternalLink className="h-3 w-3" />
                                    </div>
                                </div>
                            </>
                        );
                        const cardClasses = 'group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-coal transition-all duration-300 hover:border-lime/30';

                        return hasLandingPage ? (
                            <motion.div key={product.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.05 }}>
                                <Link to={`/produto/${product.slug}`} className={cardClasses}>{content}</Link>
                            </motion.div>
                        ) : (
                            <motion.a key={product.id} href={product.affiliate_url} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.05 }} className={cardClasses}>
                                {content}
                            </motion.a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
