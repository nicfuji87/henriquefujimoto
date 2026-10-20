import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Handshake, Mail, Shirt } from 'lucide-react';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { buildWaLink } from './home/utils';
import { hfKicker, hfLead, hfTitle } from './ui/hf';

interface Option {
    icon: React.ReactNode;
    title: string;
    description: string;
    message: string;
}

const options: Option[] = [
    {
        icon: <Shirt className="h-6 w-6" />,
        title: 'Patrocínio',
        description: 'Sua marca no quimono, nas camisetas de treino e nos conteúdos de competição.',
        message: 'Olá! Vim pelo site do Henrique e tenho interesse em patrocinar o atleta. Podemos conversar?',
    },
    {
        icon: <Handshake className="h-6 w-6" />,
        title: 'Parcerias',
        description: 'Ações, ativações e projetos conjuntos construídos com quem compartilha os valores do esporte.',
        message: 'Olá! Vim pelo site do Henrique e gostaria de propor uma parceria. Podemos conversar?',
    },
    {
        icon: <BarChart3 className="h-6 w-6" />,
        title: 'Competições',
        description: 'Apoio a inscrições, viagens e alimentação nos campeonatos dentro e fora do DF.',
        message: 'Olá! Vim pelo site do Henrique e quero apoiar uma competição (inscrição, viagem, alimentação). Como funciona?',
    },
    {
        icon: <Mail className="h-6 w-6" />,
        title: 'Preparação',
        description: 'Nutrição, fisioterapia, equipamentos e educação. Toda estrutura conta na formação do atleta.',
        message: 'Olá! Vim pelo site do Henrique e gostaria de apoiar a preparação dele (nutrição, fisioterapia, equipamentos...).',
    },
];

const HowToSupport: React.FC = () => {
    const { config } = useSiteConfig();

    return (
        <section id="como-apoiar" className="scroll-mt-20 bg-hf-navy px-6 py-16 sm:py-20 md:py-24">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[0.85fr_2fr] lg:gap-14">
                <div>
                    <span className="hf-rule mb-5 block" />
                    <p className={hfKicker}>Como você pode fazer parte</p>
                    <h2 className={`mt-4 ${hfTitle}`}>Existem várias formas de apoiar.</h2>
                    <p className={`mt-5 max-w-md ${hfLead}`}>
                        Cada parceria contribui para que o atleta siga evoluindo dentro e fora do tatame. As
                        conversas institucionais são conduzidas pelos responsáveis.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {options.map((o, i) => (
                        <motion.a
                            key={o.title}
                            href={buildWaLink(config.cta_link, o.message)}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.45, delay: i * 0.07 }}
                            className="group flex flex-col rounded-xl border border-hf-line/70 bg-hf-surface p-5 transition-all duration-300 hover:border-hf-gold/45 hover:bg-hf-surface-2"
                        >
                            <span className="text-hf-gold">{o.icon}</span>
                            <h3 className="mt-4 font-brand text-sm font-bold uppercase tracking-[0.02em] text-hf-ice">
                                {o.title}
                            </h3>
                            <p className="mt-2 font-ui text-[13px] leading-relaxed text-hf-ice/60">
                                {o.description}
                            </p>
                            <ArrowRight className="mt-5 h-4 w-4 text-hf-ice/45 transition-all group-hover:translate-x-1 group-hover:text-hf-gold" />
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowToSupport;