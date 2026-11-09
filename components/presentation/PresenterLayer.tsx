import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, EyeOff, Lock } from 'lucide-react';

export interface RulerStep {
    label: string;
    value: string;
    note?: string;
}
export interface Objection {
    q: string;
    a: string;
}

/**
 * Camada do apresentador.
 *
 * Confidencial por definicao: roteiro de fala, regua de negociacao e respostas
 * para as objecoes. Nunca e renderizada sem o modo privado ligado, nunca entra
 * no PDF e nunca aparece na pagina publica. Fica num painel preso embaixo, que
 * pode ser recolhido com um toque quando alguem chegar perto da tela.
 */
export default function PresenterLayer({
    note,
    ruler,
    objections,
    onClose,
}: {
    note?: string;
    ruler: RulerStep[];
    objections: Objection[];
    onClose: () => void;
}) {
    const [open, setOpen] = useState(true);
    const [tab, setTab] = useState<'roteiro' | 'regua' | 'objecoes'>('roteiro');

    const tabCls = (active: boolean) =>
        `rounded-full px-3.5 py-1.5 font-ui text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
            active ? 'bg-hf-gold text-hf-navy' : 'text-hf-ice/50 hover:text-hf-ice/80'
        }`;

    return (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(10px,env(safe-area-inset-bottom))]">
            <div className="pointer-events-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-hf-gold/35 bg-[#0d1424]/97 shadow-[0_-10px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur">
                <div className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                        <Lock className="h-3.5 w-3.5 shrink-0 text-hf-gold" />
                        <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.18em] text-hf-gold">
                            Só você vê
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setOpen((v) => !v)}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-hf-ice/50 hover:text-hf-ice"
                            aria-label={open ? 'Recolher' : 'Abrir'}
                        >
                            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-hf-ice/50 hover:text-hf-ice"
                            aria-label="Desligar o modo privado"
                        >
                            <EyeOff className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <AnimatePresence initial={false}>
                    {open && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22 }}
                        >
                            <div className="flex gap-1.5 px-3 pb-2">
                                <button type="button" className={tabCls(tab === 'roteiro')} onClick={() => setTab('roteiro')}>
                                    Roteiro
                                </button>
                                {ruler.length > 0 && (
                                    <button type="button" className={tabCls(tab === 'regua')} onClick={() => setTab('regua')}>
                                        Régua
                                    </button>
                                )}
                                {objections.length > 0 && (
                                    <button type="button" className={tabCls(tab === 'objecoes')} onClick={() => setTab('objecoes')}>
                                        Objeções
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[32vh] overflow-y-auto overscroll-contain px-4 pb-4">
                                {tab === 'roteiro' && (
                                    <p className="whitespace-pre-line font-ui text-[14px] leading-relaxed text-hf-ice/85">
                                        {note || 'Sem roteiro para esta tela.'}
                                    </p>
                                )}

                                {tab === 'regua' && (
                                    <ul className="space-y-1.5">
                                        {ruler.map((r, i) => (
                                            <li
                                                key={i}
                                                className="flex items-baseline justify-between gap-4 border-b border-hf-ice/8 pb-1.5 last:border-0"
                                            >
                                                <span className="font-ui text-[13px] text-hf-ice/70">
                                                    {r.label}
                                                    {r.note && (
                                                        <span className="ml-2 text-[11px] text-hf-ice/40">{r.note}</span>
                                                    )}
                                                </span>
                                                <span className="font-brand text-base font-bold tabular-nums text-hf-gold">
                                                    {r.value}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {tab === 'objecoes' && (
                                    <ul className="space-y-3">
                                        {objections.map((o, i) => (
                                            <li key={i}>
                                                <p className="font-ui text-[13px] font-semibold text-hf-gold">{o.q}</p>
                                                <p className="mt-1 whitespace-pre-line font-ui text-[13px] leading-relaxed text-hf-ice/75">
                                                    {o.a}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
