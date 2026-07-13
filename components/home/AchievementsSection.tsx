import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import SectionHeading from './SectionHeading';

interface Competition {
    id: string;
    name: string;
    date: string;
    location: string;
    category: string;
    weight_class: string;
    placement: string;
    medal_type: string | null;
}

const medalEmoji = (type: string | null) => (type === 'gold' ? '🥇' : type === 'silver' ? '🥈' : type === 'bronze' ? '🥉' : '🏅');

function CompRow({ comp }: { comp: Competition }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-coal px-4 py-3 transition-colors hover:border-white/15">
            <span className="shrink-0 text-xl">{medalEmoji(comp.medal_type)}</span>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-grotesk text-sm font-semibold text-white">{comp.name}</span>
                    {comp.category && <span className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-grotesk text-[10px] text-white/50">{comp.category}</span>}
                    {comp.weight_class && <span className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-grotesk text-[10px] text-white/50">{comp.weight_class}</span>}
                </div>
                <div className="mt-0.5 flex items-center gap-3 font-grotesk text-[11px] text-white/40">
                    <span>{new Date(comp.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                    {comp.location && <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{comp.location}</span>}
                </div>
            </div>
            <span className={`shrink-0 font-grotesk text-sm font-semibold ${comp.medal_type === 'gold' ? 'text-lime' : 'text-white/80'}`}>{comp.placement}</span>
        </div>
    );
}

export default function AchievementsSection() {
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const { data } = await supabase.from('competitions').select('*').order('date', { ascending: false });
                setCompetitions(data || []);
            } catch (err) {
                console.error('Error loading competitions:', err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading || competitions.length === 0) return null;

    const golds = competitions.filter((c) => c.medal_type === 'gold').length;
    const silvers = competitions.filter((c) => c.medal_type === 'silver').length;
    const bronzes = competitions.filter((c) => c.medal_type === 'bronze').length;
    const podiums = golds + silvers + bronzes;

    const summary = [
        { label: 'Competições', value: competitions.length, accent: false },
        { label: 'Pódios', value: podiums, accent: true },
        { label: 'Ouros', value: golds, accent: false },
        { label: 'Pratas', value: silvers, accent: false },
        { label: 'Bronzes', value: bronzes, accent: false },
    ];

    const recent = competitions.slice(0, 6);
    const rest = competitions.slice(6);
    const restByYear = rest.reduce((acc, c) => {
        const y = new Date(c.date + 'T12:00:00').getFullYear().toString();
        (acc[y] = acc[y] || []).push(c);
        return acc;
    }, {} as Record<string, Competition[]>);
    const restYears = Object.keys(restByYear).sort((a, b) => Number(b) - Number(a));

    return (
        <section className="bg-night px-6 py-20 md:py-28">
            <div className="mx-auto max-w-6xl">
                <SectionHeading
                    title={<>Cada medalha conta <span className="font-editorial font-normal italic text-lime">uma história</span></>}
                    lead="Não são apenas resultados. Cada competição representa um aprendizado diferente. Às vezes o pódio. Às vezes uma derrota que muda completamente a forma de treinar. É isso que faz parte da evolução."
                />

                <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-5">
                    {summary.map((s, i) => (
                        <motion.div
                            key={s.label}
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.06 }}
                            className="rounded-2xl border border-white/[0.07] bg-coal p-4 text-center"
                        >
                            <div className={`font-grotesk text-3xl font-semibold ${s.accent ? 'text-lime' : 'text-white'}`}>{s.value}</div>
                            <div className="mt-1.5 font-grotesk text-[11px] font-medium text-white/45">{s.label}</div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-8 space-y-2">
                    <h3 className="mb-3 font-grotesk text-[12px] font-semibold uppercase tracking-[0.12em] text-white/40">Mais recentes</h3>
                    {recent.map((c) => <CompRow key={c.id} comp={c} />)}
                </div>

                {rest.length > 0 && (
                    <>
                        <AnimatePresence initial={false}>
                            {expanded && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4 }} className="overflow-hidden">
                                    <div className="mt-6 space-y-6">
                                        {restYears.map((year) => (
                                            <div key={year}>
                                                <h4 className="mb-3 font-grotesk text-lg font-semibold text-white/30">{year}</h4>
                                                <div className="space-y-2">{restByYear[year].map((c) => <CompRow key={c.id} comp={c} />)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            onClick={() => setExpanded((v) => !v)}
                            className="group mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 font-grotesk text-xs font-semibold text-white transition-colors hover:border-lime/40 hover:bg-white/10"
                        >
                            {expanded ? 'Recolher' : `Ver todas as ${competitions.length} competições`}
                            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                        </button>
                    </>
                )}
            </div>
        </section>
    );
}
