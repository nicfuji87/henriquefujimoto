import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Flag, Sparkles, Flame } from 'lucide-react';
import SectionHeading from './SectionHeading';

const reasons = [
    { icon: <ShieldCheck className="h-5 w-5" />, title: 'Caráter e disciplina', text: 'O judô forja resiliência, respeito e foco — dentro e fora do tatame.' },
    { icon: <Flag className="h-5 w-5" />, title: 'Representatividade', text: 'Cada vitória leva o nome do Brasil e da comunidade ao pódio.' },
    { icon: <Sparkles className="h-5 w-5" />, title: 'Inspiração', text: 'Um exemplo real que motiva a próxima geração a sonhar alto.' },
    { icon: <Flame className="h-5 w-5" />, title: 'Alto rendimento', text: 'Preparação física 4×/semana e 3h diárias de tatame, 6 dias por semana. Talento não basta — exige estrutura.' },
];

export default function WhySupportSection() {
    return (
        <section id="apoiar" className="scroll-mt-16 bg-night px-6 py-14 sm:py-20 md:py-28">
            <div className="mx-auto max-w-6xl">
                <SectionHeading
                    eyebrow="Por que apoiar"
                    title={<>Mais que patrocínio, <span className="font-editorial font-normal italic text-lime">uma parceria</span></>}
                    lead="Apoiar o Henrique é investir em uma história de superação — e associar sua marca a valores que as pessoas admiram."
                />

                <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {reasons.map((r, i) => (
                        <motion.div
                            key={r.title}
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            className="group flex items-start gap-4 rounded-3xl border border-white/[0.07] bg-coal p-6 transition-all hover:border-lime/25 hover:bg-coal-2"
                        >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lime/12 text-lime transition-colors group-hover:bg-lime group-hover:text-night">
                                {r.icon}
                            </div>
                            <div>
                                <h3 className="font-grotesk text-lg font-semibold text-white">{r.title}</h3>
                                <p className="mt-1.5 font-grotesk text-sm leading-relaxed text-white/55">{r.text}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
