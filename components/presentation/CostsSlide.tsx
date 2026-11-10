import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import {
    Activity,
    Apple,
    Dumbbell,
    Globe,
    GraduationCap,
    HeartPulse,
    Plane,
    Shirt,
    Ticket,
    TrendingDown,
    User,
    Users,
} from 'lucide-react';
import PortraitPanel from './PortraitPanel';

export interface CostItem {
    label: string;
    monthly: number;
    group: string;
}
export interface CostAsk {
    percent: number;
    base: number;
    base_label?: string;
}

const brl = (n: number) =>
    new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(Math.round(n));

/** Cada linha ganha o icone do que ela e, pelo proprio rotulo. */
function itemIcon(label: string): React.ComponentType<{ className?: string }> {
    const l = label.toLowerCase();
    if (/escola|mensalidade|col[ée]gio/.test(l)) return GraduationCap;
    if (/ingl[êe]s|idioma/.test(l)) return Globe;
    if (/viagem|viagens|passagem/.test(l)) return Plane;
    if (/psic|terapia/.test(l)) return HeartPulse;
    if (/f[íi]sic|invictus|muscula/.test(l)) return Dumbbell;
    if (/nutri/.test(l)) return Apple;
    if (/osteo|fisio/.test(l)) return Activity;
    if (/equipamento|kimono|material/.test(l)) return Shirt;
    if (/inscri|competi/.test(l)) return Ticket;
    if (/particular/.test(l)) return User;
    return Users;
}

/** Dourado no maior grupo, azuis nos demais: a leitura comeca pelo que pesa. */
const GROUP_COLORS = ['#D4A336', '#3C6E9E', '#5A93C4', '#86B4DC', '#A9CBE8'];

export default function CostsSlide({
    kicker,
    title,
    accent,
    lead,
    items,
    highlight,
    ask,
    photoUrl,
}: {
    kicker: string;
    title: string;
    accent?: string;
    lead?: string;
    items: CostItem[];
    highlight?: string;
    ask?: CostAsk | null;
    photoUrl?: string;
}) {
    const sorted = useMemo(() => [...items].sort((a, b) => b.monthly - a.monthly), [items]);
    const totalMonthly = useMemo(() => items.reduce((s, i) => s + (i.monthly || 0), 0), [items]);

    const groups = useMemo(() => {
        const map = new Map<string, number>();
        for (const i of items) map.set(i.group, (map.get(i.group) || 0) + (i.monthly || 0));
        return [...map.entries()]
            .map(([name, monthly]) => ({ name, monthly }))
            .sort((a, b) => b.monthly - a.monthly);
    }, [items]);

    const askValues = useMemo(() => {
        if (!ask || !ask.percent || !ask.base) return null;
        const monthly = (ask.base * ask.percent) / 100;
        const annual = monthly * 12;
        const share = totalMonthly > 0 ? (monthly / totalMonthly) * 100 : 0;
        return { monthly, annual, share };
    }, [ask, totalMonthly]);

    return (
        <section className="relative flex min-h-full w-full overflow-hidden">
            {photoUrl && <PortraitPanel url={photoUrl} variant="bust" className="w-[25%]" />}

            <div className="relative mx-auto w-full max-w-6xl px-7 pb-10 pt-[72px] sm:px-12 sm:pt-20 lg:pr-[23%]">
                <p className="mb-4 flex items-center gap-3 font-ui text-[11px] font-semibold uppercase tracking-[0.22em] text-hf-gold">
                    <span className="h-px w-6 bg-hf-gold" />
                    {kicker}
                </p>
                <h2 className="font-brand text-[1.6rem] font-extrabold uppercase leading-[0.96] tracking-[-0.03em] sm:text-[2.05rem]">
                    <span className="text-hf-ice">{title} </span>
                    {accent && <span className="text-hf-gold">{accent}</span>}
                </h2>
                {lead && (
                    <p className="mt-3 max-w-2xl font-ui text-[13px] leading-relaxed text-hf-ice/60 sm:text-[14px]">
                        {lead}
                    </p>
                )}

                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.05fr_1fr]">
                    {/* Tabela */}
                    <div className="overflow-hidden rounded-2xl border border-hf-line/70 bg-hf-surface">
                        <div className="flex items-center gap-3 border-b border-hf-line/70 px-4 py-2.5 font-ui text-[10px] font-semibold uppercase tracking-[0.16em] text-hf-ice/45">
                            <span className="flex-1">Item</span>
                            <span className="w-16 text-right">Por mês</span>
                            <span className="w-20 text-right">Por ano</span>
                        </div>
                        {sorted.map((it, i) => {
                            const Icon = itemIcon(it.label);
                            return (
                                <div
                                    key={`${it.label}-${i}`}
                                    className="flex items-center gap-3 border-b border-hf-line/40 px-4 py-[5px] last:border-0"
                                >
                                    <Icon className="h-4 w-4 shrink-0 text-hf-gold/80" />
                                    <span className="min-w-0 flex-1 truncate font-ui text-[13px] text-hf-ice/80">
                                        {it.label}
                                    </span>
                                    <span className="w-16 text-right font-ui text-[13px] tabular-nums text-hf-ice">
                                        {brl(it.monthly)}
                                    </span>
                                    <span className="w-20 text-right font-ui text-[13px] tabular-nums text-hf-ice/55">
                                        {brl(it.monthly * 12)}
                                    </span>
                                </div>
                            );
                        })}
                        <div className="flex items-center gap-3 bg-hf-gold px-4 py-2.5 font-brand text-[13px] font-bold uppercase tracking-[0.06em] text-hf-navy">
                            <span className="flex-1">Total</span>
                            <span className="w-16 text-right tabular-nums">{brl(totalMonthly)}</span>
                            <span className="w-20 text-right tabular-nums">{brl(totalMonthly * 12)}</span>
                        </div>
                    </div>

                    {/* Rosca + destaque + o que o pedido representa */}
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-hf-line/70 bg-hf-surface p-4 sm:p-5">
                            <p className="mb-2 font-ui text-[10px] font-semibold uppercase tracking-[0.18em] text-hf-ice/45">
                                Custo por grupo (mensal)
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="relative h-[136px] w-[136px] shrink-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={groups}
                                                dataKey="monthly"
                                                innerRadius="62%"
                                                outerRadius="100%"
                                                startAngle={90}
                                                endAngle={-270}
                                                stroke="none"
                                                isAnimationActive={false}
                                            >
                                                {groups.map((g, i) => (
                                                    <Cell
                                                        key={g.name}
                                                        fill={GROUP_COLORS[i % GROUP_COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="font-brand text-[15px] font-bold leading-none text-hf-ice">
                                            {brl(totalMonthly)}
                                        </span>
                                        <span className="mt-0.5 font-ui text-[9px] uppercase tracking-[0.1em] text-hf-ice/45">
                                            por mês
                                        </span>
                                    </div>
                                </div>

                                <ul className="min-w-0 flex-1 space-y-2">
                                    {groups.map((g, i) => (
                                        <li key={g.name} className="flex items-baseline gap-2">
                                            <span
                                                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-[3px]"
                                                style={{ background: GROUP_COLORS[i % GROUP_COLORS.length] }}
                                            />
                                            <span className="min-w-0 flex-1 truncate font-ui text-[12px] text-hf-ice/75">
                                                {g.name}
                                            </span>
                                            <span className="shrink-0 font-ui text-[12px] tabular-nums text-hf-ice/55">
                                                {brl(g.monthly)}
                                            </span>
                                            <span className="w-9 shrink-0 text-right font-ui text-[12px] font-semibold tabular-nums text-hf-gold">
                                                {Math.round((g.monthly / totalMonthly) * 100)}%
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {highlight && (
                            <div className="flex items-start gap-3 rounded-2xl border border-hf-gold/30 bg-hf-gold/[0.06] px-4 py-3">
                                <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-hf-gold" />
                                <p className="font-ui text-[13px] leading-relaxed text-hf-ice/85">
                                    {highlight}
                                </p>
                            </div>
                        )}

                        {askValues && ask && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: 0.15 }}
                                className="rounded-2xl border border-hf-line/70 bg-hf-surface p-4 sm:p-5"
                            >
                                <p className="font-ui text-[10px] font-semibold uppercase tracking-[0.18em] text-hf-ice/45">
                                    O que o apoio representa
                                </p>
                                <p className="mt-2 font-ui text-[13px] leading-relaxed text-hf-ice/75">
                                    Sobre a {ask.base_label || 'mensalidade'} de R$ {brl(ask.base)}, um
                                    apoio de{' '}
                                    <span className="font-semibold text-hf-gold">{ask.percent}%</span>{' '}
                                    significa:
                                </p>
                                <div className="mt-3 grid grid-cols-3 gap-2">
                                    {[
                                        { v: `R$ ${brl(askValues.monthly)}`, l: 'por mês' },
                                        { v: `R$ ${brl(askValues.annual)}`, l: 'por ano' },
                                        {
                                            v: `${askValues.share.toFixed(1).replace('.', ',')}%`,
                                            l: 'do projeto todo',
                                        },
                                    ].map((b) => (
                                        <div
                                            key={b.l}
                                            className="rounded-xl border border-hf-line/70 bg-hf-navy/50 px-3 py-2.5 text-center"
                                        >
                                            <div className="font-brand text-[15px] font-bold leading-none text-hf-gold">
                                                {b.v}
                                            </div>
                                            <div className="mt-1 font-ui text-[10px] text-hf-ice/45">{b.l}</div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
