import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, ChevronRight, User, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const CATEGORY_STYLES: Record<string, { label: string; color: string }> = {
    'judô': { label: '🥋 Judô', color: 'bg-amber-500/20 text-amber-400' },
    'treino': { label: '💪 Treino', color: 'bg-blue-500/20 text-blue-400' },
    'competição': { label: '🏆 Competição', color: 'bg-yellow-500/20 text-yellow-400' },
    'nutrição': { label: '🥗 Nutrição', color: 'bg-green-500/20 text-green-400' },
    'vida-de-atleta': { label: '🌟 Vida de Atleta', color: 'bg-purple-500/20 text-purple-400' },
    'notícias': { label: '📰 Notícias', color: 'bg-indigo-500/20 text-indigo-400' },
    'geral': { label: '📝 Geral', color: 'bg-zinc-500/20 text-zinc-400' },
};

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    meta_title: string | null;
    meta_description: string | null;
    keywords: string[];
    og_image: string | null;
    category: string;
    status: string;
    reading_time: number;
    author: string;
    created_at: string;
    published_at: string | null;
}

function PostCard({ post, index }: { post: BlogPost; index: number }) {
    const catStyle = CATEGORY_STYLES[post.category] || CATEGORY_STYLES['geral'];
    const date = new Date(post.published_at || post.created_at).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.5 }}
            className="group relative overflow-hidden rounded-2xl bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 hover:border-primary/30 transition-all duration-300"
        >
            <Link to={`/blog/${post.slug}`} className="block">
                {/* Cover Image */}
                <div className="relative h-52 overflow-hidden bg-zinc-800">
                    {post.og_image ? (
                        <img
                            src={post.og_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-violet-600/20">
                            <span className="text-4xl">📝</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />

                    {/* Category Badge */}
                    <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${catStyle.color}`}>
                        {catStyle.label}
                    </span>
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                    </h3>
                    {post.excerpt && (
                        <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
                            {post.excerpt}
                        </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{post.reading_time} min</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>Ler mais</span>
                            <ChevronRight className="w-3 h-3" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.article>
    );
}

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Update document meta
        document.title = 'Blog — Henrique Fujimoto | Judô & Alta Performance';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Blog do atleta Henrique Fujimoto. Notícias sobre judô, treino, competições e vida de atleta de alta performance.');

        fetchPosts();
    }, []);

    async function fetchPosts() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('status', 'published')
                .order('published_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (err) {
            console.error('Error fetching blog posts:', err);
        } finally {
            setLoading(false);
        }
    }

    const filteredPosts = selectedCategory
        ? posts.filter((post) => post.category === selectedCategory)
        : posts;

    // Get unique categories from actual posts
    const activeCategories = [...new Set(posts.map(p => p.category))];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-zinc-800/50">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Voltar</span>
                    </Link>

                    <h1 className="font-display text-xl font-bold text-white">
                        BLOG
                    </h1>

                    <div className="w-20" />
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative py-16 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-display text-4xl md:text-5xl font-bold text-white mb-4"
                    >
                        Blog & <span className="text-primary">Notícias</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-zinc-400 text-lg max-w-2xl mx-auto"
                    >
                        Acompanhe minha jornada no judô, resultados de torneios, dicas de treino e muito mais.
                    </motion.p>
                </div>
            </section>

            {/* Category Filter */}
            {activeCategories.length > 1 && (
                <section className="px-4 pb-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-wrap justify-center gap-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === null
                                    ? 'bg-primary text-black'
                                    : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50'
                                    }`}
                            >
                                Todos
                            </button>
                            {activeCategories.map(cat => {
                                const style = CATEGORY_STYLES[cat as keyof typeof CATEGORY_STYLES] || CATEGORY_STYLES['geral'];
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat
                                            ? 'bg-primary text-black'
                                            : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50'
                                            }`}
                                    >
                                        {style.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Posts Grid */}
            <section className="px-4 pb-20">
                <div className="max-w-6xl mx-auto">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-zinc-900/60 rounded-2xl border border-zinc-800/50 overflow-hidden animate-pulse">
                                    <div className="h-52 bg-zinc-800"></div>
                                    <div className="p-5 space-y-3">
                                        <div className="h-5 bg-zinc-800 rounded w-3/4"></div>
                                        <div className="h-4 bg-zinc-800 rounded w-full"></div>
                                        <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredPosts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPosts.map((post, index) => (
                                <PostCard key={post.id} post={post} index={index} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-zinc-500 text-lg">
                                {posts.length === 0
                                    ? 'Nenhum post publicado ainda. Em breve teremos novidades!'
                                    : 'Nenhum post encontrado nesta categoria.'}
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
