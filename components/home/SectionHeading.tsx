import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeadingProps {
    kicker?: string;           // optional small plain overline (no pill chrome)
    title: React.ReactNode;    // chapter-like headline
    lead?: React.ReactNode;    // optional narrative paragraph
    align?: 'left' | 'center';
}

export default function SectionHeading({ kicker, title, lead, align = 'left' }: SectionHeadingProps) {
    return (
        <div className={align === 'center' ? 'text-center' : ''}>
            {kicker && (
                <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5 }}
                    className="mb-3 font-grotesk text-[12px] font-semibold uppercase tracking-[0.16em] text-lime"
                >
                    {kicker}
                </motion.p>
            )}

            <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6 }}
                className="font-grotesk text-[2rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-[2.75rem]"
            >
                {title}
            </motion.h2>

            {lead && (
                <motion.p
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className={`mt-5 max-w-2xl font-grotesk text-base leading-relaxed text-white/60 sm:text-lg ${
                        align === 'center' ? 'mx-auto' : ''
                    }`}
                >
                    {lead}
                </motion.p>
            )}
        </div>
    );
}
