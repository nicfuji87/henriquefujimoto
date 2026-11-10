import React from 'react';

/**
 * Moldura de uma tela da apresentacao.
 *
 * Tamanho pensado para tablet na mesa: o texto fica confortavel a um braco de
 * distancia, e cada tela respira em vez de empilhar paragrafo. Quando o
 * conteudo passa da altura, a propria tela rola, sem quebrar a navegacao.
 *
 * `media` liga o formato de duas colunas: texto a esquerda, painel de imagem
 * colado na borda direita. E o formato da capa e do fechamento, onde a foto
 * ocupa a altura inteira em vez de virar uma faixa recortada no meio do texto.
 */
export function Slide({
    kicker,
    title,
    lead,
    children,
    align = 'start',
    photos,
    watermark,
    titleSize = 'md',
}: {
    kicker?: string;
    title?: React.ReactNode;
    lead?: string;
    children?: React.ReactNode;
    align?: 'start' | 'center';
    /** Liga o formato de duas colunas, com as fotos na borda direita. */
    photos?: { url: string; caption?: string }[];
    /** Numero gigante e apagado ao fundo, como marca d'agua da tela. */
    watermark?: string;
    /** 'lg' nas telas de frase, onde o titulo e o conteudo principal. */
    titleSize?: 'md' | 'lg';
}) {
    const body = (
        <>
            {kicker && (
                <p className="mb-4 flex items-center gap-3 font-ui text-[11px] font-semibold uppercase tracking-[0.22em] text-hf-gold">
                    <span className="h-px w-6 bg-hf-gold" />
                    {kicker}
                </p>
            )}
            {title && (
                <h2
                    className={`font-brand font-bold uppercase leading-[1.0] tracking-[-0.025em] text-hf-ice [text-wrap:balance] ${
                        titleSize === 'lg'
                            ? 'text-[1.95rem] sm:text-[2.5rem] lg:text-[2.9rem]'
                            : 'text-[1.75rem] sm:text-[2.4rem]'
                    }`}
                >
                    {title}
                </h2>
            )}
            {lead && (
                <p className="mt-5 max-w-3xl whitespace-pre-line font-ui text-[17px] leading-relaxed text-hf-ice/70 sm:text-xl">
                    {lead}
                </p>
            )}
            {children && <div className="mt-8">{children}</div>}
        </>
    );

    const hasPhotos = !!photos && photos.filter((ph) => ph && ph.url).length > 0;
    if (hasPhotos) {
        return (
            <section className="relative flex min-h-full w-full">
                <div className="flex min-w-0 flex-1 flex-col justify-center px-7 pb-14 pt-24 sm:px-12 sm:pt-28 lg:max-w-[60%] lg:pr-10">
                    {body}
                    {/* Sem largura para o painel lateral, as fotos entram no fluxo
                        em vez de sumirem. */}
                    <div className="mt-9 lg:hidden">
                        <PhotoRow photos={photos!} />
                    </div>
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38%] lg:block">
                    <MediaPanel photos={photos!} />
                </div>
            </section>
        );
    }

    return (
        <section className="relative flex min-h-full w-full overflow-hidden">
            {watermark && (
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 select-none font-brand text-[9rem] font-black leading-none tracking-[-0.06em] text-hf-gold/[0.07] sm:right-10 sm:text-[15rem] lg:text-[19rem]"
                >
                    {watermark}
                </span>
            )}
            <div
                className={`relative mx-auto flex w-full max-w-5xl flex-col px-7 pb-12 pt-20 sm:px-12 sm:pt-24 ${
                    align === 'center' ? 'justify-center' : ''
                }`}
            >
                {body}
            </div>
        </section>
    );
}

interface FigureCardProps {
    figure: string;
    label: string;
    text?: string;
}

/**
 * Cartao de numero em destaque: a cifra em dourado, o rotulo do que ela mede e
 * uma linha explicando. Tres por tela, no maximo.
 */
export function FigureCard({ figure, label, text }: FigureCardProps) {
    return (
        <div className="flex min-h-[9.5rem] flex-col rounded-2xl border border-hf-line/70 bg-hf-surface p-6">
            <span className="font-brand text-[2rem] font-black leading-none tracking-[-0.04em] text-hf-gold sm:text-[2.5rem]">
                {figure}
            </span>
            <span className="mt-4 font-ui text-[11px] font-semibold uppercase tracking-[0.16em] text-hf-ice/55">
                {label}
            </span>
            {text && (
                <p className="mt-2.5 font-ui text-[13px] leading-relaxed text-hf-ice/60">{text}</p>
            )}
        </div>
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

/**
 * Painel de imagem da borda direita. O degrade escurece a emenda com o fundo,
 * para a foto entrar no slide em vez de parecer colada por cima dele.
 */
export function MediaPanel({ photos }: { photos: { url: string; caption?: string }[] }) {
    const items = photos.filter((p) => p && p.url).slice(0, 2);
    if (items.length === 0) return null;
    return (
        <div className="relative h-full w-full border-l border-hf-gold/25">
            <div className="flex h-full flex-col">
                {items.map((ph, i) => (
                    <div key={`${ph.url}-${i}`} className="relative min-h-0 flex-1 overflow-hidden">
                        <img
                            src={ph.url}
                            alt={ph.caption || ''}
                            loading="lazy"
                            className="h-full w-full object-cover object-top saturate-[0.85]"
                        />
                    </div>
                ))}
            </div>
            {/* Veu escuro: a foto e ambiente, o texto e o que precisa ser lido. */}
            <div className="pointer-events-none absolute inset-0 bg-hf-navy/55" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-hf-navy via-hf-navy/55 to-hf-navy/35" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-hf-navy/85 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-hf-navy/90 to-transparent" />
        </div>
    );
}

/**
 * Fotos dentro de uma tela comum.
 *
 * Cada imagem mantem a propria proporcao e fica limitada pela altura: o acervo
 * mistura retrato e paisagem, e um enquadramento fixo cortaria metade delas.
 */
export function PhotoRow({ photos }: { photos: { url: string; caption?: string }[] }) {
    const items = photos.filter((p) => p && p.url);
    if (items.length === 0) return null;
    return (
        <div className="flex flex-wrap items-start justify-start gap-5">
            {items.map((ph, i) => (
                <figure key={`${ph.url}-${i}`} className="min-w-0">
                    <img
                        src={ph.url}
                        alt={ph.caption || ''}
                        loading="lazy"
                        className="max-h-[34vh] w-auto max-w-full rounded-2xl border border-hf-line/70 object-contain"
                    />
                    {ph.caption && (
                        <figcaption className="mt-2.5 max-w-[22rem] font-ui text-[12px] leading-relaxed text-hf-ice/45">
                            {ph.caption}
                        </figcaption>
                    )}
                </figure>
            ))}
        </div>
    );
}
