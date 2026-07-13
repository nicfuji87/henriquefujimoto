import { useEffect, useRef, useState } from 'react';

/** Default WhatsApp fallback (also stored in site_config.cta_link). */
const DEFAULT_WA = 'https://wa.me/5561981446666';

/**
 * Build a WhatsApp link that preserves the admin-configured number
 * (parsed from site_config.cta_link) but swaps in a context-specific message.
 */
export function buildWaLink(ctaLink: string | undefined, message: string): string {
    let base = DEFAULT_WA;
    if (ctaLink) {
        const match = ctaLink.match(/wa\.me\/(\d+)/);
        if (match) base = `https://wa.me/${match[1]}`;
        else if (ctaLink.startsWith('http')) return ctaLink; // non-whatsapp CTA: use as-is
    }
    return `${base}?text=${encodeURIComponent(message)}`;
}

/** Compact number formatting in pt-BR style: 173420 -> "173,4 mil", 1240000 -> "1,2 mi". */
export function formatCompact(n: number): string {
    if (!n || n < 0) return '0';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')} mi`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace('.', ',')} mil`;
    return n.toLocaleString('pt-BR');
}

/** Short compact for badges: 173420 -> "173.4K". */
export function formatShort(n: number): string {
    if (!n || n < 0) return '0';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}

/** Age in whole years from an ISO date string (YYYY-MM-DD). */
export function ageFromBirth(birth: string | null | undefined): number | null {
    if (!birth) return null;
    const b = new Date(birth);
    if (isNaN(b.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - b.getFullYear();
    const m = now.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
    return age;
}

const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Animated count-up. Starts when `active` becomes true.
 * Respects prefers-reduced-motion (jumps straight to target).
 */
export function useCountUp(target: number, active: boolean, duration = 1400): number {
    const [value, setValue] = useState(0);
    const rafRef = useRef<number | null>(null);
    const startedRef = useRef(false);

    useEffect(() => {
        if (!active || startedRef.current) return;
        startedRef.current = true;

        if (prefersReducedMotion() || !target) {
            setValue(target);
            return;
        }

        const start = performance.now();
        const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            setValue(Math.round(easeOutExpo(p) * target));
            if (p < 1) rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [active, target, duration]);

    return value;
}
