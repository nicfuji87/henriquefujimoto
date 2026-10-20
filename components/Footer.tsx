import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube } from 'lucide-react';
import { HFSignature } from './brand/HFLogo';

const links = [
    { label: 'História', to: '/conteudo' },
    { label: 'Jornada', to: '/#conquistas' },
    { label: 'Números', to: '/numeros' },
    { label: 'Blog', to: '/blog' },
    { label: 'Apoiar', to: '/apoiar' },
];

const Footer: React.FC = () => {
    return (
        <footer className="border-t border-hf-line/60 bg-hf-navy-deep px-6 pb-32 pt-16">
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-9 text-center">
                {/* Assinatura HF */}
                <HFSignature />

                <p className="font-ui text-[10px] font-semibold uppercase tracking-[0.26em] text-hf-ice/40">
                    Judô · Disciplina · Respeito · Evolução
                </p>

                {/* Navegacao */}
                <nav aria-label="Navegação do rodapé" className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
                    {links.map((l) => (
                        <Link
                            key={l.to}
                            to={l.to}
                            className="font-ui text-[12px] font-semibold uppercase tracking-[0.16em] text-hf-ice/55 transition-colors hover:text-hf-gold"
                        >
                            {l.label}
                        </Link>
                    ))}
                </nav>

                <div className="h-px w-full max-w-xs bg-hf-line/60" />

                {/* Redes sociais */}
                <div className="flex items-center gap-4">
                    <a
                        href="https://instagram.com/henriquefujimoto"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram de Henrique Fujimoto"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-hf-line bg-hf-surface/70 text-hf-ice/80 transition-colors hover:border-hf-gold/50 hover:text-hf-gold"
                    >
                        <Instagram className="h-5 w-5" />
                    </a>
                    <a
                        href="https://www.youtube.com/@henriquefujimotojudo"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="YouTube de Henrique Fujimoto"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-hf-line bg-hf-surface/70 text-hf-ice/80 transition-colors hover:border-hf-gold/50 hover:text-hf-gold"
                    >
                        <Youtube className="h-5 w-5" />
                    </a>
                </div>

                {/* Credito do desenvolvedor */}
                <div className="flex flex-col items-center gap-3 opacity-60 transition-opacity duration-300 hover:opacity-100">
                    <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.24em] text-hf-ice/40">
                        Desenvolvido por
                    </span>
                    <img
                        src="https://pxremkvxoybqxfmxdyfc.supabase.co/storage/v1/object/public/site-images/partners/partner-1769994228346.png"
                        alt="Infuse Comunicação"
                        loading="lazy"
                        className="h-9 w-auto grayscale transition-all duration-300 hover:grayscale-0"
                    />
                </div>

                <p className="font-ui text-[10px] font-medium uppercase tracking-[0.2em] text-hf-ice/30">
                    © {new Date().getFullYear()} Henrique Fujimoto — Todos os direitos reservados.
                </p>
            </div>
        </footer>
    );
};

export default Footer;