import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronDown, MapPin, Medal } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { hfCardLight, hfKickerOnLight, hfLeadOnLight, hfLinkOnLight, hfTitleOnLight } from '../ui/hf';

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
    type === 'gold'
        ? 'text-hf-gold'
        : type === 'silver'
          ? 'text-hf-navy/40'
          : type === 'bronze'
            ? 'text-[#B87333]'
            : 'text-hf-navy/25';

const medalLabel = (type: string | null) =>
    type === 'gold' ? 'Ouro' : type === 'silver' ? 'Prata' : type === 'bronze' ? 'Bronze' : 'Participação';

const longDate = (iso: string) =>
    new Date(iso + 'T12:00:00')
        .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
        .replace('.', '')
        .toUpperCase();

/** Card de destaque das competicoes mais recentes (faixa clara). */
const CompCard: React.FC<{ comp: Competition; delay: number }> = ({ comp, delay }) => (
    <motion.article
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.45, delay }}
        className={`${hfCardLight} flex flex-col`}
    >
        <div className="flex items-center justify-between border-b border-hf-navy/10 px-5 py-3">
            <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.18em] text-hf-navy/45">
                {longDate(comp.date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
                <Medal className={`h-4 w-4 ${medalTone(comp.medal_type)}`} />
                <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.12em] text-hf-navy/55">
                    {medalLabel(comp.medal_type)}
                </span>
            </span>
        </div>

        <div className="flex flex-1 flex-col px-5 py-4">
            <h3 className="font-brand text-sm font-bold uppercase leading-snug tracking-[0.01em] text-hf-navy">
                {comp.name}
            </h3>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-ui text-[12px] text-hf-navy/55">
                <span>{comp.placement}</span>
                {comp.category && <span>{comp.category}</span>}
                {comp.weight_class && <span>{comp.weight_class}</span>}
            </p>
            {comp.location && (
                <p className="mt-auto flex items-center gap-1.5 pt-4 font-ui text-[12px] text-hf-navy/45">
                    <MapPin className="h-3 w-3" />
                    {comp.location}
                </p>
            )}
        </div>
    </motion.article>
);

/** Linha compacta usada na lista completa. */
const CompRow: React.FC<{ comp: Competition }> = ({ comp }) => (
    <div className="flex items-center gap-3 rounded-xl border border-hf-navy/10 bg-white px-4 py-3 transition-colors hover:border-hf-gold/50">
        <Medal className={`h-4 w-4 shrink-0 ${medalTone(comp.medal_type)}`} aria-label={medalLabel(comp.medal_type)} />
        <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
                <span className="font-ui text-sm font-semibold text-hf-navy">{comp.name}</span>
                {comp.category && (
                    <span className="rounded border border-hf-navy/10 bg-hf-ice px-1.5 py-0.5 font-ui text-[10px] text-hf-navy/55">
                        {comp.category}
                    </span>
                )}
                {comp.weight_class && (
                    <span className="rounded border border-hf-navy/10 bg-hf-ice px-1.5 py-0.5 font-ui text-[10px] text-hf-navy/55">
                        {comp.weight_class}
                    </span>
                )}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-ui text-[11px] text-hf-navy/45">
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
                comp.medal_type === 'gold' ? 'text-hf-gold-dim' : 'text-hf-navy/70'
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

    // Sem registros confirmados a secao nao aparece: nada de resultado inventado.
    if (loading || competitions.length === 0) return null;

    const golds = competitions.filter((c) => c.medal_type === 'gold').length;
    const silvers = competitions.filter((c) => c.medal_type === 'silver').length;
    const bronzes = competitions.filter((c) => c.medal_type === 'bronze').length;

    const summary = [
        { label: 'Competições', value: competitions.length, accent: false },
        { label: 'Pódios', value: golds + silvers + bronzes, accent: true },
        { label: 'Ouros', value: golds, accent: false },
        { label: 'Pratas', value: silvers, accent: false },
        { label: 'Bronzes', value: bronzes, accent: false },
    ];

    const recent = competitions.slice(0, 3);
    const rest = competitions.slice(3);
    const restByYear = rest.reduce((acc, c) => {
        const y = new Date(c.date + 'T12:00:00').getFullYear().toString();
        (acc[y] = acc[y] || []).push(c);
        return acc;
    }, {} as Record<string, Competition[]>);
    const restYears = Object.keys(restByYear).sort((a, b) => Number(b) - Number(a));

    return (
        <section id="conquistas" className="scroll-mt-20 bg-hf-ice px-6 py-16 sm:py-20 md:py-24">
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.6fr] lg:gap-14">
                    {/* Texto */}
                    <div>
                        <span className="hf-rule mb-5 block" />
                        <p className={hfKickerOnLight}>Competições / Histórias / Resultados</p>
                        <h2 className={`mt-4 ${hfTitleOnLight}`}>
                            Terminou no tatame.
                            <br />
                            Continua aqui.
                        </h2>
                        <p className={`mt-5 max-w-md ${hfLeadOnLight}`}>
                            Cada competição deixa mais do que um resultado. Deixa aprendizado, próximos passos e
                            novas perguntas. A jornada segue.
                        </p>
                        <button
                            type="button"
                            onClick={() => setExpanded((v) => !v)}
                            className={`mt-7 ${hfLinkOnLight}`}
                        >
                            {expanded ? 'Recolher a lista' : `Ver todas as ${competitions.length} competições`}
                            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* Cards recentes */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {recent.map((c, i) => (
                            <CompCard key={c.id} comp={c} delay={i * 0.08} />
                        ))}
                    </div>
                </div>

                {/* Resumo real dos registros */}
                <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-hf-navy/10 bg-hf-navy/10 sm:grid-cols-5">
                    {summary.map((s, i) => (
                        <div
                            key={s.label}
                            className={`bg-hf-ice px-4 py-5 text-center ${
                                i === summary.length - 1 ? 'col-span-2 sm:col-span-1' : ''
                            }`}
                        >
                            <div
                                className={`font-brand text-2xl font-bold sm:text-3xl ${
                                    s.accent ? 'text-hf-gold-dim' : 'text-hf-navy'
                                }`}
                            >
                                {s.value}
                            </div>
                            <div className="mt-1.5 font-ui text-[10px] font-semibold uppercase tracking-[0.14em] text-hf-navy/45">
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Lista completa */}
                {rest.length > 0 && (
                    <AnimatePresence initial={false}>
                        {expanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.4 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-10 space-y-6">
                                    {restYears.map((year) => (
                                        <div key={year}>
                                            <h3 className="mb-3 font-brand text-base font-bold uppercase tracking-[0.1em] text-hf-navy/35">
                                                {year}
                                            </h3>
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
                )}

                <Link to="/numeros" className={`mt-10 ${hfLinkOnLight}`}>
                    A jornada também em números
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </section>
    );
}