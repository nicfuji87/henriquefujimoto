import React from 'react';
import { motion } from 'framer-motion';

const unseen = [
    'Os treinos antes da escola.',
    'As viagens de madrugada.',
    'Os quilômetros na estrada.',
    'As derrotas.',
    'As dúvidas.',
    'Os dias em que nada dá certo.',
];

export default function BeyondTatame() {
    return (
        <section className="bg-night px-6 py-16 sm:py-24 md:py-32">
            <div className="mx-auto max-w-3xl">
                <motion.h2
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-70px' }}
                    transition={{ duration: 0.6 }}
                    className="font-grotesk text-[1.6rem] leading-[1.15] font-semibold tracking-tight text-white sm:text-[2rem] sm:leading-tight md:text-5xl"
                >
                    Muito além do <span className="font-editorial font-normal italic text-lime">tatame</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-70px' }}
                    transition={{ duration: 0.6, delay: 0.08 }}
                    className="mt-6 font-grotesk text-lg leading-relaxed text-white/70 sm:text-xl"
                >
                    Quando as pessoas veem um pódio, elas enxergam poucos minutos. Mas ninguém vê as milhares
                    de horas que vieram antes.
                </motion.p>

                <div className="mt-10 space-y-3 border-l-2 border-lime/40 pl-6">
                    {unseen.map((line, i) => (
                        <motion.p
                            key={line}
                            initial={{ opacity: 0, x: -8 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.4, delay: i * 0.08 }}
                            className="font-grotesk text-xl font-medium text-white/85 sm:text-2xl"
                        >
                            {line}
                        </motion.p>
                    ))}
                </div>

                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6 }}
                    className="mt-10 font-grotesk text-lg leading-relaxed text-white/70"
                >
                    É justamente essa parte da história que decidimos mostrar. Sem filtros. Sem esconder os
                    erros. Porque acreditamos que é nela que um atleta realmente é formado.
                </motion.p>
            </div>
        </section>
    );
}
