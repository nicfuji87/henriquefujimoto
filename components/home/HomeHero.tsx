import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useSiteConfig } from '../../hooks/useSiteConfig';
import { hfBtnPrimary, hfBtnSecondary } from '../ui/hf';
import WordRail from './WordRail';

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

    const breadcrumb = [name, 'Judô', category, 'História em andamento'];

    return (
        <section
            ref={ref}
            aria-label={`${name} — você chegou antes`}
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

            {/* Grade cinematografica: escurece a esquerda para o texto e preserva o rosto a direita */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-t from-hf-navy via-hf-navy/55 to-hf-navy/25" />
            <div className="absolute inset-0 z-[1] bg-gradient-to-r from-hf-navy/85 via-hf-navy/35 to-transparent" />

            {/* Conteudo ancorado embaixo para nao cobrir o rosto do atleta */}
            <div className="relative z-10 flex h-full flex-col px-6 pb-14 pt-24 sm:px-8 md:px-12 lg:px-16 lg:pb-20">
                <div className="mx-auto mt-auto flex w-full max-w-7xl items-end justify-between gap-10">
                    <div className="w-full max-w-3xl">
                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className="flex flex-wrap items-center gap-x-3 gap-y-1 font-ui text-[10px] font-semibold uppercase tracking-[0.24em] text-hf-ice/65 sm:text-[11px]"
                        >
                            {breadcrumb.map((item, i) => (
                                <React.Fragment key={item}>
                                    {i > 0 && <span className="text-hf-gold/70">/</span>}
                                    <span className={i > 1 ? 'hidden sm:inline' : undefined}>{item}</span>
                                </React.Fragment>
                            ))}
                        </motion.p>

                        <motion.h1
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.85, delay: 0.18 }}
                            className="mt-5 font-brand text-[2.75rem] font-extrabold uppercase leading-[0.92] tracking-[-0.02em] text-hf-ice sm:text-[4.5rem] lg:text-[5.5rem]"
                        >
                            Você chegou
                            <br />
                            antes.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                            className="mt-4 font-brand text-xl font-semibold text-hf-ice sm:text-2xl"
                        >
                            Antes de quê? Ninguém sabe ainda.
                        </motion.p>

                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.38 }}
                            className="mt-5 max-w-xl font-ui text-[15px] leading-relaxed text-hf-ice/75 sm:text-base"
                        >
                            {name}{age ? `, ${age} anos,` : ''} está no meio da história. Não na retrospectiva.
                            Sem final escrito. Sem promessa de medalha. Só o que está acontecendo agora.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.48 }}
                            className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
                        >
                            <a href="#historia" className={hfBtnPrimary}>
                                Descubra o Henrique
                                <ArrowRight className="h-4 w-4" />
                            </a>
                            <Link to="/blog" className={hfBtnSecondary}>
                                Veja o que está acontecendo
                            </Link>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                        className="pb-2"
                    >
                        <WordRail words={['Disciplina', 'Processo', 'Evolução', 'Judô', 'Sempre']} />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}