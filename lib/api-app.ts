import { supabase } from './supabase';

export interface AppGym {
    id: string;
    name: string;
    is_active: boolean;
    display_order: number;
    created_at?: string;
}

export interface AppTraining {
    id?: string;
    created_at?: string;
    modality: string;
    training_type: string;
    rating?: number;
    reflection?: string;
    fatigue_level?: number;
    energy_level?: number;
    pain_level?: number;
    pain_areas?: string[];
    focus_level?: number;
    distractions?: string[];
    mental_reflection?: string;
    emotions?: string[];
    emotion_intensity?: number;
    emotion_context?: string;
    learned_today?: string;
    needs_improvement?: string;
    sensei_feedback?: string;

    // Gym / Academy
    gym_id?: string;
    gym_name?: string; // Virtual field from join
    training_date?: string; // Date the training actually occurred (YYYY-MM-DD)

    // Competition Fields
    is_competition?: boolean;
    competition_name?: string;
    competition_result?: string;
    competition_weight?: string;
    competition_matches?: number;
    competition_wins?: number;
    competition_losses?: number;
}

export const appApi = {
    // Fetch gyms/academies
    getGyms: async () => {
        const { data, error } = await supabase
            .from('app_gyms')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (error) throw error;
        return data as AppGym[];
    },

    // Fetch recent trainings with gym name
    getTrainings: async (limit = 10) => {
        const { data, error } = await supabase
            .from('app_trainings')
            .select('*, app_gyms(name)')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        // Flatten gym name from join
        return (data || []).map((t: any) => ({
            ...t,
            gym_name: t.app_gyms?.name || null,
            app_gyms: undefined,
        })) as AppTraining[];
    },

    getTrainingById: async (id: string) => {
        const { data, error } = await supabase
            .from('app_trainings')
            .select('*, app_gyms(name)')
            .eq('id', id)
            .single();
        if (error) throw error;

        return {
            ...data,
            gym_name: (data as any).app_gyms?.name || null,
            app_gyms: undefined,
        } as AppTraining;
    },

    // Save or update a training session
    saveTraining: async (training: Partial<AppTraining>) => {
        // Remove virtual fields before saving
        const { gym_name, ...toSave } = training;

        if (toSave.id) {
            const { data, error } = await supabase
                .from('app_trainings')
                .update(toSave)
                .eq('id', toSave.id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase
                .from('app_trainings')
                .insert([toSave])
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    }
};
