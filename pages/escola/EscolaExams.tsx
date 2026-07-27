import React, { useEffect, useMemo, useState } from 'react';
import {
    buildStudyPlan, daysBetween, escolaApi, EscolaExam, EscolaRoutineBlock, EscolaStudyBlock,
    EscolaSubject, EXAM_KINDS, formatDate, parseISO, shortTime, TERMS, todayISO, WEEKDAYS,
} from '../../lib/api-escola';
import { canWrite, getEscolaRole } from '../../lib/escola-auth';

/** Como o horário do bloco foi escolhido, em texto para a professora. */
const windowLabel = (kind: string | null): string => {
    if (kind === 'estudo') return 'no horário de estudo que ele já tem';
    if (kind === 'livre') return 'na folga entre os compromissos do dia';
    if (kind === 'cheio') return 'dia cheio — precisa encaixar na mão';
    return '';
};

const windowColor = (kind: string | null): string =>
    kind === 'cheio' ? 'var(--danger)' : 'var(--fg-soft)';

export default function EscolaExams() {
    const role = getEscolaRole();
    const writable = canWrite(role);
    const today = todayISO();

    const [subjects, setSubjects] = useState<EscolaSubject[]>([]);
    const [exams, setExams] = useState<EscolaExam[]>([]);
    const [blocks, setBlocks] = useState<EscolaStudyBlock[]>([]);
    const [routine, setRoutine] = useState<EscolaRoutineBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showPast, setShowPast] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        title: '', subject_id: '', date: '', kind: 'prova', term: TERMS[0], content: '',
    });

    const load = async () => {
        const [s, e, b, r] = await Promise.all([
            escolaApi.getSubjects(), escolaApi.getExams(), escolaApi.getStudyBlocks(), escolaApi.getRoutine(),
        ]);
        setSubjects(s); setExams(e); setBlocks(b); setRoutine(r); setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const subjectOf = (id: string | null) => subjects.find(s => s.id === id);

    const upcoming = useMemo(() => exams.filter(e => e.date >= today), [exams, today]);
    const past = useMemo(() => exams.filter(e => e.date < today).reverse(), [exams, today]);

    /** Prévia do plano enquanto a professora preenche a data — mostra o que será gerado. */
    const preview = useMemo(
        () => form.date ? buildStudyPlan(form.date, today, routine) : [],
        [form.date, today, routine]
    );

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.date) return;
        setSaving(true);
        const created = await escolaApi.createExamWithPlan({
            title: form.title,
            subject_id: form.subject_id || null,
            date: form.date,
            kind: form.kind,
            term: form.term,
            content: form.content || null,
        });
        setSaving(false);
        if (created) {
            setForm({ title: '', subject_id: '', date: '', kind: 'prova', term: TERMS[0], content: '' });
            setShowForm(false);
            load();
        }
    };

    const toggleBlock = async (b: EscolaStudyBlock) => {
        setBlocks(prev => prev.map(x => x.id === b.id ? { ...x, done: !x.done } : x));
        await escolaApi.toggleStudyBlock(b.id, !b.done);
    };

    const handleDelete = async (exam: EscolaExam) => {
        if (!confirm(`Excluir "${exam.title}" e o plano de estudo dela?`)) return;
        await escolaApi.deleteExam(exam.id);
        load();
    };

    const handleRegenerate = async (exam: EscolaExam) => {
        await escolaApi.regenerateStudyPlan(exam);
        load();
    };

    if (loading) {
        return <div className="py-24 text-center" style={{ color: 'var(--fg-soft)' }}>
            <span className="material-symbols-outlined text-[32px] animate-spin">progress_activity</span>
        </div>;
    }

    return (
        <div className="escola-enter space-y-5">
            <div className="flex items-end justify-between gap-3">
                <div>
                    <h1 className="text-[26px] font-semibold leading-tight">Provas & <span className="escola-mark">plano de estudo</span></h1>
                    <p className="text-[13px] mt-1" style={{ color: 'var(--fg-soft)' }}>
                        Ao cadastrar uma prova, o plano é montado de trás pra frente automaticamente.
                    </p>
                </div>
            </div>

            {writable && (
                <button onClick={() => setShowForm(v => !v)} className="escola-btn w-full py-3 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">{showForm ? 'close' : 'add'}</span>
                    {showForm ? 'Cancelar' : 'Cadastrar prova'}
                </button>
            )}

            {showForm && (
                <form onSubmit={handleCreate} className="escola-card p-5 space-y-4 escola-enter">
                    <div>
                        <label className="escola-label block mb-1.5">Título</label>
                        <input className="escola-input" value={form.title} placeholder="Ex.: Prova de frações"
                            onChange={e => setForm({ ...form, title: e.target.value })} />
                    </div>

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
                            <label className="escola-label block mb-1.5">Data</label>
                            <input type="date" className="escola-input" value={form.date} min={today}
                                onChange={e => setForm({ ...form, date: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="escola-label block mb-1.5">Tipo</label>
                            <select className="escola-input" value={form.kind}
                                onChange={e => setForm({ ...form, kind: e.target.value })}>
                                {Object.entries(EXAM_KINDS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
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
                        <label className="escola-label block mb-1.5">Conteúdo que cai</label>
                        <textarea className="escola-input" rows={3} value={form.content}
                            placeholder="Capítulos, páginas, assuntos..."
                            onChange={e => setForm({ ...form, content: e.target.value })} />
                    </div>

                    {preview.length > 0 && (
                        <div className="rounded-xl p-3.5" style={{ background: 'var(--surface-2)', border: '1px dashed var(--fg-soft)' }}>
                            <p className="escola-label mb-2">Plano que será criado</p>
                            <ul className="space-y-2">
                                {preview.map(p => (
                                    <li key={p.sort_order} className="text-[13px] flex items-start gap-2">
                                        <span className="font-semibold px-1.5 py-0.5 rounded-md text-[11px] shrink-0"
                                            style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>D-{p.days_before}</span>
                                        <span className="min-w-0">
                                            <span className="block">
                                                <span className="font-semibold">
                                                    {WEEKDAYS.find(w => w.value === parseISO(p.date).getDay())?.short.toLowerCase()}{' '}
                                                    {formatDate(p.date)}
                                                    {p.start_time ? ` · ${p.start_time}–${p.end_time}` : ''}
                                                </span>
                                                <span style={{ color: 'var(--fg-soft)' }}> {p.label}</span>
                                            </span>
                                            <span className="block text-[11px]" style={{ color: windowColor(p.window_kind) }}>
                                                {windowLabel(p.window_kind)}
                                            </span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button type="submit" disabled={saving || !form.title || !form.date} className="escola-btn w-full py-3">
                        {saving ? 'Salvando...' : 'Criar prova + plano'}
                    </button>
                </form>
            )}

            {upcoming.length === 0 ? (
                <div className="escola-card-soft p-6 text-center">
                    <span className="material-symbols-outlined text-[30px]" style={{ color: 'var(--fg-soft)' }}>event_note</span>
                    <p className="font-bold mt-1">Nenhuma prova à frente</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {upcoming.map(exam => (
                        <ExamCard
                            key={exam.id}
                            exam={exam}
                            subject={subjectOf(exam.subject_id)}
                            blocks={blocks.filter(b => b.exam_id === exam.id).sort((a, b) => a.date.localeCompare(b.date))}
                            today={today}
                            writable={writable}
                            onToggle={toggleBlock}
                            onDelete={() => handleDelete(exam)}
                            onRegenerate={() => handleRegenerate(exam)}
                        />
                    ))}
                </div>
            )}

            {past.length > 0 && (
                <div>
                    <button onClick={() => setShowPast(v => !v)}
                        className="text-[13px] font-semibold flex items-center gap-1" style={{ color: 'var(--fg-soft)' }}>
                        <span className="material-symbols-outlined text-[18px]">{showPast ? 'expand_less' : 'expand_more'}</span>
                        Provas já realizadas ({past.length})
                    </button>
                    {showPast && (
                        <div className="space-y-2 mt-3">
                            {past.map(exam => (
                                <div key={exam.id} className="escola-card-soft p-3.5 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[20px]" style={{ color: 'var(--fg-soft)' }}>
                                        {EXAM_KINDS[exam.kind]?.icon || 'quiz'}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[14px] font-semibold truncate">{exam.title}</p>
                                        <p className="text-[12px]" style={{ color: 'var(--fg-soft)' }}>
                                            {subjectOf(exam.subject_id)?.name || '—'} · {formatDate(exam.date)}
                                        </p>
                                    </div>
                                    {writable && (
                                        <button onClick={() => handleDelete(exam)} style={{ color: 'var(--fg-soft)' }}>
                                            <span className="material-symbols-outlined text-[19px]">delete</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

interface ExamCardProps {
    exam: EscolaExam;
    subject?: EscolaSubject;
    blocks: EscolaStudyBlock[];
    today: string;
    writable: boolean;
    onToggle: (b: EscolaStudyBlock) => void;
    onDelete: () => void;
    onRegenerate: () => void;
}

function ExamCard({ exam, subject, blocks, today, writable, onToggle, onDelete, onRegenerate }: ExamCardProps) {
    const days = daysBetween(today, exam.date);
    const done = blocks.filter(b => b.done).length;

    return (
        <div className="escola-card p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="material-symbols-outlined text-[17px]" style={{ color: subject?.color || 'var(--fg-soft)' }}>
                            {EXAM_KINDS[exam.kind]?.icon || 'quiz'}
                        </span>
                        <span className="escola-label" style={{ color: subject?.color || 'var(--fg-soft)' }}>
                            {subject?.name || 'Sem matéria'}
                        </span>
                    </div>
                    <p className="text-[18px] font-semibold leading-tight">{exam.title}</p>
                    <p className="text-[13px] mt-0.5" style={{ color: 'var(--fg-soft)' }}>{formatDate(exam.date)}</p>
                </div>
                <div className="text-center shrink-0 px-3 py-2 rounded-2xl"
                    style={days <= 2
                        ? { background: 'rgba(248,113,113,.16)', color: 'var(--danger)' }
                        : { background: 'var(--accent)', color: 'var(--accent-ink)' }}>
                    <p className="text-[26px] font-semibold leading-none">{days}</p>
                    <p className="text-[10px] font-semibold tracking-wide">
                        {days === 0 ? 'HOJE' : days === 1 ? 'DIA' : 'DIAS'}
                    </p>
                </div>
            </div>

            {exam.content && (
                <p className="text-[13px] mt-3 p-3 rounded-xl leading-snug" style={{ background: 'var(--surface-2)' }}>
                    <span className="escola-label block mb-1">Conteúdo</span>
                    {exam.content}
                </p>
            )}

            {blocks.length > 0 ? (
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-2.5">
                        <span className="escola-label">Plano regressivo</span>
                        <span className="text-[12px] font-semibold">{done}/{blocks.length} feitos</span>
                    </div>
                    <ul className="space-y-2">
                        {blocks.map(b => {
                            const late = !b.done && b.date < today;
                            return (
                                <li key={b.id}>
                                    <button onClick={() => onToggle(b)}
                                        className="w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors"
                                        style={{
                                            background: b.done ? 'rgba(198,242,78,.07)' : late ? 'rgba(248,113,113,.07)' : 'var(--surface-2)',
                                            border: `1px solid ${b.done ? 'rgba(198,242,78,.35)' : late ? 'rgba(248,113,113,.35)' : 'var(--line)'}`,
                                        }}>
                                        <span className="material-symbols-outlined text-[21px] shrink-0"
                                            style={{ color: b.done ? 'var(--ok)' : late ? 'var(--danger)' : 'var(--fg-soft)' }}>
                                            {b.done ? 'check_circle' : 'radio_button_unchecked'}
                                        </span>
                                        <span className="flex-1 min-w-0">
                                            <span className="flex items-center gap-2">
                                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                                                    style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>D-{b.days_before}</span>
                                                <span className={`text-[14px] font-semibold ${b.done ? 'line-through opacity-60' : ''}`}>{b.label}</span>
                                            </span>
                                            {b.focus && (
                                                <span className="block text-[12px] mt-0.5 leading-snug" style={{ color: 'var(--fg-soft)' }}>
                                                    {b.focus}
                                                </span>
                                            )}
                                            <span className="block text-[11px] font-bold mt-1"
                                                style={{ color: late ? 'var(--danger)' : 'var(--fg-soft)' }}>
                                                <span className="material-symbols-outlined text-[13px] align-[-2px] mr-0.5">schedule</span>
                                                {WEEKDAYS.find(w => w.value === parseISO(b.date).getDay())?.short.toLowerCase()}{' '}
                                                {formatDate(b.date)}
                                                {b.start_time ? ` · ${shortTime(b.start_time)}–${shortTime(b.end_time)}` : ''}
                                                {late ? ' · passou da data' : ''}
                                            </span>
                                            {b.window_kind && !late && (
                                                <span className="block text-[11px]" style={{ color: windowColor(b.window_kind) }}>
                                                    {windowLabel(b.window_kind)}
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ) : (
                <p className="text-[13px] mt-3" style={{ color: 'var(--fg-soft)' }}>
                    Sem plano de estudo (prova cadastrada em cima da hora).
                </p>
            )}

            {writable && (
                <div className="flex items-center gap-4 mt-4 pt-3" style={{ borderTop: '1px solid var(--line)' }}>
                    <button onClick={onRegenerate} className="text-[12px] font-semibold flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                        <span className="material-symbols-outlined text-[16px]">refresh</span>
                        refazer plano a partir de hoje
                    </button>
                    <button onClick={onDelete} className="text-[12px] font-semibold ml-auto" style={{ color: 'var(--danger)' }}>
                        excluir
                    </button>
                </div>
            )}
        </div>
    );
}
