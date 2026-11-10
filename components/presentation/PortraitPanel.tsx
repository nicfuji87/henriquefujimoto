import React from 'react';
import { motion } from 'framer-motion';

/**
 * Retrato colado na borda direita da tela.
 *
 * A foto tem fundo de ginasio, entao nao da para recortar o contorno: o degrade
 * a esquerda dissolve a imagem no marinho e o resultado fica proximo de um
 * recorte, sem mascara falsa. Some nas larguras em que o texto precisa do
 * espaco inteiro.
 */
export default function PortraitPanel({
    url,
    className = 'w-[26%]',
    variant = 'full',
}: {
    url: string;
    className?: string;
    /** 'bust' usa um retrato de meio corpo preso no topo, sem esticar a foto. */
    variant?: 'full' | 'bust';
}) {
    if (!url) return null;

    if (variant === 'bust') {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className={`pointer-events-none absolute right-0 top-0 hidden lg:block ${className}`}
                aria-hidden="true"
            >
                <div className="relative">
                    <img src={url} alt="" className="block h-auto w-full" />
                    <span className="absolute inset-0 bg-gradient-to-r from-hf-navy via-hf-navy/40 to-transparent" />
                    <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-hf-navy to-transparent" />
                    <span className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-hf-navy/85 to-transparent" />
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className={`pointer-events-none absolute inset-y-0 right-0 hidden lg:block ${className}`}
            aria-hidden="true"
        >
            <div className="relative h-full w-full">
                <img src={url} alt="" className="h-full w-full object-cover object-top" />
                <span className="absolute inset-0 bg-gradient-to-r from-hf-navy via-hf-navy/55 to-transparent" />
                <span className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-hf-navy to-transparent" />
                <span className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-hf-navy to-transparent" />
            </div>
        </motion.div>
    );
}
