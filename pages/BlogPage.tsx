import React, { useState, useEffect } from 'react';
import PublicHeader from '../components/PublicHeader';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, ChevronRight,
    Search, TrendingUp, Sparkles, ArrowUpRight, Instagram, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { trackPageView } from '../lib/pageTracking';

// ─── Constants & Styles ──────────────────────────────────
// All categories share the hf-gold accent in the "Henrique documentary" system.
const CATEGORY_BADGE = 'bg-hf-gold/10 text-hf-gold border-hf-gold/25';
const CATEGORY_STYLES: Record<string, { label: string; color: string; icon: string }> = {
    'judô': { label: 'Judô', color: CATEGORY_BADGE, icon: '🥋' },
    'treino': { label: 'Treino', color: CATEGORY_BADGE, icon: '💪' },
    'competição': { label: 'Competição', color: CATEGORY_BADGE, icon: '🏆' },
    'nutrição': { label: 'Nutrição', color: CATEGORY_BADGE, icon: '🥗' },
    'vida-de-atleta': { label: 'Vida de atleta', color: CATEGORY_BADGE, icon: '🌟' },
    'notícias': { label: 'Notícias', color: CATEGORY_BADGE, icon: '📰' },
    'geral': { label: 'Geral', color: CATEGORY_BADGE, icon: '📝' },
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
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-ui text-[11px] font-semibold uppercase tracking-[0.08em] border ${style.color}`}>
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
            className="group relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center rounded-2xl border border-hf-line/70 bg-hf-surface p-4 md:p-6 hover:border-hf-gold/25 transition-colors duration-500"
        >
            {/* Image Side */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-hf-surface-2">
                <Link to={`/blog/${post.slug}`}>
                    {post.og_image ? (
                        <img
                            src={post.og_image}
                            alt={post.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                        />
                    ) : (
                        <div className="w-full h-full bg-hf-surface-2 flex items-center justify-center">
                            <Sparkles className="w-12 h-12 text-hf-ice/15" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-hf-navy/60 to-transparent md:hidden" />
                </Link>
                <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-hf-gold text-hf-navy text-[11px] font-semibold uppercase tracking-[0.08em] rounded-full flex items-center gap-1 font-ui">
                            <Sparkles className="w-3 h-3" />
                            Destaque
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Side */}
            <div className="space-y-4 md:py-4">
                <div className="flex items-center gap-3 font-ui text-xs text-hf-ice/45">
                    <CategoryBadge category={post.category} />
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.reading_time || 5} min</span>
                </div>

                <Link to={`/blog/${post.slug}`} className="block transition-colors group-hover:text-hf-gold">
                    <h2 className="font-brand text-3xl md:text-4xl font-semibold text-hf-ice leading-tight tracking-tight">
                        {post.title}
                    </h2>
                </Link>

                <p className="font-ui text-hf-ice/70 text-sm md:text-base line-clamp-3 leading-relaxed">
                    {post.excerpt}
                </p>

                <div className="pt-4 flex items-center gap-4">
                    <Link
                        to={`/blog/${post.slug}`}
                        className="flex items-center gap-2 font-ui text-hf-ice font-semibold hover:text-hf-gold transition-colors group/link"
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
                className="block relative aspect-video overflow-hidden rounded-2xl bg-hf-surface-2 border border-hf-line/70 group-hover:border-hf-gold/25 transition-colors"
            >
                {post.og_image ? (
                    <img
                        src={post.og_image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full bg-hf-surface-2 flex items-center justify-center">
                        <span className="text-2xl opacity-20">📝</span>
                    </div>
                )}

                <div className="absolute top-3 left-3">
                    <CategoryBadge category={post.category} />
                </div>
            </Link>

            <div className="pt-4 flex-1 flex flex-col">
                <div className="flex items-center gap-3 font-ui text-xs text-hf-ice/45 mb-2">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {date}</span>
                    <span className="border-l border-hf-ice/10 pl-3 flex items-center gap-1"><Clock className="w-3 h-3" /> {post.reading_time || 5} min</span>
                </div>

                <Link to={`/blog/${post.slug}`} className="block flex-1 transition-colors group-hover:text-hf-gold">
                    <h3 className="font-brand text-xl font-semibold text-hf-ice leading-snug tracking-tight mb-2 line-clamp-2">
                        {post.title}
                    </h3>
                </Link>

                <p className="font-ui text-sm text-hf-ice/70 line-clamp-2 mb-4">
                    {post.excerpt}
                </p>

                <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 font-ui text-xs font-semibold text-hf-ice hover:text-hf-gold transition-colors mt-auto"
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
        trackPageView('/blog', 'Blog & Notícias');
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
        <div className="min-h-screen bg-hf-navy font-ui selection:bg-hf-gold/30">
            <PublicHeader />

            <main className="mx-auto max-w-7xl space-y-16 px-4 pb-10 pt-28 md:pb-16 md:pt-32">

                {/* Hero Title & Personal Brand */}
                <section className="text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <p className="font-ui text-[12px] font-semibold uppercase tracking-[0.16em] text-hf-gold">
                            Blog oficial
                        </p>
                        <h1 className="font-brand text-[2.1rem] md:text-6xl font-semibold text-hf-ice tracking-tight leading-[1.1] md:leading-[1.05]">
                            Histórias e bastidores do <span className="text-hf-gold">judô</span>
                        </h1>
                        <p className="text-hf-ice/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                            Acompanhe minha rotina de treinos, bastidores das competições e minha evolução no judô rumo à faixa preta.
                        </p>

                        <div className="flex justify-center pt-2">
                            <a
                                href="https://instagram.com/henriquefujimoto"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-3 px-6 py-3 rounded-full border border-hf-ice/15 bg-hf-ice/5 text-hf-ice font-medium hover:bg-hf-ice/10 transition-colors"
                            >
                                <Instagram className="w-5 h-5 group-hover:text-hf-gold transition-colors" />
                                <span>Seguir no Instagram</span>
                                <ArrowUpRight className="w-4 h-4 text-hf-ice/50 group-hover:text-hf-gold transition-colors" />
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
                        <div className="relative">
                            <div className="relative flex items-center rounded-full border border-hf-line/70 bg-hf-surface px-4 py-3 focus-within:border-hf-gold/40 transition-colors">
                                <Search className="w-5 h-5 text-hf-ice/40 mr-3" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar artigos..."
                                    className="bg-transparent border-none focus:outline-none text-hf-ice w-full placeholder-hf-ice/40 text-sm"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-hf-ice/10 rounded-full text-hf-ice/60">
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
                                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${!selectedCategory
                                        ? 'bg-hf-gold text-hf-navy font-semibold'
                                        : 'border border-hf-ice/15 bg-hf-ice/5 text-hf-ice/70 hover:text-hf-ice'}`}
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
                                            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${isActive
                                                ? 'bg-hf-gold text-hf-navy font-semibold'
                                                : 'border border-hf-ice/15 bg-hf-ice/5 text-hf-ice/70 hover:text-hf-ice'}`}
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
                        <div className="md:col-span-3 h-96 bg-hf-surface rounded-2xl border border-hf-line/70" />
                        <div className="h-64 bg-hf-surface rounded-2xl border border-hf-line/70" />
                        <div className="h-64 bg-hf-surface rounded-2xl border border-hf-line/70" />
                    </div>
                ) : (
                    <div className="space-y-16">
                        {/* Featured Section */}
                        {featuredPost && (
                            <section>
                                <div className="flex items-center gap-2 mb-6 border-b border-hf-line/70 pb-4">
                                    <Sparkles className="w-5 h-5 text-hf-gold" />
                                    <h2 className="font-brand text-hf-ice text-lg font-semibold tracking-tight">Mais recente</h2>
                                </div>
                                <FeaturedPost post={featuredPost} />
                            </section>
                        )}

                        {/* Grid Section */}
                        {gridPosts.length > 0 ? (
                            <section>
                                {featuredPost && (
                                    <div className="flex items-center gap-2 mb-6 border-b border-hf-line/70 pb-4">
                                        <TrendingUp className="w-5 h-5 text-hf-ice/45" />
                                        <h2 className="font-brand text-hf-ice text-lg font-semibold tracking-tight">
                                            {isDefaultView ? 'Arquivo' : 'Resultados da busca'}
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
                                <div className="text-center py-20 bg-hf-surface rounded-2xl border border-hf-line/70">
                                    <Search className="w-12 h-12 text-hf-ice/30 mx-auto mb-4" />
                                    <p className="text-hf-ice/60 text-lg">Nenhum post encontrado.</p>
                                    <button
                                        onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
                                        className="mt-4 text-hf-gold hover:text-hf-gold-dim transition-colors text-sm"
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
