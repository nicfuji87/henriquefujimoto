import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { HFSymbol } from './brand/HFLogo';

interface PublicTopBarProps {
    /** Destino do botao voltar. */
    backTo?: string;
    backLabel?: string;
    /** Acao a direita (compartilhar, por exemplo). */
    right?: React.ReactNode;
    /** Largura do conteudo, para acompanhar a pagina. */
    maxWidth?: string;
}

/**
 * Barra superior das paginas de detalhe (post, produto, parceria).
 * Mantem a navegacao de retorno e assina a pagina com o monograma HF.
 */
export default function PublicTopBar({
    backTo = '/',
    backLabel = 'Voltar',
    right,
    maxWidth = 'max-w-5xl',
}: PublicTopBarProps) {
    return (
        <header className="sticky top-0 z-50 border-b border-hf-line/60 bg-hf-navy/90 backdrop-blur-xl">
            <div className={`mx-auto flex w-full ${maxWidth} items-center justify-between gap-3 px-4 py-3`}>
                <Link
                    to={backTo}
                    className="group inline-flex items-center gap-2 font-ui text-[12px] font-semibold uppercase tracking-[0.14em] text-hf-ice/60 transition-colors hover:text-hf-ice"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    {backLabel}
                </Link>

                <Link
                    to="/"
                    aria-label="Henrique Fujimoto — início"
                    className="inline-flex items-center gap-2.5"
                >
                    <HFSymbol className="h-6 w-auto text-hf-ice" />
                    <span className="hidden font-brand text-[11px] font-bold uppercase tracking-[0.2em] text-hf-ice/80 sm:inline">
                        Henrique Fujimoto
                    </span>
                </Link>

                <div className="flex min-w-[64px] justify-end">{right}</div>
            </div>
        </header>
    );
}