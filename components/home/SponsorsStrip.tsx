import React from 'react';
import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';

interface Partner {
    id: string;
    name: string;
    logo_url: string | null;
}

interface SponsorsStripProps {
    partners: Partner[];
}

export default function SponsorsStrip({ partners }: SponsorsStripProps) {
    if (!partners.length) return null;
    const track = [...partners, ...partners];

    return (
        <section className="bg-night px-6 py-14 sm:py-20 md:py-24">
            <div className="mx-auto max-w-6xl">
                <SectionHeading
                    title="Quem já acredita nessa jornada"
                    lead="Não existe atleta de alto rendimento sozinho. Toda conquista passa pelas pessoas e empresas que decidiram acreditar antes dos grandes resultados."
                />

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative mt-12 flex items-center overflow-hidden"
                >
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-night to-transparent" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-night to-transparent" />
                    <div className="flex w-max animate-marquee items-center gap-14">
                        {track.map((p, i) =>
                            p.logo_url ? (
                                <img
                                    key={`${p.id}-${i}`}
                                    src={p.logo_url}
                                    alt={p.name}
                                    className="h-10 w-auto max-w-[130px] object-contain opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
                                />
                            ) : (
                                <span key={`${p.id}-${i}`} className="whitespace-nowrap font-grotesk text-base font-semibold text-white/45">{p.name}</span>
                            )
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
