import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BarChart3,
    Heart,
    Newspaper,
    User,
    TrendingUp,
    Users,
    Eye,
    ChevronRight,
    ArrowRight,
    Calendar,
    Clock
} from 'lucide-react';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import StickyCTA from '../components/StickyCTA';
import CompetitionsSection from '../components/CompetitionsSection';
import AffiliateProducts from '../components/AffiliateProducts';
import { trackPageView } from '../lib/pageTracking';
import { getAggregatedMetrics } from '../lib/metrics';
import { supabase } from '../lib/supabase';

interface Partner {
    id: string;
    name: string;
    logo_url: string | null;
}

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

interface HomeCard {
    id: string;
    title: string;
    subtitle: string;
    cta_text: string;
    teaser_text: string;
    display_order: number;
    is_visible: boolean;
}

interface HubCardProps {
    to: string;
    icon: React.ReactNode;
    accentColor: string;
    bgGradient: string;
    title: string;
    subtitle: string;
    teaser: React.ReactNode;
    delay?: number;
    ctaText?: string;
}

function HubCard({ to, icon, accentColor, bgGradient, title, subtitle, teaser, delay = 0, ctaText }: HubCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
        >
            <Link
                to={to}
                className="group relative block bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/15 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.03)]"
            >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${bgGradient}`} />

                <div className="relative z-10 p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accentColor === 'text-green-400' ? 'bg-green-500/10' : accentColor === 'text-blue-400' ? 'bg-blue-500/10' : accentColor === 'text-amber-400' ? 'bg-amber-500/10' : 'bg-pink-500/10'}`}>
                            <div className={accentColor}>{icon}</div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-white">{title}</h3>
                    <p className="text-xs text-gray-500 mb-4">{subtitle}</p>

                    {/* Teaser Content */}
                    <div className="border-t border-white/5 pt-4">
                        {teaser}
                    </div>

                    {/* CTA Text */}
                    {ctaText && (
                        <div className="mt-3 flex items-center gap-1.5">
                            <span className={`text-xs font-bold flex items-center gap-1 ${accentColor === 'text-green-400' ? 'text-green-400' :
                                accentColor === 'text-blue-400' ? 'text-blue-400' :
                                    accentColor === 'text-amber-400' ? 'text-amber-400' :
                                        'text-pink-400'
                                }`}>
                                {ctaText}
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </div>
                    )}
                </div>

                {/* Bottom accent line on hover */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ${accentColor === 'text-green-400' ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                    accentColor === 'text-blue-400' ? 'bg-gradient-to-r from-blue-500 to-cyan-400' :
                        accentColor === 'text-amber-400' ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                            'bg-gradient-to-r from-pink-500 to-rose-400'
                    }`} />
            </Link>
        </motion.div>
    );
}

// Default card data as fallback
const DEFAULT_CARDS: Record<string, { title: string; subtitle: string; cta_text: string; teaser_text: string }> = {
    numeros: { title: 'Números & Métricas', subtitle: 'O impacto digital do Henrique em números reais', cta_text: 'Ver mais', teaser_text: '' },
    apoiar: { title: 'Apoie o Henrique', subtitle: 'Faça parte dessa jornada', cta_text: 'Entenda como apoiar', teaser_text: 'Parceiros de confiança que já apoiam o Henrique' },
    conteudo: { title: 'Conheça o Henrique', subtitle: 'A história por trás do atleta', cta_text: 'Saiba mais', teaser_text: 'Judoca desde os 4 anos, competidor de alto rendimento e sonho olímpico' },
    blog: { title: 'Blog & Notícias', subtitle: 'Artigos e novidades', cta_text: 'Veja outros posts', teaser_text: 'Judô, treino, competições e vida de atleta' },
};

// Card visual config (not editable from admin — visual concern only)
const CARD_CONFIG: Record<string, { to: string; icon: React.ReactNode; accentColor: string; bgGradient: string }> = {
    numeros: { to: '/numeros', icon: <BarChart3 className="w-6 h-6" />, accentColor: 'text-green-400', bgGradient: 'bg-gradient-to-br from-green-500/5 to-transparent' },
    apoiar: { to: '/apoiar', icon: <Heart className="w-6 h-6" />, accentColor: 'text-pink-400', bgGradient: 'bg-gradient-to-br from-pink-500/5 to-transparent' },
    conteudo: { to: '/conteudo', icon: <User className="w-6 h-6" />, accentColor: 'text-amber-400', bgGradient: 'bg-gradient-to-br from-amber-500/5 to-transparent' },
    blog: { to: '/blog', icon: <Newspaper className="w-6 h-6" />, accentColor: 'text-blue-400', bgGradient: 'bg-gradient-to-br from-blue-500/5 to-transparent' },
};

export default function HomePage() {
    const [metrics, setMetrics] = useState<any>(null);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [latestPost, setLatestPost] = useState<BlogPost | null>(null);
    const [homeCards, setHomeCards] = useState<HomeCard[]>([]);

    useEffect(() => {
        trackPageView('/', 'Hub Principal');

        async function loadTeasers() {
            const [metricsData, partnersRes, postsRes, cardsRes] = await Promise.all([
                getAggregatedMetrics(30),
                supabase
                    .from('partners')
                    .select('id, name, logo_url')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true }),
                supabase
                    .from('blog_posts')
                    .select('id, title, slug, og_image, category, published_at, created_at, reading_time')
                    .eq('status', 'published')
                    .order('published_at', { ascending: false })
                    .limit(1),
                supabase
                    .from('home_cards')
                    .select('*')
                    .eq('is_visible', true)
                    .order('display_order', { ascending: true }),
            ]);

            setMetrics(metricsData);
            setPartners(partnersRes.data || []);
            setLatestPost(postsRes.data?.[0] || null);
            setHomeCards(cardsRes.data || []);
        }

        loadTeasers();
    }, []);

    const formatNumber = (n: number) => {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return n.toString();
    };

    // Helper to get card data with fallback
    function getCard(id: string) {
        const dbCard = homeCards.find(c => c.id === id);
        const fallback = DEFAULT_CARDS[id];
        return {
            title: dbCard?.title || fallback?.title || '',
            subtitle: dbCard?.subtitle || fallback?.subtitle || '',
            cta_text: dbCard?.cta_text || fallback?.cta_text || '',
            teaser_text: dbCard?.teaser_text || fallback?.teaser_text || '',
        };
    }

    // Determine card order: use DB order if available, else default
    const cardOrder = homeCards.length > 0
        ? homeCards.map(c => c.id)
        : ['numeros', 'apoiar', 'conteudo', 'blog'];

    // Duplicate partners array for marquee effect
    const marqueePartners = [...partners, ...partners];

    // Build teaser renderers per card type
    function renderTeaser(cardId: string, cardData: ReturnType<typeof getCard>) {
        switch (cardId) {
            case 'numeros':
                return (
                    <div className="flex items-center gap-4">
                        {metrics ? (
                            <>
                                <div className="flex-1">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Eye className="w-3 h-3 text-green-400" />
                                        <span className="text-xs text-gray-400">Alcance 30d</span>
                                    </div>
                                    <span className="text-2xl font-black text-white">{formatNumber(metrics.total_reach)}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Users className="w-3 h-3 text-blue-400" />
                                        <span className="text-xs text-gray-400">Interações</span>
                                    </div>
                                    <span className="text-2xl font-black text-white">{formatNumber(metrics.total_interactions)}</span>
                                </div>
                                {metrics.reach_growth !== 0 && (
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className="w-4 h-4 text-green-400" />
                                        <span className="text-sm font-bold text-green-400">
                                            {metrics.reach_growth > 0 ? '+' : ''}{metrics.reach_growth}%
                                        </span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center gap-2 text-gray-500 text-xs">
                                <div className="w-3 h-3 rounded-full bg-green-500/30 animate-pulse" />
                                Carregando métricas...
                            </div>
                        )}
                    </div>
                );

            case 'apoiar':
                return (
                    <div className="space-y-3">
                        {partners.length > 0 && (
                            <div className="relative overflow-hidden rounded-lg h-10">
                                <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/60 to-transparent z-10 pointer-events-none" />
                                <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/60 to-transparent z-10 pointer-events-none" />
                                <motion.div
                                    className="flex gap-6 items-center w-max"
                                    animate={{ x: ['0%', '-50%'] }}
                                    transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
                                >
                                    {marqueePartners.map((p, i) => (
                                        p.logo_url ? (
                                            <img
                                                key={`${p.id}-${i}`}
                                                src={p.logo_url}
                                                alt={p.name}
                                                className="h-8 w-auto max-w-[100px] object-contain opacity-50 grayscale"
                                            />
                                        ) : (
                                            <span key={`${p.id}-${i}`} className="text-xs font-bold text-gray-600 whitespace-nowrap">{p.name}</span>
                                        )
                                    ))}
                                </motion.div>
                            </div>
                        )}
                        <p className="text-[11px] text-gray-500">{cardData.teaser_text}</p>
                    </div>
                );

            case 'conteudo':
                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="text-amber-400 text-lg">🥋</span>
                            <span>{cardData.teaser_text}</span>
                        </div>
                    </div>
                );

            case 'blog':
                return latestPost ? (
                    <div className="flex items-start gap-3">
                        {latestPost.og_image && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-white/5">
                                <img
                                    src={latestPost.og_image}
                                    alt={latestPost.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white line-clamp-2 leading-tight mb-1">{latestPost.title}</p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-2.5 h-2.5" />
                                    {new Date(latestPost.published_at || latestPost.created_at).toLocaleDateString('pt-BR')}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" />
                                    {latestPost.reading_time || 5} min
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Newspaper className="w-3 h-3 text-blue-400 flex-shrink-0" />
                        <span>{cardData.teaser_text}</span>
                    </div>
                );

            default:
                return <p className="text-xs text-gray-400">{cardData.teaser_text}</p>;
        }
    }

    return (
        <main className="relative min-h-screen w-full overflow-x-hidden">
            <Hero />

            <div className="relative z-10 -mt-8">
                {/* Hub Section Title */}
                <div className="max-w-5xl mx-auto px-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-3"
                    >
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Explore</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </motion.div>
                </div>

                {/* Hub Cards Grid */}
                <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cardOrder.map((cardId, index) => {
                        const config = CARD_CONFIG[cardId];
                        if (!config) return null;
                        const cardData = getCard(cardId);
                        return (
                            <HubCard
                                key={cardId}
                                to={config.to}
                                icon={config.icon}
                                accentColor={config.accentColor}
                                bgGradient={config.bgGradient}
                                title={cardData.title}
                                subtitle={cardData.subtitle}
                                ctaText={cardData.cta_text}
                                delay={0.05 + index * 0.05}
                                teaser={renderTeaser(cardId, cardData)}
                            />
                        );
                    })}
                </div>

                {/* Produtos Afiliados */}
                <AffiliateProducts />

                {/* Histórico Competitivo */}
                <CompetitionsSection />

                {/* Quick social links */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="max-w-5xl mx-auto px-4 mt-8 mb-6"
                >
                    <div className="flex items-center justify-center gap-4">
                        <a
                            href="https://instagram.com/henriquefujimoto"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-full text-xs text-gray-400 hover:text-white hover:border-pink-500/30 transition-all"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                            Instagram
                        </a>
                        <a
                            href="https://www.youtube.com/@henriquefujimotojudo"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-full text-xs text-gray-400 hover:text-white hover:border-red-500/30 transition-all"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                            YouTube
                        </a>
                    </div>
                </motion.div>
            </div>

            <Footer />
            <StickyCTA />
        </main>
    );
}
