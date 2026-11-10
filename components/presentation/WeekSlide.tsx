import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export interface RoutineBlock {
    time: string;
    label: string;
}
export interface RoutineDay {
    day: string;
    blocks: RoutineBlock[];
}

/** Grupos da coluna do dia, na ordem em que aparecem. */
const GRUPOS: { key: string; label: string; test: RegExp }[] = [
    { key: 'escola', label: 'Escola', test: /escola|aula/i },
    { key: 'formacao', label: 'Formação', test: /estudo|ingl[êe]s/i },
    { key: 'apoio', label: 'Apoio', test: /terapia|fisio|psic/i },
    { key: 'esporte', label: 'Esporte', test: /jud[ôo]|jiu|f[íi]sic|particular|tatame/i },
];

/** "07:30–12:30" vira "07h30–12h30"; hora cheia perde os minutos. */
function hora(t: string) {
    return t.replace(/(\d{1,2}):(\d{2})/g, (_, h, m) => (m === '00' ? `${h}h` : `${h}h${m}`));
}

const minutos = (t: string) => {
    const m = t.match(/(\d{1,2}):(\d{2})/);
    return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
};

/** Junta os blocos de um grupo numa faixa so: do primeiro inicio ao ultimo fim. */
function faixa(blocks: RoutineBlock[]) {
    const partes = blocks
        .map((b) => (b.time || '').match(/(\d{1,2}:\d{2})\D+(\d{1,2}:\d{2})/))
        .filter(Boolean) as RegExpMatchArray[];
    if (partes.length === 0) return blocks[0]?.time || '';
    const inicio = partes.reduce((a, p) => (minutos(p[1]) < minutos(a) ? p[1] : a), partes[0][1]);
    const fim = partes.reduce((a, p) => (minutos(p[2]) > minutos(a) ? p[2] : a), partes[0][2]);
    return hora(`${inicio}–${fim}`);
}

/** "Judo (Marista)" vira { modalidade: "Judo", local: "Marista" }. */
function parte(label: string) {
    const m = label.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
    const modalidade = (m ? m[1] : label).trim();
    return {
        modalidade: modalidade.replace(/prepara[çc][ãa]o f[íi]sica/i, 'Físico'),
        local: m ? m[2].trim() : '',
    };
}

/**
 * Junta os treinos do dia por modalidade: "Judo · Marista + Gagliard" em vez de
 * repetir a palavra judo a cada academia.
 */
function treinos(blocks: RoutineBlock[]) {
    const ordem: string[] = [];
    const locais = new Map<string, string[]>();
    for (const b of blocks) {
        const { modalidade, local } = parte(b.label);
        if (!locais.has(modalidade)) {
            locais.set(modalidade, []);
            ordem.push(modalidade);
        }
        if (local) locais.get(modalidade)!.push(local);
    }
    return ordem
        .map((m) => {
            const l = locais.get(m)!;
            return l.length > 0 ? `${m} · ${l.join(' + ')}` : m;
        })
        .join(' + ');
}

export default function WeekSlide({
    kicker,
    title,
    accent,
    lead,
    note,
    week,
    hours,
    partnerWord,
}: {
    kicker: string;
    title: string;
    accent?: string;
    lead?: string;
    note?: string;
    week: RoutineDay[];
    hours: number;
    partnerWord?: string;
}) {
    const dias = useMemo(
        () =>
            week.map((d) => {
                const grupos = GRUPOS.map((g) => {
                    const blocos = (d.blocks || []).filter((b) => g.test.test(b.label));
                    if (blocos.length === 0) return null;
                    return {
                        key: g.key,
                        label: g.label,
                        valor:
                            g.key === 'escola'
                                ? partnerWord || blocos[0].label
                                : treinos(blocos),
                        hora: faixa(blocos),
                    };
                }).filter(Boolean) as { key: string; label: string; valor: string; hora: string }[];
                return { day: d.day, grupos };
            }),
        [week, partnerWord],
    );

    return (
        <section className="relative flex min-h-full w-full overflow-hidden">
            <div className="relative mx-auto flex w-full max-w-6xl flex-col justify-center px-7 pb-10 pt-[72px] sm:px-12 sm:pt-20">
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <p className="mb-4 flex items-center gap-3 font-ui text-[11px] font-semibold uppercase tracking-[0.22em] text-hf-gold">
                            <span className="h-px w-6 bg-hf-gold" />
                            {kicker}
                        </p>
                        <h2 className="font-brand text-[1.75rem] font-extrabold uppercase leading-[0.97] tracking-[-0.03em] sm:text-[2.3rem]">
                            <span className="text-hf-ice">{title} </span>
                            {accent && <span className="text-hf-gold">{accent}</span>}
                        </h2>
                        {lead && (
                            <p className="mt-3 max-w-xl font-ui text-[14px] leading-relaxed text-hf-ice/65 sm:text-[15px]">
                                {lead}
                            </p>
                        )}
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className="font-brand text-[3.4rem] font-black leading-none tracking-[-0.06em] text-hf-gold sm:text-[4.2rem]">
                            {String(hours).replace('.', ',')}h
                        </span>
                        <span className="font-ui text-[15px] text-hf-ice/55">/ semana</span>
                    </div>
                </div>

                <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {dias.map((d, i) => (
                        <motion.div
                            key={d.day}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.06 * i }}
                            className="flex flex-col rounded-2xl border border-hf-line/70 bg-hf-surface p-4 lg:min-h-[290px]"
                        >
                            <p className="font-ui text-[12px] font-bold uppercase tracking-[0.12em] text-hf-gold">
                                {d.day}
                            </p>

                            {d.grupos
                                .filter((g) => g.key !== 'esporte')
                                .map((g) => (
                                    <div key={g.key} className="mt-4">
                                        <p className="font-ui text-[10px] font-bold uppercase tracking-[0.14em] text-hf-ice/35">
                                            {g.label}
                                        </p>
                                        <p className="mt-1 font-ui text-[14px] font-semibold leading-snug text-hf-ice/90">
                                            {g.valor}
                                        </p>
                                        <p className="mt-0.5 font-ui text-[11px] tabular-nums text-hf-ice/45">
                                            {g.hora}
                                        </p>
                                    </div>
                                ))}

                            {d.grupos
                                .filter((g) => g.key === 'esporte')
                                .map((g) => (
                                    <div
                                        key={g.key}
                                        className="mt-auto border-t border-hf-line/70 pt-3.5 lg:mt-auto"
                                    >
                                        <p className="font-ui text-[10px] font-bold uppercase tracking-[0.14em] text-hf-ice/35">
                                            {g.label}
                                        </p>
                                        <p className="mt-1 font-ui text-[14px] font-semibold leading-snug text-hf-gold">
                                            {g.valor}
                                        </p>
                                        <p className="mt-0.5 font-ui text-[11px] tabular-nums text-hf-ice/45">
                                            {g.hora}
                                        </p>
                                    </div>
                                ))}
                        </motion.div>
                    ))}
                </div>

                {note && (
                    <p className="mt-6 max-w-3xl border-l-[3px] border-hf-gold pl-4 font-ui text-[14px] leading-relaxed text-hf-ice/75 sm:text-[15px]">
                        {note}
                    </p>
                )}
            </div>
        </section>
    );
}
