import React from 'react';
import { Check } from 'lucide-react';

export interface BuildItem {
    title: string;
    text: string;
}

/**
 * As possibilidades viram cartas que a escola marca junto, na reuniao.
 *
 * O estado sobe para a pagina porque a tela de fechamento mostra o que foi
 * escolhido: a conversa sai dali com um resumo em vez de terminar no ar.
 */
export default function BuildPicker({
    items,
    selected,
    onToggle,
}: {
    items: BuildItem[];
    selected: string[];
    onToggle: (title: string) => void;
}) {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {items.map((b, i) => {
                const on = selected.includes(b.title);
                return (
                    <button
                        key={`${b.title}-${i}`}
                        type="button"
                        onClick={() => onToggle(b.title)}
                        className={`relative min-h-[112px] rounded-2xl border p-5 text-left transition-colors ${
                            on
                                ? 'border-hf-gold/60 bg-hf-gold/[0.08]'
                                : 'border-hf-line/70 bg-hf-surface hover:border-hf-gold/30'
                        }`}
                    >
                        <span
                            className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
                                on
                                    ? 'border-hf-gold bg-hf-gold text-hf-navy'
                                    : 'border-hf-ice/20 text-transparent'
                            }`}
                        >
                            <Check className="h-3.5 w-3.5" />
                        </span>
                        <h3 className="pr-9 font-brand text-[15px] font-bold uppercase leading-tight text-hf-ice">
                            {b.title}
                        </h3>
                        {b.text && (
                            <p className="mt-2 font-ui text-[13px] leading-relaxed text-hf-ice/60">
                                {b.text}
                            </p>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
