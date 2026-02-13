import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Calendar, Clock, ChevronRight, User, Tag,
    Search, TrendingUp, Sparkles, ArrowUpRight, Instagram, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// ─── Constants & Styles ──────────────────────────────────
const CATEGORY_STYLES: Record<string, { label: string; color: string; icon: string }> = {
    'judô': { label: 'Judô', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: '🥋' },
    'treino': { label: 'Treino', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: '💪' },
    'competição': { label: 'Competição', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: '🏆' },
    'nutrição': { label: 'Nutrição', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: '🥗' },
    'vida-de-atleta': { label: 'Vida de Atleta', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: '🌟' },
    'notícias': { label: 'Notícias', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', icon: '📰' },
    'geral': { label: 'Geral', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', icon: '📝' },
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

// ─── Components ──────────────────────────────────────────

function CategoryBadge({ category }: { category: string }) {
    const key = category.toLowerCase();
    const style = CATEGORY_STYLES[key] || CATEGORY_STYLES['geral'];

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${style.color}`}>
            <span>{style.icon}</span>
            {style.label}
        </span>
    );
}

function FeaturedPost({ post }: { post: BlogPost }) {
    const date = new Date(post.published_at || post.created_at).toLocaleDateString('pt-BR', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-4 md:p-6 hover:border-primary/20 transition-all duration-500"
        >
            {/* Image Side */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-2xl">
                <Link to={`/blog/${post.slug}`}>
                    {post.og_image ? (
                        <img
                            src={post.og_image}
                            alt={post.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                            <Sparkles className="w-12 h-12 text-zinc-700" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                </Link>
                <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-primary text-black text-xs font-bold rounded-full flex items-center gap-1 shadow-lg shadow-primary/20">
                            <Sparkles className="w-3 h-3" />
                            Destaque
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Side */}
            <div className="space-y-4 md:py-4">
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <CategoryBadge category={post.category} />
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.reading_time || 5} min</span>
                </div>

                <Link to={`/blog/${post.slug}`} className="block group-hover:text-primary transition-colors">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
                        {post.title}
                    </h2>
                </Link>

                <p className="text-zinc-400 text-sm md:text-base line-clamp-3 leading-relaxed">
                    {post.excerpt}
                </p>

                <div className="pt-4 flex items-center gap-4">
                    <Link
                        to={`/blog/${post.slug}`}
                        className="flex items-center gap-2 text-white font-medium hover:text-primary transition-colors group/link"
                    >
                        Ler artigo completo
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

function PostCard({ post, index }: { post: BlogPost; index: number }) {
    const date = new Date(post.published_at || post.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group flex flex-col h-full"
        >
            <Link
                to={`/blog/${post.slug}`}
                className="block relative aspect-video overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700 transition-colors"
            >
                {post.og_image ? (
                    <img
                        src={post.og_image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                        <span className="text-2xl opacity-20">📝</span>
                    </div>
                )}

                <div className="absolute top-3 left-3">
                    <CategoryBadge category={post.category} />
                </div>
            </Link>

            <div className="pt-4 flex-1 flex flex-col">
                <div className="flex items-center gap-3 text-xs text-zinc-500 mb-2">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {date}</span>
                    <span className="border-l border-zinc-800 pl-3 flex items-center gap-1"><Clock className="w-3 h-3" /> {post.reading_time || 5} min</span>
                </div>

                <Link to={`/blog/${post.slug}`} className="block flex-1 group-hover:text-primary transition-colors">
                    <h3 className="font-display text-xl font-bold text-white leading-tight mb-2 line-clamp-2">
                        {post.title}
                    </h3>
                </Link>

                <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
                    {post.excerpt}
                </p>

                <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-white hover:text-primary transition-colors mt-auto"
                >
                    Ler mais <ChevronRight className="w-3 h-3" />
                </Link>
            </div>
        </motion.div>
    );
}

// ─── Main Page Component ─────────────────────────────────

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        document.title = 'Blog — Henrique Fujimoto';
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

    // Filter Logic
    const filteredPosts = posts.filter(post => {
        const matchesCategory = selectedCategory ? post.category.toLowerCase() === selectedCategory : true;
        const matchesSearch = searchQuery === '' ||
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const activeCategories = Array.from(new Set(posts.map(p => p.category.toLowerCase())))
        .filter((c): c is string => !!(CATEGORY_STYLES[c as string] || CATEGORY_STYLES['geral']));

    // Logic to separate Featured vs Grid
    const isDefaultView = !selectedCategory && !searchQuery;
    const featuredPost = isDefaultView && filteredPosts.length > 0 ? filteredPosts[0] : null;
    const gridPosts = isDefaultView ? filteredPosts.slice(1) : filteredPosts;

    return (
        <div className="min-h-screen bg-black selection:bg-primary/30">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-900">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium group">
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Voltar ao Início
                    </Link>
                    <span className="font-display font-bold tracking-wider text-white md:hidden">FUJIMOTO</span>
                    <div className="hidden md:flex items-center gap-4">
                        <a
                            href="https://instagram.com/henriquefujimoto"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                        >
                            @henriquefujimoto
                        </a>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-10 md:py-16 space-y-16">

                {/* Hero Title & Personal Brand */}
                <section className="text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="inline-block px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-primary text-xs font-bold tracking-widest uppercase mb-2">
                            Blog Oficial
                        </div>
                        <h1 className="font-display text-5xl md:text-8xl font-bold text-white tracking-tighter uppercase leading-none">
                            Henrique <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">Fujimoto</span>
                        </h1>
                        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
                            Acompanhe minha rotina de treinos, bastidores das competições e minha evolução no judô rumo à faixa preta.
                        </p>

                        <div className="flex justify-center pt-2">
                            <a
                                href="https://instagram.com/henriquefujimoto"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-3 px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-full text-white font-medium hover:border-primary/50 hover:bg-zinc-800/80 transition-all"
                            >
                                <Instagram className="w-5 h-5 group-hover:text-primary transition-colors" />
                                <span>Seguir no Instagram</span>
                                <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-primary transition-colors" />
                            </a>
                        </div>
                    </motion.div>

                    {/* Search & Filter Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-2xl mx-auto pt-8"
                    >
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative flex items-center bg-zinc-900/80 border border-zinc-800 rounded-full px-4 py-3 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all shadow-xl">
                                <Search className="w-5 h-5 text-zinc-500 mr-3" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar artigos..."
                                    className="bg-transparent border-none focus:outline-none text-white w-full placeholder-zinc-600 text-sm"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-zinc-800 rounded-full text-zinc-400">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Categories Pills */}
                        {activeCategories.length > 0 && (
                            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${!selectedCategory
                                        ? 'bg-white text-black font-bold'
                                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700'}`}
                                >
                                    Todos
                                </button>
                                {activeCategories.map(cat => {
                                    const style = CATEGORY_STYLES[cat as string] || CATEGORY_STYLES['geral'];
                                    const isActive = selectedCategory === cat;
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(isActive ? null : cat)}
                                            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${isActive
                                                ? style.color
                                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'}`}
                                        >
                                            {style.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                </section>

                {/* Content Area */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
                        <div className="md:col-span-3 h-96 bg-zinc-900 rounded-3xl border border-zinc-800" />
                        <div className="h-64 bg-zinc-900 rounded-2xl border border-zinc-800" />
                        <div className="h-64 bg-zinc-900 rounded-2xl border border-zinc-800" />
                    </div>
                ) : (
                    <div className="space-y-16">
                        {/* Featured Section */}
                        {featuredPost && (
                            <section>
                                <div className="flex items-center gap-2 mb-6 border-b border-zinc-800 pb-4">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    <h2 className="text-white text-lg font-semibold tracking-wide uppercase font-display">Mais Recente</h2>
                                </div>
                                <FeaturedPost post={featuredPost} />
                            </section>
                        )}

                        {/* Grid Section */}
                        {gridPosts.length > 0 ? (
                            <section>
                                {featuredPost && (
                                    <div className="flex items-center gap-2 mb-6 border-b border-zinc-800 pb-4">
                                        <TrendingUp className="w-5 h-5 text-zinc-400" />
                                        <h2 className="text-white text-lg font-semibold tracking-wide uppercase font-display">
                                            {isDefaultView ? 'Arquivo' : 'Resultados da Busca'}
                                        </h2>
                                    </div>
                                )}
                                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <AnimatePresence>
                                        {gridPosts.map((post, index) => (
                                            <PostCard key={post.id} post={post} index={index} />
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            </section>
                        ) : (
                            !featuredPost && (
                                <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-zinc-800">
                                    <Search className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                                    <p className="text-zinc-400 text-lg">Nenhum post encontrado.</p>
                                    <button
                                        onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
                                        className="mt-4 text-primary hover:underline text-sm"
                                    >
                                        Limpar filtros
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
