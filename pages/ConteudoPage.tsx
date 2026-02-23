import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Flame, Star, Instagram, Loader2, X, Play, MapPin, Calendar, ChevronLeft, ChevronRight, Image as ImageIcon, Film } from 'lucide-react';
import SectionNav from '../components/SectionNav';
import TopContent from '../components/TopContent';
import Footer from '../components/Footer';
import StickyCTA from '../components/StickyCTA';
import { trackPageView } from '../lib/pageTracking';
import { supabase } from '../lib/supabase';

interface MediaItem {
    url: string;
    type: 'image' | 'video';
    caption?: string;
}

interface Milestone {
    year: string;
    title: string;
    description: string;
    /** Legacy */
    media_url?: string;
    media_type?: 'image' | 'video';
    /** Multi-media */
    media_items?: MediaItem[];
}

interface Stat {
    value: string;
    label: string;
}

interface AthleteProfile {
    bio_title: string;
    bio_description: string;
    milestones: Milestone[];
    stats: Stat[];
    values_list: string[];
}

interface Competition {
    id: string;
    name: string;
    date: string;
    location: string;
    category: string;
    weight_class: string;
    placement: string;
    medal_type: string | null;
    notes: string;
}

/** Merges legacy media_url into media_items */
function getMilestoneMedia(m: Milestone): MediaItem[] {
    const items: MediaItem[] = m.media_items ? [...m.media_items] : [];
    if (m.media_url && !items.some(i => i.url === m.media_url)) {
        items.unshift({ url: m.media_url, type: m.media_type || 'image' });
    }
    return items;
}

// Map icon by index for visual variety in the timeline
const MILESTONE_ICONS = [
    <Star className="w-5 h-5" />,
    <Trophy className="w-5 h-5" />,
    <Flame className="w-5 h-5" />,
    <Target className="w-5 h-5" />,
];


function StatCard({ value, label }: { value: string; label: string }) {
    return (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-primary mb-1">{value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</div>
        </div>
    );
}

interface SelectedMedia {
    items: MediaItem[];
    startIndex: number;
    title: string;
}

function MediaModal({ media, onClose }: { media: SelectedMedia; onClose: () => void }) {
    const [currentIdx, setCurrentIdx] = useState(media.startIndex);
    const current = media.items[currentIdx];
    const total = media.items.length;

    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') setCurrentIdx(i => Math.min(i + 1, total - 1));
            if (e.key === 'ArrowLeft') setCurrentIdx(i => Math.max(i - 1, 0));
        }
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose, total]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-4xl max-h-[90vh] w-full flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                    <p className="text-white text-sm font-bold">{media.title}</p>
                    <div className="flex items-center gap-3">
                        {total > 1 && (
                            <span className="text-gray-400 text-xs">{currentIdx + 1} / {total}</span>
                        )}
                        <button
                            onClick={onClose}
                            className="w-8 h-8 bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Media + nav */}
                <div className="relative flex items-center">
                    {/* Prev */}
                    {total > 1 && (
                        <button
                            onClick={() => setCurrentIdx(i => Math.max(i - 1, 0))}
                            disabled={currentIdx === 0}
                            className="absolute left-0 z-10 -translate-x-12 w-10 h-10 bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-30 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIdx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.15 }}
                            className="w-full"
                        >
                            {current.type === 'video' ? (
                                <video
                                    src={current.url}
                                    controls
                                    autoPlay
                                    className="w-full max-h-[72vh] rounded-xl object-contain bg-black"
                                />
                            ) : (
                                <img
                                    src={current.url}
                                    alt={current.caption || media.title}
                                    className="w-full max-h-[72vh] rounded-xl object-contain"
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Next */}
                    {total > 1 && (
                        <button
                            onClick={() => setCurrentIdx(i => Math.min(i + 1, total - 1))}
                            disabled={currentIdx === total - 1}
                            className="absolute right-0 z-10 translate-x-12 w-10 h-10 bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-30 transition-all"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Caption + dot nav */}
                {(current.caption || total > 1) && (
                    <div className="mt-3 text-center space-y-2">
                        {current.caption && (
                            <p className="text-gray-400 text-sm">{current.caption}</p>
                        )}
                        {total > 1 && (
                            <div className="flex justify-center gap-1.5">
                                {media.items.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentIdx(i)}
                                        className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIdx ? 'bg-primary scale-125' : 'bg-white/30 hover:bg-white/50'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

const medalEmoji = (type: string | null) => {
    if (type === 'gold') return '🥇';
    if (type === 'silver') return '🥈';
    if (type === 'bronze') return '🥉';
    return '🏅';
};

export default function ConteudoPage() {
    const [profile, setProfile] = useState<AthleteProfile | null>(null);
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(null);

    useEffect(() => {
        trackPageView('/conteudo', 'Conheça o Henrique');
        window.scrollTo(0, 0);

        async function loadData() {
            try {
                const [profileRes, compRes] = await Promise.all([
                    supabase
                        .from('athlete_profile')
                        .select('bio_title, bio_description, milestones, stats, values_list')
                        .limit(1)
                        .single(),
                    supabase
                        .from('competitions')
                        .select('*')
                        .order('date', { ascending: false }),
                ]);

                if (profileRes.error) throw profileRes.error;
                setProfile(profileRes.data);
                setCompetitions(compRes.data || []);
            } catch (err) {
                console.error('Error loading data:', err);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    if (loading) {
        return (
            <main className="relative min-h-screen w-full overflow-x-hidden bg-background">
                <SectionNav title="Conheça o Henrique" subtitle="A história por trás do atleta" />
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            </main>
        );
    }

    if (!profile) {
        return (
            <main className="relative min-h-screen w-full overflow-x-hidden bg-background">
                <SectionNav title="Conheça o Henrique" subtitle="A história por trás do atleta" />
                <div className="flex items-center justify-center h-[60vh] text-zinc-400">
                    Conteúdo não disponível no momento.
                </div>
                <Footer />
            </main>
        );
    }

    // Group competitions by year
    const compsByYear = competitions.reduce((acc, comp) => {
        const year = new Date(comp.date + 'T12:00:00').getFullYear().toString();
        if (!acc[year]) acc[year] = [];
        acc[year].push(comp);
        return acc;
    }, {} as Record<string, Competition[]>);
    const sortedYears = Object.keys(compsByYear).sort((a, b) => Number(b) - Number(a));

    return (
        <main className="relative min-h-screen w-full overflow-x-hidden bg-background">
            <SectionNav title="Conheça o Henrique" subtitle="A história por trás do atleta" />

            {/* Media Modal */}
            <AnimatePresence>
                {selectedMedia && (
                    <MediaModal media={selectedMedia} onClose={() => setSelectedMedia(null)} />
                )}
            </AnimatePresence>

            {/* Bio Hero Section */}
            <section className="relative py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-10"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-6">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            A Jornada
                        </div>
                        <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                            {profile.bio_title.includes(' ') ? (
                                <>
                                    {profile.bio_title.split(' ').slice(0, -1).join(' ')}{' '}
                                    <span className="text-primary">{profile.bio_title.split(' ').slice(-1)}</span>
                                </>
                            ) : (
                                <span className="text-primary">{profile.bio_title}</span>
                            )}
                        </h2>
                        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                            {profile.bio_description}
                        </p>
                    </motion.div>

                    {/* Quick Stats */}
                    {profile.stats.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className={`grid gap-3 mb-12 ${profile.stats.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' :
                                profile.stats.length === 2 ? 'grid-cols-2' :
                                    'grid-cols-3'
                                }`}
                        >
                            {profile.stats.map((stat, index) => (
                                <StatCard key={index} value={stat.value} label={stat.label} />
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Timeline Section */}
            {profile.milestones.length > 0 && (
                <section className="relative py-10 px-4">
                    <div className="max-w-3xl mx-auto">
                        <motion.h3
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-8 text-center"
                        >
                            Linha do Tempo
                        </motion.h3>

                        <div className="relative">
                            {/* Vertical line */}
                            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

                            <div className="space-y-8">
                                {profile.milestones.map((milestone, index) => {
                                    const mediaItems = getMilestoneMedia(milestone);
                                    const SHOW_LIMIT = 4;
                                    const visibleItems = mediaItems.slice(0, SHOW_LIMIT);
                                    const overflow = mediaItems.length - SHOW_LIMIT;

                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.1 }}
                                            className="relative pl-16"
                                        >
                                            {/* Timeline dot */}
                                            <div className="absolute left-[14px] top-1 w-7 h-7 rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center">
                                                <div className="text-primary">
                                                    {MILESTONE_ICONS[index % MILESTONE_ICONS.length]}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                                                <span className="text-primary text-xs font-bold uppercase tracking-widest">{milestone.year}</span>
                                                <h4 className="text-white font-bold text-lg mt-1 mb-2">{milestone.title}</h4>
                                                <p className="text-gray-400 text-sm leading-relaxed">{milestone.description}</p>

                                                {/* ── Media Gallery ── */}
                                                {mediaItems.length > 0 && (
                                                    <div className="mt-4">
                                                        {mediaItems.length === 1 ? (
                                                            // Single media: legacy style
                                                            <button
                                                                onClick={() => setSelectedMedia({
                                                                    items: mediaItems,
                                                                    startIndex: 0,
                                                                    title: `${milestone.year} — ${milestone.title}`,
                                                                })}
                                                                className="relative group rounded-lg overflow-hidden border border-white/10 hover:border-primary/30 transition-all inline-block"
                                                            >
                                                                {mediaItems[0].type === 'video' ? (
                                                                    <div className="relative">
                                                                        <video src={mediaItems[0].url} className="h-28 w-auto max-w-[220px] object-cover rounded-lg" muted />
                                                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                                                                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                                                                                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="relative">
                                                                        <img src={mediaItems[0].url} alt={mediaItems[0].caption || milestone.title} className="h-28 w-auto max-w-[220px] object-cover rounded-lg group-hover:scale-105 transition-transform duration-300" />
                                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                                                                    </div>
                                                                )}
                                                                {mediaItems[0].caption && (
                                                                    <p className="text-[10px] text-gray-500 mt-1 text-left px-0.5">{mediaItems[0].caption}</p>
                                                                )}
                                                            </button>
                                                        ) : (
                                                            // Multi-media grid
                                                            <div>
                                                                <div className="flex items-center gap-1.5 mb-2">
                                                                    <ImageIcon className="w-3 h-3 text-gray-500" />
                                                                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{mediaItems.length} fotos/vídeos</span>
                                                                </div>
                                                                <div className="grid grid-cols-4 gap-1.5">
                                                                    {visibleItems.map((item, itemIdx) => (
                                                                        <button
                                                                            key={itemIdx}
                                                                            onClick={() => setSelectedMedia({
                                                                                items: mediaItems,
                                                                                startIndex: itemIdx,
                                                                                title: `${milestone.year} — ${milestone.title}`,
                                                                            })}
                                                                            className="relative group aspect-square rounded-lg overflow-hidden border border-white/[0.06] hover:border-primary/30 transition-all"
                                                                        >
                                                                            {item.type === 'video' ? (
                                                                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                                                                    <video src={item.url} className="absolute inset-0 w-full h-full object-cover opacity-60" muted />
                                                                                    <Film className="w-4 h-4 text-white relative z-10 drop-shadow" />
                                                                                </div>
                                                                            ) : (
                                                                                <img src={item.url} alt={item.caption || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                                            )}
                                                                            {/* Overflow badge on last visible */}
                                                                            {itemIdx === SHOW_LIMIT - 1 && overflow > 0 && (
                                                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                                                    <span className="text-white font-bold text-sm">+{overflow}</span>
                                                                                </div>
                                                                            )}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>
            )}


            {/* Competitions Section */}
            {competitions.length > 0 && (
                <section className="py-10 px-4">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center mb-8"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
                                <Trophy className="w-3 h-3" />
                                Competições
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white">Histórico Competitivo</h3>
                        </motion.div>

                        {/* Summary Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="grid grid-cols-4 gap-3 mb-8"
                        >
                            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
                                <div className="text-xl font-black text-white">{competitions.length}</div>
                                <div className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Competições</div>
                            </div>
                            <div className="bg-white/[0.03] border border-yellow-500/10 rounded-xl p-3 text-center">
                                <div className="text-xl font-black text-yellow-400">{competitions.filter(c => c.medal_type === 'gold').length}</div>
                                <div className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Ouros</div>
                            </div>
                            <div className="bg-white/[0.03] border border-gray-400/10 rounded-xl p-3 text-center">
                                <div className="text-xl font-black text-gray-300">{competitions.filter(c => c.medal_type === 'silver').length}</div>
                                <div className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Pratas</div>
                            </div>
                            <div className="bg-white/[0.03] border border-amber-700/10 rounded-xl p-3 text-center">
                                <div className="text-xl font-black text-amber-600">{competitions.filter(c => c.medal_type === 'bronze').length}</div>
                                <div className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Bronzes</div>
                            </div>
                        </motion.div>

                        {/* Competitions by Year */}
                        <div className="space-y-6">
                            {sortedYears.map((year, yearIdx) => (
                                <motion.div
                                    key={year}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: yearIdx * 0.05 }}
                                >
                                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 flex items-center gap-2">
                                        <Calendar className="w-3 h-3" />
                                        {year}
                                    </h4>
                                    <div className="space-y-2">
                                        {compsByYear[year].map((comp) => (
                                            <div
                                                key={comp.id}
                                                className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 hover:border-white/10 transition-colors"
                                            >
                                                <span className="text-xl flex-shrink-0">{medalEmoji(comp.medal_type)}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-white font-semibold text-sm">{comp.name}</span>
                                                        {comp.category && (
                                                            <span className="text-[10px] px-1.5 py-0.5 bg-white/[0.05] border border-white/[0.08] rounded text-gray-400">{comp.category}</span>
                                                        )}
                                                        {comp.weight_class && (
                                                            <span className="text-[10px] px-1.5 py-0.5 bg-white/[0.05] border border-white/[0.08] rounded text-gray-400">{comp.weight_class}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-gray-500">
                                                        <span>{new Date(comp.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                                                        {comp.location && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-2.5 h-2.5" />
                                                                {comp.location}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <span className={`text-sm font-bold ${comp.medal_type === 'gold' ? 'text-yellow-400' : comp.medal_type === 'silver' ? 'text-gray-300' : comp.medal_type === 'bronze' ? 'text-amber-600' : 'text-white'}`}>
                                                        {comp.placement}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Values Section */}
            {profile.values_list.length > 0 && (
                <section className="py-10 px-4">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5 border border-white/[0.06] rounded-2xl p-8 text-center"
                        >
                            <span className="text-4xl mb-4 block">🥋</span>
                            <h3 className="text-xl font-bold text-white mb-3">Valores que guiam o Henrique</h3>
                            <div className="flex flex-wrap justify-center gap-3 mt-4">
                                {profile.values_list.map((value, index) => (
                                    <span
                                        key={index}
                                        className="px-4 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full text-sm text-gray-300 font-medium"
                                    >
                                        {value}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Instagram CTA */}
            <section className="py-6 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <a
                        href="https://instagram.com/henriquefujimoto"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-6 py-3 bg-white/[0.03] border border-white/[0.06] rounded-full text-white font-medium hover:border-pink-500/30 hover:bg-pink-500/5 transition-all"
                    >
                        <Instagram className="w-5 h-5 text-pink-400" />
                        Acompanhe no Instagram
                    </a>
                </div>
            </section>

            {/* Top Content from Instagram */}
            <div className="pt-4 pb-10">
                <TopContent />
            </div>

            <Footer />
            <StickyCTA />
        </main>
    );
}
