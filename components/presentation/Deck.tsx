import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, LayoutGrid, X } from 'lucide-react';

export interface DeckSlide {
    /** Chave estavel, usada para casar com o roteiro do apresentador. */
    key: string;
    /** Titulo curto para a grade de navegacao. */
    label: string;
    node: React.ReactNode;
}

interface DeckProps {
    slides: DeckSlide[];
    /** Camada do apresentador, desenhada por cima (ja filtrada pelo slide atual). */
    presenterLayer?: React.ReactNode;
    /** Chamado quando o slide muda, para o pai saber o que exibir no roteiro. */
    onSlideChange?: (slide: DeckSlide, index: number) => void;
    /** Alterna o modo privado. Ligado ao toque longo no numero do slide. */
    onTogglePresenter?: () => void;
    presenterOn?: boolean;
}

/**
 * Motor de navegacao da apresentacao.
 *
 * Pensado para tablet em cima da mesa: arrastar o dedo troca de tela, tocar nas
 * bordas avanca e volta, e a grade (tecla O ou o botao) serve para pular direto
 * quando a conversa sai da ordem. O teclado continua valendo para quando a
 * apresentacao roda no notebook.
 */
export default function Deck({
    slides,
    presenterLayer,
    onSlideChange,
    onTogglePresenter,
    presenterOn = false,
}: DeckProps) {
    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const [overview, setOverview] = useState(false);
    const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);
    const holdTimer = useRef<number | null>(null);

    const total = slides.length;
    const clamp = useCallback((i: number) => Math.max(0, Math.min(total - 1, i)), [total]);

    const go = useCallback(
        (next: number) => {
            setDirection(next > index ? 1 : -1);
            setIndex(clamp(next));
        },
        [index, clamp],
    );

    useEffect(() => {
        const slide = slides[index];
        if (slide) onSlideChange?.(slide, index);
    }, [index, slides, onSlideChange]);

    // Teclado: setas, espaco, inicio/fim, O para a grade, P para o modo privado.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement | null)?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;
            switch (e.key) {
                case 'ArrowRight':
                case 'PageDown':
                case ' ':
                    e.preventDefault();
                    if (overview) return;
                    go(index + 1);
                    break;
                case 'ArrowLeft':
                case 'PageUp':
                    e.preventDefault();
                    if (overview) return;
                    go(index - 1);
                    break;
                case 'Home':
                    go(0);
                    break;
                case 'End':
                    go(total - 1);
                    break;
                case 'o':
                case 'O':
                    setOverview((v) => !v);
                    break;
                case 'p':
                case 'P':
                    onTogglePresenter?.();
                    break;
                case 'Escape':
                    setOverview(false);
                    break;
                default:
                    break;
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [go, index, total, overview, onTogglePresenter]);

    // Arrastar o dedo. O limiar e alto o bastante para nao disparar quando a
    // pessoa so esta rolando uma lista dentro do slide.
    const onTouchStart = (e: React.TouchEvent) => {
        const t = e.touches[0];
        touchStart.current = { x: t.clientX, y: t.clientY, t: Date.now() };
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        const start = touchStart.current;
        if (!start) return;
        touchStart.current = null;
        const t = e.changedTouches[0];
        const dx = t.clientX - start.x;
        const dy = t.clientY - start.y;
        if (Date.now() - start.t > 800) return;
        if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
        go(index + (dx < 0 ? 1 : -1));
    };

    // Toque longo no numero do slide abre o modo privado sem botao visivel.
    const startHold = () => {
        holdTimer.current = window.setTimeout(() => onTogglePresenter?.(), 650);
    };
    const cancelHold = () => {
        if (holdTimer.current) {
            window.clearTimeout(holdTimer.current);
            holdTimer.current = null;
        }
    };

    const current = slides[index];

    return (
        <div
            className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-hf-navy text-hf-ice"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            {/* Trilha de progresso */}
            <div className="absolute left-0 right-0 top-0 z-30 h-[3px] bg-hf-ice/10">
                <motion.div
                    className="h-full bg-hf-gold"
                    animate={{ width: `${((index + 1) / total) * 100}%` }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                />
            </div>

            {/* Area do slide */}
            <div className="relative flex-1 overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={current?.key || index}
                        custom={direction}
                        initial={{ opacity: 0, x: direction * 48 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: direction * -48 }}
                        transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
                        className="absolute inset-0 overflow-y-auto overscroll-contain"
                    >
                        {current?.node}
                    </motion.div>
                </AnimatePresence>

                {/* Zonas de toque nas bordas. Estreitas para nao roubar o conteudo. */}
                <button
                    type="button"
                    aria-label="Tela anterior"
                    onClick={() => go(index - 1)}
                    disabled={index === 0}
                    className="group absolute left-0 top-0 z-20 h-full w-[8%] min-w-[44px] cursor-pointer disabled:cursor-default"
                >
                    <ChevronLeft className="mx-auto h-7 w-7 text-hf-ice/20 opacity-0 transition-opacity group-hover:opacity-100 group-disabled:hidden" />
                </button>
                <button
                    type="button"
                    aria-label="Próxima tela"
                    onClick={() => go(index + 1)}
                    disabled={index === total - 1}
                    className="group absolute right-0 top-0 z-20 h-full w-[8%] min-w-[44px] cursor-pointer disabled:cursor-default"
                >
                    <ChevronRight className="mx-auto h-7 w-7 text-hf-ice/20 opacity-0 transition-opacity group-hover:opacity-100 group-disabled:hidden" />
                </button>
            </div>

            {/* Rodape: contador (toque longo = modo privado) e grade */}
            <div className="relative z-30 flex shrink-0 items-center justify-between px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 sm:px-8">
                <button
                    type="button"
                    onPointerDown={startHold}
                    onPointerUp={cancelHold}
                    onPointerLeave={cancelHold}
                    onContextMenu={(e) => e.preventDefault()}
                    className={`select-none font-ui text-[12px] font-semibold tabular-nums tracking-[0.18em] transition-colors ${
                        presenterOn ? 'text-hf-gold' : 'text-hf-ice/30'
                    }`}
                    aria-label="Segure para alternar o modo privado"
                >
                    {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                </button>

                <button
                    type="button"
                    onClick={() => setOverview(true)}
                    className="flex h-11 items-center gap-2 rounded-full border border-hf-line px-4 font-ui text-[11px] font-semibold uppercase tracking-[0.14em] text-hf-ice/55 transition-colors hover:border-hf-gold/45 hover:text-hf-ice"
                >
                    <LayoutGrid className="h-4 w-4" />
                    Telas
                </button>
            </div>

            {presenterLayer}

            {/* Grade de navegacao */}
            <AnimatePresence>
                {overview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 z-40 overflow-y-auto bg-hf-navy/97 px-5 py-6 backdrop-blur-sm sm:px-8"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.22em] text-hf-gold">
                                Ir para
                            </p>
                            <button
                                type="button"
                                onClick={() => setOverview(false)}
                                className="flex h-11 w-11 items-center justify-center rounded-full border border-hf-line text-hf-ice/60"
                                aria-label="Fechar"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {slides.map((s, i) => (
                                <button
                                    key={s.key}
                                    type="button"
                                    onClick={() => {
                                        go(i);
                                        setOverview(false);
                                    }}
                                    className={`flex min-h-[86px] flex-col justify-between rounded-2xl border p-4 text-left transition-colors ${
                                        i === index
                                            ? 'border-hf-gold/60 bg-hf-gold/[0.08]'
                                            : 'border-hf-line/70 bg-hf-surface hover:border-hf-gold/30'
                                    }`}
                                >
                                    <span className="font-ui text-[11px] font-semibold tabular-nums text-hf-ice/35">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <span className="font-brand text-[13px] font-bold uppercase leading-tight text-hf-ice">
                                        {s.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
