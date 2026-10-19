import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MapPin, Medal } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import SectionHeading from './SectionHeading';
import { hfBtnGhost, hfCard } from '../ui/hf';

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

/** Cor do icone por tipo de medalha. Ouro usa o dourado da marca. */
const medalTone = (type: string | null) =>
    type === 'gold' ? 'text-hf-gold' : type === 'silver' ? 'text-hf-ice/70' : type === 'bronze' ? 'text-[#B87333]' : 'text-hf-ice/35';

const medalLabel = (type: string | null) =>
    type === 'gold' ? 'Ouro' : type === 'silver' ? 'Prata' : type === 'bronze' ? 'Bronze' : 'Participação';

const CompRow: React.FC<{ comp: Competition }> = ({ comp }) => (
    <div className={`${hfCard} flex items-center gap-3 px-4 py-3 transition-colors hover:border-hf-gold/30`}>
        <Medal className={`h-5 w-5 shrink-0 ${medalTone(comp.medal_type)}`} aria-label={medalLabel(comp.medal_type)} />
        <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
                <span className="font-ui text-sm font-semibold text-hf-ice">{comp.name}</span>
                {comp.category && (
                    <span className="rounded-md border border-hf-line bg-hf-surface-2 px-1.5 py-0.5 font-ui text-[10px] text-hf-ice/50">
                        {comp.category}
                    </span>
                )}
                {comp.weight_class && (
                    <span className="rounded-md border border-hf-line bg-hf-surface-2 px-1.5 py-0.5 font-ui text-[10px] text-hf-ice/50">
                        {comp.weight_class}
                    </span>
                )}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-ui text-[11px] text-hf-ice/40">
                <span>{new Date(comp.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                {comp.location && (
                    <span className="flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5" />
                        {comp.location}
                    </span>
                )}
            </div>
        </div>
        <span
            className={`shrink-0 font-ui text-sm font-semibold ${
                comp.medal_type === 'gold' ? 'text-hf-gold' : 'text-hf-ice/80'
            }`}
        >
            {comp.placement}
        </span>
    </div>
);

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

    // Sem dados confirmados a secao nao aparece: nada de numeros inventados.
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
        <section id="conquistas" className="scroll-mt-20 bg-hf-navy px-6 py-16 sm:py-20 md:py-28">
            <div className="mx-auto max-w-6xl">
                <SectionHeading
                    kicker="Conquistas"
                    title={<>Cada medalha conta <span className="text-hf-gold">uma história</span></>}
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
                            className={`${hfCard} p-4 text-center`}
                        >
                            <div className={`font-brand text-3xl font-bold ${s.accent ? 'text-hf-gold' : 'text-hf-ice'}`}>
                                {s.value}
                            </div>
                            <div className="mt-1.5 font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-hf-ice/45">
                                {s.label}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-8 space-y-2">
                    <h3 className="mb-3 font-ui text-[12px] font-semibold uppercase tracking-[0.16em] text-hf-gold">
                        Mais recentes
                    </h3>
                    {recent.map((c) => (
                        <CompRow key={c.id} comp={c} />
                    ))}
                </div>

                {rest.length > 0 && (
                    <>
                        <AnimatePresence initial={false}>
                            {expanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-6 space-y-6">
                                        {restYears.map((year) => (
                                            <div key={year}>
                                                <h4 className="mb-3 font-brand text-lg font-bold text-hf-ice/30">{year}</h4>
                                                <div className="space-y-2">
                                                    {restByYear[year].map((c) => (
                                                        <CompRow key={c.id} comp={c} />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button onClick={() => setExpanded((v) => !v)} className={`group mt-6 ${hfBtnGhost}`}>
                            {expanded ? 'Recolher' : `Ver todas as ${competitions.length} competições`}
                            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                        </button>
                    </>
                )}
            </div>
        </section>
    );
}