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
}: {
    url: string;
    className?: string;
}) {
    if (!url) return null;
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
