import React from 'react';
import { motion } from 'framer-motion';
import { hfKicker, hfLead, hfTitle } from '../ui/hf';

interface SectionHeadingProps {
    kicker?: string;           // overline dourado opcional
    title: React.ReactNode;    // titulo da secao (Montserrat, caixa alta)
    lead?: React.ReactNode;    // paragrafo narrativo opcional
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
                    className={`mb-3 ${hfKicker}`}
                >
                    {kicker}
                </motion.p>
            )}

            <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6 }}
                className={hfTitle}
            >
                {title}
            </motion.h2>

            {/* Filete dourado: assinatura discreta da marca sob cada titulo */}
            <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: 0.12 }}
                className={`hf-rule mt-5 origin-left ${align === 'center' ? 'mx-auto origin-center' : ''}`}
            />

            {lead && (
                <motion.p
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className={`mt-5 max-w-2xl ${hfLead} ${align === 'center' ? 'mx-auto' : ''}`}
                >
                    {lead}
                </motion.p>
            )}
        </div>
    );
}