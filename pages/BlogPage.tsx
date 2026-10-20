import React, { useState, useEffect } from 'react';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';
import WordRail from '../components/home/WordRail';
import { hfBtnPrimary, hfCard, hfKicker, hfLead } from '../components/ui/hf';
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

const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
    const key = category.toLowerCase();
    const style = CATEGORY_STYLES[key] || CATEGORY_STYLES['geral'];

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-ui text-[11px] font-semibold uppercase tracking-[0.08em] border ${style.color}`}>
            <span>{style.icon}</span>
            {style.label}
        </span>
    );
}

const FeaturedPost: React.FC<{ post: BlogPost }> = ({ post }) => {
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

const PostCard: React.FC<{ post: BlogPost; index: number }> = ({ post, index }) => {
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

    // Capa do hero: a imagem do post mais recente (real, nunca banco de imagens).
    const heroImage = posts.find((p) => p.og_image)?.og_image || null;

    // Contagem por categoria a partir dos posts publicados — sem numeros fixos.
    const categoryCounts = activeCategories
        .map((cat) => ({
            key: cat,
            label: (CATEGORY_STYLES[cat] || CATEGORY_STYLES['geral']).label,
            count: posts.filter((p) => p.category.toLowerCase() === cat).length,
        }))
        .sort((a, b) => b.count - a.count);

    return (
        <div className="min-h-screen bg-hf-navy font-ui text-hf-ice selection:bg-hf-gold/30">
            <PublicHeader />

            {/* Hero */}
            <section className="relative isolate overflow-hidden border-b border-hf-line/60 px-6 pb-14 pt-28 sm:pb-16 sm:pt-32">
                {heroImage && (
                    <>
                        <img
                            src={heroImage}
                            alt=""
                            className="absolute inset-0 -z-10 h-full w-full object-cover object-center opacity-35 grayscale"
                        />
                        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-hf-navy via-hf-navy/90 to-hf-navy/40" />
                    </>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto max-w-7xl"
                >
                    <span className="hf-rule mb-5 block" />
                    <p className={hfKicker}>Bastidores / Rotina / Reflexões</p>
                    <h1 className="mt-4 font-brand text-[2.25rem] font-extrabold uppercase leading-[0.95] tracking-[-0.015em] text-hf-ice sm:text-[3.25rem] lg:text-[4rem]">
                        Não coube
                        <br />
                        no Reels.
                    </h1>
                    <p className={`mt-6 max-w-xl ${hfLead}`}>
                        Histórias, bastidores, treinos e tudo o que também faz parte dessa jornada. Os momentos que
                        não cabem em vídeos curtos, mas que constroem o caminho.
                    </p>
                </motion.div>
            </section>

            <main className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 lg:grid-cols-[1.9fr_0.75fr] lg:gap-14 lg:py-16">
                {/* Coluna principal */}
                <div className="min-w-0 space-y-14">
                    {loading ? (
                        <div className="space-y-8">
                            <div className="h-80 animate-pulse rounded-2xl bg-hf-surface" />
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="h-64 animate-pulse rounded-2xl bg-hf-surface" />
                                <div className="h-64 animate-pulse rounded-2xl bg-hf-surface" />
                            </div>
                        </div>
                    ) : (
                        <>
                            {featuredPost && (
                                <section>
                                    <div className="mb-6 flex items-center gap-2 border-b border-hf-line/70 pb-4">
                                        <Sparkles className="h-4 w-4 text-hf-gold" />
                                        <h2 className="font-ui text-[11px] font-semibold uppercase tracking-[0.2em] text-hf-ice/70">
                                            Artigo em destaque
                                        </h2>
                                    </div>
                                    <FeaturedPost post={featuredPost} />
                                </section>
                            )}

                            {gridPosts.length > 0 ? (
                                <section>
                                    <div className="mb-6 flex items-center gap-2 border-b border-hf-line/70 pb-4">
                                        <TrendingUp className="h-4 w-4 text-hf-ice/45" />
                                        <h2 className="font-ui text-[11px] font-semibold uppercase tracking-[0.2em] text-hf-ice/70">
                                            {isDefaultView ? 'Artigos recentes' : 'Resultados da busca'}
                                        </h2>
                                    </div>
                                    <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                        <AnimatePresence>
                                            {gridPosts.map((post, index) => (
                                                <PostCard key={post.id} post={post} index={index} />
                                            ))}
                                        </AnimatePresence>
                                    </motion.div>
                                </section>
                            ) : (
                                !featuredPost && (
                                    <div className="rounded-2xl border border-hf-line/70 bg-hf-surface py-20 text-center">
                                        <Search className="mx-auto mb-4 h-10 w-10 text-hf-ice/25" />
                                        <p className="font-ui text-hf-ice/60">Nenhum artigo encontrado.</p>
                                        <button
                                            onClick={() => {
                                                setSearchQuery('');
                                                setSelectedCategory(null);
                                            }}
                                            className="mt-4 font-ui text-sm text-hf-gold transition-colors hover:text-hf-gold-soft"
                                        >
                                            Limpar filtros
                                        </button>
                                    </div>
                                )
                            )}
                        </>
                    )}
                </div>

                {/* Barra lateral */}
                <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
                    {/* Busca */}
                    <div className="flex items-center rounded-full border border-hf-line/70 bg-hf-surface px-4 py-3 transition-colors focus-within:border-hf-gold/50">
                        <Search className="mr-3 h-4 w-4 text-hf-ice/40" />
                        <label htmlFor="busca-artigos" className="sr-only">
                            Buscar artigos
                        </label>
                        <input
                            id="busca-artigos"
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar artigos..."
                            className="w-full border-none bg-transparent font-ui text-sm text-hf-ice placeholder-hf-ice/40 focus:outline-none"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                aria-label="Limpar busca"
                                className="rounded-full p-1 text-hf-ice/60 hover:bg-hf-ice/10"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Categorias com contagem real */}
                    {categoryCounts.length > 0 && (
                        <div>
                            <div className="mb-4 flex items-center gap-2">
                                <span className="h-0.5 w-5 bg-hf-gold" />
                                <h2 className="font-ui text-[11px] font-semibold uppercase tracking-[0.2em] text-hf-ice/70">
                                    Categorias
                                </h2>
                            </div>
                            <ul className="space-y-1">
                                <li>
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className={`flex w-full items-center justify-between border-b border-hf-line/40 py-2.5 font-ui text-sm transition-colors ${
                                            !selectedCategory ? 'text-hf-gold' : 'text-hf-ice/70 hover:text-hf-ice'
                                        }`}
                                    >
                                        Todos
                                        <span className="font-ui text-xs text-hf-ice/40">{posts.length}</span>
                                    </button>
                                </li>
                                {categoryCounts.map((c) => (
                                    <li key={c.key}>
                                        <button
                                            onClick={() => setSelectedCategory(selectedCategory === c.key ? null : c.key)}
                                            className={`flex w-full items-center justify-between border-b border-hf-line/40 py-2.5 font-ui text-sm transition-colors ${
                                                selectedCategory === c.key ? 'text-hf-gold' : 'text-hf-ice/70 hover:text-hf-ice'
                                            }`}
                                        >
                                            {c.label}
                                            <span className="font-ui text-xs text-hf-ice/40">{c.count}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Todos os artigos */}
                    {posts.length > 0 && (
                        <div>
                            <div className="mb-4 flex items-center gap-2">
                                <span className="h-0.5 w-5 bg-hf-gold" />
                                <h2 className="font-ui text-[11px] font-semibold uppercase tracking-[0.2em] text-hf-ice/70">
                                    Todos os artigos
                                </h2>
                            </div>
                            <ul className="space-y-3">
                                {posts.map((p) => (
                                    <li key={p.id}>
                                        <Link to={`/blog/${p.slug}`} className="group flex gap-3">
                                            <span className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-hf-line/60 bg-hf-surface-2">
                                                {p.og_image && (
                                                    <img src={p.og_image} alt="" className="h-full w-full object-cover" />
                                                )}
                                            </span>
                                            <span className="min-w-0">
                                                <span className="line-clamp-2 font-ui text-[13px] font-semibold leading-snug text-hf-ice/85 transition-colors group-hover:text-hf-gold">
                                                    {p.title}
                                                </span>
                                                <span className="mt-1 block font-ui text-[11px] text-hf-ice/40">
                                                    {new Date(p.published_at || p.created_at).toLocaleDateString('pt-BR')} ·{' '}
                                                    {p.reading_time || 5} min
                                                </span>
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Instagram */}
                    <a
                        href="https://instagram.com/henriquefujimoto"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group flex items-center justify-between gap-3 ${hfCard} px-4 py-4 transition-colors hover:border-hf-gold/40`}
                    >
                        <span className="flex items-center gap-3">
                            <Instagram className="h-5 w-5 text-hf-gold" />
                            <span className="font-ui text-[13px] font-semibold text-hf-ice">Seguir no Instagram</span>
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-hf-ice/45 transition-colors group-hover:text-hf-gold" />
                    </a>
                </aside>
            </main>

            {/* Fechamento */}
            <section className="relative isolate overflow-hidden border-t border-hf-line/60 bg-hf-navy px-6 py-16 sm:py-20">
                {heroImage && (
                    <>
                        <img
                            src={heroImage}
                            alt=""
                            loading="lazy"
                            className="absolute inset-0 -z-10 h-full w-full object-cover object-center opacity-30 grayscale"
                        />
                        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-hf-navy via-hf-navy/85 to-hf-navy/50" />
                    </>
                )}
                <div className="mx-auto flex w-full max-w-7xl items-end justify-between gap-10">
                    <div className="max-w-2xl">
                        <h2 className="font-brand text-[1.75rem] font-extrabold uppercase leading-[1] tracking-[-0.015em] text-hf-ice sm:text-[2.5rem]">
                            Continua essa jornada.
                        </h2>
                        <p className="mt-4 max-w-md font-ui text-[15px] leading-relaxed text-hf-ice/70">
                            Mais histórias, aprendizados e bastidores por aqui. A jornada segue, e você faz parte dela.
                        </p>
                        <a
                            href="https://instagram.com/henriquefujimoto"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`mt-7 ${hfBtnPrimary}`}
                        >
                            <Instagram className="h-4 w-4" />
                            Acompanhar tudo
                        </a>
                    </div>
                    <WordRail words={['Mesmo', 'tatame', 'novas', 'histórias']} className="pb-2" />
                </div>
            </section>

            <Footer />
        </div>
    );
}
