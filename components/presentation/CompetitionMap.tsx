import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { statePaths, stateCodeToName } from '../BrazilMap';
import type { PresentationCompetition } from './CompetitionsExplorer';

/**
 * Onde ele competiu, por estado.
 *
 * Reaproveita os contornos do mapa que ja existe no site, mas conta outra
 * coisa: aqui o valor e quantidade de competicoes, nao porcentagem de
 * audiencia, entao o rotulo e o numero bruto.
 */
export default function CompetitionMap({
    competitions,
    caption,
    highlight,
}: {
    competitions: PresentationCompetition[];
    caption?: string;
    /** UFs com marca propria na lista, ex.: onde competiu pela escola. */
    highlight?: Record<string, string>;
}) {
    const byState = useMemo<Record<string, number>>(() => {
        const result: Record<string, number> = {};
        for (const c of competitions) {
            // Formato do cadastro: "Brasília-DF", "Santo Antônio do Descoberto-GO".
            const uf = (c.location || '').trim().slice(-2).toUpperCase();
            if (statePaths[uf]) result[uf] = (result[uf] || 0) + 1;
        }
        return result;
    }, [competitions]);

    const entries = useMemo<[string, number][]>(
        () => (Object.entries(byState) as [string, number][]).sort(([, a], [, b]) => b - a),
        [byState],
    );
    const max = Math.max(...(Object.values(byState) as number[]), 1);

    if (entries.length === 0) return null;

    // Raiz quadrada em vez de proporcao direta: com 23 competicoes no DF, uma
    // escala linear deixaria os estados de uma competicao praticamente invisiveis.
    const fill = (code: string) => {
        const v = byState[code] || 0;
        if (!v) return 'rgba(244,246,248,0.07)';
        return `rgba(212,163,54,${(0.38 + Math.sqrt(v / max) * 0.57).toFixed(3)})`;
    };

    return (
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <div className="w-full max-w-[400px] shrink-0">
                <svg viewBox="20 5 360 375" className="h-auto w-full">
                    {Object.entries(statePaths).map(([code, d]) => (
                        <motion.path
                            key={code}
                            d={d}
                            fill={fill(code)}
                            stroke={
                                highlight?.[code]
                                    ? '#F4F6F8'
                                    : byState[code]
                                      ? 'rgba(212,163,54,0.65)'
                                      : 'rgba(244,246,248,0.16)'
                            }
                            strokeWidth={highlight?.[code] ? 2 : byState[code] ? 1.4 : 0.8}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: byState[code] ? 0.15 : 0 }}
                        />
                    ))}
                    {entries.map(([code]) => {
                        const nums = statePaths[code].match(/\d+/g)?.map(Number) || [];
                        if (nums.length < 4) return null;
                        const xs = nums.filter((_, i) => i % 2 === 0);
                        const ys = nums.filter((_, i) => i % 2 === 1);
                        return (
                            <text
                                key={`l-${code}`}
                                x={xs.reduce((a, b) => a + b, 0) / xs.length}
                                y={ys.reduce((a, b) => a + b, 0) / ys.length}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill="#0B1426"
                                fontSize="9"
                                fontWeight="700"
                                pointerEvents="none"
                            >
                                {code}
                            </text>
                        );
                    })}
                </svg>
            </div>

            <div className="w-full flex-1">
                <ul className="space-y-2.5">
                    {entries.map(([code, count], i) => (
                        <motion.li
                            key={code}
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
                            className="flex items-baseline justify-between gap-4 border-b border-hf-line/60 pb-2 last:border-0"
                        >
                            <span className="min-w-0 font-ui text-[15px] text-hf-ice/75">
                                {stateCodeToName[code] || code}
                                {highlight?.[code] && (
                                    <span className="ml-2 font-ui text-[12px] text-hf-gold/80">
                                        {highlight[code]}
                                    </span>
                                )}
                            </span>
                            <span className="shrink-0 font-brand text-lg font-bold tabular-nums text-hf-gold">
                                {count}
                            </span>
                        </motion.li>
                    ))}
                </ul>
                {caption && (
                    <p className="mt-4 font-ui text-[12px] leading-relaxed text-hf-ice/40">{caption}</p>
                )}
            </div>
        </div>
    );
}
