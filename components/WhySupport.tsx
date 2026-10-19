import React from 'react';
import { motion } from 'framer-motion';
import { User, Flag, Lightbulb, TrendingUp } from 'lucide-react';

const reasons = [
    {
        icon: <User className="w-6 h-6" />,
        title: "Caráter e disciplina",
        description: "O esporte forja resiliência, foco e determinação, qualidades essenciais para a vida dentro e fora dos tatames."
    },
    {
        icon: <Flag className="w-6 h-6" />,
        title: "Representatividade",
        description: "Cada vitória não é apenas pessoal. É a oportunidade de elevar o nome do Brasil e da nossa comunidade ao pódio mundial."
    },
    {
        icon: <Lightbulb className="w-6 h-6" />,
        title: "Inspiração",
        description: "Apoiar um atleta é investir em um exemplo real que motivará a próxima geração a perseguir seus próprios sonhos."
    },
    {
        icon: <TrendingUp className="w-6 h-6" />,
        title: "Alto rendimento",
        description: "Para competir no topo, talento não basta. Viagens internacionais, quimonos de competição e equipe multidisciplinar exigem recursos."
    }
];

const WhySupport: React.FC = () => {
    return (
        <section className="bg-hf-navy px-6 py-14 sm:py-20 md:py-28">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="font-brand text-[1.6rem] font-semibold leading-[1.15] tracking-tight text-hf-ice sm:text-[2rem] sm:leading-[1.08] md:text-[2.75rem]">
                        Por que apoiar o <span className="text-hf-gold">Henrique</span>?
                    </h2>
                    <p className="mx-auto mt-5 max-w-xl font-ui text-base leading-relaxed text-hf-ice/60 sm:text-lg">
                        Muito além de patrocínio, é uma parceria para construir uma história de superação e conquistas.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reasons.map((reason, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.5, delay: index * 0.08 }}
                            className="group rounded-2xl border border-hf-line/70 bg-hf-surface p-6 transition-all hover:border-hf-gold/25 hover:bg-hf-surface-2"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-hf-gold/12 text-hf-gold transition-colors group-hover:bg-hf-gold group-hover:text-hf-navy">
                                    {reason.icon}
                                </div>
                                <div>
                                    <h3 className="font-brand text-lg font-semibold text-hf-ice mb-1.5">{reason.title}</h3>
                                    <p className="font-ui text-sm leading-relaxed text-hf-ice/55">
                                        {reason.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhySupport;
