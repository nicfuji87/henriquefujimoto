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
        <section id="apoiar" className="scroll-mt-16 bg-hf-navy px-6 py-14 sm:py-20 md:py-28">
            <div className="mx-auto max-w-6xl">
                <SectionHeading
                    kicker="Por que apoiar"
                    title={<>Mais que patrocínio, <span className="text-hf-gold">uma parceria</span></>}
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
                            className="group flex items-start gap-4 rounded-2xl border border-hf-line/70 bg-hf-surface p-6 transition-all hover:border-hf-gold/25 hover:bg-hf-surface-2"
                        >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-hf-gold/12 text-hf-gold transition-colors group-hover:bg-hf-gold group-hover:text-hf-navy">
                                {r.icon}
                            </div>
                            <div>
                                <h3 className="font-brand text-lg font-semibold text-hf-ice">{r.title}</h3>
                                <p className="mt-1.5 font-ui text-sm leading-relaxed text-hf-ice/55">{r.text}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
