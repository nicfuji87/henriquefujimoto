import React from 'react';

interface WordRailProps {
    /** Palavras curtas, lidas de cima para baixo. */
    words: string[];
    className?: string;
    /** Em faixas claras o filete e o texto invertem. */
    tone?: 'dark' | 'light';
}

/**
 * Trilha vertical de palavras usada nas dobras largas (hero e fechamento).
 * Puramente decorativa: fica escondida abaixo de lg e e ignorada por leitores
 * de tela, porque repete o que o texto ao lado ja diz.
 */
export default function WordRail({ words, className = '', tone = 'dark' }: WordRailProps) {
    const text = tone === 'light' ? 'text-hf-navy/45' : 'text-hf-ice/45';
    const rule = tone === 'light' ? 'bg-hf-navy/20' : 'bg-hf-ice/20';

    return (
        <div aria-hidden="true" className={`hidden flex-col items-end gap-3 lg:flex ${className}`}>
            {words.map((w) => (
                <span key={w} className={`font-ui text-[10px] font-medium uppercase tracking-[0.3em] ${text}`}>
                    {w}
                </span>
            ))}
            <span className="mt-3 h-16 w-px bg-gradient-to-b from-hf-gold/70 to-transparent" />
            <span className={`h-10 w-px ${rule}`} />
        </div>
    );
}