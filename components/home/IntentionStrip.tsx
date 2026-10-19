import React from 'react';
import { motion } from 'framer-motion';
import { UserRound, BarChart3, HeartHandshake, ArrowRight } from 'lucide-react';

const steps = [
    { icon: <UserRound className="h-5 w-5" />, title: 'Conheça', text: 'Quem é o Henrique e a história por trás do kimono.', href: '#historia' },
    { icon: <BarChart3 className="h-5 w-5" />, title: 'Confie', text: 'O alcance real do conteúdo dele, em números.', href: '#numeros' },
    { icon: <HeartHandshake className="h-5 w-5" />, title: 'Apoie', text: 'As formas de fazer parte dessa jornada.', href: '#apoiar' },
];

export default function IntentionStrip() {
    return (
        <section id="entenda" className="scroll-mt-20 bg-hf-navy px-6 py-14 sm:py-20 md:py-28">
            <div className="mx-auto max-w-6xl">
                {/* Manifesto */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl"
                >
                    <span className="inline-flex items-center gap-2 rounded-full border border-hf-ice/10 bg-hf-ice/[0.04] px-3 py-1 font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-hf-ice/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-hf-gold" />
                        O que é este site
                    </span>
                    <p className="mt-5 font-ui text-2xl font-medium leading-snug text-hf-ice/90 sm:text-[2rem]">
                        Este é o media kit do Henrique. Em um só lugar você entende{' '}
                        <span className="text-hf-gold">quem ele é</span>, vê a{' '}
                        <span className="text-hf-gold">prova do seu impacto</span> e descobre{' '}
                        <span className="text-hf-gold">como apoiar</span>.
                    </p>
                    <p className="mt-3 font-ui text-base text-hf-ice/50">
                        Como patrocinador, comprando o que ele usa, ou simplesmente acompanhando.
                    </p>
                </motion.div>

                {/* Steps */}
                <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {steps.map((s, i) => (
                        <motion.a
                            key={s.title}
                            href={s.href}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="group rounded-2xl border border-hf-line/70 bg-hf-surface p-6 transition-all hover:border-hf-gold/30 hover:bg-hf-surface-2"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-hf-gold/12 text-hf-gold transition-colors group-hover:bg-hf-gold group-hover:text-hf-navy">
                                {s.icon}
                            </div>
                            <h3 className="mt-4 font-brand text-xl font-semibold text-hf-ice">{s.title}</h3>
                            <p className="mt-1.5 font-ui text-sm leading-relaxed text-hf-ice/55">{s.text}</p>
                            <span className="mt-4 inline-flex items-center gap-1.5 font-ui text-xs font-semibold text-hf-gold">
                                Ver
                                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                            </span>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
}
