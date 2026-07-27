import React, { useEffect, useMemo, useState } from 'react';
import {
    CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
    escolaApi, EscolaGrade, EscolaSubject, formatDate, TERMS, todayISO, weightedAverage,
} from '../../lib/api-escola';
import { canWrite, getEscolaRole } from '../../lib/escola-auth';

/** Nota mínima de aprovação usada como linha de referência nos gráficos. */
const PASS_MARK = 6;

export default function EscolaGrades() {
    const role = getEscolaRole();
    const writable = canWrite(role);

    const [subjects, setSubjects] = useState<EscolaSubject[]>([]);
    const [grades, setGrades] = useState<EscolaGrade[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [openSubject, setOpenSubject] = useState<string | null>(null);

    const [form, setForm] = useState({
        subject_id: '', term: TERMS[0], title: '', score: '', max_score: '10', weight: '1',
        date: todayISO(), notes: '',
    });

    const load = async () => {
        const [s, g] = await Promise.all([escolaApi.getSubjects(), escolaApi.getGrades()]);
        setSubjects(s); setGrades(g); setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const average = useMemo(() => weightedAverage(grades), [grades]);

    /** Média geral por bimestre — só entram os bimestres que já têm nota. */
    const termChart = useMemo(() => TERMS.map(term => {
        const avg = weightedAverage(grades.filter(g => g.term === term));
        return { term: term.replace(' Bimestre', ' Bi'), media: avg !== null ? Number(avg.toFixed(2)) : null };
    }).filter(d => d.media !== null), [grades]);

    const bySubject = useMemo(() => subjects.map(s => {
        const list = grades.filter(g => g.subject_id === s.id).sort((a, b) => a.date.localeCompare(b.date));
        const avg = weightedAverage(list);
        const normalized = list.map(g => (Number(g.score) / (g.max_score || 10)) * 10);
        const trend = normalized.length >= 2 ? normalized[normalized.length - 1] - normalized[normalized.length - 2] : null;
        return { subject: s, list, avg, trend };
    }).filter(x => x.list.length > 0), [subjects, grades]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const score = parseFloat(form.score.replace(',', '.'));
        if (!form.subject_id || Number.isNaN(score)) return;
        setSaving(true);
        await escolaApi.saveGrade({
            subject_id: form.subject_id,
            term: form.term,
            title: form.title || null,
            score,
            max_score: parseFloat(form.max_score.replace(',', '.')) || 10,
            weight: parseFloat(form.weight.replace(',', '.')) || 1,
            date: form.date,
            notes: form.notes || null,
        });
        setSaving(false);
        setForm({ ...form, title: '', score: '', notes: '' });
        setShowForm(false);
        load();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir esta nota?')) return;
        await escolaApi.deleteGrade(id);
        load();
    };

    if (loading) {
        return <div className="py-24 text-center" style={{ color: 'var(--fg-soft)' }}>
            <span className="material-symbols-outlined text-[32px] animate-spin">progress_activity</span>
        </div>;
    }

    return (
        <div className="escola-enter space-y-5">
            <div>
                <h1 className="text-[26px] font-semibold leading-tight">Notas & <span className="escola-mark">evolução</span></h1>
                <p className="text-[13px] mt-1" style={{ color: 'var(--fg-soft)' }}>
                    Notas convertidas para escala 0–10, com peso, para dar pra comparar tudo.
                </p>
            </div>

            {/* Média geral */}
            <div className="escola-card p-5 flex items-center gap-5">
                <div>
                    <p className="escola-label">Média geral</p>
                    <p className="text-[44px] font-semibold leading-none mt-1"
                        style={{ color: average === null ? 'var(--fg-soft)' : average >= PASS_MARK ? 'var(--ok)' : 'var(--danger)' }}>
                        {average !== null ? average.toFixed(1).replace('.', ',') : '—'}
                    </p>
                </div>
                <div className="flex-1 text-[13px] leading-snug" style={{ color: 'var(--fg-soft)' }}>
                    {average === null
                        ? 'Lance a primeira nota para começar o acompanhamento.'
                        : average >= PASS_MARK
                            ? `Acima da média de aprovação (${PASS_MARK},0). ${grades.length} nota${grades.length === 1 ? '' : 's'} considerada${grades.length === 1 ? '' : 's'}.`
                            : `Abaixo da média de aprovação (${PASS_MARK},0). Vale priorizar as matérias em vermelho.`}
                </div>
            </div>

            {writable && (
                <button onClick={() => setShowForm(v => !v)} className="escola-btn w-full py-3 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">{showForm ? 'close' : 'add'}</span>
                    {showForm ? 'Cancelar' : 'Lançar nota'}
                </button>
            )}

            {showForm && (
                <form onSubmit={handleCreate} className="escola-card p-5 space-y-4 escola-enter">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="escola-label block mb-1.5">Matéria</label>
                            <select className="escola-input" value={form.subject_id}
                                onChange={e => setForm({ ...form, subject_id: e.target.value })}>
                                <option value="">Selecione</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="escola-label block mb-1.5">Período</label>
                            <select className="escola-input" value={form.term}
                                onChange={e => setForm({ ...form, term: e.target.value })}>
                                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="escola-label block mb-1.5">Avaliação</label>
                        <input className="escola-input" value={form.title} placeholder="Ex.: Prova bimestral"
                            onChange={e => setForm({ ...form, title: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="escola-label block mb-1.5">Nota</label>
                            <input className="escola-input" inputMode="decimal" value={form.score} placeholder="8,5"
                                onChange={e => setForm({ ...form, score: e.target.value })} />
                        </div>
                        <div>
                            <label className="escola-label block mb-1.5">Valia</label>
                            <input className="escola-input" inputMode="decimal" value={form.max_score}
                                onChange={e => setForm({ ...form, max_score: e.target.value })} />
                        </div>
                        <div>
                            <label className="escola-label block mb-1.5">Peso</label>
                            <input className="escola-input" inputMode="decimal" value={form.weight}
                                onChange={e => setForm({ ...form, weight: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="escola-label block mb-1.5">Data</label>
                        <input type="date" className="escola-input" value={form.date}
                            onChange={e => setForm({ ...form, date: e.target.value })} />
                    </div>

                    <div>
                        <label className="escola-label block mb-1.5">Observação (opcional)</label>
                        <textarea className="escola-input" rows={2} value={form.notes}
                            placeholder="O que puxou a nota pra cima ou pra baixo"
                            onChange={e => setForm({ ...form, notes: e.target.value })} />
                    </div>

                    <button type="submit" disabled={saving || !form.subject_id || !form.score} className="escola-btn w-full py-3">
                        {saving ? 'Salvando...' : 'Salvar nota'}
                    </button>
                </form>
            )}

            {/* Evolução por bimestre */}
            {termChart.length >= 2 && (
                <section className="escola-card p-5">
                    <p className="escola-label mb-3">Evolução por bimestre</p>
                    <div style={{ width: '100%', height: 190 }}>
                        <ResponsiveContainer>
                            <LineChart data={termChart} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}>
                                <CartesianGrid stroke="#282c31" vertical={false} />
                                <XAxis dataKey="term" tick={{ fontSize: 12, fontWeight: 600, fill: '#8b9099' }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 11, fill: '#8b9099' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    formatter={(v: number) => [String(v).replace('.', ','), 'Média']}
                                    contentStyle={{
                                        borderRadius: 14, border: '1px solid #282c31', background: '#141619',
                                        fontSize: 13, fontWeight: 600, color: '#ffffff',
                                    }}
                                    labelStyle={{ color: 'rgba(255,255,255,.55)' }}
                                    cursor={{ stroke: '#282c31' }}
                                />
                                <ReferenceLine y={PASS_MARK} stroke="#f87171" strokeDasharray="4 4" />
                                <Line type="monotone" dataKey="media" stroke="#c6f24e" strokeWidth={3}
                                    dot={{ r: 5, fill: '#c6f24e' }} activeDot={{ r: 7 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-[11px] mt-1" style={{ color: 'var(--fg-soft)' }}>
                        Linha tracejada = média de aprovação ({PASS_MARK},0)
                    </p>
                </section>
            )}

            {/* Por matéria */}
            <section>
                <h2 className="escola-label mb-2">Por matéria</h2>
                {bySubject.length === 0 ? (
                    <div className="escola-card-soft p-6 text-center">
                        <span className="material-symbols-outlined text-[30px]" style={{ color: 'var(--fg-soft)' }}>trending_up</span>
                        <p className="font-bold mt-1">Nenhuma nota lançada ainda</p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {bySubject.map(({ subject, list, avg, trend }) => {
                            const open = openSubject === subject.id;
                            return (
                                <div key={subject.id} className="escola-card-soft overflow-hidden">
                                    <button onClick={() => setOpenSubject(open ? null : subject.id)}
                                        className="w-full p-4 flex items-center gap-3 text-left">
                                        <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                            style={{ background: `${subject.color}1a`, color: subject.color }}>
                                            <span className="material-symbols-outlined text-[20px]">{subject.icon}</span>
                                        </span>
                                        <span className="flex-1 min-w-0">
                                            <span className="block text-[15px] font-semibold">{subject.name}</span>
                                            <span className="block text-[12px]" style={{ color: 'var(--fg-soft)' }}>
                                                {list.length} nota{list.length === 1 ? '' : 's'}
                                            </span>
                                        </span>
                                        {trend !== null && Math.abs(trend) >= 0.05 && (
                                            <span className="flex items-center text-[12px] font-semibold"
                                                style={{ color: trend > 0 ? 'var(--ok)' : 'var(--danger)' }}>
                                                <span className="material-symbols-outlined text-[17px]">
                                                    {trend > 0 ? 'trending_up' : 'trending_down'}
                                                </span>
                                                {trend > 0 ? '+' : ''}{trend.toFixed(1).replace('.', ',')}
                                            </span>
                                        )}
                                        <span className="text-[22px] font-semibold tabular-nums"
                                            style={{ color: (avg ?? 0) >= PASS_MARK ? 'var(--ok)' : 'var(--danger)' }}>
                                            {avg !== null ? avg.toFixed(1).replace('.', ',') : '—'}
                                        </span>
                                        <span className="material-symbols-outlined text-[20px]" style={{ color: 'var(--fg-soft)' }}>
                                            {open ? 'expand_less' : 'expand_more'}
                                        </span>
                                    </button>

                                    {open && (
                                        <ul className="px-4 pb-4 space-y-2" style={{ borderTop: '1px solid var(--line)' }}>
                                            {[...list].reverse().map(g => (
                                                <li key={g.id} className="flex items-start gap-3 pt-3">
                                                    <span className="text-[17px] font-semibold tabular-nums shrink-0 w-12"
                                                        style={{ color: (Number(g.score) / (g.max_score || 10)) * 10 >= PASS_MARK ? 'var(--ok)' : 'var(--danger)' }}>
                                                        {Number(g.score).toFixed(1).replace('.', ',')}
                                                    </span>
                                                    <span className="flex-1 min-w-0">
                                                        <span className="block text-[13px] font-bold">
                                                            {g.title || 'Avaliação'}
                                                            <span className="font-normal" style={{ color: 'var(--fg-soft)' }}>
                                                                {' '}/ {Number(g.max_score).toFixed(0)}
                                                                {Number(g.weight) !== 1 ? ` · peso ${g.weight}` : ''}
                                                            </span>
                                                        </span>
                                                        <span className="block text-[12px]" style={{ color: 'var(--fg-soft)' }}>
                                                            {g.term} · {formatDate(g.date)}
                                                        </span>
                                                        {g.notes && (
                                                            <span className="block text-[12px] mt-1 leading-snug">{g.notes}</span>
                                                        )}
                                                    </span>
                                                    {writable && (
                                                        <button onClick={() => handleDelete(g.id)} style={{ color: 'var(--fg-soft)' }}>
                                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                                        </button>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
