import { supabase } from './supabase';

// ============================================================
// Types
// ============================================================

export interface GymAthleteProfile {
    id?: string;
    birth_date?: string;
    weight?: number;
    height?: number;
    primary_modality?: string;
    secondary_modalities?: string[];
    category?: string;
    belt?: string;
    laterality?: string;
    injury_history?: { area: string; description: string; year?: number }[];
    observations?: string;
    gym_onboarded?: boolean;
}

export interface GymScheduleEntry {
    id?: string;
    day_of_week: number;
    modality: string;
    start_time: string;
    end_time: string;
}

export interface GymCompetition {
    id?: string;
    name: string;
    date: string;
    importance: 'A' | 'B' | 'C';
    location?: string;
    notes?: string;
    created_at?: string;
}

export interface GymCheckin {
    id?: string;
    date?: string;
    energy: number;
    sleep_quality: number;
    muscle_pain: number;
    joint_pain: number;
    joint_pain_areas?: string[];
    motivation: number;
    observation?: string;
    readiness_score?: number;
    created_at?: string;
}

export interface GymExercise {
    id: string;
    name: string;
    category: string;
    muscle_groups: string[];
    equipment?: string;
    video_url?: string;
    description?: string;
    attention_points?: string[];
    common_errors?: string[];
    contraindications?: string[];
    variations?: string[];
    difficulty: string;
    is_active: boolean;
}

export interface GymWorkoutExercise {
    exercise_id: string;
    exercise_name: string;
    block_type?: 'warmup' | 'main' | 'accessory' | 'cooldown';
    sets: number;
    reps: string;
    rest_seconds: number;
    tempo?: string;
    technical_cues?: string[];
    common_errors?: string[];
    regression_option?: string;
    progression_option?: string;
    notes?: string;
    completed?: boolean;
    category?: string;
}

export interface GymWorkout {
    id?: string;
    date?: string;
    workout_name?: string;
    objective?: string;
    duration_minutes?: number;
    intensity?: 'low' | 'moderate' | 'high';
    atr_phase?: 'accumulation' | 'transmutation' | 'realization';
    session_type?: 'complete' | 'standard' | 'light' | 'regenerative' | 'short_activation';
    focus_tags?: string[];
    ai_justification?: string;
    ai_detailed_justification?: string;
    exercises?: GymWorkoutExercise[];
    checkin_id?: string;
    plan_id?: string;
    status?: 'pending' | 'completed' | 'skipped';
    rpe?: number;
    post_workout_pain?: boolean;
    post_workout_notes?: string;
    hardest_exercise?: string;
    easiest_exercise?: string;
    ai_model?: string;
    ai_prompt_id?: string;
    ai_post_analysis?: GymPostAnalysis;
    acute_load?: number;
    chronic_load?: number;
    acwr?: number;
    readiness_score?: number;
    athlete_load_score?: number;
    created_at?: string;
    completed_at?: string;
}

export interface GymTrainingPlan {
    id?: string;
    name: string;
    competition_id?: string;
    start_date: string;
    end_date?: string;
    phase?: 'accumulation' | 'transmutation' | 'realization';
    objective?: string;
    focus_tags?: string[];
    notes?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface GymPostAnalysis {
    summary: string;
    insights: string[];
    recommendations: string[];
    load_assessment: 'adequate' | 'high' | 'low';
    progression_suggestions: { exercise_name: string; suggestion: 'progress' | 'maintain' | 'regress'; reason: string }[];
}

export interface GymAIPrompt {
    id: string;
    name: string;
    model: string;
    system_prompt: string;
    temperature: number;
    max_tokens: number;
    is_active: boolean;
}

// ============================================================
// Deterministic Engine — ATR Phase & Readiness
// ============================================================

export function calculateATRPhase(nextCompetitionDate: string | null): 'accumulation' | 'transmutation' | 'realization' {
    if (!nextCompetitionDate) return 'accumulation';
    const now = new Date();
    const comp = new Date(nextCompetitionDate + 'T12:00:00');
    const daysUntil = Math.ceil((comp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil > 42) return 'accumulation';
    if (daysUntil > 21) return 'transmutation';
    return 'realization';
}

export function calculateReadinessScore(checkin: GymCheckin): number {
    // Weighted average: energy(25%), sleep(25%), motivation(20%), muscle_pain_inverted(15%), joint_pain_inverted(15%)
    const energyNorm = (checkin.energy / 5) * 100;
    const sleepNorm = (checkin.sleep_quality / 5) * 100;
    const motivationNorm = (checkin.motivation / 5) * 100;
    const musclePainNorm = ((5 - checkin.muscle_pain) / 5) * 100;
    const jointPainNorm = ((5 - checkin.joint_pain) / 5) * 100;

    return Math.round(
        energyNorm * 0.25 +
        sleepNorm * 0.25 +
        motivationNorm * 0.20 +
        musclePainNorm * 0.15 +
        jointPainNorm * 0.15
    );
}

export function calculateDailyLoad(durationMinutes: number, rpe: number): number {
    return durationMinutes * rpe;
}

export function getMaxDuration(atrPhase: string, readiness: number): number {
    if (atrPhase === 'realization') return readiness < 60 ? 10 : 15;
    if (atrPhase === 'transmutation') return readiness < 50 ? 12 : 20;
    return readiness < 50 ? 15 : 25;
}

export function getBlockedCategories(checkin: GymCheckin, atrPhase: string, daysUntilCompetition: number | null): string[] {
    const blocked: string[] = [];
    // Block power/jumps if knee pain >= 3
    if (checkin.joint_pain >= 3 && checkin.joint_pain_areas?.some(a => ['joelho', 'tornozelo'].includes(a))) {
        blocked.push('power');
    }
    // Block overhead if shoulder pain >= 3
    if (checkin.joint_pain >= 3 && checkin.joint_pain_areas?.some(a => ['ombro'].includes(a))) {
        // Don't fully block strength, but will filter specific exercises
    }
    // Limit grip near competition
    if (daysUntilCompetition !== null && daysUntilCompetition < 7) {
        blocked.push('grip');
    }
    return blocked;
}

// ============================================================
// API Methods
// ============================================================

export const gymApi = {
    // ---------- Athlete Profile ----------
    getAthleteProfile: async (): Promise<GymAthleteProfile | null> => {
        const { data, error } = await supabase
            .from('athlete_profile')
            .select('id, birth_date, weight, height, primary_modality, secondary_modalities, category, belt, laterality, injury_history, observations, gym_onboarded')
            .limit(1)
            .single();
        if (error) return null;
        return data as GymAthleteProfile;
    },

    updateAthleteProfile: async (profile: Partial<GymAthleteProfile>) => {
        // Get existing profile id
        const { data: existing } = await supabase.from('athlete_profile').select('id').limit(1).single();
        if (!existing) throw new Error('No athlete profile found');
        const { error } = await supabase
            .from('athlete_profile')
            .update({ ...profile, updated_at: new Date().toISOString() })
            .eq('id', existing.id);
        if (error) throw error;
    },

    // ---------- Weekly Schedule ----------
    getSchedule: async (): Promise<GymScheduleEntry[]> => {
        const { data, error } = await supabase
            .from('gym_weekly_schedule')
            .select('*')
            .order('day_of_week')
            .order('start_time');
        if (error) throw error;
        return (data || []) as GymScheduleEntry[];
    },

    saveScheduleEntry: async (entry: Partial<GymScheduleEntry>) => {
        if (entry.id) {
            const { error } = await supabase.from('gym_weekly_schedule').update(entry).eq('id', entry.id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('gym_weekly_schedule').insert([entry]);
            if (error) throw error;
        }
    },

    deleteScheduleEntry: async (id: string) => {
        const { error } = await supabase.from('gym_weekly_schedule').delete().eq('id', id);
        if (error) throw error;
    },

    // ---------- Competitions ----------
    getCompetitions: async (): Promise<GymCompetition[]> => {
        const { data, error } = await supabase
            .from('gym_competitions')
            .select('*')
            .order('date', { ascending: true });
        if (error) throw error;
        return (data || []) as GymCompetition[];
    },

    getNextCompetition: async (): Promise<GymCompetition | null> => {
        const today = new Date().toISOString().slice(0, 10);
        const { data, error } = await supabase
            .from('gym_competitions')
            .select('*')
            .gte('date', today)
            .order('date', { ascending: true })
            .limit(1);
        if (error) return null;
        return data && data.length > 0 ? (data[0] as GymCompetition) : null;
    },

    saveCompetition: async (comp: Partial<GymCompetition>) => {
        if (comp.id) {
            const { error } = await supabase.from('gym_competitions').update(comp).eq('id', comp.id);
            if (error) throw error;
        } else {
            const { id: _id, ...toInsert } = comp;
            const { error } = await supabase.from('gym_competitions').insert([toInsert]);
            if (error) throw error;
        }
    },

    deleteCompetition: async (id: string) => {
        const { error } = await supabase.from('gym_competitions').delete().eq('id', id);
        if (error) throw error;
    },

    // ---------- Check-ins ----------
    getTodayCheckin: async (): Promise<GymCheckin | null> => {
        const today = new Date().toISOString().slice(0, 10);
        const { data, error } = await supabase
            .from('gym_checkins')
            .select('*')
            .eq('date', today)
            .limit(1);
        if (error) return null;
        return data && data.length > 0 ? (data[0] as GymCheckin) : null;
    },

    getRecentCheckins: async (days = 28): Promise<GymCheckin[]> => {
        const since = new Date();
        since.setDate(since.getDate() - days);
        const { data, error } = await supabase
            .from('gym_checkins')
            .select('*')
            .gte('date', since.toISOString().slice(0, 10))
            .order('date', { ascending: false });
        if (error) return [];
        return (data || []) as GymCheckin[];
    },

    saveCheckin: async (checkin: Partial<GymCheckin>) => {
        const readiness = calculateReadinessScore(checkin as GymCheckin);
        const today = new Date().toISOString().slice(0, 10);
        const toSave = { ...checkin, date: today, readiness_score: readiness };
        // Upsert by date
        const { data, error } = await supabase
            .from('gym_checkins')
            .upsert([toSave], { onConflict: 'date' })
            .select()
            .single();
        if (error) throw error;
        return data as GymCheckin;
    },

    // ---------- Exercises ----------
    getExercises: async (): Promise<GymExercise[]> => {
        const { data, error } = await supabase
            .from('gym_exercises')
            .select('*')
            .eq('is_active', true)
            .order('category')
            .order('name');
        if (error) throw error;
        return (data || []) as GymExercise[];
    },

    // ---------- Workouts ----------
    getTodayWorkout: async (): Promise<GymWorkout | null> => {
        const today = new Date().toISOString().slice(0, 10);
        const { data, error } = await supabase
            .from('gym_workouts')
            .select('*')
            .eq('date', today)
            .order('created_at', { ascending: false })
            .limit(1);
        if (error) return null;
        return data && data.length > 0 ? (data[0] as GymWorkout) : null;
    },

    getRecentWorkouts: async (limit = 14): Promise<GymWorkout[]> => {
        const { data, error } = await supabase
            .from('gym_workouts')
            .select('*')
            .order('date', { ascending: false })
            .limit(limit);
        if (error) return [];
        return (data || []) as GymWorkout[];
    },

    getAllWorkouts: async (): Promise<GymWorkout[]> => {
        const { data, error } = await supabase
            .from('gym_workouts')
            .select('*')
            .order('date', { ascending: false });
        if (error) return [];
        return (data || []) as GymWorkout[];
    },

    completeWorkout: async (workoutId: string, feedback: Partial<GymWorkout>) => {
        const { error } = await supabase
            .from('gym_workouts')
            .update({
                ...feedback,
                status: 'completed',
                completed_at: new Date().toISOString(),
            })
            .eq('id', workoutId);
        if (error) throw error;
    },

    // ---------- Training Plans ----------
    getTrainingPlans: async (): Promise<GymTrainingPlan[]> => {
        const { data, error } = await supabase
            .from('gym_training_plans')
            .select('*')
            .order('start_date', { ascending: false });
        if (error) return [];
        return (data || []) as GymTrainingPlan[];
    },

    getActivePlan: async (): Promise<GymTrainingPlan | null> => {
        const today = new Date().toISOString().slice(0, 10);
        const { data, error } = await supabase
            .from('gym_training_plans')
            .select('*')
            .eq('is_active', true)
            .lte('start_date', today)
            .order('start_date', { ascending: false })
            .limit(1);
        if (error) return null;
        return data && data.length > 0 ? (data[0] as GymTrainingPlan) : null;
    },

    saveTrainingPlan: async (plan: Partial<GymTrainingPlan>) => {
        if (plan.id) {
            const { error } = await supabase.from('gym_training_plans').update({ ...plan, updated_at: new Date().toISOString() }).eq('id', plan.id);
            if (error) throw error;
        } else {
            const { id: _id, ...toInsert } = plan;
            const { error } = await supabase.from('gym_training_plans').insert([toInsert]);
            if (error) throw error;
        }
    },

    deleteTrainingPlan: async (id: string) => {
        const { error } = await supabase.from('gym_training_plans').delete().eq('id', id);
        if (error) throw error;
    },

    // ---------- AI Prompts ----------
    getPrompt: async (name: string): Promise<GymAIPrompt | null> => {
        const { data, error } = await supabase
            .from('gym_ai_prompts')
            .select('*')
            .eq('name', name)
            .eq('is_active', true)
            .limit(1)
            .single();
        if (error) return null;
        return data as GymAIPrompt;
    },

    // ---------- Generate Workout (calls edge function) ----------
    generateWorkout: async (checkinId: string, planId?: string): Promise<GymWorkout> => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const res = await fetch(`${supabaseUrl}/functions/v1/gym-generate-workout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({ checkin_id: checkinId, plan_id: planId }),
        });
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Failed to generate workout: ${errText}`);
        }
        return await res.json() as GymWorkout;
    },

    // ---------- Post-workout AI Analysis ----------
    analyzeWorkout: async (workoutId: string): Promise<GymPostAnalysis> => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const res = await fetch(`${supabaseUrl}/functions/v1/gym-post-workout-analysis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({ workout_id: workoutId }),
        });
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Failed to analyze workout: ${errText}`);
        }
        return await res.json() as GymPostAnalysis;
    },

    // ---------- Load calculations ----------
    getWeeklyLoad: async (): Promise<{ acute: number; chronic: number; acwr: number }> => {
        const workouts = await gymApi.getRecentWorkouts(30);
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const twentyEightDaysAgo = new Date(now);
        twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);

        const acuteWorkouts = workouts.filter(w => w.date && new Date(w.date + 'T12:00:00') >= sevenDaysAgo && w.status === 'completed');
        const chronicWorkouts = workouts.filter(w => w.date && new Date(w.date + 'T12:00:00') >= twentyEightDaysAgo && w.status === 'completed');

        const acute = acuteWorkouts.reduce((sum, w) => sum + calculateDailyLoad(w.duration_minutes || 0, w.rpe || 5), 0);
        const chronic = chronicWorkouts.length > 0
            ? chronicWorkouts.reduce((sum, w) => sum + calculateDailyLoad(w.duration_minutes || 0, w.rpe || 5), 0) / 4
            : 0;
        const acwr = chronic > 0 ? +(acute / chronic).toFixed(2) : 0;

        return { acute, chronic, acwr };
    },
};
