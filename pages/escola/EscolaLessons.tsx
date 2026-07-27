import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
    escolaApi, EscolaLesson, EscolaSubject, formatDate, PERFORMANCE, todayISO,
} from '../../lib/api-escola';
import { canViewLessons, canWrite, getEscolaRole } from '../../lib/escola-auth';

export default function EscolaLessons() {
    const role = getEscolaRole();
    const writable = canWrite(role);

    const [subjects, setSubjects] = useState<EscolaSubject[]>([]);
    const [lessons, setLessons] = useState<EscolaLesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        date: todayISO(), subject_id: '', duration_min: '60', content: '',
        performance: 'green', engagement: 4, notes: '', homework: '',
    });

    const load = async () => {
        const [s, l] = await Promise.all([escolaApi.getSubjects(), escolaApi.getLessons()]);
        setSubjects(s); setLessons(l); setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const subjectOf = (id: string | null) => subjects.find(s => s.id === id);

    /** Termômetro das últimas 10 aulas registradas. */
    const thermometer = useMemo(() => {
        const recent = lessons.slice(0, 10);
        return {
            total: recent.length,
            green: recent.filter(l => l.performance === 'green').length,
            yellow: recent.filter(l => l.performance === 'yellow').length,
            red: recent.filter(l => l.performance === 'red').length,
        };
    }, [lessons]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.content) return;
        setSaving(true);
        await escolaApi.saveLesson({
            date: form.date,
            subject_id: form.subject_id || null,
            duration_min: parseInt(form.duration_min) || null,
            content: form.content,
            performance: form.performance,
            engagement: form.engagement,
            notes: form.notes || null,
            homework: form.homework || null,
            author: role === 'professora' ? 'professora' : 'familia',
        });
        setSaving(false);
        setForm({ ...form, content: '', notes: '', homework: '', performance: 'green', engagement: 4 });
        setShowForm(false);
        load();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este registro de aula?')) return;
        await escolaApi.deleteLesson(id);
        load();
    };

    if (!canViewLessons(role)) return <Navigate to="/escola" replace />;

    if (loading) {
        return <div className="py-24 text-center" style={{ color: 'var(--fg-soft)' }}>
            <span className="material-symbols-outlined text-[32px] animate-spin">progress_activity</span>
        </div>;
    }

    return (
        <div className="escola-enter space-y-5">
            <div>
                <h1 className="text-[26px] font-semibold leading-tight">Diário de <span className="escola-mark">aula</span></h1>
                <p className="text-[13px] mt-1" style={{ color: 'var(--fg-soft)' }}>
                    Atividades desenvolvidas em cada atendimento e como o Henrique respondeu.
                </p>
            </div>

            {thermometer.total > 0 && (
                <div className="escola-card p-5">
                    <p className="escola-label mb-3">
                        {thermometer.total === 1 ? 'Última aula' : `Últimas ${thermometer.total} aulas`}
                    </p>
                    <div className="flex h-3 rounded-full overflow-hidden" style={{ background: 'var(--line)' }}>
                        {(['green', 'yellow', 'red'] as const).map(k => thermometer[k] > 0 && (
                            <div key={k} style={{
                                width: `${(thermometer[k] / thermometer.total) * 100}%`,
                                background: k === 'green' ? 'var(--ok)' : k === 'yellow' ? 'var(--warn)' : 'var(--danger)',
                            }} />
                        ))}
                    </div>
                    <div className="flex gap-4 mt-3">
                        {(['green', 'yellow', 'red'] as const).map(k => (
                            <span key={k} className="text-[12px] font-bold flex items-center gap-1">
                                <span>{PERFORMANCE[k].emoji}</span>
                                <span>{thermometer[k]}</span>
                                <span style={{ color: 'var(--fg-soft)' }}>{PERFORMANCE[k].label}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {writable && (
                <button onClick={() => setShowForm(v => !v)} className="escola-btn w-full py-3 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">{showForm ? 'close' : 'edit_note'}</span>
                    {showForm ? 'Cancelar' : 'Registrar aula de hoje'}
                </button>
            )}

            {showForm && (
                <form onSubmit={handleCreate} className="escola-card p-5 space-y-4 escola-enter">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="escola-label block mb-1.5">Data</label>
                            <input type="date" className="escola-input" value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })} />
                        </div>
                        <div>
                            <label className="escola-label block mb-1.5">Duração (min)</label>
                            <input className="escola-input" inputMode="numeric" value={form.duration_min}
                                onChange={e => setForm({ ...form, duration_min: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="escola-label block mb-1.5">Matéria</label>
                        <select className="escola-input" value={form.subject_id}
                            onChange={e => setForm({ ...form, subject_id: e.target.value })}>
                            <option value="">Selecione</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="escola-label block mb-1.5">Atividades desenvolvidas</label>
                        <textarea className="escola-input" rows={3} value={form.content}
                            placeholder="O que foi trabalhado na aula de hoje"
                            onChange={e => setForm({ ...form, content: e.target.value })} />
                    </div>

                    <div>
                        <label className="escola-label block mb-2">Como ele foi?</label>
                        <div className="space-y-2">
                            {Object.entries(PERFORMANCE).map(([k, v]) => (
                                <button key={k} type="button" onClick={() => setForm({ ...form, performance: k })}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                                    style={form.performance === k
                                        ? { background: v.bg, border: `1.5px solid ${v.color}` }
                                        : { background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
                                    <span className="text-[17px]">{v.emoji}</span>
                                    <span>
                                        <span className="block text-[14px] font-semibold">{v.label}</span>
                                        <span className="block text-[12px]" style={{ color: 'var(--fg-soft)' }}>{v.desc}</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="escola-label block mb-2">Concentração / engajamento</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(n => (
                                <button key={n} type="button" onClick={() => setForm({ ...form, engagement: n })}
                                    className="flex-1 py-2.5 rounded-xl text-[15px] font-semibold transition-all"
                                    style={form.engagement === n
                                        ? { background: 'var(--accent)', color: 'var(--accent-ink)' }
                                        : { background: 'var(--surface-2)', color: 'var(--fg-soft)', border: '1px solid var(--line)' }}>
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="escola-label block mb-1.5">Observações para a família</label>
                        <textarea className="escola-input" rows={2} value={form.notes}
                            placeholder="O que vale reforçar em casa, o que chamou atenção"
                            onChange={e => setForm({ ...form, notes: e.target.value })} />
                    </div>

                    <div>
                        <label className="escola-label block mb-1.5">Ficou de casa</label>
                        <textarea className="escola-input" rows={2} value={form.homework}
                            placeholder="O que ele deve fazer até a próxima aula"
                            onChange={e => setForm({ ...form, homework: e.target.value })} />
                    </div>

                    <button type="submit" disabled={saving || !form.content} className="escola-btn w-full py-3">
                        {saving ? 'Salvando...' : 'Salvar registro'}
                    </button>
                </form>
            )}

            {lessons.length === 0 ? (
                <div className="escola-card-soft p-6 text-center">
                    <span className="material-symbols-outlined text-[30px]" style={{ color: 'var(--fg-soft)' }}>auto_stories</span>
                    <p className="font-bold mt-1">Nenhuma aula registrada ainda</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {lessons.map(lesson => {
                        const perf = PERFORMANCE[lesson.performance] || PERFORMANCE.green;
                        const subject = subjectOf(lesson.subject_id);
                        return (
                            <li key={lesson.id} className="escola-card-soft p-4"
                                style={{ borderLeft: `4px solid ${perf.color}` }}>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[13px] font-semibold">{formatDate(lesson.date)}</span>
                                    {subject && (
                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                                            style={{ background: `${subject.color}1a`, color: subject.color }}>
                                            {subject.name}
                                        </span>
                                    )}
                                    {lesson.duration_min && (
                                        <span className="text-[12px]" style={{ color: 'var(--fg-soft)' }}>{lesson.duration_min} min</span>
                                    )}
                                    <span className="text-[12px] font-bold ml-auto flex items-center gap-1" style={{ color: perf.color }}>
                                        {perf.emoji} {perf.label}
                                    </span>
                                    {writable && (
                                        <button onClick={() => handleDelete(lesson.id)} style={{ color: 'var(--fg-soft)' }}>
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    )}
                                </div>

                                <p className="text-[14px] leading-snug mt-2">{lesson.content}</p>

                                {lesson.engagement && (
                                    <div className="flex items-center gap-1 mt-2">
                                        <span className="escola-label">Concentração</span>
                                        <span className="flex gap-0.5 ml-1">
                                            {[1, 2, 3, 4, 5].map(n => (
                                                <span key={n} className="w-4 h-1.5 rounded-full"
                                                    style={{ background: n <= (lesson.engagement || 0) ? 'var(--accent)' : 'var(--line)' }} />
                                            ))}
                                        </span>
                                    </div>
                                )}

                                {lesson.notes && (
                                    <p className="text-[13px] mt-2.5 p-2.5 rounded-lg leading-snug"
                                        style={{ background: 'var(--surface-2)', borderLeft: '3px solid var(--accent)' }}>
                                        <span className="escola-label block mb-0.5">Observação</span>
                                        {lesson.notes}
                                    </p>
                                )}

                                {lesson.homework && (
                                    <p className="text-[13px] mt-2 p-2.5 rounded-lg leading-snug"
                                        style={{ background: 'rgba(251,191,36,.08)', borderLeft: '3px solid var(--accent)' }}>
                                        <span className="escola-label block mb-0.5">Ficou de casa</span>
                                        {lesson.homework}
                                    </p>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
