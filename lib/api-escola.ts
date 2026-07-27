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

/**
 * Monta os blocos de estudo contando de trás pra frente a partir da data da prova.
 * Com uma semana ou mais, usa o template (D-7, D-5, D-3, D-1). Com menos tempo,
 * mantém as etapas mais práticas (exercícios/revisão) em dias consecutivos.
 */
export const buildStudyPlan = (
    examDate: string,
    fromDate: string = todayISO()
): { date: string; days_before: number; label: string; focus: string; sort_order: number }[] => {
    const available = daysBetween(fromDate, examDate);
    if (available <= 0) return [];

    if (available >= 7) {
        return STUDY_TEMPLATE.map((s, i) => ({
            date: addDaysISO(examDate, -s.days),
            days_before: s.days,
            label: s.label,
            focus: s.focus,
            sort_order: i,
        }));
    }

    const n = Math.min(STUDY_TEMPLATE.length, available);
    const steps = STUDY_TEMPLATE.slice(STUDY_TEMPLATE.length - n);
    return steps.map((s, i) => {
        const daysBefore = n - i;
        return {
            date: addDaysISO(examDate, -daysBefore),
            days_before: daysBefore,
            label: s.label,
            focus: s.focus,
            sort_order: i,
        };
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

    /** Cria a prova e já gera o plano regressivo de estudo. */
    createExamWithPlan: async (exam: Partial<EscolaExam>): Promise<EscolaExam | null> => {
        const { data, error } = await supabase.from('escola_exams').insert([exam]).select().single();
        if (error || !data) { console.error(error); return null; }

        const blocks = buildStudyPlan(data.date).map(b => ({ ...b, exam_id: data.id }));
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
        const blocks = buildStudyPlan(exam.date).map(b => ({ ...b, exam_id: exam.id }));
        if (!blocks.length) return true;
        const { error } = await supabase.from('escola_study_blocks').insert(blocks);
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
