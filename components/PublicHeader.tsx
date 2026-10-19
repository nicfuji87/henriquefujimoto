import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { HFLockup } from './brand/HFLogo';

interface NavItem {
    label: string;
    to: string;
}

const NAV: NavItem[] = [
    { label: 'História', to: '/#historia' },
    { label: 'Jornada', to: '/conteudo' },
    { label: 'Números', to: '/numeros' },
    { label: 'Conteúdo', to: '/blog' },
];

interface PublicHeaderProps {
    /**
     * `overlay` deixa o cabecalho transparente sobre o hero e so aplica o vidro
     * depois da rolagem (home). `solid` ja inicia com fundo azul-marinho.
     */
    variant?: 'overlay' | 'solid';
}

export default function PublicHeader({ variant = 'solid' }: PublicHeaderProps) {
    const { pathname, hash } = useLocation();
    const [scrolled, setScrolled] = useState(variant === 'solid');
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (variant === 'solid') return;
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [variant]);

    // Fecha o menu ao navegar.
    useEffect(() => setOpen(false), [pathname, hash]);

    // Trava a rolagem do fundo enquanto o menu mobile esta aberto.
    useEffect(() => {
        if (!open) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [open]);

    const isActive = (to: string) =>
        to.startsWith('/#') ? pathname === '/' && hash === to.slice(1) : pathname.startsWith(to);

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
                scrolled || open
                    ? 'border-b border-hf-line/60 bg-hf-navy/90 backdrop-blur-xl'
                    : 'border-b border-transparent bg-transparent'
            }`}
        >
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
                <Link to="/" aria-label="Henrique Fujimoto — início" className="shrink-0">
                    <HFLockup symbolClassName="h-8 w-auto text-hf-ice sm:h-9" compact />
                </Link>

                <nav aria-label="Navegação principal" className="hidden items-center gap-7 md:flex">
                    {NAV.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`font-ui text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors hover:text-hf-ice ${
                                isActive(item.to) ? 'text-hf-ice' : 'text-hf-ice/60'
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <Link
                        to="/apoiar"
                        className="hidden rounded-full bg-hf-gold px-5 py-2.5 font-ui text-[12px] font-semibold uppercase tracking-[0.12em] text-hf-navy transition-colors hover:bg-hf-gold-dim sm:inline-flex"
                    >
                        Apoiar
                    </Link>

                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        aria-expanded={open}
                        aria-controls="hf-menu-mobile"
                        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-hf-line bg-hf-surface/70 text-hf-ice transition-colors hover:border-hf-gold/40 md:hidden"
                    >
                        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Menu mobile */}
            <div
                id="hf-menu-mobile"
                hidden={!open}
                className="border-t border-hf-line/60 bg-hf-navy/95 backdrop-blur-xl md:hidden"
            >
                <nav aria-label="Navegação principal (mobile)" className="flex flex-col px-5 py-3">
                    {NAV.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className="border-b border-hf-line/40 py-3.5 font-ui text-sm font-semibold uppercase tracking-[0.14em] text-hf-ice/80 transition-colors hover:text-hf-ice"
                        >
                            {item.label}
                        </Link>
                    ))}
                    <Link
                        to="/apoiar"
                        className="mt-4 inline-flex items-center justify-center rounded-full bg-hf-gold px-6 py-3.5 font-ui text-sm font-semibold uppercase tracking-[0.1em] text-hf-navy"
                    >
                        Apoiar o atleta
                    </Link>
                    <span className="py-4 text-center font-ui text-[10px] font-semibold uppercase tracking-[0.3em] text-hf-gold">
                        Um treino de cada vez.
                    </span>
                </nav>
            </div>
        </header>
    );
}