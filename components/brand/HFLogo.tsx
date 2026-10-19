import React from 'react';

/**
 * Marca HF — componentes oficiais.
 *
 * A geometria abaixo e copia literal dos arquivos vetoriais aprovados do kit
 * (public/brand/hf-simbolo-*.svg, viewBox 0 0 752 618). Nao redesenhe, nao
 * reproporcione e nao acrescente outro detalhe dourado: a UNICA area dourada
 * do simbolo e a ponta direita da barra horizontal central.
 */

export const HF_GOLD = '#D4A336';
export const HF_NAVY = '#0B1426';
export const HF_ICE = '#F4F6F8';

interface HFSymbolProps {
    /** Classe do wrapper. A cor base do simbolo segue `currentColor`. */
    className?: string;
    /** Quando false, o simbolo fica monocromatico (sem o traco dourado). */
    gold?: boolean;
    /** Texto alternativo; quando ausente o simbolo e puramente decorativo. */
    title?: string;
}

/** Monograma HF isolado. A cor base vem de `currentColor`. */
export function HFSymbol({ className = 'h-8 w-auto text-hf-ice', gold = true, title }: HFSymbolProps) {
    return (
        <svg
            viewBox="0 0 752 618"
            className={className}
            fill="none"
            role={title ? 'img' : undefined}
            aria-label={title}
            aria-hidden={title ? undefined : true}
            focusable="false"
        >
            {title && <title>{title}</title>}
            <polygon
                fill="currentColor"
                points="127.64,24.00 28.00,115.18 28.00,595.52 130.46,508.10 129.52,347.36 294.02,347.36 385.20,260.88 130.46,263.70"
            />
            <polygon
                fill="currentColor"
                points="294.02,241.14 397.42,241.14 398.36,120.82 634.30,120.82 723.60,37.16 364.52,37.16 294.02,101.08"
            />
            <polygon fill="currentColor" points="401.18,366.16 294.02,367.10 294.02,594.58 401.18,506.22" />
            <polygon
                fill={gold ? HF_GOLD : 'currentColor'}
                points="294.02,348.30 545.94,348.30 634.30,260.88 383.32,260.88"
            />
        </svg>
    );
}

interface HFLockupProps {
    className?: string;
    /** Altura do simbolo dentro do lockup. */
    symbolClassName?: string;
    /** Mostra o slogan oficial abaixo do nome. */
    withSlogan?: boolean;
    /** Esconde o nome em telas pequenas (uso em cabecalhos estreitos). */
    compact?: boolean;
}

/** Assinatura horizontal: simbolo + nome (e slogan opcional). */
export function HFLockup({
    className = '',
    symbolClassName = 'h-9 w-auto text-hf-ice',
    withSlogan = false,
    compact = false,
}: HFLockupProps) {
    return (
        <span className={`inline-flex items-center gap-3 ${className}`}>
            <HFSymbol className={symbolClassName} />
            <span className={compact ? 'hidden flex-col leading-none sm:flex' : 'flex flex-col leading-none'}>
                <span className="font-brand text-[13px] font-bold uppercase tracking-[0.2em] text-hf-ice sm:text-sm">
                    Henrique Fujimoto
                </span>
                {withSlogan && (
                    <span className="mt-1.5 font-ui text-[10px] font-semibold uppercase tracking-[0.26em] text-hf-gold">
                        Um treino de cada vez.
                    </span>
                )}
            </span>
        </span>
    );
}

/** Assinatura vertical centralizada (rodape, aberturas, fechamentos). */
export function HFSignature({ className = '' }: { className?: string }) {
    return (
        <span className={`inline-flex flex-col items-center text-center ${className}`}>
            <HFSymbol className="h-12 w-auto text-hf-ice" title="Henrique Fujimoto" />
            <span className="mt-4 font-brand text-sm font-bold uppercase tracking-[0.3em] text-hf-ice">
                Henrique Fujimoto
            </span>
            <span className="mt-2 font-ui text-[10px] font-semibold uppercase tracking-[0.3em] text-hf-gold">
                Um treino de cada vez.
            </span>
        </span>
    );
}

export default HFSymbol;