import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    og_image: string | null;
    category: string;
    published_at: string | null;
    created_at: string;
    reading_time: number;
}

const CATEGORY_LABELS: Record<string, string> = {
    'judô': '🥋 Judô',
    'treino': '💪 Treino',
    'competição': '🏆 Competição',
    'nutrição': '🥗 Nutrição',
    'vida-de-atleta': '🌟 Vida de Atleta',
    'notícias': '📰 Notícias',
    'geral': '📝 Geral',
};

export default function LatestPosts() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLatestPosts();
    }, []);

    async function fetchLatestPosts() {
        try {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('id, title, slug, excerpt, og_image, category, published_at, created_at, reading_time')
                .eq('status', 'published')
                .order('published_at', { ascending: false })
                .limit(3);

            if (error) throw error;
            setPosts(data || []);
        } catch (err) {
            console.error('Error fetching latest posts:', err);
        } finally {
            setLoading(false);
        }
    }

    if (!loading && posts.length === 0) return null;

    return (
        <section className="py-20 px-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-black" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-primary text-xs font-bold uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            Atualizações
                        </div>
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
                            Blog & <span className="text-primary">Notícias</span>
                        </h2>
                        <p className="text-zinc-400 text-lg max-w-xl">
                            Fique por dentro das últimas novidades sobre o mundo do judô, dicas de treino e análises técnicas.
                        </p>
                    </div>

                    <Link
                        to="/blog"
                        className="hidden md:flex items-center gap-2 px-6 py-3 bg-zinc-900/50 border border-zinc-800 rounded-full text-white font-medium hover:bg-zinc-800 hover:border-primary/50 transition-all group"
                    >
                        Ver todos os posts
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="aspect-[4/5] md:aspect-auto md:h-[400px] bg-zinc-900/50 rounded-2xl border border-zinc-800 animate-pulse" />
                        ))
                    ) : (
                        posts.map((post, index) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link
                                    to={`/blog/${post.slug}`}
                                    className="group block relative h-[400px] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-primary/50 transition-all duration-500"
                                >
                                    {/* Image Background */}
                                    <div className="absolute inset-0">
                                        {post.og_image ? (
                                            <img
                                                src={post.og_image}
                                                alt={post.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-zinc-800 opacity-50" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                                    </div>

                                    {/* Content Overlay */}
                                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            {/* Meta */}
                                            <div className="flex items-center gap-3 text-xs text-zinc-400 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                                <span className="bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/20">
                                                    {CATEGORY_LABELS[post.category.toLowerCase()] || 'Geral'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(post.published_at || post.created_at).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 className="font-display text-2xl font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                                {post.title}
                                            </h3>

                                            {/* Excerpt */}
                                            <p className="text-zinc-400 text-sm line-clamp-2 mb-4 opacity-0 h-0 group-hover:opacity-100 group-hover:h-auto transition-all duration-300">
                                                {post.excerpt}
                                            </p>

                                            {/* Read More Link */}
                                            <div className="flex items-center gap-2 text-primary font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                                                Ler artigo completo
                                                <ChevronRight className="w-4 h4" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))
                    )}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-full text-white font-medium shadow-lg"
                    >
                        Ver todos os posts
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
