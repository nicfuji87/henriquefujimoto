import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Newspaper } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import SectionHeading from './SectionHeading';

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

    if (loading || posts.length === 0) return null;

    const [featured, ...others] = posts;
    const dateOf = (p: BlogPost) => new Date(p.published_at || p.created_at).toLocaleDateString('pt-BR');

    return (
        <section className="bg-night px-6 py-20 md:py-28">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <SectionHeading
                        title={<>Notícias e <span className="font-editorial font-normal italic text-lime">conteúdo</span></>}
                        lead="Novidades, guias e informações sobre o mundo do judô — e as atualizações da trajetória do Henrique, para quem quer entender o esporte por dentro."
                    />
                    <Link to="/blog" className="group inline-flex items-center gap-2 font-grotesk text-sm font-semibold text-lime transition-colors hover:text-lime-dim">
                        Ver todos
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                        <Link to={`/blog/${featured.slug}`} className="group block overflow-hidden rounded-3xl border border-white/[0.07] bg-coal transition-colors hover:border-lime/25">
                            <div className="aspect-[16/9] overflow-hidden bg-coal-2">
                                {featured.og_image && <img src={featured.og_image} alt={featured.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                            </div>
                            <div className="p-6">
                                {featured.category && <span className="font-grotesk text-[11px] font-semibold uppercase tracking-[0.1em] text-lime">{featured.category}</span>}
                                <h3 className="mt-2 font-grotesk text-xl font-semibold leading-snug text-white transition-colors group-hover:text-lime">{featured.title}</h3>
                                <div className="mt-3 flex items-center gap-3 font-grotesk text-[11px] text-white/40">
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{dateOf(featured)}</span>
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{featured.reading_time || 5} min</span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    <div className="flex flex-col gap-4">
                        {others.length > 0 ? others.map((p, i) => (
                            <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }} className="flex-1">
                                <Link to={`/blog/${p.slug}`} className="group flex h-full items-center gap-4 overflow-hidden rounded-3xl border border-white/[0.07] bg-coal p-4 transition-colors hover:border-lime/25">
                                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-coal-2">
                                        {p.og_image && <img src={p.og_image} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        {p.category && <span className="font-grotesk text-[10px] font-semibold uppercase tracking-wide text-lime/80">{p.category}</span>}
                                        <h4 className="mt-1 line-clamp-2 font-grotesk text-sm font-semibold leading-tight text-white transition-colors group-hover:text-lime">{p.title}</h4>
                                        <div className="mt-2 flex items-center gap-3 font-grotesk text-[10px] text-white/40">
                                            <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" />{dateOf(p)}</span>
                                            <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{p.reading_time || 5} min</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )) : (
                            <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-white/10 p-8 text-center">
                                <div className="flex items-center gap-2 font-grotesk text-sm text-white/40"><Newspaper className="h-4 w-4" />Mais posts em breve.</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
