import React from 'react';
import { motion } from 'framer-motion';
import { hfKicker, hfLead, hfTitle } from './ui/hf';

interface PageIntroProps {
    kicker?: string;
    title: React.ReactNode;
    lead?: React.ReactNode;
}

/**
 * Abertura padrao das paginas publicas internas: respeita o cabecalho fixo,
 * mantem o azul-marinho dominante e assina o titulo com o filete dourado.
 */
export default function PageIntro({ kicker, title, lead }: PageIntroProps) {
    return (
        <section className="relative overflow-hidden bg-hf-navy px-6 pb-10 pt-28 sm:pb-14 sm:pt-32">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-hf-gold/30 to-transparent" />
            <div className="mx-auto w-full max-w-6xl">
                {kicker && (
                    <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`mb-3 ${hfKicker}`}
                    >
                        {kicker}
                    </motion.p>
                )}
                <motion.h1
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.05 }}
                    className={hfTitle}
                >
                    {title}
                </motion.h1>
                <div className="hf-rule mt-5" />
                {lead && (
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.12 }}
                        className={`mt-5 max-w-2xl ${hfLead}`}
                    >
                        {lead}
                    </motion.p>
                )}
            </div>
        </section>
    );
}