import React, { useEffect, useMemo, useState } from 'react';
import {
    dayLoadMinutes, escolaApi, EscolaRoutineBlock, findStudyWindow,
    ROUTINE_KINDS, shortTime, toMinutes, WEEKDAYS,
} from '../../lib/api-escola';
import { canWrite, getEscolaRole } from '../../lib/escola-auth';

/** Altura de uma hora na grade, em pixels. */
const HOUR_PX = 58;

export default function EscolaRoutine() {
    const role = getEscolaRole();
    const writable = canWrite(role);
    const todayWeekday = new Date().getDay();

    const [routine, setRoutine] = useState<EscolaRoutineBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [day, setDay] = useState(WEEKDAYS.some(w => w.value === todayWeekday) ? todayWeekday : 1);
    const [editing, setEditing] = useState<EscolaRoutineBlock | 'new' | null>(null);

    const load = async () => {
        setRoutine(await escolaApi.getRoutine());
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    /** Só mostra sábado e domingo se houver algo marcado neles. */
    const days = useMemo(
        () => WEEKDAYS.filter(w => w.value >= 1 && w.value <= 5 || routine.some(r => r.weekday === w.value)),
        [routine]
    );

    const bounds = useMemo(() => {
        if (!routine.length) return { start: 7, end: 21 };
        const starts = routine.map(r => toMinutes(r.start_time));
        const ends = routine.map(r => toMinutes(r.end_time));
        return {
            start: Math.floor(Math.min(...starts) / 60),
            end: Math.ceil(Math.max(...ends) / 60),
        };
    }, [routine]);

    const hours = useMemo(
        () => Array.from({ length: bounds.end - bounds.start + 1 }, (_, i) => bounds.start + i),
        [bounds]
    );

    const handleDelete = async (block: EscolaRoutineBlock) => {
        if (!confirm(`Remover "${block.title}" da rotina?`)) return;
        await escolaApi.deleteRoutineBlock(block.id);
        load();
    };

    if (loading) {
        return <div className="py-24 text-center" style={{ color: 'var(--fg-soft)' }}>
            <span className="material-symbols-outlined text-[32px] animate-spin">progress_activity</span>
        </div>;
    }

    const dayBlocks = routine.filter(r => r.weekday === day)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
    const load_ = dayLoadMinutes(routine, day);
    const window = findStudyWindow(routine, day);

    return (
        <div className="escola-enter space-y-5">
            <div>
                <h1 className="text-[26px] font-semibold leading-tight">A semana do <span className="escola-mark">Henrique</span></h1>
                <p className="text-[13px] mt-1" style={{ color: 'var(--fg-soft)' }}>
                    Escola, treinos, aulas e terapia — é daqui que o plano de estudo tira os horários.
                </p>
            </div>

            {/* Grade da semana */}
            <section className="escola-card p-4">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    <div className="shrink-0" style={{ width: 38 }} />
                    {days.map(w => (
                        <button key={w.value} onClick={() => setDay(w.value)}
                            className="shrink-0 flex-1 rounded-xl py-1.5 text-[12px] font-semibold transition-colors"
                            style={{
                                minWidth: 62,
                                background: day === w.value ? 'rgba(198,242,78,.14)' : 'transparent',
                                color: day === w.value ? 'var(--accent)' : 'var(--fg-soft)',
                            }}>
                            {w.short}
                            {w.value === todayWeekday && <span className="block text-[9px] opacity-70">hoje</span>}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar mt-1">
                    {/* Eixo das horas */}
                    <div className="shrink-0 relative" style={{ width: 38, height: hours.length * HOUR_PX }}>
                        {hours.map((h, i) => (
                            <span key={h} className="absolute text-[10px] font-semibold"
                                style={{ top: i * HOUR_PX - 5, color: 'var(--fg-soft)' }}>
                                {String(h).padStart(2, '0')}h
                            </span>
                        ))}
                    </div>

                    {days.map(w => (
                        <DayColumn
                            key={w.value}
                            blocks={routine.filter(r => r.weekday === w.value)}
                            startHour={bounds.start}
                            hours={hours.length}
                            highlighted={day === w.value}
                            onSelect={() => setDay(w.value)}
                        />
                    ))}
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3 pt-3" style={{ borderTop: '1px solid var(--line)' }}>
                    {Object.entries(ROUTINE_KINDS)
                        .filter(([k]) => routine.some(r => r.kind === k))
                        .map(([k, v]) => (
                            <span key={k} className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: 'var(--fg-soft)' }}>
                                <span className="w-2.5 h-2.5 rounded-full" style={{ background: v.color }} />
                                {v.label}
                            </span>
                        ))}
                </div>
            </section>

            {/* Detalhe do dia escolhido */}
            <section>
                <div className="flex items-center justify-between mb-2">
                    <h2 className="escola-label">{WEEKDAYS.find(w => w.value === day)?.long}</h2>
                    <span className="text-[11px] font-semibold" style={{ color: 'var(--fg-soft)' }}>
                        {load_ >= 480 ? '🔥 ' : ''}{Math.floor(load_ / 60)}h{load_ % 60 ? String(load_ % 60).padStart(2, '0') : ''} de compromissos
                    </span>
                </div>

                {window ? (
                    <div className="escola-card-soft p-3.5 mb-2.5 flex items-center gap-3"
                        style={{ borderLeft: '3px solid var(--accent)' }}>
                        <span className="material-symbols-outlined text-[20px]" style={{ color: 'var(--accent)' }}>lightbulb</span>
                        <p className="text-[13px] leading-snug">
                            Melhor janela para estudar: <strong>{window.start_time}–{window.end_time}</strong>
                            <span style={{ color: 'var(--fg-soft)' }}>
                                {window.window_kind === 'estudo' ? ' (horário de estudo que já existe)' : ' (folga entre compromissos)'}
                            </span>
                        </p>
                    </div>
                ) : (
                    <div className="escola-card-soft p-3.5 mb-2.5 flex items-center gap-3"
                        style={{ borderLeft: '3px solid var(--danger)' }}>
                        <span className="material-symbols-outlined text-[20px]" style={{ color: 'var(--danger)' }}>event_busy</span>
                        <p className="text-[13px] leading-snug">Dia cheio — não sobra janela decente para estudar.</p>
                    </div>
                )}

                {dayBlocks.length === 0 ? (
                    <div className="escola-card-soft p-6 text-center">
                        <span className="material-symbols-outlined text-[28px]" style={{ color: 'var(--fg-soft)' }}>event_available</span>
                        <p className="font-semibold mt-1">Dia livre</p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {dayBlocks.map(b => {
                            const kind = ROUTINE_KINDS[b.kind] || ROUTINE_KINDS.outro;
                            return (
                                <li key={b.id} className="escola-card-soft p-3.5 flex items-center gap-3">
                                    <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ background: `${kind.color}1f`, color: kind.color }}>
                                        <span className="material-symbols-outlined text-[19px]">{kind.icon}</span>
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[14px] font-semibold truncate">
                                            {b.title}
                                            {b.online && <span className="text-[11px] font-normal" style={{ color: 'var(--fg-soft)' }}> · online</span>}
                                        </p>
                                        <p className="text-[12px]" style={{ color: 'var(--fg-soft)' }}>
                                            {shortTime(b.start_time)}–{shortTime(b.end_time)}
                                            {b.place ? ` · ${b.place}` : ''}
                                        </p>
                                    </div>
                                    {writable && (
                                        <>
                                            <button onClick={() => setEditing(b)} style={{ color: 'var(--fg-soft)' }}>
                                                <span className="material-symbols-outlined text-[19px]">edit</span>
                                            </button>
                                            <button onClick={() => handleDelete(b)} style={{ color: 'var(--fg-soft)' }}>
                                                <span className="material-symbols-outlined text-[19px]">delete</span>
                                            </button>
                                        </>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}

                {writable && (
                    <button onClick={() => setEditing('new')} className="escola-btn w-full py-3 mt-3 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Adicionar à rotina
                    </button>
                )}
            </section>

            {editing && (
                <RoutineForm
                    block={editing === 'new' ? null : editing}
                    defaultWeekday={day}
                    onClose={() => setEditing(null)}
                    onSaved={() => { setEditing(null); load(); }}
                />
            )}
        </div>
    );
}

function DayColumn({ blocks, startHour, hours, highlighted, onSelect }: {
    blocks: EscolaRoutineBlock[];
    startHour: number;
    hours: number;
    highlighted: boolean;
    onSelect: () => void;
}) {
    const offset = startHour * 60;
    const sorted = [...blocks].sort((a, b) => a.start_time.localeCompare(b.start_time));

    /** Blocos que se sobrepõem (a aula particular dentro do estudo) dividem a largura. */
    const laneOf = (block: EscolaRoutineBlock): { lane: number; lanes: number } => {
        const overlapping = sorted.filter(o =>
            toMinutes(o.start_time) < toMinutes(block.end_time) &&
            toMinutes(o.end_time) > toMinutes(block.start_time));
        return { lane: overlapping.indexOf(block), lanes: overlapping.length };
    };

    return (
        <button onClick={onSelect} className="shrink-0 flex-1 relative rounded-xl text-left transition-colors"
            style={{
                minWidth: 62,
                height: hours * HOUR_PX,
                background: highlighted ? 'rgba(255,255,255,.03)' : 'transparent',
            }}>
            {Array.from({ length: hours }, (_, i) => (
                <span key={i} className="absolute left-0 right-0"
                    style={{ top: i * HOUR_PX, height: 1, background: 'var(--line)' }} />
            ))}

            {sorted.map(b => {
                const kind = ROUTINE_KINDS[b.kind] || ROUTINE_KINDS.outro;
                const top = ((toMinutes(b.start_time) - offset) / 60) * HOUR_PX;
                const height = ((toMinutes(b.end_time) - toMinutes(b.start_time)) / 60) * HOUR_PX;
                const { lane, lanes } = laneOf(b);
                return (
                    <span key={b.id} className="absolute rounded-lg px-1.5 py-1 overflow-hidden"
                        style={{
                            top: top + 1,
                            height: Math.max(height - 2, 16),
                            left: `${(lane / lanes) * 100}%`,
                            width: `calc(${100 / lanes}% - 2px)`,
                            background: `${kind.color}26`,
                            borderLeft: `2px solid ${kind.color}`,
                        }}>
                        <span className="block text-[9px] font-semibold leading-tight" style={{ color: kind.color }}>
                            {shortTime(b.start_time)}
                        </span>
                        <span className="block text-[10px] font-semibold leading-tight text-white/85">
                            {b.title}
                        </span>
                    </span>
                );
            })}
        </button>
    );
}

function RoutineForm({ block, defaultWeekday, onClose, onSaved }: {
    block: EscolaRoutineBlock | null;
    defaultWeekday: number;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [form, setForm] = useState({
        weekday: block?.weekday ?? defaultWeekday,
        title: block?.title || '',
        kind: block?.kind || 'treino',
        start_time: shortTime(block?.start_time || '') || '14:00',
        end_time: shortTime(block?.end_time || '') || '15:00',
        place: block?.place || '',
        online: block?.online || false,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title) return;
        if (toMinutes(form.end_time) <= toMinutes(form.start_time)) {
            setError('O horário de término precisa ser depois do início.');
            return;
        }
        setSaving(true);
        const payload = {
            weekday: form.weekday,
            title: form.title,
            kind: form.kind,
            start_time: form.start_time,
            end_time: form.end_time,
            place: form.place || null,
            online: form.online,
        };
        const ok = block
            ? await escolaApi.updateRoutineBlock(block.id, payload)
            : await escolaApi.saveRoutineBlock(payload);
        setSaving(false);
        if (ok) onSaved();
        else setError('Não deu para salvar. Tente de novo.');
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(10,11,13,.75)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
            <form onSubmit={handleSubmit} className="escola-card w-full max-w-md p-5 space-y-4 escola-enter max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}>
                <p className="text-[17px] font-semibold">{block ? 'Editar compromisso' : 'Novo compromisso'}</p>

                <div>
                    <label className="escola-label block mb-1.5">Dia</label>
                    <div className="flex gap-1.5 flex-wrap">
                        {WEEKDAYS.map(w => (
                            <button key={w.value} type="button" onClick={() => setForm({ ...form, weekday: w.value })}
                                className="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                                style={form.weekday === w.value
                                    ? { background: 'rgba(198,242,78,.14)', color: 'var(--accent)', border: '1px solid var(--accent)' }
                                    : { background: 'var(--surface-2)', color: 'var(--fg-soft)', border: '1px solid var(--line)' }}>
                                {w.short}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="escola-label block mb-1.5">O que é</label>
                    <input className="escola-input" value={form.title} placeholder="Ex.: Judô Marista"
                        onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>

                <div>
                    <label className="escola-label block mb-1.5">Tipo</label>
                    <select className="escola-input" value={form.kind}
                        onChange={e => setForm({ ...form, kind: e.target.value })}>
                        {Object.entries(ROUTINE_KINDS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="escola-label block mb-1.5">Começa</label>
                        <input type="time" className="escola-input" value={form.start_time}
                            onChange={e => setForm({ ...form, start_time: e.target.value, })} />
                    </div>
                    <div>
                        <label className="escola-label block mb-1.5">Termina</label>
                        <input type="time" className="escola-input" value={form.end_time}
                            onChange={e => setForm({ ...form, end_time: e.target.value })} />
                    </div>
                </div>

                <div>
                    <label className="escola-label block mb-1.5">Local (opcional)</label>
                    <input className="escola-input" value={form.place} placeholder="Ex.: Marista"
                        onChange={e => setForm({ ...form, place: e.target.value })} />
                </div>

                <label className="flex items-center gap-2.5 text-[14px] font-semibold">
                    <input type="checkbox" checked={form.online} className="w-4 h-4 rounded"
                        onChange={e => setForm({ ...form, online: e.target.checked })} />
                    É online
                </label>

                {error && <p className="text-[13px] font-semibold" style={{ color: 'var(--danger)' }}>{error}</p>}

                <div className="flex gap-2">
                    <button type="button" onClick={onClose} className="flex-1 py-3 rounded-full font-semibold"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
                        Cancelar
                    </button>
                    <button type="submit" disabled={saving || !form.title} className="escola-btn flex-[2] py-3">
                        {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    );
}
