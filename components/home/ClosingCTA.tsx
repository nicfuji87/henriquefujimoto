import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Instagram } from 'lucide-react';
import { hfBtnPrimary, hfBtnSecondary } from '../ui/hf';
import { buildWaLink } from './utils';
import WordRail from './WordRail';

interface ClosingCTAProps {
    ctaLink?: string;
    /** Foto real de fechamento (marco mais recente do atleta). */
    photo?: string | null;
}

export default function ClosingCTA({ ctaLink, photo }: ClosingCTAProps) {
    const wa = buildWaLink(
        ctaLink,
        'Olá! Vim pelo site do Henrique e quero fazer parte dessa jornada. Podemos conversar?'
    );

    return (
        <section className="relative isolate overflow-hidden border-y border-hf-line/60 bg-hf-navy px-6 py-16 sm:py-20 md:py-24">
            {photo && (
                <>
                    <img
                        src={photo}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 -z-10 h-full w-full object-cover object-center opacity-40 grayscale"
                    />
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-hf-navy via-hf-navy/85 to-hf-navy/55" />
                </>
            )}

            <div className="mx-auto flex w-full max-w-7xl items-end justify-between gap-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-70px' }}
                    transition={{ duration: 0.6 }}
                    className="max-w-2xl"
                >
                    <h2 className="font-brand text-[1.9rem] font-extrabold uppercase leading-[0.98] tracking-[-0.015em] text-hf-ice sm:text-[2.75rem]">
                        Não temos o final.
                    </h2>
                    <p className="mt-3 font-brand text-lg font-semibold text-hf-ice/85 sm:text-xl">
                        E você não precisa esperar por ele.
                    </p>
                    <p className="mt-2 font-ui text-sm uppercase tracking-[0.2em] text-hf-gold">
                        Um treino de cada vez.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                        <a
                            href="https://instagram.com/henriquefujimoto"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={hfBtnPrimary}
                        >
                            <Instagram className="h-4 w-4" />
                            Acompanhar essa jornada
                        </a>
                        <a href={wa} target="_blank" rel="noopener noreferrer" className={hfBtnSecondary}>
                            Conhecer as parcerias
                            <ArrowRight className="h-4 w-4" />
                        </a>
                    </div>
                </motion.div>

                <WordRail words={['Mesmo', 'tatame', 'novas', 'histórias']} className="pb-2" />
            </div>
        </section>
    );
}