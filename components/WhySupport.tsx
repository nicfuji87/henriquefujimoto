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
        <section className="bg-night px-6 py-20 md:py-28">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="font-grotesk text-[2rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-[2.75rem]">
                        Por que apoiar o <span className="font-editorial font-normal italic text-lime">Henrique</span>?
                    </h2>
                    <p className="mx-auto mt-5 max-w-xl font-grotesk text-base leading-relaxed text-white/60 sm:text-lg">
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
                            className="group rounded-3xl border border-white/[0.07] bg-coal p-6 transition-all hover:border-lime/25 hover:bg-coal-2"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lime/12 text-lime transition-colors group-hover:bg-lime group-hover:text-night">
                                    {reason.icon}
                                </div>
                                <div>
                                    <h3 className="font-grotesk text-lg font-semibold text-white mb-1.5">{reason.title}</h3>
                                    <p className="font-grotesk text-sm leading-relaxed text-white/55">
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
