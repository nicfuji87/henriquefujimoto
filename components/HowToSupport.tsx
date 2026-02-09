import React from 'react';
import { motion } from 'framer-motion';

const options = [
    {
        icon: (
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
        ),
        title: 'Patrocínio de Marca',
        subtitle: 'Sua marca vestindo o campeão',
        description: 'Logomarca no Kimono, camisetas de treino e agasalhos. Visibilidade em competições, fotos de pódio e treinos nas redes sociais.',
    },
    {
        icon: (
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
            </svg>
        ),
        title: 'Apoio para Competições',
        subtitle: 'Leve o Henrique para o pódio',
        description: 'Custeio de inscrições, viagens e alimentação para campeonatos. Agradecimento especial em vídeo e menção nos posts do evento.',
    },
    {
        icon: (
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
        ),
        title: 'Parceiro de Preparação',
        subtitle: 'Cuide do atleta fora do tatame',
        description: 'Apoio com serviços essenciais: Nutricionista, Fisioterapia, Educação ou Suplementação. Faça parte do "Time Henrique".',
    },
];

const HowToSupport: React.FC = () => {
    return (
        <section className="py-16 px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-10"
            >
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
                    Formas de Apoio
                </h3>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                    Como Participar Dessa Jornada?
                </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {options.map((option, index) => (
                    <motion.div
                        key={option.title}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.15 }}
                        className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-primary/30 transition-all duration-300"
                    >
                        {/* Icon */}
                        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:bg-primary/20 transition-colors">
                            {option.icon}
                        </div>

                        {/* Content */}
                        <h4 className="text-lg font-bold text-white mb-1">
                            {option.title}
                        </h4>
                        <p className="text-sm font-medium text-primary/80 mb-3">
                            {option.subtitle}
                        </p>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            {option.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default HowToSupport;
