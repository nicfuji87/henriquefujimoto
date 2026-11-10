import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Calendar, MapPin, Medal, Trophy, Weight } from 'lucide-react';
import PortraitPanel from './PortraitPanel';
import CompetitionsExplorer, { type PresentationCompetition } from './CompetitionsExplorer';

interface Stat {
    icon: React.ComponentType<{ className?: string }>;
    value: number | string;
    label: string;
    sub?: string;
}

/** Pilula larga: icone, numero grande e o que ele mede. */
function StatPill({ icon: Icon, value, label, sub }: Stat) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-hf-line/70 bg-hf-surface px-5 py-4">
            <Icon className="h-7 w-7 shrink-0 text-hf-gold" />
            <span className="font-brand text-[2rem] font-black leading-none tracking-[-0.04em] text-hf-ice sm:text-[2.4rem]">
                {value}
            </span>
            <span className="min-w-0 font-ui text-[13px] leading-snug text-hf-ice/70">
                {label}
                {sub && <span className="mt-0.5 block text-[11px] text-hf-ice/40">{sub}</span>}
            </span>
        </div>
    );
}

/** Linha de conquista: o que foi, quando, onde e em que peso. */
function AchievementRow({ comp, first }: { comp: PresentationCompetition; first: boolean }) {
    const gold = comp.medal_type === 'gold';
    return (
        <div
            className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${
                first ? 'border-hf-gold/45 bg-hf-gold/[0.06]' : 'border-transparent'
            }`}
        >
            <Trophy className={`h-6 w-6 shrink-0 ${gold ? 'text-hf-gold' : 'text-hf-ice/35'}`} />
            <div className="min-w-0 flex-1">
                <p className="font-brand text-[13px] font-bold uppercase leading-tight text-hf-ice">
                    {comp.name}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-ui text-[11px] text-hf-ice/45">
                    <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(comp.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </span>
                    {comp.location && (
                        <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {comp.location}
                        </span>
                    )}
                    {comp.weight_class && (
                        <span className="flex items-center gap-1">
                            <Weight className="h-3 w-3" />
                            {comp.weight_class}
                        </span>
                    )}
                </p>
            </div>
            <span
                className={`shrink-0 rounded-full px-3 py-1 font-ui text-[10px] font-bold uppercase tracking-[0.1em] ${
                    gold
                        ? 'bg-hf-gold text-hf-navy'
                        : 'border border-hf-ice/25 text-hf-ice/70'
                }`}
            >
                {comp.placement}
            </span>
        </div>
    );
}

export default function ResultsSlide({
    kicker,
    title,
    accent,
    lead,
    photoUrl,
    competitions,
    total,
    firstYear,
    last12,
    last12Podiums,
    last12NoPodium,
}: {
    kicker: string;
    title: string;
    accent?: string;
    lead?: string;
    photoUrl?: string;
    competitions: PresentationCompetition[];
    total: number;
    firstYear: number | null;
    last12: number;
    last12Podiums: number;
    last12NoPodium: number;
}) {
    const [todos, setTodos] = useState(false);
    const destaques = competitions.slice(0, 4);

    return (
        <section className="relative flex min-h-full w-full overflow-hidden">
            {photoUrl && <PortraitPanel url={photoUrl} className="w-[24%]" />}

            <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-7 pb-12 pt-20 sm:px-12 sm:pt-24 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-10 lg:pr-[26%]">
                <div>
                    <p className="mb-4 flex items-center gap-3 font-ui text-[11px] font-semibold uppercase tracking-[0.22em] text-hf-gold">
                        <span className="h-px w-6 bg-hf-gold" />
                        {kicker}
                    </p>
                    <h2 className="font-brand text-[1.9rem] font-extrabold uppercase leading-[0.96] tracking-[-0.03em] sm:text-[2.5rem]">
                        <span className="block text-hf-ice">{title}</span>
                        {accent && <span className="block italic text-hf-gold">{accent}</span>}
                    </h2>
                    {lead && (
                        <p className="mt-5 max-w-md font-ui text-[15px] leading-relaxed text-hf-ice/70 sm:text-[16px]">
                            {lead}
                        </p>
                    )}
                    <span className="mt-6 block h-[3px] w-12 bg-hf-gold" />

                    <div className="mt-7 space-y-3">
                        <StatPill
                            icon={Trophy}
                            value={total}
                            label={firstYear ? `resultados desde ${firstYear}` : 'resultados'}
                        />
                        <StatPill icon={Medal} value={last12} label="competições nos últimos 12 meses" />
                        <StatPill
                            icon={BarChart3}
                            value={last12Podiums}
                            label="pódios no período"
                            sub={`${last12NoPodium} vezes fora do pódio`}
                        />
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="rounded-2xl border border-hf-line/70 bg-hf-surface/80 p-4 backdrop-blur-sm sm:p-5"
                >
                    <p className="mb-3 font-ui text-[11px] font-semibold uppercase tracking-[0.2em] text-hf-ice/55">
                        {todos ? 'Todos os resultados' : 'Principais conquistas recentes'}
                    </p>

                    {todos ? (
                        <CompetitionsExplorer competitions={competitions} />
                    ) : (
                        <div className="space-y-1">
                            {destaques.map((c, i) => (
                                <React.Fragment key={c.id}>
                                    <AchievementRow comp={c} first={i === 0} />
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => setTodos((v) => !v)}
                        className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 border-t border-hf-line/70 pt-4 font-ui text-[11px] font-semibold uppercase tracking-[0.16em] text-hf-gold transition-colors hover:text-hf-gold-soft"
                    >
                        {todos ? 'Ver só as principais' : 'Ver todos os resultados'}
                        <ArrowRight className={`h-4 w-4 transition-transform ${todos ? 'rotate-180' : ''}`} />
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
