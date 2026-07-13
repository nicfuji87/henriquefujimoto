import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, HeartHandshake } from 'lucide-react';
import { buildWaLink } from './utils';

interface ClosingCTAProps {
    ctaLink?: string;
}

const buildup = [
    'Talvez você esteja conhecendo o Henrique hoje.',
    'Daqui a alguns anos, talvez veja esse mesmo menino disputando um Campeonato Brasileiro.',
    'Quem sabe um Pan-Americano. Ou até uma Olimpíada.',
];

export default function ClosingCTA({ ctaLink }: ClosingCTAProps) {
    const wa = buildWaLink(ctaLink, 'Olá! Vim pelo site do Henrique e quero fazer parte dessa jornada. Podemos conversar?');

    return (
        <section className="relative overflow-hidden bg-night px-6 py-28 md:py-36">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/[0.08] blur-[130px]" />

            <div className="relative mx-auto max-w-3xl text-center">
                <div className="space-y-2">
                    {buildup.map((line, i) => (
                        <motion.p
                            key={line}
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.6, delay: i * 0.12 }}
                            className="font-grotesk text-lg leading-relaxed text-white/60 sm:text-xl"
                        >
                            {line}
                        </motion.p>
                    ))}
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-8 font-grotesk text-base text-white/45"
                >
                    Quando esse dia chegar, esperamos que você possa dizer:
                </motion.p>

                <motion.blockquote
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="mt-4 font-editorial text-3xl italic leading-tight text-lime sm:text-5xl"
                >
                    “Eu acompanho essa história desde o começo.”
                </motion.blockquote>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.66 }}
                    className="mt-12"
                >
                    <p className="font-grotesk text-xl font-semibold text-white">Faça parte da jornada.</p>
                    <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <a
                            href="https://instagram.com/henriquefujimoto"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2.5 rounded-full bg-lime px-7 py-4 font-grotesk text-base font-semibold text-night transition-all hover:bg-lime-dim"
                        >
                            <Instagram className="h-5 w-5" />
                            Acompanhar nas redes sociais
                        </a>
                        <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/5 px-7 py-4 font-grotesk text-base font-semibold text-white transition-all hover:bg-white/10"
                        >
                            <HeartHandshake className="h-5 w-5" />
                            Apoiar o atleta
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
