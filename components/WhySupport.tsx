import React from 'react';
import { motion } from 'framer-motion';
import { User, Flag, Lightbulb, TrendingUp } from 'lucide-react';

const reasons = [
    {
        icon: <User className="w-6 h-6" />,
        title: "Caráter e Disciplina",
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
        title: "Alto Rendimento",
        description: "Para competir no topo, talento não basta. Viagens internacionais, quimonos de competição e equipe multidisciplinar exigem recursos."
    }
];

const WhySupport: React.FC = () => {
    return (
        <section className="py-16 px-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl font-black text-white italic tracking-tighter mb-4 uppercase">
                        POR QUE APOIAR O <span className="text-blue-500">HENRIQUE?</span>
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
                        Muito além de patrocínio, é uma parceria para construir uma história de superação e conquistas.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reasons.map((reason, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                                    {reason.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">{reason.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
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
