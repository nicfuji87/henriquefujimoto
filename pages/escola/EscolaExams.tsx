import React, { useEffect, useMemo, useState } from 'react';
import {
    buildStudyPlan, daysBetween, escolaApi, EscolaExam, EscolaRoutineBlock, EscolaStudyBlock,
    EscolaSubject, EXAM_KINDS, formatDate, parseISO, shortTime, TERMS, todayISO, WEEKDAYS,
} from '../../lib/api-escola';
import { canWrite, getEscolaRole } from '../../lib/escola-auth';
import ExamImport from '../../components/escola/ExamImport';

/** Como o horário do bloco foi escolhido, em texto para a professora. */
const windowLabel = (kind: string | null): string => {
    if (kind === 'estudo') return 'no horário de estudo que ele já tem';
    if (kind === 'livre') return 'na folga entre os compromissos do dia';
    if (kind === 'cheio') return 'dia cheio — precisa encaixar na mão';
    if (kind === 'professora') return 'horário definido pela professora';
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
    const [showImport, setShowImport] = useState(false);
    const [showPast, setShowPast] = useState(false);
    const [saving, setSaving] = useState(false);
    const [flash, setFlash] = useState('');

    const [form, setForm] = useState({
        title: '', subject_id: '', date: '', kind: 'prova', term: TERMS[0], content: '', withPlan: false,
    });

    const load = async () => {
        const [s, e, b, r] = await Promise.all([
            escolaApi.getSubjects(), escolaApi.getExams(), escolaApi.getStudyBlocks(), escolaApi.getRoutine(),
        ]);
        setSubjects(s); setExams(e); setBlocks(b); setRoutine(r); setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const subjectOf = (id: string | null) => subjects.find(s => s.id === id);

    /**
     * Em semana de globalizantes várias provas caem na mesma janela de estudo.
     * Aqui mapeamos dia+horário -> quantas matérias dividem aquele bloco.
     */
    const sharedSlots = useMemo(() => {
        const count: Record<string, number> = {};
        for (const b of blocks) {
            if (!b.start_time) continue;
            const key = `${b.date}|${b.start_time}`;
            count[key] = (count[key] || 0) + 1;
        }
        return count;
    }, [blocks]);

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
        const payload = {
            title: form.title,
            subject_id: form.subject_id || null,
            date: form.date,
            kind: form.kind,
            term: form.term,
            content: form.content || null,
        };
        // O plano só nasce junto se a professora pedir.
        const created = form.withPlan
            ? await escolaApi.createExamWithPlan(payload)
            : await escolaApi.createExam(payload);
        setSaving(false);
        if (created) {
            setForm({ title: '', subject_id: '', date: '', kind: 'prova', term: TERMS[0], content: '', withPlan: false });
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

    const handleAddBlock = async (exam: EscolaExam, block: Partial<EscolaStudyBlock>) => {
        await escolaApi.saveStudyBlock({
            ...block,
            exam_id: exam.id,
            days_before: block.date ? daysBetween(block.date, exam.date) : 0,
        });
        load();
    };

    const handleDeleteBlock = async (id: string) => {
        await escolaApi.deleteStudyBlock(id);
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
                        As provas entram por aqui; os blocos de estudo de cada uma quem define é a professora.
                    </p>
                </div>
            </div>

            {flash && (
                <p className="escola-card-soft p-3.5 text-[14px] font-semibold flex items-center gap-2"
                    style={{ borderLeft: '3px solid var(--accent)' }}>
                    <span className="material-symbols-outlined text-[20px]" style={{ color: 'var(--accent)' }}>check_circle</span>
                    {flash}
                </p>
            )}

            {writable && !showImport && (
                <div className="grid grid-cols-2 gap-2.5">
                    <button onClick={() => { setShowImport(true); setShowForm(false); }}
                        className="escola-btn py-3 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                        Importar PDF
                    </button>
                    <button onClick={() => setShowForm(v => !v)}
                        className="py-3 rounded-full font-semibold flex items-center justify-center gap-2"
                        style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--fg)' }}>
                        <span className="material-symbols-outlined text-[20px]">{showForm ? 'close' : 'add'}</span>
                        {showForm ? 'Cancelar' : 'Uma prova'}
                    </button>
                </div>
            )}

            {showImport && (
                <ExamImport
                    subjects={subjects}
                    onCancel={() => setShowImport(false)}
                    onDone={(created) => {
                        setShowImport(false);
                        setFlash(`${created} prova${created === 1 ? '' : 's'} criada${created === 1 ? '' : 's'} a partir do PDF.`);
                        setTimeout(() => setFlash(''), 6000);
                        load();
                    }}
                />
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

                    <div className="p-3.5 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
                        <label className="flex items-center gap-2.5 text-[14px] font-semibold cursor-pointer">
                            <input type="checkbox" checked={form.withPlan} className="w-4 h-4 rounded"
                                onChange={e => setForm({ ...form, withPlan: e.target.checked })} />
                            Já sugerir um plano de estudo
                        </label>
                        <p className="text-[12px] pl-7 mt-1" style={{ color: 'var(--fg-soft)' }}>
                            Você monta os blocos de estudo depois, no cartão da prova.
                        </p>
                    </div>

                    {form.withPlan && preview.length > 0 && (
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
                        {saving ? 'Salvando...' : form.withPlan ? 'Criar prova + plano' : 'Criar prova'}
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
                            sharedSlots={sharedSlots}
                            onAddBlock={(b) => handleAddBlock(exam, b)}
                            onDeleteBlock={handleDeleteBlock}
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

/**
 * O conteúdo cobrado vem longo (capítulos, páginas, níveis). Mostra as primeiras
 * linhas e abre o resto sob demanda, preservando as quebras de linha do documento.
 */
function ExamContent({ content }: { content: string }) {
    const [open, setOpen] = useState(false);

    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    const preview = 4;
    const shown = open ? lines : lines.slice(0, preview);
    const hidden = lines.length - shown.length;

    /** Linha sem marcador é subtítulo do documento (NÍVEL, MATERIAIS DE ESTUDO...). */
    const BULLET = /^[-•➢▪◦*·]\s*/;
    const isHeading = (line: string) => !BULLET.test(line);

    return (
        <div className="mt-3 p-3.5 rounded-xl" style={{ background: 'var(--surface-2)' }}>
            <p className="escola-label mb-2">Conteúdo cobrado</p>
            <ul className="space-y-1">
                {shown.map((line, i) => (
                    isHeading(line) ? (
                        <li key={i} className="text-[12px] font-semibold uppercase tracking-wide pt-1.5 first:pt-0"
                            style={{ color: 'var(--accent)' }}>
                            {line}
                        </li>
                    ) : (
                        <li key={i} className="text-[13px] leading-snug flex gap-2">
                            <span style={{ color: 'var(--fg-soft)' }}>·</span>
                            <span>{line.replace(BULLET, '')}</span>
                        </li>
                    )
                ))}
            </ul>

            {lines.length > preview && (
                <button onClick={() => setOpen(v => !v)}
                    className="text-[12px] font-semibold flex items-center gap-1 mt-2.5" style={{ color: 'var(--accent)' }}>
                    <span className="material-symbols-outlined text-[16px]">{open ? 'expand_less' : 'expand_more'}</span>
                    {open ? 'mostrar menos' : `ver mais ${hidden} ${hidden === 1 ? 'item' : 'itens'}`}
                </button>
            )}
        </div>
    );
}

/** Bloco de estudo montado pela professora: dia, o que fazer e, se quiser, horário. */
function StudyBlockForm({ examDate, today, onCancel, onSave }: {
    examDate: string;
    today: string;
    onCancel: () => void;
    onSave: (block: Partial<EscolaStudyBlock>) => void;
}) {
    const [form, setForm] = useState({
        date: today, label: '', focus: '', start_time: '', end_time: '',
    });
    const [error, setError] = useState('');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.label || !form.date) return;
        if (form.date > examDate) {
            setError('Esse dia é depois da prova.');
            return;
        }
        if (form.start_time && form.end_time && form.end_time <= form.start_time) {
            setError('O horário de término precisa ser depois do início.');
            return;
        }
        onSave({
            date: form.date,
            label: form.label,
            focus: form.focus || null,
            start_time: form.start_time || null,
            end_time: form.end_time || null,
            window_kind: form.start_time ? 'professora' : null,
            sort_order: 0,
        });
    };

    return (
        <form onSubmit={submit} className="mt-3 p-3.5 rounded-xl space-y-3"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
            <div>
                <label className="escola-label block mb-1.5">O que ele vai fazer</label>
                <input className="escola-input" value={form.label} placeholder="Ex.: Refazer a lista de ângulos"
                    onChange={e => { setForm({ ...form, label: e.target.value }); setError(''); }} />
            </div>

            <div>
                <label className="escola-label block mb-1.5">Dia</label>
                <input type="date" className="escola-input" value={form.date} max={examDate}
                    onChange={e => { setForm({ ...form, date: e.target.value }); setError(''); }} />
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="escola-label block mb-1.5">Das (opcional)</label>
                    <input type="time" className="escola-input" value={form.start_time}
                        onChange={e => { setForm({ ...form, start_time: e.target.value }); setError(''); }} />
                </div>
                <div>
                    <label className="escola-label block mb-1.5">Até</label>
                    <input type="time" className="escola-input" value={form.end_time}
                        onChange={e => { setForm({ ...form, end_time: e.target.value }); setError(''); }} />
                </div>
            </div>

            <div>
                <label className="escola-label block mb-1.5">Detalhe (opcional)</label>
                <textarea className="escola-input" rows={2} value={form.focus}
                    placeholder="Como fazer, o que revisar antes"
                    onChange={e => setForm({ ...form, focus: e.target.value })} />
            </div>

            {error && <p className="text-[12px] font-semibold" style={{ color: 'var(--danger)' }}>{error}</p>}

            <div className="flex gap-2">
                <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-full text-[13px] font-semibold"
                    style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
                    Cancelar
                </button>
                <button type="submit" disabled={!form.label} className="escola-btn flex-[2] py-2.5 text-[13px]">
                    Adicionar bloco
                </button>
            </div>
        </form>
    );
}

interface ExamCardProps {
    exam: EscolaExam;
    subject?: EscolaSubject;
    sharedSlots: Record<string, number>;
    onAddBlock: (block: Partial<EscolaStudyBlock>) => void;
    onDeleteBlock: (id: string) => void;
    blocks: EscolaStudyBlock[];
    today: string;
    writable: boolean;
    onToggle: (b: EscolaStudyBlock) => void;
    onDelete: () => void;
    onRegenerate: () => void;
}

function ExamCard({
    exam, subject, blocks, today, writable, sharedSlots,
    onAddBlock, onDeleteBlock, onToggle, onDelete, onRegenerate,
}: ExamCardProps) {
    const days = daysBetween(today, exam.date);
    const done = blocks.filter(b => b.done).length;
    const [adding, setAdding] = useState(false);

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

            {exam.content && <ExamContent content={exam.content} />}

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
                                            {(() => {
                                                const shared = b.start_time ? sharedSlots[`${b.date}|${b.start_time}`] || 0 : 0;
                                                if (shared < 2) return null;
                                                return (
                                                    <span className="block text-[11px] font-semibold" style={{ color: 'var(--warn)' }}>
                                                        {shared === 2
                                                            ? 'janela dividida com outra matéria nesse dia'
                                                            : `janela dividida com outras ${shared - 1} matérias nesse dia`}
                                                    </span>
                                                );
                                            })()}
                                        </span>
                                        {writable && (
                                            <span onClick={(e) => { e.stopPropagation(); onDeleteBlock(b.id); }}
                                                className="shrink-0" style={{ color: 'var(--fg-soft)' }}>
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </span>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ) : (
                <p className="text-[13px] mt-3" style={{ color: 'var(--fg-soft)' }}>
                    Sem blocos de estudo. {writable ? 'Monte o plano do jeito que fizer sentido para essa prova.' : 'A professora ainda não montou o plano.'}
                </p>
            )}

            {writable && adding && (
                <StudyBlockForm
                    examDate={exam.date}
                    today={today}
                    onCancel={() => setAdding(false)}
                    onSave={(block) => { onAddBlock(block); setAdding(false); }}
                />
            )}

            {writable && (
                <div className="flex items-center gap-4 mt-4 pt-3 flex-wrap" style={{ borderTop: '1px solid var(--line)' }}>
                    <button onClick={() => setAdding(v => !v)}
                        className="text-[12px] font-semibold flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                        <span className="material-symbols-outlined text-[16px]">{adding ? 'close' : 'add'}</span>
                        {adding ? 'cancelar' : 'adicionar bloco de estudo'}
                    </button>
                    <button onClick={onRegenerate} className="text-[12px] font-semibold flex items-center gap-1" style={{ color: 'var(--fg-soft)' }}>
                        <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                        {blocks.length ? 'refazer sugestão automática' : 'sugerir um plano'}
                    </button>
                    <button onClick={onDelete} className="text-[12px] font-semibold ml-auto" style={{ color: 'var(--danger)' }}>
                        excluir prova
                    </button>
                </div>
            )}
        </div>
    );
}
