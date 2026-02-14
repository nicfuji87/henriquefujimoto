import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    FileText,
    Settings,
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Save,
    X,
    LogOut,
    Menu,
    Home,
    Upload,
    Link2,
    ExternalLink,
    Newspaper,
    Activity,
    Clock, MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, Post } from '../lib/supabase';
import BlogTab from '../components/admin/BlogTab';
import TrackingTab from '../components/admin/TrackingTab';

// Mock posts for development
const mockPosts: Post[] = [
    {
        id: '1',
        title: 'Conquista no Campeonato Brasileiro de Judô 2024',
        slug: 'conquista-campeonato-brasileiro-2024',
        excerpt: 'Uma jornada incrível até a medalha de ouro.',
        content: 'Conteúdo completo do post...',
        cover_image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800',
        category: 'tournament',
        published: true,
        created_at: '2024-12-15T10:00:00Z',
        updated_at: '2024-12-15T10:00:00Z',
    },
    {
        id: '2',
        title: '5 Técnicas Essenciais de Uchi-Mata',
        slug: '5-tecnicas-uchi-mata',
        excerpt: 'Aprenda os fundamentos desta técnica.',
        content: 'Conteúdo completo do post...',
        cover_image: 'https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=800',
        category: 'tips',
        published: false,
        created_at: '2024-12-10T14:30:00Z',
        updated_at: '2024-12-10T14:30:00Z',
    },
];

type Tab = 'dashboard' | 'blog' | 'posts' | 'bio' | 'tracking' | 'settings';

function Sidebar({
    activeTab,
    setActiveTab,
    isOpen,
    setIsOpen,
}: {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}) {
    const menuItems = [
        { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'blog' as Tab, label: 'Blog', icon: Newspaper },
        { id: 'posts' as Tab, label: 'Posts IG', icon: FileText },
        { id: 'bio' as Tab, label: 'Bio / Home', icon: Home },
        { id: 'tracking' as Tab, label: 'Tracking & SEO', icon: Activity },
        { id: 'settings' as Tab, label: 'Configurações', icon: Settings },
    ];

    return (
        <>
            {/* Mobile overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset - y - 0 left - 0 z - 50 w - 64 bg - zinc - 900 / 95 backdrop - blur - xl border - r border - zinc - 800 / 50 transform transition - transform duration - 300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    } `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-zinc-800/50">
                        <h1 className="font-display text-xl font-bold text-white">
                            ADMIN <span className="text-primary">PANEL</span>
                        </h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setIsOpen(false);
                                }}
                                className={`w - full flex items - center gap - 3 px - 4 py - 3 rounded - xl transition - all ${activeTab === item.id
                                    ? 'bg-primary/20 text-primary'
                                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                                    } `}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-zinc-800/50">
                        <Link
                            to="/"
                            className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800/50 transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Ver Site</span>
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
}

function DashboardTab() {
    const [loading, setLoading] = useState(true);
    const [igMetrics, setIgMetrics] = useState<{
        followers: number; followersGain: number; followersGrowth: number;
        reach: number; reachGrowth: number;
        interactions: number; interactionsGrowth: number;
    } | null>(null);
    const [contentStats, setContentStats] = useState<{
        totalPosts: number; totalLikes: number; totalComments: number;
    }>({ totalPosts: 0, totalLikes: 0, totalComments: 0 });
    const [followersHistory, setFollowersHistory] = useState<{ date: string; count: number }[]>([]);
    const [topPosts, setTopPosts] = useState<{
        id: string; caption: string; media_url: string; thumbnail_url: string;
        media_type: string; like_count: number; comments_count: number; permalink: string;
    }[]>([]);
    const [gaMetrics, setGaMetrics] = useState<{
        activeUsers: number;
        sessions: number;
        screenPageViews: number;
        engagementRate: number;
        history: { date: string; users: number }[];
        topPages?: { path: string; views: number; avgTime: number; title?: string; image?: string | null }[];
        locations?: { city: string; region: string; country: string; users: number }[];
        mock?: boolean;
    } | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    async function loadDashboardData() {
        setLoading(true);
        try {
            // 1. Instagram metrics (últimos 30 dias)
            const { getAggregatedMetrics } = await import('../lib/metrics');
            const metrics = await getAggregatedMetrics(30);
            if (metrics) {
                setIgMetrics({
                    followers: metrics.total_followers,
                    followersGain: metrics.followers_gained,
                    followersGrowth: metrics.followers_growth,
                    reach: metrics.total_reach,
                    reachGrowth: metrics.reach_growth,
                    interactions: metrics.total_interactions,
                    interactionsGrowth: metrics.interactions_growth,
                });
            }

            // 2. Content stats
            const { data: posts } = await supabase
                .from('top_content')
                .select('id, caption, media_url, thumbnail_url, media_type, like_count, comments_count, permalink')
                .order('like_count', { ascending: false });

            if (posts) {
                setContentStats({
                    totalPosts: posts.length,
                    totalLikes: posts.reduce((sum, p) => sum + (p.like_count || 0), 0),
                    totalComments: posts.reduce((sum, p) => sum + (p.comments_count || 0), 0),
                });
                setTopPosts(posts.slice(0, 5));
            }

            // 3. Followers history (all available dates)
            const { data: history } = await supabase
                .from('daily_metrics')
                .select('date, followers_count')
                .order('date', { ascending: true });

            if (history) {
                setFollowersHistory(history.filter(h => h.followers_count > 0).map(h => ({
                    date: h.date,
                    count: h.followers_count,
                })));
            }

            // 4. GA4 Metrics
            try {
                const { data: { publicUrl } } = supabase.storage.from('site-images').getPublicUrl('dummy');
                const projectUrl = publicUrl.split('/storage/')[0];
                const res = await fetch(`${projectUrl}/functions/v1/get-ga4-metrics`);
                if (res.ok) {
                    const data = await res.json();
                    if (!data.error) {
                        setGaMetrics(data);
                    }
                }
            } catch (e) {
                console.error('GA Error', e);
            }
        } catch (err) {
            console.error('Error loading dashboard data:', err);
        } finally {
            setLoading(false);
        }
    }

    function formatNum(n: number): string {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return n.toLocaleString('pt-BR');
    }

    function GrowthIndicator({ value }: { value: number }) {
        if (value === 0) return <span className="text-xs text-zinc-500">—</span>;
        const isPositive = value > 0;
        return (
            <span className={`text - xs font - medium ${isPositive ? 'text-emerald-400' : 'text-red-400'} `}>
                {isPositive ? '▲' : '▼'} {Math.abs(value).toFixed(1)}%
            </span>
        );
    }

    if (loading) {
        return (
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Dashboard</h2>
                    <p className="text-zinc-400">Carregando dados...</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 animate-pulse">
                            <div className="h-4 bg-zinc-800 rounded w-24 mb-3"></div>
                            <div className="h-8 bg-zinc-800 rounded w-16 mb-2"></div>
                            <div className="h-3 bg-zinc-800 rounded w-20"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Chart calculations
    const chartWidth = 600;
    const chartHeight = 150;
    const chartPadding = { top: 20, right: 10, bottom: 30, left: 50 };
    const innerW = chartWidth - chartPadding.left - chartPadding.right;
    const innerH = chartHeight - chartPadding.top - chartPadding.bottom;

    let chartPath = '';
    let chartAreaPath = '';
    let chartDots: { x: number; y: number; count: number; date: string }[] = [];
    if (followersHistory.length > 1) {
        const minVal = Math.min(...followersHistory.map(h => h.count)) - 5;
        const maxVal = Math.max(...followersHistory.map(h => h.count)) + 5;
        const range = maxVal - minVal || 1;

        chartDots = followersHistory.map((h, i) => ({
            x: chartPadding.left + (i / (followersHistory.length - 1)) * innerW,
            y: chartPadding.top + innerH - ((h.count - minVal) / range) * innerH,
            count: h.count,
            date: h.date,
        }));

        chartPath = chartDots.map((d, i) => `${i === 0 ? 'M' : 'L'} ${d.x} ${d.y} `).join(' ');
        chartAreaPath = chartPath + ` L ${chartDots[chartDots.length - 1].x} ${chartPadding.top + innerH} L ${chartDots[0].x} ${chartPadding.top + innerH} Z`;
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Dashboard</h2>
                <p className="text-zinc-400">Visão geral do Site e Instagram • Últimos 30 dias</p>
            </div>

            {/* Row 0: Site Analytics (GA4) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
                    className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Activity className="w-16 h-16 text-blue-500" />
                    </div>
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Usuários Ativos (30d)</p>
                    <p className="text-3xl font-bold text-white">{formatNum(gaMetrics?.activeUsers || 0)}</p>
                    <span className="text-xs text-blue-400 font-medium">Google Analytics 4</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5"
                >
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Visualizações de Página</p>
                    <p className="text-3xl font-bold text-white">{formatNum(gaMetrics?.screenPageViews || 0)}</p>
                    <span className="text-xs text-zinc-500">Total de views</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5"
                >
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Sessões</p>
                    <p className="text-3xl font-bold text-white">{formatNum(gaMetrics?.sessions || 0)}</p>
                    <span className="text-xs text-zinc-500">Visitas únicas</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5"
                >
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Engajamento Médio</p>
                    <p className="text-3xl font-bold text-white">{gaMetrics ? (gaMetrics.engagementRate * 100).toFixed(1) + '%' : '0%'}</p>
                    <span className="text-xs text-zinc-500">Taxa de interação</span>
                </motion.div>
            </div>

            {gaMetrics?.mock && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
                    <Activity className="w-5 h-5 text-amber-500" />
                    <p className="text-sm text-amber-200">
                        Ative o Google Analytics configurando as variáveis <code>GA4_CREDENTIALS</code> e <code>GA4_PROPERTY_ID</code> no Supabase.
                    </p>
                </div>
            )}

            {/* Row 0.5: Top Blog Posts & Locations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {gaMetrics?.topPages && gaMetrics.topPages.length > 0 && (
                    <div className="lg:col-span-2 bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-purple-500" />
                            Posts Mais Lidos (30d)
                        </h3>
                        <div className="space-y-4">
                            {gaMetrics.topPages.slice(0, 5).map((page, i) => (
                                <div key={i} className="group flex items-center gap-4 bg-zinc-900/50 hover:bg-zinc-800/50 border border-zinc-800 rounded-xl p-3 transition-all">
                                    <div className="w-16 h-16 flex-shrink-0 bg-zinc-800 rounded-lg overflow-hidden relative">
                                        {page.image ? (
                                            <img src={page.image} alt={page.title || ''} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                                <FileText className="w-6 h-6 opacity-20" />
                                            </div>
                                        )}
                                        <div className="absolute top-0 left-0 bg-black/60 px-1.5 py-0.5 rounded-br text-[10px] font-bold text-white">
                                            #{i + 1}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-white line-clamp-1 mb-1" title={page.title}>
                                            {page.title || page.path.replace('/blog/', '')}
                                        </h4>
                                        <div className="flex items-center gap-4 text-xs text-zinc-400">
                                            <div className="flex items-center gap-1.5">
                                                <Eye className="w-3.5 h-3.5 text-purple-400" />
                                                <span className="text-zinc-300 font-bold">{formatNum(page.views)}</span> views
                                            </div>
                                            <div className="flex items-center gap-1.5" title="Tempo Médio na Página">
                                                <Clock className="w-3.5 h-3.5 text-blue-400" />
                                                <span className="text-zinc-300 font-bold">
                                                    {Math.floor(page.avgTime / 60)}m {Math.floor(page.avgTime % 60)}s
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden sm:block">
                                        <a href={`https://henriquefujimoto.com.br/blog/${page.slug}`} target="_blank" rel="noreferrer" className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors">
                                            <ExternalLink className="w-4 h-4" />
                                        </a >
                                    </div >
                                </div >
                            ))}
                        </div >
                    </div >
                )}

                {/* Locations */}
                {
                    gaMetrics?.locations && gaMetrics.locations.length > 0 && (
                        <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-green-500" />
                                Top Cidades (30d)
                            </h3>
                            <div className="space-y-3">
                                {gaMetrics.locations.slice(0, 8).map((loc, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                                i === 1 ? 'bg-zinc-300/20 text-zinc-300' :
                                                    i === 2 ? 'bg-amber-700/20 text-amber-700' :
                                                        'bg-zinc-800 text-zinc-500'
                                                }`}>
                                                {i + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{loc.city === '(not set)' ? 'Desconhecido' : loc.city}</p>
                                                <p className="text-xs text-zinc-500">{loc.region}, {loc.country}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-white">{formatNum(loc.users)}</p>
                                            <p className="text-[10px] text-zinc-500">usuários</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }
            </div >

            {/* Row 1: Instagram Metrics */}
            < div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" >
                {/* Followers */}
                < motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
                    className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5"
                >
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Seguidores</p>
                    <p className="text-3xl font-bold text-white">{formatNum(igMetrics?.followers || 0)}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-emerald-400 font-medium">+{igMetrics?.followersGain || 0} novos</span>
                        <GrowthIndicator value={igMetrics?.followersGrowth || 0} />
                    </div>
                </motion.div >

                {/* Reach */}
                < motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5"
                >
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Alcance (30d)</p>
                    <p className="text-3xl font-bold text-white">{formatNum(igMetrics?.reach || 0)}</p>
                    <GrowthIndicator value={igMetrics?.reachGrowth || 0} />
                </motion.div >

                {/* Interactions */}
                < motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5"
                >
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Interações (30d)</p>
                    <p className="text-3xl font-bold text-white">{formatNum(igMetrics?.interactions || 0)}</p>
                    <GrowthIndicator value={igMetrics?.interactionsGrowth || 0} />
                </motion.div >

                {/* Engagement */}
                < motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5"
                >
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Engajamento</p>
                    <p className="text-3xl font-bold text-white">
                        {igMetrics && igMetrics.followers > 0
                            ? ((igMetrics.interactions / igMetrics.followers) * 100).toFixed(1) + '%'
                            : '—'}
                    </p>
                    <span className="text-xs text-zinc-500">Interações / Seguidores</span>
                </motion.div >
            </div >

            {/* Row 2: Content Stats */}
            < div className="grid grid-cols-1 md:grid-cols-3 gap-4" >
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5"
                >
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Posts Indexados</p>
                    <p className="text-3xl font-bold text-white">{contentStats.totalPosts}</p>
                    <span className="text-xs text-zinc-500">No banco de dados</span>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5"
                >
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Total de Likes</p>
                    <p className="text-3xl font-bold text-white">{formatNum(contentStats.totalLikes)}</p>
                    <span className="text-xs text-zinc-500">Todos os posts</span>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5"
                >
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Total de Comentários</p>
                    <p className="text-3xl font-bold text-white">{formatNum(contentStats.totalComments)}</p>
                    <span className="text-xs text-zinc-500">Todos os posts</span>
                </motion.div>
            </div >

            {/* Row 3: Followers Chart */}
            {
                followersHistory.length > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                        className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6"
                    >
                        <h3 className="text-lg font-semibold text-white mb-4">📈 Evolução de Seguidores</h3>
                        <div className="w-full overflow-x-auto">
                            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                                <defs>
                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {/* Grid lines */}
                                {[0, 0.25, 0.5, 0.75, 1].map(pct => (
                                    <line key={pct}
                                        x1={chartPadding.left} y1={chartPadding.top + innerH * (1 - pct)}
                                        x2={chartPadding.left + innerW} y2={chartPadding.top + innerH * (1 - pct)}
                                        stroke="#27272a" strokeWidth="0.5"
                                    />
                                ))}
                                {/* Area fill */}
                                <path d={chartAreaPath} fill="url(#areaGrad)" />
                                {/* Line */}
                                <path d={chartPath} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" />
                                {/* Dots */}
                                {chartDots.map((d, i) => (
                                    <g key={i}>
                                        <circle cx={d.x} cy={d.y} r="3" fill="#22c55e" stroke="#09090b" strokeWidth="1.5" />
                                        {/* Label on first and last */}
                                        {(i === 0 || i === chartDots.length - 1) && (
                                            <text x={d.x} y={d.y - 8} textAnchor="middle" fill="#a1a1aa" fontSize="9" fontWeight="bold">
                                                {d.count}
                                            </text>
                                        )}
                                    </g>
                                ))}
                                {/* Date labels */}
                                {chartDots.filter((_, i) => i === 0 || i === chartDots.length - 1).map((d, i) => (
                                    <text key={i} x={d.x} y={chartPadding.top + innerH + 15} textAnchor="middle" fill="#71717a" fontSize="8">
                                        {new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                    </text>
                                ))}
                            </svg>
                        </div>
                    </motion.div>
                )
            }

            {/* Row 4: Top Posts */}
            {
                topPosts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                        className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6"
                    >
                        <h3 className="text-lg font-semibold text-white mb-4">🔥 Top Posts por Engajamento</h3>
                        <div className="space-y-3">
                            {topPosts.map((post, i) => (
                                <a
                                    key={post.id}
                                    href={post.permalink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-800/50 transition-colors group"
                                >
                                    <span className="text-lg font-bold text-zinc-600 w-6 text-center">{i + 1}</span>
                                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                                        <img
                                            src={post.thumbnail_url || post.media_url}
                                            alt=""
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">
                                            {post.caption?.slice(0, 60) || 'Sem legenda'}
                                            {(post.caption?.length || 0) > 60 ? '...' : ''}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-zinc-400">❤️ {post.like_count}</span>
                                            <span className="text-xs text-zinc-400">💬 {post.comments_count}</span>
                                            <span className="text-xs text-zinc-500">{post.media_type}</span>
                                        </div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-primary transition-colors flex-shrink-0" />
                                </a>
                            ))}
                        </div>
                    </motion.div>
                )
            }
        </div >
    );
}

function PostsTab() {
    const [posts, setPosts] = useState<Post[]>(mockPosts);
    const [showEditor, setShowEditor] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);

    const handleTogglePublish = (id: string) => {
        setPosts(posts.map(p =>
            p.id === id ? { ...p, published: !p.published } : p
        ));
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este post?')) {
            setPosts(posts.filter(p => p.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Posts</h2>
                    <p className="text-zinc-400">Gerencie seus posts do blog</p>
                </div>
                <button
                    onClick={() => {
                        setEditingPost(null);
                        setShowEditor(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Novo Post
                </button>
            </div>

            {/* Posts List */}
            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-800/50">
                            <th className="text-left text-zinc-400 text-sm font-medium px-6 py-4">Título</th>
                            <th className="text-left text-zinc-400 text-sm font-medium px-6 py-4 hidden md:table-cell">Categoria</th>
                            <th className="text-left text-zinc-400 text-sm font-medium px-6 py-4 hidden md:table-cell">Data</th>
                            <th className="text-left text-zinc-400 text-sm font-medium px-6 py-4">Status</th>
                            <th className="text-right text-zinc-400 text-sm font-medium px-6 py-4">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map((post) => (
                            <tr key={post.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20">
                                <td className="px-6 py-4">
                                    <p className="text-white font-medium truncate max-w-xs">{post.title}</p>
                                </td>
                                <td className="px-6 py-4 hidden md:table-cell">
                                    <span className="px-2 py-1 text-xs rounded-full bg-zinc-800 text-zinc-300 capitalize">
                                        {post.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 hidden md:table-cell text-zinc-400 text-sm">
                                    {new Date(post.created_at).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${post.published
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-amber-500/20 text-amber-400'
                                        }`}>
                                        {post.published ? 'Publicado' : 'Rascunho'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleTogglePublish(post.id)}
                                            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                                            title={post.published ? 'Despublicar' : 'Publicar'}
                                        >
                                            {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingPost(post);
                                                setShowEditor(true);
                                            }}
                                            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                                            title="Editar"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="p-2 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Post Editor Modal */}
            <AnimatePresence>
                {showEditor && (
                    <PostEditor
                        post={editingPost}
                        onClose={() => setShowEditor(false)}
                        onSave={(post) => {
                            if (editingPost) {
                                setPosts(posts.map(p => p.id === post.id ? post : p));
                            } else {
                                setPosts([{ ...post, id: Date.now().toString() }, ...posts]);
                            }
                            setShowEditor(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function PostEditor({
    post,
    onClose,
    onSave,
}: {
    post: Post | null;
    onClose: () => void;
    onSave: (post: Post) => void;
}) {
    const [formData, setFormData] = useState<Partial<Post>>(
        post || {
            title: '',
            slug: '',
            excerpt: '',
            content: '',
            cover_image: '',
            category: 'news',
            published: false,
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            id: post?.id || '',
            created_at: post?.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
        } as Post);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">
                        {post ? 'Editar Post' : 'Novo Post'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Título</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-primary"
                            placeholder="Título do post"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Slug</label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-primary"
                            placeholder="url-do-post"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Categoria</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as Post['category'] })}
                            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-primary"
                        >
                            <option value="tournament">Torneio</option>
                            <option value="training">Treino</option>
                            <option value="tips">Dicas</option>
                            <option value="news">Notícias</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Imagem de Capa (URL)</label>
                        <input
                            type="url"
                            value={formData.cover_image}
                            onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-primary"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Resumo</label>
                        <textarea
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-primary resize-none"
                            placeholder="Breve descrição do post"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Conteúdo</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={8}
                            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-primary resize-none"
                            placeholder="Escreva o conteúdo do post..."
                            required
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="published"
                            checked={formData.published}
                            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                            className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-primary focus:ring-primary"
                        />
                        <label htmlFor="published" className="text-sm text-zinc-300">
                            Publicar imediatamente
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-zinc-800 text-white rounded-xl font-medium hover:bg-zinc-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-black rounded-xl font-medium hover:bg-primary/90 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            Salvar
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

function BioTab() {
    const [config, setConfig] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingMobile, setUploadingMobile] = useState(false);
    const [uploadingDesktop, setUploadingDesktop] = useState(false);
    const [uploadingVideoMobile, setUploadingVideoMobile] = useState(false);
    const [uploadingVideoDesktop, setUploadingVideoDesktop] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const fileInputMobileRef = React.useRef<HTMLInputElement>(null);
    const fileInputDesktopRef = React.useRef<HTMLInputElement>(null);
    const fileInputVideoMobileRef = React.useRef<HTMLInputElement>(null);
    const fileInputVideoDesktopRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    async function fetchConfig() {
        try {
            const { data, error } = await supabase
                .from('site_config')
                .select('key, value');

            if (error) throw error;

            const configObj = data?.reduce((acc, item) => {
                acc[item.key] = item.value;
                return acc;
            }, {} as Record<string, string>) || {};

            setConfig(configObj);
        } catch (err) {
            console.error('Error fetching config:', err);
            setMessage({ type: 'error', text: 'Erro ao carregar configurações' });
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        setMessage(null);

        try {
            const updates = Object.entries(config).map(([key, value]) => ({
                key,
                value,
                updated_at: new Date().toISOString(),
            }));

            for (const update of updates) {
                const { error } = await supabase
                    .from('site_config')
                    .upsert(update, { onConflict: 'key' });

                if (error) throw error;
            }

            setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
        } catch (err) {
            console.error('Error saving config:', err);
            setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
        } finally {
            setSaving(false);
        }
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, imageType: 'mobile' | 'desktop') {
        const file = e.target.files?.[0];
        if (!file) return;

        const setUploading = imageType === 'mobile' ? setUploadingMobile : setUploadingDesktop;
        const configKey = imageType === 'mobile' ? 'hero_image' : 'hero_image_desktop';

        setUploading(true);
        setMessage(null);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `hero-${imageType}-${Date.now()}.${fileExt}`;
            const filePath = `hero/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('site-images')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('site-images')
                .getPublicUrl(filePath);

            setConfig(prev => ({ ...prev, [configKey]: data.publicUrl }));
            setMessage({ type: 'success', text: `Imagem ${imageType === 'mobile' ? 'mobile' : 'desktop'} carregada! Clique em Salvar para confirmar.` });
        } catch (err) {
            console.error('Error uploading image:', err);
            setMessage({ type: 'error', text: 'Erro ao fazer upload da imagem' });
        } finally {
            setUploading(false);
        }
    }

    async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>, videoType: 'mobile' | 'desktop') {
        const file = e.target.files?.[0];
        if (!file) return;

        const setUploading = videoType === 'mobile' ? setUploadingVideoMobile : setUploadingVideoDesktop;
        const configKey = videoType === 'mobile' ? 'hero_video_mobile' : 'hero_video_desktop';

        setUploading(true);
        setMessage(null);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `hero-video-${videoType}-${Date.now()}.${fileExt}`;
            const filePath = `hero/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('site-videos')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('site-videos')
                .getPublicUrl(filePath);

            setConfig(prev => ({ ...prev, [configKey]: data.publicUrl }));
            setMessage({ type: 'success', text: `Vídeo ${videoType === 'mobile' ? 'mobile' : 'desktop'} carregado! Clique em Salvar para confirmar.` });
        } catch (err) {
            console.error('Error uploading video:', err);
            setMessage({ type: 'error', text: 'Erro ao fazer upload do vídeo (verifique o tamanho, max ~50MB no plano free)' });
        } finally {
            setUploading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Configurar Bio / Home</h2>
                <p className="text-zinc-400">Personalize sua página inicial e Media Kit</p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 space-y-6">
                {/* Hero Media Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Mobile Media */}
                    <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/50">
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            📱 Hero Mobile (Vertical)
                        </label>
                        <p className="text-xs text-zinc-500 mb-3">Ideal: 1080x1920px (9:16)</p>

                        {/* Media Type Toggle */}
                        <div className="flex gap-1 p-1 bg-zinc-800/70 rounded-lg mb-3">
                            <button
                                onClick={() => setConfig(prev => {
                                    const updated = { ...prev };
                                    delete updated.hero_video_mobile;
                                    return updated;
                                })}
                                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${!config.hero_video_mobile ? 'bg-primary text-black' : 'text-zinc-400 hover:text-white'}`}
                            >
                                🖼️ Imagem
                            </button>
                            <button
                                onClick={() => setConfig(prev => ({ ...prev, hero_video_mobile: prev.hero_video_mobile || '' }))}
                                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${config.hero_video_mobile !== undefined && config.hero_video_mobile !== null ? 'bg-primary text-black' : 'text-zinc-400 hover:text-white'}`}
                            >
                                🎬 Vídeo
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            {/* Image input (always visible as fallback/poster) */}
                            <input
                                type="url"
                                value={config.hero_image || ''}
                                onChange={(e) => setConfig({ ...config, hero_image: e.target.value })}
                                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                                placeholder={config.hero_video_mobile !== undefined ? "URL imagem de capa (poster)" : "URL da imagem"}
                            />
                            <input
                                ref={fileInputMobileRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'mobile')}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputMobileRef.current?.click()}
                                disabled={uploadingMobile}
                                className="w-full px-4 py-2 bg-zinc-700 text-white rounded-lg font-medium hover:bg-zinc-600 transition-colors disabled:opacity-50 text-sm"
                            >
                                {uploadingMobile ? 'Enviando...' : 'Upload Imagem Mobile'}
                            </button>

                            {/* Video URL input */}
                            {config.hero_video_mobile !== undefined && config.hero_video_mobile !== null && (
                                <div className="mt-2 space-y-2">
                                    <label className="block text-xs font-medium text-zinc-400">
                                        🎬 URL do Vídeo Mobile (Cole o link ou faça upload)
                                    </label>
                                    <input
                                        type="url"
                                        value={config.hero_video_mobile || ''}
                                        onChange={(e) => setConfig({ ...config, hero_video_mobile: e.target.value })}
                                        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                                        placeholder="https://cdn.exemplo.com/video.mp4"
                                    />

                                    <input
                                        ref={fileInputVideoMobileRef}
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => handleVideoUpload(e, 'mobile')}
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => fileInputVideoMobileRef.current?.click()}
                                        disabled={uploadingVideoMobile}
                                        className="w-full px-4 py-2 bg-zinc-700 text-white rounded-lg font-medium hover:bg-zinc-600 transition-colors disabled:opacity-50 text-xs flex items-center justify-center gap-2"
                                    >
                                        {uploadingVideoMobile ? 'Enviando Vídeo...' : '☁️ Upload de Arquivo de Vídeo'}
                                    </button>

                                    <p className="text-[10px] text-zinc-600">
                                        Formatos: .mp4, .webm • Para 200MB+, comprima para ~30-50MB antes
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Preview */}
                        {config.hero_video_mobile ? (
                            <div className="mt-4 relative rounded-lg overflow-hidden h-48">
                                <video
                                    src={config.hero_video_mobile}
                                    poster={config.hero_image || undefined}
                                    muted
                                    loop
                                    playsInline
                                    autoPlay
                                    className="w-full h-full object-cover object-top"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <span className="absolute bottom-2 left-2 text-xs text-white/70 bg-black/40 px-2 py-1 rounded flex items-center gap-1">
                                    🎬 Vídeo Mobile
                                </span>
                            </div>
                        ) : config.hero_image ? (
                            <div className="mt-4 relative rounded-lg overflow-hidden h-48">
                                <img
                                    src={config.hero_image}
                                    alt="Mobile Preview"
                                    className="w-full h-full object-cover object-top"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <span className="absolute bottom-2 left-2 text-xs text-white/70 bg-black/40 px-2 py-1 rounded">Mobile</span>
                            </div>
                        ) : null}
                    </div>

                    {/* Desktop Media */}
                    <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/50">
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            🖥️ Hero Desktop (Horizontal)
                        </label>
                        <p className="text-xs text-zinc-500 mb-3">Ideal: 1920x1080px (16:9)</p>

                        {/* Media Type Toggle */}
                        <div className="flex gap-1 p-1 bg-zinc-800/70 rounded-lg mb-3">
                            <button
                                onClick={() => setConfig(prev => {
                                    const updated = { ...prev };
                                    delete updated.hero_video_desktop;
                                    return updated;
                                })}
                                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${!config.hero_video_desktop ? 'bg-primary text-black' : 'text-zinc-400 hover:text-white'}`}
                            >
                                🖼️ Imagem
                            </button>
                            <button
                                onClick={() => setConfig(prev => ({ ...prev, hero_video_desktop: prev.hero_video_desktop || '' }))}
                                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${config.hero_video_desktop !== undefined && config.hero_video_desktop !== null ? 'bg-primary text-black' : 'text-zinc-400 hover:text-white'}`}
                            >
                                🎬 Vídeo
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            <input
                                type="url"
                                value={config.hero_image_desktop || ''}
                                onChange={(e) => setConfig({ ...config, hero_image_desktop: e.target.value })}
                                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                                placeholder={config.hero_video_desktop !== undefined ? "URL imagem de capa (poster)" : "URL da imagem"}
                            />
                            <input
                                ref={fileInputDesktopRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'desktop')}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputDesktopRef.current?.click()}
                                disabled={uploadingDesktop}
                                className="w-full px-4 py-2 bg-zinc-700 text-white rounded-lg font-medium hover:bg-zinc-600 transition-colors disabled:opacity-50 text-sm"
                            >
                                {uploadingDesktop ? 'Enviando...' : 'Upload Imagem Desktop'}
                            </button>

                            {/* Video URL input */}
                            {config.hero_video_desktop !== undefined && config.hero_video_desktop !== null && (
                                <div className="mt-2 space-y-2">
                                    <label className="block text-xs font-medium text-zinc-400">
                                        🎬 URL do Vídeo Desktop (Cole o link ou faça upload)
                                    </label>
                                    <input
                                        type="url"
                                        value={config.hero_video_desktop || ''}
                                        onChange={(e) => setConfig({ ...config, hero_video_desktop: e.target.value })}
                                        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                                        placeholder="https://cdn.exemplo.com/video.mp4"
                                    />

                                    <input
                                        ref={fileInputVideoDesktopRef}
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => handleVideoUpload(e, 'desktop')}
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => fileInputVideoDesktopRef.current?.click()}
                                        disabled={uploadingVideoDesktop}
                                        className="w-full px-4 py-2 bg-zinc-700 text-white rounded-lg font-medium hover:bg-zinc-600 transition-colors disabled:opacity-50 text-xs flex items-center justify-center gap-2"
                                    >
                                        {uploadingVideoDesktop ? 'Enviando Vídeo...' : '☁️ Upload de Arquivo de Vídeo'}
                                    </button>

                                    <p className="text-[10px] text-zinc-600">
                                        Formatos: .mp4, .webm • Para 200MB+, comprima para ~30-50MB antes
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Preview */}
                        {config.hero_video_desktop ? (
                            <div className="mt-4 relative rounded-lg overflow-hidden h-32">
                                <video
                                    src={config.hero_video_desktop}
                                    poster={config.hero_image_desktop || undefined}
                                    muted
                                    loop
                                    playsInline
                                    autoPlay
                                    className="w-full h-full object-cover object-top"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <span className="absolute bottom-2 left-2 text-xs text-white/70 bg-black/40 px-2 py-1 rounded flex items-center gap-1">
                                    🎬 Vídeo Desktop
                                </span>
                            </div>
                        ) : config.hero_image_desktop ? (
                            <div className="mt-4 relative rounded-lg overflow-hidden h-32">
                                <img
                                    src={config.hero_image_desktop}
                                    alt="Desktop Preview"
                                    className="w-full h-full object-cover object-top"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <span className="absolute bottom-2 left-2 text-xs text-white/70 bg-black/40 px-2 py-1 rounded">Desktop</span>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Nome do Atleta</label>
                        <input
                            type="text"
                            value={config.athlete_name || ''}
                            onChange={(e) => setConfig({ ...config, athlete_name: e.target.value })}
                            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Tagline</label>
                        <input
                            type="text"
                            value={config.tagline || ''}
                            onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Views ao Vivo (30d)</label>
                    <input
                        type="text"
                        value={config.live_views || ''}
                        onChange={(e) => setConfig({ ...config, live_views: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-primary"
                        placeholder="Ex: 73.4k"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Texto do CTA</label>
                        <input
                            type="text"
                            value={config.cta_text || ''}
                            onChange={(e) => setConfig({ ...config, cta_text: e.target.value })}
                            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Link do CTA (WhatsApp)</label>
                        <input
                            type="url"
                            value={config.cta_link || ''}
                            onChange={(e) => setConfig({ ...config, cta_link: e.target.value })}
                            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-primary"
                            placeholder="https://wa.me/5511999999999"
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-black rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    <Save className="w-5 h-5" />
                    {saving ? 'Salvando...' : 'Salvar Configurações'}
                </button>
            </div>

            {/* Partners Section */}
            <PartnersEditor />
        </div>
    );
}

type Partner = {
    id: string;
    name: string;
    logo_url: string | null;
    website_url: string | null;
    display_order: number;
    is_active: boolean;
};

function PartnersEditor() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [newPartnerName, setNewPartnerName] = useState('');
    const [newPartnerLogo, setNewPartnerLogo] = useState('');
    const [newPartnerLink, setNewPartnerLink] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [uploadingNew, setUploadingNew] = useState(false);
    const newLogoInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchPartners();
    }, []);

    async function fetchPartners() {
        try {
            const { data, error } = await supabase
                .from('partners')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            setPartners(data || []);
        } catch (err) {
            console.error('Error fetching partners:', err);
        } finally {
            setLoading(false);
        }
    }

    async function addPartner() {
        if (!newPartnerName.trim()) return;

        setSaving(true);
        try {
            const maxOrder = partners.length > 0 ? Math.max(...partners.map(p => p.display_order)) : 0;

            const { data, error } = await supabase
                .from('partners')
                .insert({
                    name: newPartnerName.trim(),
                    logo_url: newPartnerLogo.trim() || null,
                    website_url: newPartnerLink.trim() || null,
                    display_order: maxOrder + 1,
                    is_active: true
                })
                .select()
                .single();

            if (error) throw error;

            setPartners([...partners, data]);
            setNewPartnerName('');
            setNewPartnerLogo('');
            setNewPartnerLink('');
            setMessage({ type: 'success', text: 'Parceiro adicionado!' });
        } catch (err) {
            console.error('Error adding partner:', err);
            setMessage({ type: 'error', text: 'Erro ao adicionar parceiro' });
        } finally {
            setSaving(false);
        }
    }

    async function updatePartner(id: string, updates: Partial<Partner>) {
        try {
            const { error } = await supabase
                .from('partners')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            setPartners(partners.map(p => p.id === id ? { ...p, ...updates } : p));
            setEditingId(null);
        } catch (err) {
            console.error('Error updating partner:', err);
            setMessage({ type: 'error', text: 'Erro ao atualizar parceiro' });
        }
    }

    async function deletePartner(id: string) {
        if (!confirm('Tem certeza que deseja excluir este parceiro?')) return;

        try {
            const { error } = await supabase
                .from('partners')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setPartners(partners.filter(p => p.id !== id));
            setMessage({ type: 'success', text: 'Parceiro excluído!' });
        } catch (err) {
            console.error('Error deleting partner:', err);
            setMessage({ type: 'error', text: 'Erro ao excluir parceiro' });
        }
    }

    async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>, partnerId?: string) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (partnerId) {
            setUploadingId(partnerId);
        } else {
            setUploadingNew(true);
        }

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `partner-${Date.now()}.${fileExt}`;
            const filePath = `partners/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('site-images')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('site-images')
                .getPublicUrl(filePath);

            if (partnerId) {
                await updatePartner(partnerId, { logo_url: data.publicUrl });
            } else {
                setNewPartnerLogo(data.publicUrl);
            }
            setMessage({ type: 'success', text: 'Logo carregada!' });
        } catch (err) {
            console.error('Error uploading logo:', err);
            setMessage({ type: 'error', text: 'Erro ao fazer upload da logo' });
        } finally {
            setUploadingId(null);
            setUploadingNew(false);
            // Reset file input
            e.target.value = '';
        }
    }

    if (loading) {
        return (
            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">🤝 Parceiros de Confiança</h3>
                <p className="text-sm text-zinc-400">Gerencie as logos dos parceiros que aparecem na home</p>
            </div>

            {message && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {message.text}
                </div>
            )}

            {/* Partner List */}
            <div className="space-y-3">
                {partners.map((partner) => (
                    <div
                        key={partner.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${partner.is_active
                            ? 'bg-zinc-800/50 border-zinc-700/50'
                            : 'bg-zinc-800/20 border-zinc-800/30 opacity-50'
                            }`}
                    >
                        {/* Logo with Upload */}
                        <div className="shrink-0 relative group">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleLogoUpload(e, partner.id)}
                                className="hidden"
                                id={`logo-upload-${partner.id}`}
                            />
                            <label
                                htmlFor={`logo-upload-${partner.id}`}
                                className="cursor-pointer block"
                            >
                                {uploadingId === partner.id ? (
                                    <div className="h-12 w-12 bg-zinc-700 rounded-lg flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                    </div>
                                ) : partner.logo_url ? (
                                    <div className="relative">
                                        <img
                                            src={partner.logo_url}
                                            alt={partner.name}
                                            className="h-12 w-12 object-contain rounded-lg bg-white/10 p-1 group-hover:opacity-70 transition-opacity"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Upload className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-12 w-12 bg-zinc-700 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:bg-zinc-600 transition-colors">
                                        <Upload className="w-4 h-4 opacity-0 group-hover:opacity-100 absolute" />
                                        <span className="group-hover:opacity-0 transition-opacity">{partner.name.charAt(0)}</span>
                                    </div>
                                )}
                            </label>
                        </div>

                        {/* Name and Link */}
                        <div className="flex-1 min-w-0 space-y-1">
                            {/* Name row */}
                            {editingId === partner.id ? (
                                <input
                                    type="text"
                                    value={partner.name}
                                    onChange={(e) => setPartners(partners.map(p =>
                                        p.id === partner.id ? { ...p, name: e.target.value } : p
                                    ))}
                                    onBlur={() => updatePartner(partner.id, { name: partner.name })}
                                    onKeyDown={(e) => e.key === 'Enter' && updatePartner(partner.id, { name: partner.name })}
                                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                                    autoFocus
                                />
                            ) : (
                                <span className="text-white font-medium truncate block">{partner.name}</span>
                            )}

                            {/* Link row */}
                            {editingLinkId === partner.id ? (
                                <div className="flex items-center gap-2">
                                    <Link2 className="w-3 h-3 text-zinc-400 shrink-0" />
                                    <input
                                        type="url"
                                        value={partner.website_url || ''}
                                        onChange={(e) => setPartners(partners.map(p =>
                                            p.id === partner.id ? { ...p, website_url: e.target.value } : p
                                        ))}
                                        onBlur={() => {
                                            updatePartner(partner.id, { website_url: partner.website_url || null });
                                            setEditingLinkId(null);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                updatePartner(partner.id, { website_url: partner.website_url || null });
                                                setEditingLinkId(null);
                                            }
                                        }}
                                        placeholder="https://exemplo.com"
                                        className="flex-1 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-zinc-300 text-xs focus:outline-none focus:border-primary"
                                        autoFocus
                                    />
                                </div>
                            ) : partner.website_url ? (
                                <div className="flex items-center gap-1 text-xs text-zinc-400 truncate">
                                    <Link2 className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{partner.website_url}</span>
                                </div>
                            ) : (
                                <span className="text-xs text-zinc-500 italic">Sem link</span>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            {/* Edit Link */}
                            <button
                                onClick={() => setEditingLinkId(editingLinkId === partner.id ? null : partner.id)}
                                className={`p-2 rounded-lg transition-colors ${partner.website_url
                                    ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                    : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'}`}
                                title="Editar link"
                            >
                                <Link2 className="w-4 h-4" />
                            </button>

                            {/* Toggle Active */}
                            <button
                                onClick={() => updatePartner(partner.id, { is_active: !partner.is_active })}
                                className={`p-2 rounded-lg transition-colors ${partner.is_active
                                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                    : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                                    }`}
                                title={partner.is_active ? 'Desativar' : 'Ativar'}
                            >
                                {partner.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>

                            {/* Edit Name */}
                            <button
                                onClick={() => setEditingId(editingId === partner.id ? null : partner.id)}
                                className="p-2 rounded-lg bg-zinc-700 text-zinc-300 hover:bg-zinc-600 hover:text-white transition-colors"
                                title="Editar nome"
                            >
                                <Edit className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                                onClick={() => deletePartner(partner.id)}
                                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                title="Excluir"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {partners.length === 0 && (
                    <div className="text-center py-8 text-zinc-500">
                        Nenhum parceiro cadastrado ainda.
                    </div>
                )}
            </div>

            {/* Add New Partner */}
            <div className="border-t border-zinc-800 pt-6">
                <h4 className="text-sm font-medium text-zinc-300 mb-3">Adicionar Novo Parceiro</h4>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        {/* Logo Upload Area */}
                        <div className="shrink-0">
                            <input
                                type="file"
                                accept="image/*"
                                ref={newLogoInputRef}
                                onChange={(e) => handleLogoUpload(e)}
                                className="hidden"
                            />
                            <button
                                onClick={() => newLogoInputRef.current?.click()}
                                disabled={uploadingNew}
                                className="h-14 w-14 bg-zinc-800 border-2 border-dashed border-zinc-600 rounded-xl flex items-center justify-center hover:border-primary hover:bg-zinc-700 transition-colors disabled:opacity-50"
                            >
                                {uploadingNew ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                ) : newPartnerLogo ? (
                                    <img
                                        src={newPartnerLogo}
                                        alt="Logo preview"
                                        className="h-12 w-12 object-contain rounded-lg"
                                    />
                                ) : (
                                    <Upload className="w-5 h-5 text-zinc-400" />
                                )}
                            </button>
                        </div>

                        {/* Name Input */}
                        <input
                            type="text"
                            value={newPartnerName}
                            onChange={(e) => setNewPartnerName(e.target.value)}
                            placeholder="Nome do parceiro"
                            className="flex-1 px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-primary"
                        />

                        {/* Link Input */}
                        <div className="flex items-center gap-2 flex-1">
                            <Link2 className="w-4 h-4 text-zinc-400 shrink-0" />
                            <input
                                type="url"
                                value={newPartnerLink}
                                onChange={(e) => setNewPartnerLink(e.target.value)}
                                placeholder="https://site-do-parceiro.com"
                                className="flex-1 px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-primary"
                            />
                        </div>

                        {/* Add Button */}
                        <button
                            onClick={addPartner}
                            disabled={saving || !newPartnerName.trim()}
                            className="px-6 py-3 bg-primary text-black rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Adicionar
                        </button>
                    </div>

                    {newPartnerLogo && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500 truncate flex-1">{newPartnerLogo}</span>
                            <button
                                onClick={() => setNewPartnerLogo('')}
                                className="text-red-400 hover:text-red-300 text-xs"
                            >
                                Remover logo
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SettingsTab() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Configurações</h2>
                <p className="text-zinc-400">Configurações gerais do sistema</p>
            </div>

            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Supabase</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">URL do Projeto</label>
                            <input
                                type="url"
                                placeholder="https://xxx.supabase.co"
                                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">Anon Key</label>
                            <input
                                type="password"
                                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button className="flex items-center gap-2 px-6 py-3 bg-primary text-black rounded-xl font-medium hover:bg-primary/90 transition-colors">
                        <Save className="w-4 h-4" />
                        Salvar Configurações
                    </button>
                </div>
            </div>
        </div>
    );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simulate a small delay for UX
        setTimeout(() => {
            if (username === 'admin' && password === 'Henrique09') {
                sessionStorage.setItem('admin_auth', 'true');
                onLogin();
            } else {
                setError('Usuário ou senha incorretos');
                setLoading(false);
            }
        }, 500);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md"
            >
                <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-8 shadow-2xl shadow-black/40">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4 border border-primary/30">
                            <span className="text-primary font-bold text-2xl font-display">HF</span>
                        </div>
                        <h1 className="font-display text-2xl font-bold text-white">
                            ADMIN <span className="text-primary">PANEL</span>
                        </h1>
                        <p className="text-zinc-500 text-sm mt-2">
                            Acesse o painel administrativo
                        </p>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -10, height: 0 }}
                                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Usuário
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                                placeholder="Digite seu usuário"
                                required
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Senha
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                                placeholder="Digite sua senha"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-black rounded-xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                    Entrando...
                                </>
                            ) : (
                                <>
                                    <LogOut className="w-4 h-4 rotate-180" />
                                    Entrar
                                </>
                            )}
                        </button>
                    </form>

                    {/* Back to site */}
                    <div className="mt-6 text-center">
                        <Link
                            to="/"
                            className="text-xs text-zinc-500 hover:text-primary transition-colors"
                        >
                            ← Voltar ao site
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return sessionStorage.getItem('admin_auth') === 'true';
    });

    const handleLogout = () => {
        sessionStorage.removeItem('admin_auth');
        setIsAuthenticated(false);
    };

    if (!isAuthenticated) {
        return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
    }

    return (
        <div className="min-h-screen bg-background flex">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-zinc-800/50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="hidden lg:block" />
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-zinc-400">Henrique Fujimoto</span>
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-primary font-bold text-sm">HF</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800/50 transition-colors"
                                title="Sair"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'dashboard' && <DashboardTab />}
                            {activeTab === 'blog' && <BlogTab />}
                            {activeTab === 'posts' && <PostsTab />}
                            {activeTab === 'bio' && <BioTab />}
                            {activeTab === 'tracking' && <TrackingTab />}
                            {activeTab === 'settings' && <SettingsTab />}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
