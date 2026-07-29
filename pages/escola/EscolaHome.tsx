import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    daysBetween, escolaApi, EscolaExam, EscolaGrade, EscolaLesson, EscolaRoutineBlock,
    EscolaStudyBlock, EscolaSubject, EscolaTask, EXAM_KINDS, formatDate, formatDateLong,
    PERFORMANCE, ROUTINE_KINDS, shortTime, todayISO, toMinutes, weightedAverage,
} from '../../lib/api-escola';
import { canViewAnamnese, canViewLessons, getEscolaRole } from '../../lib/escola-auth';

export default function EscolaHome() {
    const navigate = useNavigate();
    const role = getEscolaRole();
    const today = todayISO();

    const [subjects, setSubjects] = useState<EscolaSubject[]>([]);
    const [exams, setExams] = useState<EscolaExam[]>([]);
    const [blocks, setBlocks] = useState<EscolaStudyBlock[]>([]);
    const [tasks, setTasks] = useState<EscolaTask[]>([]);
    const [lessons, setLessons] = useState<EscolaLesson[]>([]);
    const [grades, setGrades] = useState<EscolaGrade[]>([]);
    const [routine, setRoutine] = useState<EscolaRoutineBlock[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        const [s, e, b, t, l, g, r] = await Promise.all([
            escolaApi.getSubjects(),
            escolaApi.getExams(),
            escolaApi.getStudyBlocks(),
            escolaApi.getTasks(),
            canViewLessons(role) ? escolaApi.getLessons(5) : Promise.resolve([]),
            escolaApi.getGrades(),
            escolaApi.getRoutine(),
        ]);
        setSubjects(s); setExams(e); setBlocks(b); setTasks(t); setLessons(l); setGrades(g); setRoutine(r);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const subjectOf = (id: string | null) => subjects.find(s => s.id === id);

    const nextExam = useMemo(
        () => exams.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0],
        [exams, today]
    );

    const nextExamBlocks = useMemo(
        () => blocks.filter(b => b.exam_id === nextExam?.id).sort((a, b) => a.date.localeCompare(b.date)),
        [blocks, nextExam]
    );

    const todayBlocks = useMemo(() => blocks.filter(b => b.date === today && !b.done), [blocks, today]);
    const pendingTasks = useMemo(() => tasks.filter(t => t.status !== 'done'), [tasks]);
    const lateTasks = useMemo(() => pendingTasks.filter(t => t.due_date && t.due_date < today), [pendingTasks, today]);
    const todayTasks = useMemo(() => pendingTasks.filter(t => t.due_date === today), [pendingTasks, today]);
    const average = useMemo(() => weightedAverage(grades), [grades]);

    /** Compromissos fixos de hoje, com o próximo destacado. */
    const todayRoutine = useMemo(() => {
        const weekday = new Date().getDay();
        return routine
            .filter(r => r.weekday === weekday)
            .sort((a, b) => a.start_time.localeCompare(b.start_time));
    }, [routine]);

    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    const nextRoutine = todayRoutine.find(r => toMinutes(r.end_time) > nowMinutes);

    const toggleBlock = async (b: EscolaStudyBlock) => {
        setBlocks(prev => prev.map(x => x.id === b.id ? { ...x, done: !x.done } : x));
        await escolaApi.toggleStudyBlock(b.id, !b.done);
    };

    if (loading) {
        return <div className="py-24 text-center" style={{ color: 'var(--fg-soft)' }}>
            <span className="material-symbols-outlined text-[32px] animate-spin">progress_activity</span>
        </div>;
    }

    const doneCount = nextExamBlocks.filter(b => b.done).length;
    const daysToExam = nextExam ? daysBetween(today, nextExam.date) : null;

    return (
        <div className="escola-enter space-y-5">
            <div>
                <p className="escola-label">{formatDateLong(today)}</p>
                <h1 className="text-[26px] font-semibold leading-tight mt-1">
                    {role === 'aluno' ? <>Bora estudar, <span className="escola-mark">Henrique</span>?</>
                        : role === 'professora' ? <>Olá, <span className="escola-mark">professora</span></>
                            : <>Acompanhamento <span className="escola-mark">de hoje</span></>}
                </h1>
            </div>

            {/* Contagem regressiva da próxima prova */}
            {nextExam ? (
                <div className="escola-card p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="escola-label">Próxima {EXAM_KINDS[nextExam.kind]?.label.toLowerCase() || 'prova'}</p>
                            <p className="text-[19px] font-semibold leading-tight mt-1 truncate">{nextExam.title}</p>
                            <p className="text-[13px] font-semibold mt-0.5" style={{ color: subjectOf(nextExam.subject_id)?.color || 'var(--fg-soft)' }}>
                                {subjectOf(nextExam.subject_id)?.name || 'Sem matéria'} · {formatDate(nextExam.date)}
                            </p>
                        </div>
                        <div className="text-center shrink-0 px-3 py-2 rounded-2xl" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>
                            <p className="text-[30px] font-semibold leading-none">{daysToExam}</p>
                            <p className="text-[10px] font-semibold tracking-wide">
                                {daysToExam === 0 ? 'É HOJE!' : daysToExam === 1 ? 'DIA' : 'DIAS'}
                            </p>
                        </div>
                    </div>

                    {nextExamBlocks.length > 0 && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="escola-label">Plano de estudo</span>
                                <span className="text-[12px] font-semibold">{doneCount}/{nextExamBlocks.length}</span>
                            </div>
                            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--line)' }}>
                                <div className="h-full rounded-full transition-all"
                                    style={{ width: `${(doneCount / nextExamBlocks.length) * 100}%`, background: 'var(--accent)' }} />
                            </div>
                            <button onClick={() => navigate('/escola/provas')}
                                className="mt-3 text-[13px] font-semibold flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                                ver o plano completo
                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="escola-card-soft p-5 text-center">
                    <span className="material-symbols-outlined text-[28px]" style={{ color: 'var(--fg-soft)' }}>event_available</span>
                    <p className="font-bold mt-1">Nenhuma prova marcada</p>
                    <button onClick={() => navigate('/escola/provas')} className="text-[13px] font-semibold mt-1" style={{ color: 'var(--accent)' }}>
                        cadastrar uma prova
                    </button>
                </div>
            )}

            {/* Agenda fixa de hoje */}
            {todayRoutine.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="escola-label">Agenda de hoje</h2>
                        <button onClick={() => navigate('/escola/rotina')} className="text-[12px] font-semibold" style={{ color: 'var(--accent)' }}>
                            ver a semana
                        </button>
                    </div>
                    <div className="escola-card-soft p-3 flex gap-2 overflow-x-auto no-scrollbar">
                        {todayRoutine.map(r => {
                            const kind = ROUTINE_KINDS[r.kind] || ROUTINE_KINDS.outro;
                            const past = toMinutes(r.end_time) <= nowMinutes;
                            const isNext = nextRoutine?.id === r.id;
                            return (
                                <div key={r.id} className="shrink-0 rounded-xl px-3 py-2"
                                    style={{
                                        minWidth: 108,
                                        background: isNext ? `${kind.color}1f` : 'var(--surface-2)',
                                        border: `1px solid ${isNext ? kind.color : 'var(--line)'}`,
                                        opacity: past ? 0.4 : 1,
                                    }}>
                                    <p className="text-[11px] font-semibold" style={{ color: kind.color }}>
                                        {shortTime(r.start_time)}–{shortTime(r.end_time)}
                                    </p>
                                    <p className="text-[13px] font-semibold leading-tight mt-0.5">{r.title}</p>
                                    {isNext && (
                                        <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--fg-soft)' }}>
                                            {toMinutes(r.start_time) <= nowMinutes ? 'agora' : 'a seguir'}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Para hoje */}
            <section>
                <h2 className="escola-label mb-2">Tarefas e estudo de hoje</h2>
                {todayBlocks.length === 0 && todayTasks.length === 0 && lateTasks.length === 0 ? (
                    <div className="escola-card-soft p-4 flex items-center gap-3">
                        <span className="material-symbols-outlined text-[22px]" style={{ color: 'var(--ok)' }}>check_circle</span>
                        <p className="text-[14px] font-semibold">Nada pendente para hoje. Dia livre pro tatame.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {todayBlocks.map(b => (
                            <button key={b.id} onClick={() => toggleBlock(b)}
                                className="escola-card-soft w-full p-3.5 flex items-center gap-3 text-left">
                                <span className="w-6 h-6 rounded-md shrink-0 flex items-center justify-center"
                                    style={{ border: '2px solid var(--accent)' }} />
                                <span className="flex-1 min-w-0">
                                    <span className="block text-[14px] font-semibold truncate">
                                        {b.start_time ? `${shortTime(b.start_time)}–${shortTime(b.end_time)} · ` : ''}{b.label}
                                    </span>
                                    <span className="block text-[12px]" style={{ color: 'var(--fg-soft)' }}>
                                        Estudo · {exams.find(e => e.id === b.exam_id)?.title}
                                    </span>
                                    {todayBlocks.filter(o => o.start_time === b.start_time).length > 1 && (
                                        <span className="block text-[11px] font-semibold" style={{ color: 'var(--warn)' }}>
                                            {todayBlocks.filter(o => o.start_time === b.start_time).length} matérias nessa mesma janela
                                        </span>
                                    )}
                                </span>
                            </button>
                        ))}
                        {[...lateTasks, ...todayTasks].map(t => (
                            <button key={t.id} onClick={() => navigate('/escola/tarefas')}
                                className="escola-card-soft w-full p-3.5 flex items-center gap-3 text-left">
                                <span className="material-symbols-outlined text-[20px] shrink-0"
                                    style={{ color: t.due_date && t.due_date < today ? 'var(--danger)' : 'var(--fg-soft)' }}>
                                    {t.due_date && t.due_date < today ? 'priority_high' : 'radio_button_unchecked'}
                                </span>
                                <span className="flex-1 min-w-0">
                                    <span className="block text-[14px] font-semibold truncate">{t.title}</span>
                                    <span className="block text-[12px]" style={{ color: 'var(--fg-soft)' }}>
                                        {subjectOf(t.subject_id)?.name || 'Tarefa'}
                                        {t.due_date && t.due_date < today ? ' · atrasada' : ''}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            {/* Números rápidos */}
            <section className="grid grid-cols-2 gap-3">
                <button onClick={() => navigate('/escola/notas')} className="escola-card-soft p-4 text-left">
                    <p className="escola-label">Média geral</p>
                    <p className="text-[28px] font-semibold leading-tight mt-1">
                        {average !== null ? average.toFixed(1).replace('.', ',') : '—'}
                    </p>
                    <p className="text-[12px]" style={{ color: 'var(--fg-soft)' }}>
                        {grades.length} nota{grades.length === 1 ? '' : 's'} lançada{grades.length === 1 ? '' : 's'}
                    </p>
                </button>
                <button onClick={() => navigate('/escola/tarefas')} className="escola-card-soft p-4 text-left">
                    <p className="escola-label">Tarefas abertas</p>
                    <p className="text-[28px] font-semibold leading-tight mt-1">{pendingTasks.length}</p>
                    <p className="text-[12px]" style={{ color: lateTasks.length ? 'var(--danger)' : 'var(--fg-soft)' }}>
                        {lateTasks.length ? `${lateTasks.length} atrasada${lateTasks.length === 1 ? '' : 's'}` : 'nenhuma atrasada'}
                    </p>
                </button>
            </section>

            {/* Última aula */}
            {canViewLessons(role) && lessons.length > 0 && (
                <section>
                    <h2 className="escola-label mb-2">Última aula</h2>
                    <button onClick={() => navigate('/escola/diario')} className="escola-card-soft w-full p-4 text-left">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[15px]">{PERFORMANCE[lessons[0].performance]?.emoji}</span>
                            <span className="text-[13px] font-semibold">{formatDate(lessons[0].date)}</span>
                            <span className="text-[13px] font-semibold" style={{ color: subjectOf(lessons[0].subject_id)?.color || 'var(--fg-soft)' }}>
                                {subjectOf(lessons[0].subject_id)?.name || ''}
                            </span>
                        </div>
                        <p className="text-[14px] leading-snug">{lessons[0].content}</p>
                    </button>
                </section>
            )}

            {/* Atalhos */}
            <section className="grid grid-cols-2 gap-3">
                <button onClick={() => navigate('/escola/rotina')} className="escola-card-soft p-4 flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[22px]" style={{ color: 'var(--accent)' }}>calendar_view_week</span>
                    <span className="text-[13px] font-semibold text-left">Agenda da semana</span>
                </button>
                <button onClick={() => navigate('/escola/biblioteca')} className="escola-card-soft p-4 flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[22px]" style={{ color: 'var(--accent)' }}>folder_copy</span>
                    <span className="text-[13px] font-semibold text-left">Materiais</span>
                </button>
                {canViewLessons(role) && (
                    <button onClick={() => navigate('/escola/diario')} className="escola-card-soft p-4 flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-[22px]" style={{ color: 'var(--accent)' }}>auto_stories</span>
                        <span className="text-[13px] font-semibold text-left">Diário de aula</span>
                    </button>
                )}
                {canViewAnamnese(role) && (
                    <button onClick={() => navigate('/escola/anamnese')} className="escola-card-soft p-4 flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-[22px]" style={{ color: 'var(--accent)' }}>description</span>
                        <span className="text-[13px] font-semibold text-left">Ficha do aluno</span>
                    </button>
                )}
            </section>
        </div>
    );
}
