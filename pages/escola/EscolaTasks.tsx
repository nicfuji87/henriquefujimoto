import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    daysBetween, escolaApi, EscolaExam, EscolaLibraryItem, EscolaSubject, EscolaTask,
    formatDate, PRIORITIES, todayISO,
} from '../../lib/api-escola';
import { canWrite, getEscolaRole } from '../../lib/escola-auth';

const DIFFICULTY = [
    { value: 1, emoji: '😄', label: 'Fácil' },
    { value: 2, emoji: '🙂', label: 'Tranquilo' },
    { value: 3, emoji: '😐', label: 'Mais ou menos' },
    { value: 4, emoji: '😕', label: 'Difícil' },
    { value: 5, emoji: '😣', label: 'Travei' },
];

export default function EscolaTasks() {
    const role = getEscolaRole();
    const writable = canWrite(role);
    const today = todayISO();
    const navigate = useNavigate();

    const [subjects, setSubjects] = useState<EscolaSubject[]>([]);
    const [exams, setExams] = useState<EscolaExam[]>([]);
    const [library, setLibrary] = useState<EscolaLibraryItem[]>([]);
    const [tasks, setTasks] = useState<EscolaTask[]>([]);
    const [openingFile, setOpeningFile] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'pending' | 'done'>('pending');
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [feedbackFor, setFeedbackFor] = useState<EscolaTask | null>(null);

    const [form, setForm] = useState({
        title: '', subject_id: '', description: '', due_date: '', priority: 'normal',
        exam_id: '', library_id: '',
    });

    const load = async () => {
        const [s, e, t, l] = await Promise.all([
            escolaApi.getSubjects(), escolaApi.getExams(), escolaApi.getTasks(), escolaApi.getLibrary(),
        ]);
        setSubjects(s); setExams(e); setTasks(t); setLibrary(l); setLoading(false);
    };

    /** Abre o material anexado à tarefa por link temporário. */
    const openMaterial = async (item: EscolaLibraryItem) => {
        setOpeningFile(item.id);
        const url = await escolaApi.getLibraryFileUrl(item.file_path);
        setOpeningFile(null);
        if (url) window.open(url, '_blank', 'noopener');
    };

    useEffect(() => { load(); }, []);

    const subjectOf = (id: string | null) => subjects.find(s => s.id === id);

    const pending = useMemo(
        () => tasks.filter(t => t.status !== 'done')
            .sort((a, b) => (a.due_date || '9999').localeCompare(b.due_date || '9999')),
        [tasks]
    );
    const done = useMemo(
        () => tasks.filter(t => t.status === 'done')
            .sort((a, b) => (b.done_at || '').localeCompare(a.done_at || '')),
        [tasks]
    );

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title) return;
        setSaving(true);
        await escolaApi.saveTask({
            title: form.title,
            subject_id: form.subject_id || null,
            exam_id: form.exam_id || null,
            library_id: form.library_id || null,
            description: form.description || null,
            due_date: form.due_date || null,
            priority: form.priority,
            created_by: role === 'professora' ? 'professora' : 'familia',
        });
        setSaving(false);
        setForm({
            title: '', subject_id: '', description: '', due_date: '', priority: 'normal',
            exam_id: '', library_id: '',
        });
        setShowForm(false);
        load();
    };

    /** Aluno marca como feito → abre o "como foi?"; desmarcar volta direto pra pendente. */
    const handleToggle = async (task: EscolaTask) => {
        if (task.status === 'done') {
            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'pending', done_at: null } : t));
            await escolaApi.setTaskDone(task.id, false);
            return;
        }
        setFeedbackFor(task);
    };

    const submitFeedback = async (difficulty: number, note: string) => {
        if (!feedbackFor) return;
        const id = feedbackFor.id;
        setTasks(prev => prev.map(t => t.id === id
            ? { ...t, status: 'done', done_at: new Date().toISOString(), difficulty, student_note: note || null }
            : t));
        setFeedbackFor(null);
        await escolaApi.setTaskDone(id, true, note, difficulty);
    };

    const handleDelete = async (task: EscolaTask) => {
        if (!confirm(`Excluir "${task.title}"?`)) return;
        await escolaApi.deleteTask(task.id);
        load();
    };

    if (loading) {
        return <div className="py-24 text-center" style={{ color: 'var(--fg-soft)' }}>
            <span className="material-symbols-outlined text-[32px] animate-spin">progress_activity</span>
        </div>;
    }

    const list = tab === 'pending' ? pending : done;

    return (
        <div className="escola-enter space-y-5">
            <div>
                <h1 className="text-[26px] font-semibold leading-tight">Atividades <span className="escola-mark">a desenvolver</span></h1>
                <p className="text-[13px] mt-1" style={{ color: 'var(--fg-soft)' }}>
                    O que a professora deixou para fazer entre uma aula e outra.
                </p>
            </div>

            {writable && (
                <button onClick={() => setShowForm(v => !v)} className="escola-btn w-full py-3 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">{showForm ? 'close' : 'add'}</span>
                    {showForm ? 'Cancelar' : 'Nova tarefa'}
                </button>
            )}

            {showForm && (
                <form onSubmit={handleCreate} className="escola-card p-5 space-y-4 escola-enter">
                    <div>
                        <label className="escola-label block mb-1.5">O que fazer</label>
                        <input className="escola-input" value={form.title} placeholder="Ex.: Lista de exercícios págs. 44 e 45"
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
                            <label className="escola-label block mb-1.5">Entregar até</label>
                            <input type="date" className="escola-input" value={form.due_date}
                                onChange={e => setForm({ ...form, due_date: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="escola-label block mb-1.5">Prioridade</label>
                        <div className="flex gap-2">
                            {Object.entries(PRIORITIES).map(([k, v]) => (
                                <button key={k} type="button" onClick={() => setForm({ ...form, priority: k })}
                                    className="flex-1 py-2 rounded-xl text-[13px] font-semibold transition-all"
                                    style={form.priority === k
                                        ? { background: `${v.color}22`, color: v.color, border: `1px solid ${v.color}` }
                                        : { background: 'var(--surface-2)', color: 'var(--fg-soft)', border: '1px solid var(--line)' }}>
                                    {v.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="escola-label block mb-1.5">Instruções (opcional)</label>
                        <textarea className="escola-input" rows={3} value={form.description}
                            placeholder="Como fazer, o que revisar antes, material a usar..."
                            onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>

                    <div>
                        <label className="escola-label block mb-1.5">Material da biblioteca</label>
                        {library.length === 0 ? (
                            <button type="button" onClick={() => navigate('/escola/biblioteca')}
                                className="text-[13px] font-semibold flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                                <span className="material-symbols-outlined text-[17px]">upload_file</span>
                                subir um material primeiro
                            </button>
                        ) : (
                            <select className="escola-input" value={form.library_id}
                                onChange={e => setForm({ ...form, library_id: e.target.value })}>
                                <option value="">Nenhum</option>
                                {library.map(l => (
                                    <option key={l.id} value={l.id}>
                                        {l.title}{l.needs_print && !l.printed ? ' (falta imprimir)' : ''}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {exams.filter(e => e.date >= today).length > 0 && (
                        <div>
                            <label className="escola-label block mb-1.5">Ligada a alguma prova?</label>
                            <select className="escola-input" value={form.exam_id}
                                onChange={e => setForm({ ...form, exam_id: e.target.value })}>
                                <option value="">Nenhuma</option>
                                {exams.filter(e => e.date >= today).map(e => (
                                    <option key={e.id} value={e.id}>{e.title} · {formatDate(e.date)}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button type="submit" disabled={saving || !form.title} className="escola-btn w-full py-3">
                        {saving ? 'Salvando...' : 'Salvar tarefa'}
                    </button>
                </form>
            )}

            <div className="flex gap-2">
                <TabButton active={tab === 'pending'} onClick={() => setTab('pending')} label={`A fazer (${pending.length})`} />
                <TabButton active={tab === 'done'} onClick={() => setTab('done')} label={`Feitas (${done.length})`} />
            </div>

            {list.length === 0 ? (
                <div className="escola-card-soft p-6 text-center">
                    <span className="material-symbols-outlined text-[30px]" style={{ color: 'var(--fg-soft)' }}>
                        {tab === 'pending' ? 'task_alt' : 'inbox'}
                    </span>
                    <p className="font-bold mt-1">
                        {tab === 'pending' ? 'Nenhuma tarefa em aberto' : 'Nada concluído ainda'}
                    </p>
                </div>
            ) : (
                <ul className="space-y-2.5">
                    {list.map(task => {
                        const late = task.status !== 'done' && task.due_date && task.due_date < today;
                        const dueIn = task.due_date ? daysBetween(today, task.due_date) : null;
                        const subject = subjectOf(task.subject_id);
                        return (
                            <li key={task.id} className="escola-card-soft p-4"
                                style={late ? { borderColor: 'rgba(248,113,113,.35)', background: 'rgba(248,113,113,.05)' } : {}}>
                                <div className="flex items-start gap-3">
                                    <button onClick={() => handleToggle(task)} className="shrink-0 mt-0.5">
                                        <span className="material-symbols-outlined text-[24px]"
                                            style={{ color: task.status === 'done' ? 'var(--ok)' : late ? 'var(--danger)' : 'var(--fg-soft)' }}>
                                            {task.status === 'done' ? 'check_circle' : 'radio_button_unchecked'}
                                        </span>
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {subject && (
                                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                                                    style={{ background: `${subject.color}1a`, color: subject.color }}>
                                                    {subject.name}
                                                </span>
                                            )}
                                            {task.priority === 'high' && task.status !== 'done' && (
                                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                                                    style={{ background: 'rgba(248,113,113,.16)', color: 'var(--danger)' }}>PRIORIDADE</span>
                                            )}
                                        </div>

                                        <p className={`text-[15px] font-semibold leading-snug mt-1 ${task.status === 'done' ? 'line-through opacity-55' : ''}`}>
                                            {task.title}
                                        </p>

                                        {task.description && (
                                            <p className="text-[13px] mt-1 leading-snug" style={{ color: 'var(--fg-soft)' }}>
                                                {task.description}
                                            </p>
                                        )}

                                        {(() => {
                                            const material = library.find(l => l.id === task.library_id);
                                            if (!material) return null;
                                            return (
                                                <button onClick={() => openMaterial(material)}
                                                    className="mt-2 w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left"
                                                    style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
                                                    <span className="material-symbols-outlined text-[19px] shrink-0" style={{ color: 'var(--accent)' }}>
                                                        {openingFile === material.id ? 'progress_activity' : 'description'}
                                                    </span>
                                                    <span className="flex-1 min-w-0">
                                                        <span className="block text-[13px] font-semibold truncate">{material.title}</span>
                                                        <span className="block text-[11px]" style={{ color: 'var(--fg-soft)' }}>
                                                            {material.needs_print && !material.printed ? 'falta imprimir' : 'abrir material'}
                                                        </span>
                                                    </span>
                                                    <span className="material-symbols-outlined text-[17px]" style={{ color: 'var(--fg-soft)' }}>
                                                        open_in_new
                                                    </span>
                                                </button>
                                            );
                                        })()}

                                        {task.due_date && task.status !== 'done' && (
                                            <p className="text-[12px] font-bold mt-1.5"
                                                style={{ color: late ? 'var(--danger)' : dueIn !== null && dueIn <= 1 ? 'var(--warn)' : 'var(--fg-soft)' }}>
                                                {late ? `Atrasada · era ${formatDate(task.due_date)}`
                                                    : dueIn === 0 ? 'Entregar hoje'
                                                        : dueIn === 1 ? 'Entregar amanhã'
                                                            : `Entregar até ${formatDate(task.due_date)}`}
                                            </p>
                                        )}

                                        {task.status === 'done' && task.difficulty && (
                                            <p className="text-[12px] font-bold mt-1.5" style={{ color: 'var(--fg-soft)' }}>
                                                {DIFFICULTY.find(d => d.value === task.difficulty)?.emoji}{' '}
                                                {DIFFICULTY.find(d => d.value === task.difficulty)?.label}
                                            </p>
                                        )}

                                        {task.student_note && (
                                            <p className="text-[13px] mt-2 p-2.5 rounded-lg leading-snug"
                                                style={{ background: 'var(--surface-2)', borderLeft: '3px solid var(--accent)' }}>
                                                <span className="escola-label block mb-0.5">Recado do Henrique</span>
                                                {task.student_note}
                                            </p>
                                        )}
                                    </div>

                                    {writable && (
                                        <button onClick={() => handleDelete(task)} className="shrink-0" style={{ color: 'var(--fg-soft)' }}>
                                            <span className="material-symbols-outlined text-[19px]">delete</span>
                                        </button>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {feedbackFor && (
                <FeedbackSheet
                    task={feedbackFor}
                    onCancel={() => setFeedbackFor(null)}
                    onSubmit={submitFeedback}
                />
            )}
        </div>
    );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button onClick={onClick}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
            style={active
                ? { background: 'var(--accent)', color: 'var(--accent-ink)' }
                : { background: 'var(--surface)', color: 'var(--fg-soft)', border: '1px solid var(--line)' }}>
            {label}
        </button>
    );
}

/** Ao concluir, o aluno diz como foi — é o que a professora lê antes da próxima aula. */
function FeedbackSheet({ task, onCancel, onSubmit }: {
    task: EscolaTask;
    onCancel: () => void;
    onSubmit: (difficulty: number, note: string) => void;
}) {
    const [difficulty, setDifficulty] = useState(2);
    const [note, setNote] = useState('');

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(10,11,13,.75)', backdropFilter: 'blur(4px)' }} onClick={onCancel}>
            <div className="escola-card w-full max-w-md p-5 escola-enter" onClick={e => e.stopPropagation()}>
                <p className="escola-label">Tarefa concluída</p>
                <p className="text-[17px] font-semibold leading-snug mt-1 mb-4">{task.title}</p>

                <p className="escola-label mb-2">Como foi pra você?</p>
                <div className="flex gap-1.5 mb-4">
                    {DIFFICULTY.map(d => (
                        <button key={d.value} onClick={() => setDifficulty(d.value)}
                            className="flex-1 py-2.5 rounded-xl flex flex-col items-center gap-0.5 transition-all"
                            style={difficulty === d.value
                                ? { background: 'rgba(198,242,78,.14)', border: '1px solid var(--accent)' }
                                : { background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
                            <span className="text-[20px]">{d.emoji}</span>
                            <span className="text-[9px] font-semibold leading-tight text-center">{d.label}</span>
                        </button>
                    ))}
                </div>

                <label className="escola-label block mb-1.5">Quer deixar um recado? (opcional)</label>
                <textarea className="escola-input" rows={2} value={note}
                    placeholder="Ex.: não entendi a questão 4"
                    onChange={e => setNote(e.target.value)} />

                <div className="flex gap-2 mt-4">
                    <button onClick={onCancel} className="flex-1 py-3 rounded-full font-semibold"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
                        Cancelar
                    </button>
                    <button onClick={() => onSubmit(difficulty, note)} className="escola-btn flex-[2] py-3">
                        Concluir
                    </button>
                </div>
            </div>
        </div>
    );
}
