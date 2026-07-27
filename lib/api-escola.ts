import { supabase } from './supabase';

// ============================================================
// Types
// ============================================================

export interface EscolaSubject {
    id: string;
    name: string;
    color: string;
    icon: string;
    sort_order: number;
    active: boolean;
}

export interface EscolaGrade {
    id: string;
    subject_id: string | null;
    term: string;
    title: string | null;
    score: number;
    max_score: number;
    weight: number;
    date: string;
    notes: string | null;
    created_at: string;
}

export interface EscolaExam {
    id: string;
    subject_id: string | null;
    title: string;
    date: string;
    kind: string;
    term: string | null;
    content: string | null;
    status: string;
    created_at: string;
}

export interface EscolaStudyBlock {
    id: string;
    exam_id: string;
    date: string;
    days_before: number;
    label: string;
    focus: string | null;
    done: boolean;
    done_at: string | null;
    sort_order: number;
    start_time: string | null;
    end_time: string | null;
    window_kind: string | null;
}

export interface EscolaRoutineBlock {
    id: string;
    weekday: number;
    start_time: string;
    end_time: string;
    title: string;
    kind: string;
    place: string | null;
    online: boolean;
    notes: string | null;
    active: boolean;
}

export interface EscolaLesson {
    id: string;
    date: string;
    duration_min: number | null;
    subject_id: string | null;
    content: string;
    performance: string;
    engagement: number | null;
    notes: string | null;
    homework: string | null;
    author: string;
    created_at: string;
}

export interface EscolaTask {
    id: string;
    title: string;
    subject_id: string | null;
    exam_id: string | null;
    library_id: string | null;
    description: string | null;
    due_date: string | null;
    priority: string;
    status: string;
    done_at: string | null;
    student_note: string | null;
    difficulty: number | null;
    created_by: string;
    created_at: string;
}

export interface EscolaLibraryItem {
    id: string;
    title: string;
    description: string | null;
    subject_id: string | null;
    exam_id: string | null;
    file_path: string;
    file_name: string;
    mime_type: string | null;
    size_bytes: number | null;
    kind: string;
    needs_print: boolean;
    printed: boolean;
    printed_at: string | null;
    print_copies: number;
    uploaded_by: string;
    created_at: string;
}

export interface EscolaAnamnese {
    id: string;
    child_name: string | null;
    guardians: string | null;
    guardians_phones: string | null;
    address: string | null;
    birth_date: string | null;
    birthplace: string | null;
    grade: string | null;
    school: string | null;
    sports: string | null;
    allergies: string | null;
    specialists: string | null;
    medications: string | null;
    food_restrictions: string | null;
    routine: string | null;
    school_history: string | null;
    favorite_activities: string | null;
    socioemotional: string | null;
    expectations: string | null;
    class_days: string | null;
    other_notes: string | null;
    signed_by: string | null;
    updated_at: string;
}

// ============================================================
// Constantes de domínio
// ============================================================

export const PERFORMANCE: Record<string, { label: string; color: string; bg: string; emoji: string; desc: string }> = {
    green: { label: 'Mandou bem', color: '#c6f24e', bg: 'rgba(198,242,78,.12)', emoji: '🟢', desc: 'Entendeu e resolveu sozinho' },
    yellow: { label: 'Quase lá', color: '#fbbf24', bg: 'rgba(251,191,36,.12)', emoji: '🟡', desc: 'Entendeu com ajuda, precisa treinar' },
    red: { label: 'Precisa retomar', color: '#f87171', bg: 'rgba(248,113,113,.14)', emoji: '🔴', desc: 'Conteúdo ainda não fixou' },
};

export const EXAM_KINDS: Record<string, { label: string; icon: string }> = {
    prova: { label: 'Prova', icon: 'quiz' },
    trabalho: { label: 'Trabalho', icon: 'assignment' },
    simulado: { label: 'Simulado', icon: 'fact_check' },
    apresentacao: { label: 'Apresentação', icon: 'co_present' },
    recuperacao: { label: 'Recuperação', icon: 'restart_alt' },
};

export const PRIORITIES: Record<string, { label: string; color: string }> = {
    low: { label: 'Tranquila', color: '#6b7280' },
    normal: { label: 'Normal', color: '#c6f24e' },
    high: { label: 'Prioridade', color: '#f87171' },
};

export const TERMS = ['1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre'];

export const ROUTINE_KINDS: Record<string, { label: string; color: string; icon: string }> = {
    escola: { label: 'Escola', color: '#38bdf8', icon: 'school' },
    estudo: { label: 'Estudo', color: '#c6f24e', icon: 'menu_book' },
    aula_particular: { label: 'Aula particular', color: '#facc15', icon: 'record_voice_over' },
    curso: { label: 'Curso', color: '#c084fc', icon: 'translate' },
    treino: { label: 'Treino', color: '#fb923c', icon: 'sports_martial_arts' },
    terapia: { label: 'Terapia', color: '#34d399', icon: 'psychology' },
    outro: { label: 'Outro', color: '#94a3b8', icon: 'more_horiz' },
};

export const LIBRARY_KINDS: Record<string, { label: string; icon: string }> = {
    material: { label: 'Material de aula', icon: 'description' },
    lista: { label: 'Lista de exercícios', icon: 'list_alt' },
    resumo: { label: 'Resumo', icon: 'sticky_note_2' },
    prova_antiga: { label: 'Prova anterior', icon: 'history_edu' },
    apostila: { label: 'Apostila', icon: 'menu_book' },
    outro: { label: 'Outro', icon: 'attach_file' },
};

export const LIBRARY_BUCKET = 'escola-biblioteca';

export const formatBytes = (bytes: number | null): string => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
};

export const WEEKDAYS = [
    { value: 1, short: 'Seg', long: 'Segunda' },
    { value: 2, short: 'Ter', long: 'Terça' },
    { value: 3, short: 'Qua', long: 'Quarta' },
    { value: 4, short: 'Qui', long: 'Quinta' },
    { value: 5, short: 'Sex', long: 'Sexta' },
    { value: 6, short: 'Sáb', long: 'Sábado' },
    { value: 0, short: 'Dom', long: 'Domingo' },
];

// ============================================================
// Datas (tudo em horário local, sem UTC shift)
// ============================================================

export const todayISO = (): string => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Converte 'YYYY-MM-DD' num Date local à meia-noite (evita o -1 dia do parse UTC). */
export const parseISO = (iso: string): Date => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
};

export const addDaysISO = (iso: string, days: number): string => {
    const d = parseISO(iso);
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Dias inteiros de `from` até `to` (positivo = no futuro). */
export const daysBetween = (from: string, to: string): number =>
    Math.round((parseISO(to).getTime() - parseISO(from).getTime()) / 86400000);

export const formatDate = (iso: string): string =>
    parseISO(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

export const formatDateLong = (iso: string): string =>
    parseISO(iso).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'long' });

// ============================================================
// Plano regressivo de estudo
// ============================================================

const STUDY_TEMPLATE = [
    { days: 7, label: 'Ler e marcar dúvidas', focus: 'Ler todo o conteúdo da prova e anotar o que não entendeu' },
    { days: 5, label: 'Resumo / mapa mental', focus: 'Transformar a matéria em um resumo curto com as suas palavras' },
    { days: 3, label: 'Exercícios', focus: 'Resolver exercícios e listas do conteúdo' },
    { days: 1, label: 'Revisão final', focus: 'Reler o resumo e refazer só o que errou' },
];

/** Menor bloco de estudo que vale a pena marcar. */
const MIN_STUDY_MIN = 45;
/** Nenhum bloco de estudo passa disso, mesmo que a janela seja enorme. */
const MAX_STUDY_MIN = 90;
/** Fora dos horários da rotina, o dia útil para estudar vai das 9h às 21h. */
const DAY_START_MIN = 9 * 60;
const DAY_END_MIN = 21 * 60;
/** Respiro depois da escola antes de sentar para estudar. */
const AFTER_SCHOOL_BREAK_MIN = 60;

export const toMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + (m || 0);
};

export const fromMinutes = (minutes: number): string =>
    `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** '14:00:00' e '14:00' viram '14:00'. */
export const shortTime = (time: string | null): string => (time ? time.slice(0, 5) : '');

type Interval = { start: number; end: number };

const mergeIntervals = (list: Interval[]): Interval[] => {
    const sorted = [...list].sort((a, b) => a.start - b.start);
    const merged: Interval[] = [];
    for (const it of sorted) {
        const last = merged[merged.length - 1];
        if (last && it.start <= last.end) last.end = Math.max(last.end, it.end);
        else merged.push({ ...it });
    }
    return merged;
};

/** Buracos livres dentro de [from, to], descontando os compromissos do dia. */
const gapsBetween = (busy: Interval[], from: number, to: number): Interval[] => {
    const gaps: Interval[] = [];
    let cursor = from;
    for (const b of mergeIntervals(busy)) {
        if (b.end <= from || b.start >= to) continue;
        if (b.start > cursor) gaps.push({ start: cursor, end: Math.min(b.start, to) });
        cursor = Math.max(cursor, b.end);
    }
    if (cursor < to) gaps.push({ start: cursor, end: to });
    return gaps.filter(g => g.end - g.start >= MIN_STUDY_MIN);
};

export interface StudyWindow {
    start_time: string;
    end_time: string;
    /** 'estudo' = janela de estudo que já existe na rotina; 'livre' = folga entre compromissos. */
    window_kind: 'estudo' | 'livre';
}

/**
 * Acha o melhor horário para estudar num dia da semana, olhando a rotina fixa.
 * Prioridade: a janela de estudo que ele já tem (descontando a aula particular,
 * que acontece dentro dela) e, se não houver, a maior folga entre compromissos.
 */
export const findStudyWindow = (routine: EscolaRoutineBlock[], weekday: number): StudyWindow | null => {
    const dayBlocks = routine.filter(r => r.active !== false && r.weekday === weekday);
    if (!dayBlocks.length) {
        return { start_time: fromMinutes(14 * 60), end_time: fromMinutes(15 * 60 + 30), window_kind: 'livre' };
    }

    const asInterval = (r: EscolaRoutineBlock): Interval => ({
        start: toMinutes(r.start_time), end: toMinutes(r.end_time),
    });

    // 1) A janela de estudo dele, menos o pedaço que a professora ocupa.
    const studyBlocks = dayBlocks.filter(r => r.kind === 'estudo').map(asInterval);
    const taken = dayBlocks.filter(r => r.kind !== 'estudo').map(asInterval);
    for (const study of mergeIntervals(studyBlocks)) {
        const free = gapsBetween(taken, study.start, study.end);
        if (free.length) {
            const best = free.reduce((a, b) => (b.end - b.start > a.end - a.start ? b : a));
            return {
                start_time: fromMinutes(best.start),
                end_time: fromMinutes(Math.min(best.end, best.start + MAX_STUDY_MIN)),
                window_kind: 'estudo',
            };
        }
    }

    // 2) Sem janela de estudo: a maior folga do dia, já depois da escola.
    const school = dayBlocks.filter(r => r.kind === 'escola').map(asInterval);
    const dayStart = school.length
        ? Math.max(...school.map(s => s.end)) + AFTER_SCHOOL_BREAK_MIN
        : DAY_START_MIN;
    const gaps = gapsBetween(dayBlocks.map(asInterval), dayStart, DAY_END_MIN);
    if (!gaps.length) return null;

    const best = gaps.reduce((a, b) => (b.end - b.start > a.end - a.start ? b : a));
    return {
        start_time: fromMinutes(best.start),
        end_time: fromMinutes(Math.min(best.end, best.start + MAX_STUDY_MIN)),
        window_kind: 'livre',
    };
};

/** Quanto tempo de compromisso o dia já tem, em minutos. Serve para avisar de dia cheio. */
export const dayLoadMinutes = (routine: EscolaRoutineBlock[], weekday: number): number =>
    mergeIntervals(
        routine.filter(r => r.active !== false && r.weekday === weekday)
            .map(r => ({ start: toMinutes(r.start_time), end: toMinutes(r.end_time) }))
    ).reduce((sum, i) => sum + (i.end - i.start), 0);

export interface StudyPlanBlock {
    date: string;
    days_before: number;
    label: string;
    focus: string;
    sort_order: number;
    start_time: string | null;
    end_time: string | null;
    window_kind: string | null;
}

/**
 * Monta os blocos de estudo contando de trás pra frente a partir da data da prova.
 * Com uma semana ou mais, usa o template (D-7, D-5, D-3, D-1). Com menos tempo,
 * mantém as etapas mais práticas (exercícios/revisão) em dias consecutivos.
 *
 * Passando a rotina, cada bloco também ganha horário: a janela de estudo que ele já
 * tem naquele dia ou a maior folga entre os treinos. Se o dia estiver lotado, o bloco
 * recua um dia; se nem assim couber, fica marcado como 'cheio' para a professora ver.
 */
export const buildStudyPlan = (
    examDate: string,
    fromDate: string = todayISO(),
    routine: EscolaRoutineBlock[] = []
): StudyPlanBlock[] => {
    const available = daysBetween(fromDate, examDate);
    if (available <= 0) return [];

    let steps: { days: number; label: string; focus: string }[];
    if (available >= 7) {
        steps = STUDY_TEMPLATE;
    } else {
        const n = Math.min(STUDY_TEMPLATE.length, available);
        steps = STUDY_TEMPLATE.slice(STUDY_TEMPLATE.length - n)
            .map((s, i) => ({ ...s, days: n - i }));
    }

    const used = new Set<string>();
    return steps.map((s, i) => {
        const target = addDaysISO(examDate, -s.days);
        const base = { label: s.label, focus: s.focus, sort_order: i };

        if (!routine.length) {
            return { ...base, date: target, days_before: s.days, start_time: null, end_time: null, window_kind: null };
        }

        // Tenta o dia previsto e, se estiver lotado ou já ocupado por outro bloco, o dia anterior.
        for (const candidate of [target, addDaysISO(target, -1)]) {
            if (used.has(candidate) || daysBetween(fromDate, candidate) < 0) continue;
            const window = findStudyWindow(routine, parseISO(candidate).getDay());
            if (!window) continue;
            used.add(candidate);
            return {
                ...base,
                date: candidate,
                days_before: daysBetween(candidate, examDate),
                start_time: window.start_time,
                end_time: window.end_time,
                window_kind: window.window_kind,
            };
        }

        used.add(target);
        return { ...base, date: target, days_before: s.days, start_time: null, end_time: null, window_kind: 'cheio' };
    });
};

// ============================================================
// Cálculo de notas
// ============================================================

/** Média ponderada normalizada para escala 0–10. */
export const weightedAverage = (grades: EscolaGrade[]): number | null => {
    if (!grades.length) return null;
    let sum = 0;
    let weights = 0;
    for (const g of grades) {
        const max = g.max_score || 10;
        const w = g.weight || 1;
        sum += (Number(g.score) / max) * 10 * w;
        weights += w;
    }
    return weights ? sum / weights : null;
};

// ============================================================
// API
// ============================================================

export const escolaApi = {
    // ---------- Matérias ----------
    getSubjects: async (): Promise<EscolaSubject[]> => {
        const { data, error } = await supabase
            .from('escola_subjects')
            .select('*')
            .eq('active', true)
            .order('sort_order');
        if (error) { console.error(error); return []; }
        return data || [];
    },

    createSubject: async (subject: Partial<EscolaSubject>): Promise<boolean> => {
        const { error } = await supabase.from('escola_subjects').insert([subject]);
        if (error) { console.error(error); return false; }
        return true;
    },

    // ---------- Notas ----------
    getGrades: async (): Promise<EscolaGrade[]> => {
        const { data, error } = await supabase
            .from('escola_grades')
            .select('*')
            .order('date', { ascending: false });
        if (error) { console.error(error); return []; }
        return data || [];
    },

    saveGrade: async (grade: Partial<EscolaGrade>): Promise<boolean> => {
        const { error } = await supabase.from('escola_grades').insert([grade]);
        if (error) { console.error(error); return false; }
        return true;
    },

    deleteGrade: async (id: string): Promise<boolean> => {
        const { error } = await supabase.from('escola_grades').delete().eq('id', id);
        if (error) { console.error(error); return false; }
        return true;
    },

    // ---------- Provas ----------
    getExams: async (): Promise<EscolaExam[]> => {
        const { data, error } = await supabase
            .from('escola_exams')
            .select('*')
            .order('date');
        if (error) { console.error(error); return []; }
        return data || [];
    },

    /** Cria a prova e já gera o plano regressivo de estudo, encaixado na rotina da semana. */
    createExamWithPlan: async (exam: Partial<EscolaExam>): Promise<EscolaExam | null> => {
        const { data, error } = await supabase.from('escola_exams').insert([exam]).select().single();
        if (error || !data) { console.error(error); return null; }

        const routine = await escolaApi.getRoutine();
        const blocks = buildStudyPlan(data.date, todayISO(), routine).map(b => ({ ...b, exam_id: data.id }));
        if (blocks.length) {
            const { error: blockError } = await supabase.from('escola_study_blocks').insert(blocks);
            if (blockError) console.error(blockError);
        }
        return data as EscolaExam;
    },

    deleteExam: async (id: string): Promise<boolean> => {
        const { error } = await supabase.from('escola_exams').delete().eq('id', id);
        if (error) { console.error(error); return false; }
        return true;
    },

    // ---------- Blocos de estudo ----------
    getStudyBlocks: async (): Promise<EscolaStudyBlock[]> => {
        const { data, error } = await supabase
            .from('escola_study_blocks')
            .select('*')
            .order('date');
        if (error) { console.error(error); return []; }
        return data || [];
    },

    toggleStudyBlock: async (id: string, done: boolean): Promise<boolean> => {
        const { error } = await supabase
            .from('escola_study_blocks')
            .update({ done, done_at: done ? new Date().toISOString() : null })
            .eq('id', id);
        if (error) { console.error(error); return false; }
        return true;
    },

    /** Refaz o plano de uma prova a partir de hoje (útil quando a prova é remarcada). */
    regenerateStudyPlan: async (exam: EscolaExam): Promise<boolean> => {
        await supabase.from('escola_study_blocks').delete().eq('exam_id', exam.id);
        const routine = await escolaApi.getRoutine();
        const blocks = buildStudyPlan(exam.date, todayISO(), routine).map(b => ({ ...b, exam_id: exam.id }));
        if (!blocks.length) return true;
        const { error } = await supabase.from('escola_study_blocks').insert(blocks);
        if (error) { console.error(error); return false; }
        return true;
    },

    // ---------- Rotina semanal ----------
    getRoutine: async (): Promise<EscolaRoutineBlock[]> => {
        const { data, error } = await supabase
            .from('escola_routine')
            .select('*')
            .eq('active', true)
            .order('weekday')
            .order('start_time');
        if (error) { console.error(error); return []; }
        return data || [];
    },

    saveRoutineBlock: async (block: Partial<EscolaRoutineBlock>): Promise<boolean> => {
        const { error } = await supabase.from('escola_routine').insert([block]);
        if (error) { console.error(error); return false; }
        return true;
    },

    updateRoutineBlock: async (id: string, patch: Partial<EscolaRoutineBlock>): Promise<boolean> => {
        const { error } = await supabase.from('escola_routine').update(patch).eq('id', id);
        if (error) { console.error(error); return false; }
        return true;
    },

    deleteRoutineBlock: async (id: string): Promise<boolean> => {
        const { error } = await supabase.from('escola_routine').delete().eq('id', id);
        if (error) { console.error(error); return false; }
        return true;
    },

    // ---------- Diário de aula ----------
    getLessons: async (limit = 60): Promise<EscolaLesson[]> => {
        const { data, error } = await supabase
            .from('escola_lessons')
            .select('*')
            .order('date', { ascending: false })
            .limit(limit);
        if (error) { console.error(error); return []; }
        return data || [];
    },

    saveLesson: async (lesson: Partial<EscolaLesson>): Promise<boolean> => {
        const { error } = await supabase.from('escola_lessons').insert([lesson]);
        if (error) { console.error(error); return false; }
        return true;
    },

    deleteLesson: async (id: string): Promise<boolean> => {
        const { error } = await supabase.from('escola_lessons').delete().eq('id', id);
        if (error) { console.error(error); return false; }
        return true;
    },

    // ---------- Tarefas ----------
    getTasks: async (): Promise<EscolaTask[]> => {
        const { data, error } = await supabase
            .from('escola_tasks')
            .select('*')
            .order('due_date', { nullsFirst: false });
        if (error) { console.error(error); return []; }
        return data || [];
    },

    saveTask: async (task: Partial<EscolaTask>): Promise<boolean> => {
        const { error } = await supabase.from('escola_tasks').insert([task]);
        if (error) { console.error(error); return false; }
        return true;
    },

    updateTask: async (id: string, patch: Partial<EscolaTask>): Promise<boolean> => {
        const { error } = await supabase.from('escola_tasks').update(patch).eq('id', id);
        if (error) { console.error(error); return false; }
        return true;
    },

    setTaskDone: async (id: string, done: boolean, studentNote?: string, difficulty?: number): Promise<boolean> => {
        const patch: Partial<EscolaTask> = {
            status: done ? 'done' : 'pending',
            done_at: done ? new Date().toISOString() : null,
        };
        if (studentNote !== undefined) patch.student_note = studentNote;
        if (difficulty !== undefined) patch.difficulty = difficulty;
        return escolaApi.updateTask(id, patch);
    },

    deleteTask: async (id: string): Promise<boolean> => {
        const { error } = await supabase.from('escola_tasks').delete().eq('id', id);
        if (error) { console.error(error); return false; }
        return true;
    },

    // ---------- Biblioteca ----------
    getLibrary: async (): Promise<EscolaLibraryItem[]> => {
        const { data, error } = await supabase
            .from('escola_library')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) { console.error(error); return []; }
        return data || [];
    },

    /** Sobe o arquivo no bucket privado e registra o material. */
    uploadLibraryFile: async (
        file: File,
        meta: Partial<EscolaLibraryItem>
    ): Promise<boolean> => {
        const safeName = file.name.replace(/[^\w.\-]+/g, '_');
        const path = `${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
            .from(LIBRARY_BUCKET)
            .upload(path, file, { contentType: file.type || undefined, upsert: false });
        if (uploadError) { console.error(uploadError); return false; }

        const { error } = await supabase.from('escola_library').insert([{
            ...meta,
            file_path: path,
            file_name: file.name,
            mime_type: file.type || null,
            size_bytes: file.size,
        }]);
        if (error) {
            console.error(error);
            // Não deixa arquivo órfão no bucket se o registro falhar.
            await supabase.storage.from(LIBRARY_BUCKET).remove([path]);
            return false;
        }
        return true;
    },

    /** URL temporária (1h) para abrir ou baixar o arquivo. */
    getLibraryFileUrl: async (path: string): Promise<string | null> => {
        const { data, error } = await supabase.storage
            .from(LIBRARY_BUCKET)
            .createSignedUrl(path, 3600);
        if (error) { console.error(error); return null; }
        return data?.signedUrl || null;
    },

    setLibraryPrinted: async (id: string, printed: boolean): Promise<boolean> => {
        const { error } = await supabase
            .from('escola_library')
            .update({ printed, printed_at: printed ? new Date().toISOString() : null })
            .eq('id', id);
        if (error) { console.error(error); return false; }
        return true;
    },

    deleteLibraryItem: async (item: EscolaLibraryItem): Promise<boolean> => {
        const { error } = await supabase.from('escola_library').delete().eq('id', item.id);
        if (error) { console.error(error); return false; }
        await supabase.storage.from(LIBRARY_BUCKET).remove([item.file_path]);
        return true;
    },

    // ---------- Anamnese ----------
    getAnamnese: async (): Promise<EscolaAnamnese | null> => {
        const { data, error } = await supabase
            .from('escola_anamnese')
            .select('*')
            .order('created_at')
            .limit(1)
            .maybeSingle();
        if (error) { console.error(error); return null; }
        return data as EscolaAnamnese | null;
    },

    saveAnamnese: async (id: string, patch: Partial<EscolaAnamnese>): Promise<boolean> => {
        const { error } = await supabase
            .from('escola_anamnese')
            .update({ ...patch, updated_at: new Date().toISOString() })
            .eq('id', id);
        if (error) { console.error(error); return false; }
        return true;
    },
};
