import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { buildWaLink } from './utils';

interface StickyApoiarProps {
    ctaLink?: string;
}

/**
 * Floating "Apoiar" pill that appears only after the visitor scrolls past the hero.
 * Less intrusive than a permanent bottom bar, and on-brand for the redesign.
 */
export default function StickyApoiar({ ctaLink }: StickyApoiarProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.9);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const wa = buildWaLink(ctaLink, 'Olá! Vim pelo site do Henrique e gostaria de apoiar o atleta. Podemos conversar?');

    return (
        <AnimatePresence>
            {show && (
                <motion.a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 24, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 24, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2.5 rounded-full bg-lime px-5 py-3.5 font-grotesk text-sm font-semibold text-night shadow-[0_12px_40px_-8px_rgba(198,242,78,0.5)] transition-colors hover:bg-lime-dim"
                >
                    <MessageCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Apoiar o atleta</span>
                    <span className="sm:hidden">Apoiar</span>
                </motion.a>
            )}
        </AnimatePresence>
    );
}
