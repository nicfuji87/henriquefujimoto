import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Flame, Star, Instagram } from 'lucide-react';
import SectionNav from '../components/SectionNav';
import TopContent from '../components/TopContent';
import Footer from '../components/Footer';
import StickyCTA from '../components/StickyCTA';
import { trackPageView } from '../lib/pageTracking';

const milestones = [
    {
        year: '2015',
        title: 'O início no Judô',
        description: 'Henrique começou a treinar judô aos 4 anos, já demonstrando paixão e disciplina desde os primeiros movimentos no tatame.',
        icon: <Star className="w-5 h-5" />,
    },
    {
        year: '2019',
        title: 'Primeiras competições',
        description: 'Com apenas 8 anos, Henrique passou a competir em torneios regionais, acumulando resultados expressivos e chamando atenção no cenário paulista.',
        icon: <Trophy className="w-5 h-5" />,
    },
    {
        year: '2022',
        title: 'Competidor estadual',
        description: 'Consolidou-se como atleta de destaque nos campeonatos estaduais, representando sua equipe com garra e determinação.',
        icon: <Flame className="w-5 h-5" />,
    },
    {
        year: '2024',
        title: 'Alto rendimento',
        description: 'Entrou no circuito de alto rendimento, treinando com os melhores e mirando competições nacionais e internacionais.',
        icon: <Target className="w-5 h-5" />,
    },
];

function StatCard({ value, label }: { value: string; label: string }) {
    return (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-primary mb-1">{value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</div>
        </div>
    );
}

export default function ConteudoPage() {
    useEffect(() => {
        trackPageView('/conteudo', 'Conheça o Henrique');
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="relative min-h-screen w-full overflow-x-hidden bg-background">
            <SectionNav title="Conheça o Henrique" subtitle="A história por trás do atleta" />

            {/* Bio Hero Section */}
            <section className="relative py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-10"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-6">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            A Jornada
                        </div>
                        <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                            Do tatame para o <span className="text-primary">mundo</span>
                        </h2>
                        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                            Henrique Fujimoto é um jovem judoca brasileiro que vive pelo esporte. Com disciplina,
                            dedicação e o sonho de representar o Brasil nas maiores competições do mundo, ele constrói
                            uma trajetória inspiradora dentro e fora do tatame.
                        </p>
                    </motion.div>

                    {/* Quick Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-3 gap-3 mb-12"
                    >
                        <StatCard value="+9" label="Anos no Judô" />
                        <StatCard value="🥇" label="Múltiplos títulos" />
                        <StatCard value="🇧🇷" label="Org. São Paulo" />
                    </motion.div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="relative py-10 px-4">
                <div className="max-w-3xl mx-auto">
                    <motion.h3
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-8 text-center"
                    >
                        Linha do Tempo
                    </motion.h3>

                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

                        <div className="space-y-8">
                            {milestones.map((milestone, index) => (
                                <motion.div
                                    key={milestone.year}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative pl-16"
                                >
                                    {/* Timeline dot */}
                                    <div className="absolute left-[14px] top-1 w-7 h-7 rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center">
                                        <div className="text-primary">{milestone.icon}</div>
                                    </div>

                                    {/* Content */}
                                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                                        <span className="text-primary text-xs font-bold uppercase tracking-widest">{milestone.year}</span>
                                        <h4 className="text-white font-bold text-lg mt-1 mb-2">{milestone.title}</h4>
                                        <p className="text-gray-400 text-sm leading-relaxed">{milestone.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-10 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5 border border-white/[0.06] rounded-2xl p-8 text-center"
                    >
                        <span className="text-4xl mb-4 block">🥋</span>
                        <h3 className="text-xl font-bold text-white mb-3">Valores que guiam o Henrique</h3>
                        <div className="flex flex-wrap justify-center gap-3 mt-4">
                            {['Disciplina', 'Respeito', 'Determinação', 'Humildade', 'Superação'].map((value) => (
                                <span
                                    key={value}
                                    className="px-4 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full text-sm text-gray-300 font-medium"
                                >
                                    {value}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Instagram CTA */}
            <section className="py-6 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <a
                        href="https://instagram.com/henriquefujimoto"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-6 py-3 bg-white/[0.03] border border-white/[0.06] rounded-full text-white font-medium hover:border-pink-500/30 hover:bg-pink-500/5 transition-all"
                    >
                        <Instagram className="w-5 h-5 text-pink-400" />
                        Acompanhe no Instagram
                    </a>
                </div>
            </section>

            {/* Top Content from Instagram */}
            <div className="pt-4 pb-10">
                <TopContent />
            </div>

            <Footer />
            <StickyCTA />
        </main>
    );
}
