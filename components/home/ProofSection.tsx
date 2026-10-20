import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Check, TrendingDown, TrendingUp } from 'lucide-react';
import type { AggregatedMetrics } from '../../lib/metrics';
import SectionHeading from './SectionHeading';
import { hfCard, hfEmpty, hfLink, hfSkeleton } from '../ui/hf';
import { formatCompact, useCountUp } from './utils';

interface ProofSectionProps {
    metrics: AggregatedMetrics | null;
    loading?: boolean;
}

const audience = ['Pais', 'Atletas', 'Senseis', 'Academias'];

function GrowthBadge({ value }: { value?: number }) {
    if (!value) return null;
    const up = value > 0;
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-ui text-[11px] font-semibold ${
                up ? 'bg-hf-gold/15 text-hf-gold' : 'bg-hf-ice/10 text-hf-ice/50'
            }`}
        >
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {up ? '+' : ''}
            {value.toFixed(1).replace('.', ',')}%
        </span>
    );
}

interface StatTileProps {
    label: string;
    value: number;
    active: boolean;
    growth?: number;
    accent?: boolean;
    delay?: number;
}

const StatTile: React.FC<StatTileProps> = ({ label, value, active, growth, accent = false, delay = 0 }) => {
    const display = useCountUp(value, active);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className={`${hfCard} p-6 transition-colors hover:border-hf-gold/30`}
        >
            <div className="flex items-start justify-between gap-2">
                <div
                    className={`font-brand text-4xl font-bold tracking-tight sm:text-[2.6rem] ${
                        accent ? 'text-hf-gold' : 'text-hf-ice'
                    }`}
                >
                    {formatCompact(display)}
                </div>
                <GrowthBadge value={growth} />
            </div>
            <div className="mt-2 font-ui text-[13px] font-medium text-hf-ice/50">{label}</div>
        </motion.div>
    );
};

export default function ProofSection({ metrics, loading = false }: ProofSectionProps) {
    const gridRef = useRef<HTMLDivElement>(null);
    const inView = useInView(gridRef, { once: true, margin: '-80px' });

    const reach = metrics?.total_reach ?? 0;
    const interactions = metrics?.total_interactions ?? 0;
    const followers = metrics?.total_followers ?? 0;
    const gained = metrics?.followers_gained ?? 0;

    // Apenas indicadores com dado verificavel entram na tela. Um indicador sem
    // dado nao vira zero: ele simplesmente nao e exibido.
    const tiles = [
        reach > 0 && { key: 'reach', label: 'Pessoas alcançadas · 30 dias', value: reach, growth: metrics?.reach_growth, accent: true },
        interactions > 0 && { key: 'interactions', label: 'Interações · 30 dias', value: interactions, growth: metrics?.interactions_growth },
        gained > 0 && { key: 'gained', label: 'Novos seguidores · 30 dias', value: gained },
        followers > 0 && { key: 'followers', label: 'Seguidores', value: followers },
    ].filter(Boolean) as { key: string; label: string; value: number; growth?: number; accent?: boolean }[];

    // Uma janela mal sincronizada nao vira "pouco alcance": sem cobertura
    // suficiente de medicao, o periodo e tratado como indisponivel.
    const measured = (metrics?.coverage ?? 0) >= 0.6;
    const hasData = measured && tiles.length > 0;

    return (
        <section id="numeros" className="scroll-mt-20 bg-hf-navy px-6 py-16 sm:py-20 md:py-28">
            <div className="mx-auto max-w-6xl">
                <SectionHeading
                    kicker="Números"
                    title={<>A jornada também pode ser <span className="text-hf-gold">contada em números.</span></>}
                    lead={
                        hasData && reach > 0 ? (
                            <>
                                {formatCompact(reach)} pessoas viram o conteúdo do Henrique nos últimos 30 dias. O
                                número mede o tamanho da audiência. Quem está do outro lado diz mais.
                            </>
                        ) : (
                            <>
                                Boa parte de quem acompanha o Henrique está dentro do esporte, e é por isso que a
                                audiência importa mais pelo perfil do que pelo tamanho.
                            </>
                        )
                    }
                />

                {/* Quem acompanha — significado antes da estatistica */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6 }}
                    className="mt-8"
                >
                    <div className="flex flex-wrap gap-x-6 gap-y-3">
                        {audience.map((a) => (
                            <span key={a} className="inline-flex items-center gap-2 font-ui text-base font-medium text-hf-ice/85">
                                <Check className="h-4 w-4 text-hf-gold" />
                                {a}
                            </span>
                        ))}
                    </div>
                    <p className="mt-4 max-w-xl font-ui text-sm text-hf-ice/45">
                        É uma audiência de nicho, construída em torno do judô.
                    </p>
                </motion.div>

                {/* Estatisticas */}
                <div ref={gridRef} className="mt-12">
                    {loading ? (
                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                            {[0, 1, 2, 3].map((i) => (
                                <div key={i} className={`${hfSkeleton} h-[132px]`} />
                            ))}
                        </div>
                    ) : hasData ? (
                        <div
                            className={`grid gap-4 ${
                                tiles.length >= 3 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'
                            }`}
                        >
                            {tiles.map((t, i) => (
                                <StatTile
                                    key={t.key}
                                    label={t.label}
                                    value={t.value}
                                    growth={t.growth}
                                    accent={t.accent}
                                    active={inView}
                                    delay={i * 0.08}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className={hfEmpty}>
                            Os indicadores de audiência não estão disponíveis para este período: a sincronização com
                            o Instagram está incompleta. Assim que os dados forem atualizados, os números reais
                            aparecem aqui.
                        </p>
                    )}
                </div>

                {hasData && (
                    <p className="mt-5 font-ui text-[13px] text-hf-ice/40">
                        Dados reais do Instagram, atualizados automaticamente.
                    </p>
                )}

                <Link to="/numeros" className={`mt-6 ${hfLink} group`}>
                    Ver todos os números
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>
        </section>
    );
}