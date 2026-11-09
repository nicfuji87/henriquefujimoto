import React, { useMemo, useState } from 'react';
import { MapPin, Medal } from 'lucide-react';

export interface PresentationCompetition {
    id: string;
    name: string;
    date: string;
    location: string;
    category: string;
    weight_class: string;
    placement: string;
    medal_type: string | null;
}

const medalTone = (type: string | null) =>
    type === 'gold'
        ? 'text-hf-gold'
        : type === 'silver'
          ? 'text-hf-ice/70'
          : type === 'bronze'
            ? 'text-[#B87333]'
            : 'text-hf-ice/25';

/** Jiu-jitsu fica marcado no proprio nome da competicao, como no cadastro. */
const isBjj = (c: PresentationCompetition) => /bjj|jiu/i.test(c.name);

/**
 * Lista de competicoes com filtro, para a reunião.
 *
 * O filtro existe para responder pergunta na hora ("e em 2025?", "e fora do
 * judo?") sem sair da tela. O padrao mostra tudo, inclusive as competicoes sem
 * podio: esconder derrota seria contar outra historia.
 */
export default function CompetitionsExplorer({
    competitions,
}: {
    competitions: PresentationCompetition[];
}) {
    const [year, setYear] = useState<string>('todos');
    const [sport, setSport] = useState<'todos' | 'judo' | 'bjj'>('todos');
    const [onlyPodium, setOnlyPodium] = useState(false);

    const years = useMemo(() => {
        const set = new Set(competitions.map((c) => (c.date || '').slice(0, 4)).filter(Boolean));
        return Array.from(set).sort().reverse();
    }, [competitions]);

    const filtered = useMemo(
        () =>
            competitions.filter((c) => {
                if (year !== 'todos' && !(c.date || '').startsWith(year)) return false;
                if (sport === 'judo' && isBjj(c)) return false;
                if (sport === 'bjj' && !isBjj(c)) return false;
                if (onlyPodium && !c.medal_type) return false;
                return true;
            }),
        [competitions, year, sport, onlyPodium],
    );

    const podiums = filtered.filter((c) => !!c.medal_type).length;

    const chip = (active: boolean) =>
        `min-h-[40px] rounded-full border px-4 font-ui text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors ${
            active
                ? 'border-hf-gold/60 bg-hf-gold/10 text-hf-gold'
                : 'border-hf-line text-hf-ice/50 hover:border-hf-gold/30 hover:text-hf-ice/80'
        }`;

    return (
        <div>
            <div className="flex flex-wrap items-center gap-2">
                <button type="button" className={chip(year === 'todos')} onClick={() => setYear('todos')}>
                    Tudo
                </button>
                {years.map((y) => (
                    <button key={y} type="button" className={chip(year === y)} onClick={() => setYear(y)}>
                        {y}
                    </button>
                ))}
                <span className="mx-1 hidden h-5 w-px bg-hf-line sm:block" />
                <button type="button" className={chip(sport === 'judo')} onClick={() => setSport(sport === 'judo' ? 'todos' : 'judo')}>
                    Judô
                </button>
                <button type="button" className={chip(sport === 'bjj')} onClick={() => setSport(sport === 'bjj' ? 'todos' : 'bjj')}>
                    Jiu-jitsu
                </button>
                <button type="button" className={chip(onlyPodium)} onClick={() => setOnlyPodium((v) => !v)}>
                    Só pódio
                </button>
            </div>

            <p className="mt-4 font-ui text-[13px] text-hf-ice/45">
                {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'} · {podiums}{' '}
                {podiums === 1 ? 'pódio' : 'pódios'}
                {filtered.length > podiums && ` · ${filtered.length - podiums} sem pódio`}
            </p>

            <div className="mt-4 max-h-[42vh] space-y-2 overflow-y-auto overscroll-contain pr-1">
                {filtered.map((c) => (
                    <div
                        key={c.id}
                        className="flex items-center gap-3 rounded-xl border border-hf-line/70 bg-hf-surface px-4 py-3"
                    >
                        <Medal className={`h-5 w-5 shrink-0 ${medalTone(c.medal_type)}`} />
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-ui text-sm font-semibold text-hf-ice">{c.name}</p>
                            <p className="mt-0.5 flex items-center gap-3 font-ui text-[11px] text-hf-ice/40">
                                <span className="tabular-nums">
                                    {new Date(c.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                                </span>
                                {c.location && (
                                    <span className="flex min-w-0 items-center gap-1">
                                        <MapPin className="h-3 w-3 shrink-0" />
                                        <span className="truncate">{c.location}</span>
                                    </span>
                                )}
                                {c.weight_class && <span className="shrink-0">{c.weight_class}</span>}
                            </p>
                        </div>
                        <span
                            className={`shrink-0 font-ui text-sm font-semibold ${
                                c.medal_type === 'gold' ? 'text-hf-gold' : 'text-hf-ice/70'
                            }`}
                        >
                            {c.placement}
                        </span>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <p className="rounded-xl border border-dashed border-hf-line px-4 py-8 text-center font-ui text-sm text-hf-ice/40">
                        Nenhum resultado com esse filtro.
                    </p>
                )}
            </div>
        </div>
    );
}
