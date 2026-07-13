import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SectionHeading from './SectionHeading';

export interface StoryFact {
    label: string;
    value: string;
}

interface StorySectionProps {
    portrait: string | null;
    facts: StoryFact[];
}

export default function StorySection({ portrait, facts }: StorySectionProps) {
    return (
        <section id="historia" className="scroll-mt-16 bg-night px-6 py-14 sm:py-20 md:py-28">
            <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-10 lg:grid-cols-[0.8fr_1fr] lg:gap-16">
                {/* Portrait */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.7 }}
                    className="relative order-2 lg:order-1"
                >
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/[0.08] bg-coal">
                        {portrait ? (
                            <img src={portrait} alt="Henrique Fujimoto" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center font-grotesk text-5xl font-semibold text-white/10">HF</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent" />
                        <span className="absolute bottom-4 left-5 font-grotesk text-sm font-medium text-white/80">
                            Terceira geração · família Fujimoto
                        </span>
                    </div>
                </motion.div>

                {/* Copy */}
                <div className="order-1 lg:order-2">
                    <SectionHeading title="Quem é o Henrique?" />

                    <motion.p
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6, delay: 0.08 }}
                        className="mt-6 max-w-xl font-grotesk text-base leading-relaxed text-white/70"
                    >
                        Vestiu o primeiro kimono aos seis anos. Desde então, o judô deixou de ser apenas um
                        esporte — virou rotina, virou disciplina, virou estilo de vida.
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6, delay: 0.14 }}
                        className="mt-4 max-w-xl font-grotesk text-base leading-relaxed text-white/70"
                    >
                        Ele representa a terceira geração da família Fujimoto dentro do judô. O avô foi campeão
                        brasileiro. O tio-avô conquistou um título mundial.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-6 border-l-2 border-lime/60 pl-4"
                    >
                        <p className="font-editorial text-xl italic leading-snug text-white/90 sm:text-2xl">
                            Mas nenhuma dessas medalhas garante o futuro. Agora chegou a vez dele escrever a
                            própria história.
                        </p>
                    </motion.div>

                    {/* Dados rápidos */}
                    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {facts.map((f, i) => (
                            <motion.div
                                key={f.label}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.06 }}
                                className="rounded-2xl border border-white/[0.07] bg-coal px-4 py-3.5"
                            >
                                <div className="font-grotesk text-xl font-semibold text-white">{f.value}</div>
                                <div className="mt-1 font-grotesk text-[11px] font-medium uppercase tracking-wide text-white/45">{f.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    <Link
                        to="/conteudo"
                        className="group mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 font-grotesk text-sm font-semibold text-white transition-all hover:border-lime/40 hover:bg-white/10"
                    >
                        Conhecer a jornada completa
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
