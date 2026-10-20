import React from 'react';
import { motion } from 'framer-motion';
import { Flag, Lightbulb, TrendingUp, User } from 'lucide-react';
import { hfKickerOnLight, hfLeadOnLight, hfTitleOnLight } from './ui/hf';

const reasons = [
    {
        icon: <User className="h-6 w-6" />,
        title: 'Caráter e disciplina',
        description:
            'O esporte forja resiliência, foco e determinação — qualidades essenciais dentro e fora dos tatames.',
    },
    {
        icon: <Flag className="h-6 w-6" />,
        title: 'Representatividade',
        description:
            'Cada competição leva o nome de Brasília e da comunidade do judô para o tatame.',
    },
    {
        icon: <Lightbulb className="h-6 w-6" />,
        title: 'Inspiração',
        description:
            'Apoiar um atleta em formação é investir em um exemplo real para a próxima geração.',
    },
    {
        icon: <TrendingUp className="h-6 w-6" />,
        title: 'Alto rendimento',
        description:
            'Talento não basta: viagens, inscrições, quimonos de competição e equipe multidisciplinar exigem estrutura.',
    },
];

const WhySupport: React.FC = () => {
    return (
        <section className="bg-hf-ice px-6 py-16 sm:py-20 md:py-24">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[0.85fr_2fr] lg:gap-14">
                <div>
                    <span className="hf-rule mb-5 block" />
                    <p className={hfKickerOnLight}>Por que apoiar</p>
                    <h2 className={`mt-4 ${hfTitleOnLight}`}>
                        Um projeto sólido,
                        <br />
                        baseado em valores reais.
                    </h2>
                    <p className={`mt-5 max-w-md ${hfLeadOnLight}`}>
                        Mais que resultados, o que se busca é evolução contínua, respeito e impacto positivo
                        através do judô.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-hf-navy/10 bg-hf-navy/10 sm:grid-cols-2 xl:grid-cols-4">
                    {reasons.map((r, i) => (
                        <motion.div
                            key={r.title}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.45, delay: i * 0.07 }}
                            className="bg-hf-ice px-6 py-7"
                        >
                            <span className="text-hf-gold-dim">{r.icon}</span>
                            <h3 className="mt-4 font-brand text-sm font-bold uppercase tracking-[0.02em] text-hf-navy">
                                {r.title}
                            </h3>
                            <p className="mt-2 font-ui text-[13px] leading-relaxed text-hf-navy/60">
                                {r.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhySupport;