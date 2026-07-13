import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, TrendingUp, TrendingDown, Check } from 'lucide-react';
import type { AggregatedMetrics } from '../../lib/metrics';
import SectionHeading from './SectionHeading';
import { useCountUp, formatCompact } from './utils';

interface ProofSectionProps {
    metrics: AggregatedMetrics | null;
}

const audience = ['Pais', 'Atletas', 'Senseis', 'Academias'];

function GrowthBadge({ value }: { value: number }) {
    if (!value) return null;
    const up = value > 0;
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-grotesk text-[11px] font-semibold ${up ? 'bg-lime/15 text-lime' : 'bg-white/10 text-white/50'}`}>
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {up ? '+' : ''}{value.toFixed(1).replace('.', ',')}%
        </span>
    );
}

function StatTile({ label, value, active, growth, accent = 'white', delay = 0 }: {
    label: string; value: number; active: boolean; growth?: number; accent?: 'white' | 'lime'; delay?: number;
}) {
    const display = useCountUp(value, active);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="rounded-3xl border border-white/[0.07] bg-coal p-6 transition-colors hover:border-white/15"
        >
            <div className="flex items-start justify-between">
                <div className={`font-grotesk text-4xl font-semibold tracking-tight sm:text-[2.75rem] ${accent === 'lime' ? 'text-lime' : 'text-white'}`}>
                    {formatCompact(display)}
                </div>
                {growth !== undefined && <GrowthBadge value={growth} />}
            </div>
            <div className="mt-2 font-grotesk text-[13px] font-medium text-white/50">{label}</div>
        </motion.div>
    );
}

export default function ProofSection({ metrics }: ProofSectionProps) {
    const gridRef = useRef<HTMLDivElement>(null);
    const inView = useInView(gridRef, { once: true, margin: '-80px' });

    const reach = metrics?.total_reach ?? 0;
    const interactions = metrics?.total_interactions ?? 0;
    const followers = metrics?.total_followers ?? 0;
    const gained = metrics?.followers_gained ?? 0;

    return (
        <section id="numeros" className="scroll-mt-16 bg-night px-6 py-14 sm:py-20 md:py-28">
            <div className="mx-auto max-w-6xl">
                <SectionHeading
                    title={<>Uma história que já <span className="font-editorial font-normal italic text-lime">alcança muita gente</span></>}
                    lead={<>Mais de {reach > 0 ? formatCompact(reach) : '170 mil'} pessoas acompanharam o conteúdo do Henrique nos últimos 30 dias. Mas, mais importante do que o alcance, é quem está acompanhando.</>}
                />

                {/* Who is watching — meaning before statistics */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6 }}
                    className="mt-8"
                >
                    <div className="flex flex-wrap gap-x-6 gap-y-3">
                        {audience.map((a) => (
                            <span key={a} className="inline-flex items-center gap-2 font-grotesk text-base font-medium text-white/85">
                                <Check className="h-4 w-4 text-lime" />
                                {a}
                            </span>
                        ))}
                    </div>
                    <p className="mt-4 max-w-xl font-grotesk text-sm text-white/45">
                        Pessoas que acreditam no esporte como ferramenta de transformação.
                    </p>
                </motion.div>

                {/* Then the statistics */}
                <div ref={gridRef} className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatTile label="Pessoas alcançadas · 30 dias" value={reach} active={inView} growth={metrics?.reach_growth} accent="lime" delay={0} />
                    <StatTile label="Interações · 30 dias" value={interactions} active={inView} growth={metrics?.interactions_growth} delay={0.08} />
                    <StatTile label="Novos seguidores · 30 dias" value={gained} active={inView} delay={0.16} />
                    <StatTile label="Seguidores" value={followers} active={inView} delay={0.24} />
                </div>

                <p className="mt-5 font-grotesk text-[13px] text-white/40">
                    Dados reais do Instagram, atualizados automaticamente.
                </p>

                <Link to="/numeros" className="group mt-6 inline-flex items-center gap-2 font-grotesk text-sm font-semibold text-lime transition-colors hover:text-lime-dim">
                    Ver todos os números
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>
        </section>
    );
}
