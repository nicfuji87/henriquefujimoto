import { supabase } from './supabase';

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
    // Fetch recent trainings
    getTrainings: async (limit = 10) => {
        const { data, error } = await supabase
            .from('app_trainings')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data as AppTraining[];
    },

    getTrainingById: async (id: string) => {
        const { data, error } = await supabase
            .from('app_trainings')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data as AppTraining;
    },

    // Save or update a training session (since it's a multi-step form, we pass the ID if updating)
    saveTraining: async (training: Partial<AppTraining>) => {
        if (training.id) {
            const { data, error } = await supabase
                .from('app_trainings')
                .update(training)
                .eq('id', training.id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase
                .from('app_trainings')
                .insert([training])
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    }
};
