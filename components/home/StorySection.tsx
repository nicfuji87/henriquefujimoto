import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { hfBody, hfBtnSecondary, hfCard } from '../ui/hf';

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
        <section id="historia" className="scroll-mt-20 bg-hf-navy px-6 py-16 sm:py-20 md:py-24">
            <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 lg:grid-cols-[0.85fr_1fr] lg:gap-16">
                {/* Retrato real */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.7 }}
                    className="relative order-2 lg:order-1"
                >
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-hf-line/70 bg-hf-surface">
                        {portrait ? (
                            <img
                                src={portrait}
                                alt="Henrique Fujimoto"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center font-brand text-5xl font-bold text-hf-ice/10">
                                HF
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-hf-navy/80 via-transparent to-transparent" />
                        <span className="absolute bottom-4 left-5 font-ui text-[11px] font-semibold uppercase tracking-[0.18em] text-hf-ice/80">
                            Terceira geração · família Fujimoto
                        </span>
                    </div>
                </motion.div>

                {/* Copy */}
                <div className="order-1 lg:order-2">
                    <SectionHeading
                        kicker="Quem é Henrique Fujimoto?"
                        title={<>Uma história de família. <span className="text-hf-gold">Um caminho próprio.</span></>}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6, delay: 0.08 }}
                        className="mt-6 max-w-xl space-y-4"
                    >
                        <p className={hfBody}>
                            O judô faz parte da história da família Fujimoto há gerações. Henrique representa a
                            terceira geração dessa relação com o esporte — uma tradição construída com dedicação,
                            respeito e amor pelo tatame.
                        </p>
                        <p className={hfBody}>
                            Mas carregar esse legado não significa ter um caminho pronto. Ele está escrevendo a
                            própria história, enfrentando os desafios de quem escolheu levar o esporte a sério.
                        </p>
                        <p className={hfBody}>
                            Entre treinos, escola, competições e a vida de um adolescente, descobre todos os dias
                            o que significa evoluir como atleta e como pessoa.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6, delay: 0.16 }}
                        className="mt-7 border-l-2 border-hf-gold/60 pl-5"
                    >
                        <p className="font-brand text-lg font-bold uppercase leading-snug tracking-[0.01em] text-hf-ice sm:text-xl">
                            O passado inspira. O futuro ainda está sendo construído.
                        </p>
                    </motion.div>

                    {/* Dados reais do perfil do atleta */}
                    {facts.length > 0 && (
                        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {facts.map((f, i) => (
                                <motion.div
                                    key={f.label}
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.06 }}
                                    className={`${hfCard} px-4 py-3.5`}
                                >
                                    <div className="font-brand text-xl font-bold text-hf-ice">{f.value}</div>
                                    <div className="mt-1 font-ui text-[10px] font-semibold uppercase tracking-[0.16em] text-hf-ice/45">
                                        {f.label}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <Link to="/conteudo" className={`group mt-8 ${hfBtnSecondary}`}>
                        Conheça a história completa
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
}