import React from 'react';

/**
 * Moldura de uma tela da apresentacao.
 *
 * Tamanho pensado para tablet na mesa: o texto fica confortavel a um braco de
 * distancia, e cada tela respira em vez de empilhar paragrafo. Quando o
 * conteudo passa da altura, a propria tela rola, sem quebrar a navegacao.
 */
export function Slide({
    kicker,
    title,
    lead,
    children,
    align = 'start',
}: {
    kicker?: string;
    title?: React.ReactNode;
    lead?: string;
    children?: React.ReactNode;
    align?: 'start' | 'center';
}) {
    return (
        <section
            className={`mx-auto flex min-h-full w-full max-w-5xl flex-col px-7 pb-10 pt-10 sm:px-12 sm:pt-14 ${
                align === 'center' ? 'justify-center' : ''
            }`}
        >
            {kicker && (
                <p className="mb-3 font-ui text-[12px] font-semibold uppercase tracking-[0.22em] text-hf-gold">
                    {kicker}
                </p>
            )}
            {title && (
                <h2 className="font-brand text-[1.75rem] font-bold uppercase leading-[1.05] tracking-[-0.01em] text-hf-ice sm:text-[2.4rem]">
                    {title}
                </h2>
            )}
            {lead && (
                <p className="mt-5 max-w-3xl whitespace-pre-line font-ui text-[17px] leading-relaxed text-hf-ice/70 sm:text-xl">
                    {lead}
                </p>
            )}
            {children && <div className="mt-8">{children}</div>}
        </section>
    );
}

interface BigStatProps {
    value: React.ReactNode;
    label: string;
    sub?: string;
    accent?: boolean;
    /** 'sm' para fileiras de quatro, onde o numero grande quebraria a linha. */
    size?: 'md' | 'sm';
}

/** Numero grande com legenda. Use com parcimonia: no maximo tres por tela. */
export function BigStat({ value, label, sub, accent = false, size = 'md' }: BigStatProps) {
    return (
        <div className="rounded-2xl border border-hf-line/70 bg-hf-surface px-5 py-5">
            <div
                className={`font-brand font-bold leading-none tracking-tight ${
                    size === 'sm' ? 'text-[1.7rem] sm:text-[2rem]' : 'text-[2.4rem] sm:text-[3rem]'
                } ${accent ? 'text-hf-gold' : 'text-hf-ice'}`}
            >
                {value}
            </div>
            <div className="mt-2.5 font-ui text-[13px] font-medium leading-snug text-hf-ice/65 sm:text-sm">
                {label}
            </div>
            {sub && (
                <div className="mt-1 font-ui text-[11px] leading-relaxed text-hf-ice/40">{sub}</div>
            )}
        </div>
    );
}
