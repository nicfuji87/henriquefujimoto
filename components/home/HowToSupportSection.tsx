import React from 'react';
import { motion } from 'framer-motion';
import { Shirt, Plane, HeartPulse, ShoppingBag, Share2, ArrowUpRight, ArrowRight } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { buildWaLink } from './utils';

interface HowToSupportSectionProps {
    ctaLink?: string;
}

export default function HowToSupportSection({ ctaLink }: HowToSupportSectionProps) {
    const handleShare = async () => {
        const url = typeof window !== 'undefined' ? window.location.origin : '';
        const shareData = {
            title: 'Henrique Fujimoto — Judoca',
            text: 'Conheça a história do Henrique Fujimoto e acompanhe essa jornada desde o começo.',
            url,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
                return;
            }
        } catch {
            /* user cancelled — ignore */
        }
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareData.text} ${url}`)}`, '_blank', 'noopener');
    };

    const ways = [
        {
            icon: <Shirt className="h-5 w-5" />,
            title: 'Seja um patrocinador',
            text: 'Sua marca acompanha uma história de dedicação, disciplina e crescimento — com presença em competições, uniformes, redes sociais e conteúdos exclusivos.',
            action: 'link' as const,
            href: buildWaLink(ctaLink, 'Olá! Vim pelo site do Henrique e tenho interesse em ser patrocinador dele. Podemos conversar?'),
            cta: 'Conversar sobre patrocínio',
        },
        {
            icon: <Plane className="h-5 w-5" />,
            title: 'Apoie uma competição',
            text: 'Cada viagem representa uma oportunidade de evolução. Sua ajuda pode levar o Henrique ao próximo desafio.',
            action: 'link' as const,
            href: buildWaLink(ctaLink, 'Olá! Vim pelo site do Henrique e quero apoiar uma competição dele (viagem, inscrição, alimentação). Como funciona?'),
            cta: 'Apoiar uma viagem',
        },
        {
            icon: <HeartPulse className="h-5 w-5" />,
            title: 'Faça parte da preparação',
            text: 'Nutrição, fisioterapia, equipamentos, academia, educação. Toda estrutura faz diferença na formação do atleta.',
            action: 'link' as const,
            href: buildWaLink(ctaLink, 'Olá! Vim pelo site do Henrique e gostaria de apoiar a preparação dele (nutrição, fisioterapia, equipamentos...). Vamos conversar?'),
            cta: 'Quero ajudar na preparação',
        },
        {
            icon: <ShoppingBag className="h-5 w-5" />,
            title: 'Compre pelos links',
            text: 'São exatamente os produtos que fazem parte da rotina de treinos. Você não paga nada a mais e ainda ajuda diretamente o atleta.',
            action: 'anchor' as const,
            href: '#produtos',
            cta: 'Ver os produtos',
        },
        {
            icon: <Share2 className="h-5 w-5" />,
            title: 'Compartilhe',
            text: 'Às vezes um compartilhamento leva essa história para alguém que pode mudar o futuro dela.',
            action: 'share' as const,
            cta: 'Compartilhar a jornada',
        },
    ];

    return (
        <section id="apoiar" className="scroll-mt-16 bg-night px-6 py-14 sm:py-20 md:py-28">
            <div className="mx-auto max-w-4xl">
                <SectionHeading
                    title={<>Como você pode fazer parte <span className="font-editorial font-normal italic text-lime">dessa história</span></>}
                    lead="Toda carreira começa com pessoas que decidiram apoiar quando o sonho ainda estava no começo. Hoje existem várias formas de participar dessa caminhada."
                />

                <div className="mt-12 flex flex-col gap-3">
                    {ways.map((w, i) => {
                        const inner = (
                            <>
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lime/12 text-lime transition-colors group-hover:bg-lime group-hover:text-night">
                                    {w.icon}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-grotesk text-lg font-semibold text-white">{w.title}</h3>
                                    <p className="mt-1 font-grotesk text-sm leading-relaxed text-white/55">{w.text}</p>
                                    <span className="mt-2.5 inline-flex items-center gap-1.5 font-grotesk text-[13px] font-semibold text-lime">
                                        {w.cta}
                                        {w.action === 'link' ? (
                                            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                        ) : (
                                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                        )}
                                    </span>
                                </div>
                            </>
                        );
                        const cls = 'group flex items-start gap-4 rounded-3xl border border-white/[0.07] bg-coal p-5 text-left transition-all hover:border-lime/25 hover:bg-coal-2';

                        return (
                            <motion.div
                                key={w.title}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ duration: 0.45, delay: i * 0.07 }}
                            >
                                {w.action === 'share' ? (
                                    <button type="button" onClick={handleShare} className={`${cls} w-full`}>{inner}</button>
                                ) : w.action === 'anchor' ? (
                                    <a href={w.href} className={cls}>{inner}</a>
                                ) : (
                                    <a href={w.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
