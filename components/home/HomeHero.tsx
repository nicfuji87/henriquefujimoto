import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BookOpen, HeartHandshake, ArrowDown } from 'lucide-react';
import { useSiteConfig } from '../../hooks/useSiteConfig';

interface HomeHeroProps {
    age: number | null;
    category: string;
}

export default function HomeHero({ age, category }: HomeHeroProps) {
    const { config, loading } = useSiteConfig();
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
    const mediaY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
    const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

    const name = config.athlete_name || 'Henrique Fujimoto';
    // Fall back to the mobile video on desktop when no dedicated desktop video exists,
    // so the hero always plays footage instead of a static image.
    const desktopVideo = config.hero_video_desktop || config.hero_video_mobile;
    const desktopPoster = config.hero_image_desktop || config.hero_image || undefined;
    const mobileVideo = config.hero_video_mobile;

    return (
        <section ref={ref} className="relative flex h-[100svh] min-h-[640px] w-full flex-col overflow-hidden bg-night">
            {/* Background footage */}
            <motion.div style={{ y: mediaY, scale: mediaScale }} className="absolute inset-0 z-0 will-change-transform">
                {loading ? (
                    <div className="h-full w-full animate-pulse bg-coal" />
                ) : (
                    <>
                        {/* Mobile */}
                        {mobileVideo ? (
                            <video src={mobileVideo} poster={config.hero_image || undefined} autoPlay muted loop playsInline className="h-full w-full object-cover object-top md:hidden" />
                        ) : config.hero_image ? (
                            <img src={config.hero_image} alt={name} className="h-full w-full object-cover object-top md:hidden" />
                        ) : null}

                        {/* Desktop */}
                        {desktopVideo ? (
                            <video src={desktopVideo} poster={desktopPoster} autoPlay muted loop playsInline className="hidden h-full w-full object-cover object-center md:block" />
                        ) : desktopPoster ? (
                            <img src={desktopPoster} alt={name} className="hidden h-full w-full object-cover object-center md:block" />
                        ) : null}
                    </>
                )}
            </motion.div>

            {/* Cinematic grade */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-t from-night via-night/45 to-night/30" />
            <div className="absolute inset-0 z-[1] bg-gradient-to-b from-night/40 via-transparent to-transparent" />

            {/* Layout: masthead top, statement bottom */}
            <div className="relative z-10 flex h-full flex-col px-6 py-6 md:px-12 md:py-8 lg:px-20">
                {/* Editorial masthead */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="mx-auto flex w-full max-w-6xl items-center gap-4"
                >
                    <span className="font-grotesk text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85 sm:text-xs">
                        {name}
                    </span>
                    <span className="h-px flex-1 bg-white/20" />
                    <span className="hidden font-grotesk text-[11px] font-medium uppercase tracking-[0.22em] text-white/55 sm:inline">
                        Judô · Brasília — DF
                    </span>
                </motion.div>

                {/* Statement */}
                <div className="mx-auto mt-auto w-full max-w-6xl pb-14 lg:pb-20">
                    <motion.h1
                        initial={{ opacity: 0, y: 26 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.85, delay: 0.2 }}
                        className="max-w-4xl font-grotesk text-[2.15rem] font-semibold leading-[1.1] tracking-[-0.02em] text-white sm:text-7xl lg:text-[5.5rem]"
                    >
                        Um sonho olímpico começa{' '}
                        <span className="font-editorial font-normal italic text-lime">muito antes da medalha.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="mt-6 max-w-xl font-grotesk text-base leading-relaxed text-white/75 sm:text-lg"
                    >
                        {name}, {age ? `${age} anos` : `judoca`}. Você pode acompanhar essa jornada desde o
                        começo — cada treino, cada viagem, cada conquista.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.52 }}
                        className="mt-8 flex flex-wrap items-center gap-3"
                    >
                        <a href="#historia" className="group inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3.5 font-grotesk text-sm font-semibold text-night transition-all hover:bg-lime-dim">
                            <BookOpen className="h-4 w-4" />
                            Conhecer a história
                        </a>
                        <a href="#apoiar" className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3.5 font-grotesk text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20">
                            <HeartHandshake className="h-4 w-4" />
                            Fazer parte da jornada
                        </a>
                    </motion.div>
                </div>
            </div>

            {/* Scroll cue */}
            <motion.a
                href="#historia"
                aria-label="Rolar para saber mais"
                className="absolute bottom-6 right-6 z-20 hidden h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 backdrop-blur-sm transition-colors hover:text-white md:flex"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
            >
                <motion.span animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}>
                    <ArrowDown className="h-4 w-4" />
                </motion.span>
            </motion.a>
        </section>
    );
}
