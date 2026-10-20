import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { hfKicker, hfLead, hfLink, hfTitle } from '../ui/hf';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    og_image: string | null;
    category: string;
    published_at: string | null;
    created_at: string;
    reading_time: number;
}

export default function BlogTeaser() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const { data } = await supabase
                .from('blog_posts')
                .select('id, title, slug, og_image, category, published_at, created_at, reading_time')
                .eq('status', 'published')
                .order('published_at', { ascending: false })
                .limit(3);
            setPosts(data || []);
            setLoading(false);
        }
        load();
    }, []);

    // Sem posts publicados a secao nao aparece.
    if (loading || posts.length === 0) return null;

    return (
        <section className="bg-hf-navy px-6 py-16 sm:py-20 md:py-24">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.6fr] lg:gap-14">
                {/* Texto */}
                <div>
                    <span className="hf-rule mb-5 block" />
                    <p className={hfKicker}>Bastidores / Rotina / Reflexões</p>
                    <h2 className={`mt-4 ${hfTitle}`}>Não coube no Reels.</h2>
                    <p className={`mt-5 max-w-md ${hfLead}`}>
                        O que não cabe em trinta segundos de vídeo fica aqui: a viagem, o treino, o que deu
                        errado na competição e o que mudou depois.
                    </p>
                    <Link to="/blog" className={`group mt-7 ${hfLink}`}>
                        Ver mais conteúdos
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {posts.map((p, i) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.45, delay: i * 0.08 }}
                        >
                            <Link
                                to={`/blog/${p.slug}`}
                                className="group relative isolate flex h-full min-h-[210px] flex-col justify-end overflow-hidden rounded-xl border border-hf-line/70 bg-hf-surface p-5 transition-colors hover:border-hf-gold/45"
                            >
                                {p.og_image && (
                                    <>
                                        <img
                                            src={p.og_image}
                                            alt=""
                                            loading="lazy"
                                            className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-hf-navy via-hf-navy/80 to-hf-navy/25" />
                                    </>
                                )}

                                {p.category && (
                                    <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.18em] text-hf-gold">
                                        {p.category}
                                    </span>
                                )}
                                <h3 className="mt-2 font-brand text-sm font-bold uppercase leading-snug text-hf-ice">
                                    {p.title}
                                </h3>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 font-ui text-[11px] text-hf-ice/45">
                                        <Clock className="h-3 w-3" />
                                        {p.reading_time || 5} min
                                    </span>
                                    <ArrowRight className="h-4 w-4 text-hf-ice/60 transition-all group-hover:translate-x-1 group-hover:text-hf-gold" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}