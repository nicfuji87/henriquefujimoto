import React, { useEffect, useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { supabase } from '../../lib/supabase';

interface Point {
    date: string;
    reach: number | null;
}

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const fmtShort = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.', ',')} mil` : String(n);

/**
 * Alcance de 28 dias do Instagram ao longo do ultimo ano.
 *
 * O dado e o `reach_28d` da propria API, que ja vem deduplicado: somar o
 * alcance diario inflaria o numero. Os dias sem medicao entram como `null` de
 * proposito, para o periodo de conta bloqueada aparecer como buraco no grafico
 * em vez de virar uma linha reta que nao existiu.
 */
export default function ReachChart() {
    const [data, setData] = useState<Point[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const start = new Date();
            start.setDate(start.getDate() - 365);
            const { data: rows } = await supabase
                .from('daily_metrics')
                .select('date, reach_28d')
                .gte('date', start.toISOString().slice(0, 10))
                .order('date', { ascending: true });
            if (cancelled) return;

            const byDate = new Map<string, number>();
            for (const r of (rows as { date: string; reach_28d: number | null }[]) || []) {
                if (r.reach_28d != null) byDate.set(r.date, r.reach_28d);
            }

            // Eixo continuo: um ponto por dia, mesmo nos dias sem medicao.
            const points: Point[] = [];
            const cursor = new Date(start);
            const today = new Date();
            while (cursor <= today) {
                const key = cursor.toISOString().slice(0, 10);
                points.push({ date: key, reach: byDate.has(key) ? byDate.get(key)! : null });
                cursor.setDate(cursor.getDate() + 1);
            }
            setData(points);
            setLoading(false);
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const gap = useMemo(() => {
        // Maior buraco ENTRE duas medicoes. O periodo anterior a primeira
        // medicao nao conta: ali nao houve interrupcao, so nao existia coleta.
        let best: { from: string; to: string; days: number } | null = null;
        let seenData = false;
        let runStart: string | null = null;
        let runLen = 0;
        for (const p of data) {
            if (p.reach == null) {
                if (seenData) {
                    if (!runStart) runStart = p.date;
                    runLen += 1;
                }
            } else {
                if (runStart && runLen > (best?.days || 0)) {
                    best = { from: runStart, to: p.date, days: runLen };
                }
                seenData = true;
                runStart = null;
                runLen = 0;
            }
        }
        return best && best.days >= 14 ? best : null;
    }, [data]);

    // Uma marca por mes, escolhida antes de desenhar. Deixar o recharts decidir
    // sobre 365 pontos faz os rotulos dancarem a cada redimensionamento.
    const monthTicks = useMemo(
        () => data.filter((d) => d.date.slice(-2) === '01').map((d) => d.date),
        [data],
    );

    if (loading) {
        return <div className="h-[220px] animate-pulse rounded-2xl bg-hf-surface-2" />;
    }
    if (data.every((d) => d.reach == null)) return null;

    const tickFmt = (iso: string) => {
        const d = new Date(iso + 'T12:00:00');
        return d.getMonth() === 0 ? `${MONTHS[0]}/${String(d.getFullYear()).slice(2)}` : MONTHS[d.getMonth()];
    };

    return (
        <div className="rounded-2xl border border-hf-line/70 bg-hf-surface p-4 sm:p-5">
            <p className="font-ui text-[12px] font-semibold uppercase tracking-[0.16em] text-hf-gold">
                Contas alcançadas a cada 28 dias
            </p>
            <div className="mt-4 h-[168px] w-full sm:h-[208px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 6, right: 6, left: -16, bottom: 0 }}>
                        <defs>
                            <linearGradient id="hfReach" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#D4A336" stopOpacity={0.45} />
                                <stop offset="100%" stopColor="#D4A336" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(244,246,248,0.07)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            ticks={monthTicks}
                            tickFormatter={tickFmt}
                            interval={0}
                            tick={{ fill: 'rgba(244,246,248,0.45)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            padding={{ left: 2, right: 2 }}
                        />
                        <YAxis
                            tickFormatter={fmtShort}
                            tick={{ fill: 'rgba(244,246,248,0.35)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            width={54}
                        />
                        <Tooltip
                            contentStyle={{
                                background: '#131c2e',
                                border: '1px solid rgba(244,246,248,0.12)',
                                borderRadius: 12,
                                fontSize: 12,
                            }}
                            labelFormatter={(v) => new Date(v + 'T12:00:00').toLocaleDateString('pt-BR')}
                            formatter={(v: number) => [`${v.toLocaleString('pt-BR')} contas`, '28 dias']}
                        />
                        <Area
                            type="monotone"
                            dataKey="reach"
                            stroke="#D4A336"
                            strokeWidth={2}
                            fill="url(#hfReach)"
                            connectNulls={false}
                            isAnimationActive={false}
                            dot={false}
                            activeDot={{ r: 4, fill: '#D4A336' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            {gap && (
                <p className="mt-3 font-ui text-[12px] leading-relaxed text-hf-ice/45">
                    O vazio no meio do gráfico são {gap.days} dias sem medição, entre{' '}
                    {new Date(gap.from + 'T12:00:00').toLocaleDateString('pt-BR')} e{' '}
                    {new Date(gap.to + 'T12:00:00').toLocaleDateString('pt-BR')}, quando a conta
                    ficou bloqueada.
                </p>
            )}
        </div>
    );
}
