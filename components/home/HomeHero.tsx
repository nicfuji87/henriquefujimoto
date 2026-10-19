import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowRight, BookOpen } from 'lucide-react';
import { useSiteConfig } from '../../hooks/useSiteConfig';
import { hfBtnPrimary, hfBtnSecondary } from '../ui/hf';

interface HomeHeroProps {
    age: number | null;
    category: string;
}

export default function HomeHero({ age, category }: HomeHeroProps) {
    const { config, loading } = useSiteConfig();
    const ref = useRef<HTMLElement>(null);
    const reduceMotion = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
    const mediaY = useTransform(scrollYProgress, [0, 1], ['0%', reduceMotion ? '0%' : '12%']);
    const mediaScale = useTransform(scrollYProgress, [0, 1], [1, reduceMotion ? 1 : 1.08]);

    const name = config.athlete_name || 'Henrique Fujimoto';
    // Sem video dedicado de desktop, reaproveita o vertical para que o hero sempre
    // mostre imagem real do atleta (configuravel pelo painel administrativo).
    const desktopVideo = config.hero_video_desktop || config.hero_video_mobile;
    const desktopPoster = config.hero_image_desktop || config.hero_image || undefined;
    const mobileVideo = config.hero_video_mobile;

    return (
        <section
            ref={ref}
            aria-label="Henrique Fujimoto — um treino de cada vez"
            className="relative flex h-[100svh] min-h-[620px] w-full flex-col overflow-hidden bg-hf-navy"
        >
            {/* Midia real do atleta */}
            <motion.div style={{ y: mediaY, scale: mediaScale }} className="absolute inset-0 z-0 will-change-transform">
                {loading ? (
                    <div className="h-full w-full animate-pulse bg-hf-surface" />
                ) : (
                    <>
                        {/* Mobile */}
                        {mobileVideo ? (
                            <video
                                src={mobileVideo}
                                poster={config.hero_image || undefined}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="h-full w-full object-cover object-top md:hidden"
                            />
                        ) : config.hero_image ? (
                            <img
                                src={config.hero_image}
                                alt={`${name} em treino de judô`}
                                className="h-full w-full object-cover object-top md:hidden"
                            />
                        ) : null}

                        {/* Desktop */}
                        {desktopVideo ? (
                            <video
                                src={desktopVideo}
                                poster={desktopPoster}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="hidden h-full w-full object-cover object-center md:block"
                            />
                        ) : desktopPoster ? (
                            <img
                                src={desktopPoster}
                                alt={`${name} em treino de judô`}
                                className="hidden h-full w-full object-cover object-center md:block"
                            />
                        ) : null}
                    </>
                )}
            </motion.div>

            {/* Grade cinematografica em azul-marinho: preserva o rosto e garante leitura do texto */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-t from-hf-navy via-hf-navy/55 to-hf-navy/25" />
            <div className="absolute inset-0 z-[1] bg-gradient-to-b from-hf-navy/75 via-transparent to-transparent" />

            {/* Conteudo: ancorado embaixo para nao cobrir o rosto do atleta */}
            <div className="relative z-10 flex h-full flex-col px-6 pb-14 pt-24 sm:px-8 md:px-12 lg:px-16 lg:pb-20">
                <div className="mx-auto mt-auto w-full max-w-6xl">
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="flex flex-wrap items-center gap-x-3 gap-y-1 font-ui text-[11px] font-semibold uppercase tracking-[0.24em] text-hf-ice/70 sm:text-xs"
                    >
                        <span>Judô</span>
                        <span className="h-1 w-1 rounded-full bg-hf-gold" />
                        <span>{category}</span>
                        <span className="h-1 w-1 rounded-full bg-hf-gold" />
                        <span>Brasília — DF</span>
                    </motion.p>

                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.85, delay: 0.18 }}
                        className="mt-5 max-w-4xl font-brand text-[2.6rem] font-extrabold uppercase leading-[0.95] tracking-[-0.015em] text-hf-ice sm:text-[4.25rem] lg:text-[5.75rem]"
                    >
                        Um treino
                        <br className="sm:hidden" /> de cada <span className="text-hf-gold">vez.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.34 }}
                        className="mt-6 max-w-xl font-ui text-base leading-relaxed text-hf-ice/75 sm:text-lg"
                    >
                        Acompanhe a trajetória de {name}
                        {age ? `, ${age} anos,` : ''} no judô. Cada treino, cada desafio e cada conquista fazem
                        parte de uma história que ainda está sendo escrita.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.46 }}
                        className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
                    >
                        <a href="#historia" className={hfBtnPrimary}>
                            <BookOpen className="h-4 w-4" />
                            Conheça minha história
                        </a>
                        <Link to="/conteudo" className={hfBtnSecondary}>
                            <ArrowRight className="h-4 w-4" />
                            Acompanhe minha jornada
                        </Link>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.62 }}
                        className="mt-6 font-ui text-[13px] text-hf-ice/50"
                    >
                        Empresas e apoiadores podem{' '}
                        <a href="#apoiar" className="font-semibold text-hf-ice/80 underline decoration-hf-gold/60 underline-offset-4 transition-colors hover:text-hf-gold">
                            fazer parte dessa jornada
                        </a>
                        .
                    </motion.p>
                </div>
            </div>

            {/* Indicador de rolagem */}
            <motion.a
                href="#historia"
                aria-label="Rolar para a próxima seção"
                className="absolute bottom-6 right-6 z-20 hidden h-10 w-10 items-center justify-center rounded-full border border-hf-ice/20 bg-hf-navy/40 text-hf-ice/80 backdrop-blur-sm transition-colors hover:border-hf-gold/50 hover:text-hf-gold md:flex"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
            >
                <motion.span
                    animate={reduceMotion ? undefined : { y: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                >
                    <ArrowDown className="h-4 w-4" />
                </motion.span>
            </motion.a>
        </section>
    );
}