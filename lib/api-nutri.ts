import { supabase } from './supabase';

// ============================================================
// Types
// ============================================================

export interface NutriWeightLog {
    id: string;
    date: string;
    time: string;
    weight: number;
    created_at: string;
}

export interface NutriDailyLog {
    id: string;
    date: string;
    water_ml: number;
    sleep_bedtime: string | null;
    sleep_waketime: string | null;
    sleep_hours: number | null;
    energy_level: number | null;
    bowel_movement: number | null;
    diet_followed: boolean;
    notes: string | null;
    created_at: string;
}

export interface NutriMeal {
    id: string;
    date: string;
    meal_type: string;
    description: string | null;
    followed_diet: boolean;
    photo_url: string | null;
    ai_estimated_calories: number | null;
    ai_analysis: string | null;
    ai_model: string | null;
    created_at: string;
}

export interface NutriDietPlan {
    id: string;
    name: string;
    meal_type: string;
    description: string;
    estimated_calories: number | null;
    is_active: boolean;
    created_at: string;
}

export interface AiFoodAnalysis {
    food_items: { name: string; estimated_calories: number }[];
    total_calories: number;
    analysis: string;
    is_balanced: boolean;
    suggestions: string;
}

export const MEAL_TYPES: Record<string, string> = {
    breakfast: 'Café da Manhã',
    morning_snack: 'Lanche da Manhã',
    lunch: 'Almoço',
    afternoon_snack: 'Lanche da Tarde',
    dinner: 'Jantar',
    supper: 'Ceia',
    other: 'Outro',
};

export const MEAL_ICONS: Record<string, string> = {
    breakfast: 'egg_alt',
    morning_snack: 'nutrition',
    lunch: 'restaurant',
    afternoon_snack: 'cookie',
    dinner: 'dinner_dining',
    supper: 'nightlight',
    other: 'fastfood',
};

// ============================================================
// Weight API
// ============================================================

export const nutriApi = {
    // Weight
    getWeightLogs: async (limit = 60): Promise<NutriWeightLog[]> => {
        const { data, error } = await supabase
            .from('nutri_weight_logs')
            .select('*')
            .order('date', { ascending: false })
            .limit(limit);
        if (error) { console.error(error); return []; }
        return data || [];
    },

    getTodayWeight: async (): Promise<NutriWeightLog | null> => {
        const today = new Date().toISOString().slice(0, 10);
        const { data } = await supabase
            .from('nutri_weight_logs')
            .select('*')
            .eq('date', today)
            .limit(1)
            .single();
        return data as NutriWeightLog | null;
    },

    saveWeight: async (weight: number): Promise<boolean> => {
        const today = new Date().toISOString().slice(0, 10);
        const now = new Date().toTimeString().slice(0, 8);
        const { error } = await supabase
            .from('nutri_weight_logs')
            .upsert([{ date: today, time: now, weight }], { onConflict: 'date' });
        if (error) { console.error(error); return false; }
        return true;
    },

    // Daily Logs
    getDailyLogs: async (limit = 30): Promise<NutriDailyLog[]> => {
        const { data, error } = await supabase
            .from('nutri_daily_logs')
            .select('*')
            .order('date', { ascending: false })
            .limit(limit);
        if (error) { console.error(error); return []; }
        return data || [];
    },

    getTodayDailyLog: async (): Promise<NutriDailyLog | null> => {
        const today = new Date().toISOString().slice(0, 10);
        const { data } = await supabase
            .from('nutri_daily_logs')
            .select('*')
            .eq('date', today)
            .limit(1)
            .single();
        return data as NutriDailyLog | null;
    },

    saveDailyLog: async (log: Partial<NutriDailyLog>): Promise<boolean> => {
        const today = new Date().toISOString().slice(0, 10);
        const { error } = await supabase
            .from('nutri_daily_logs')
            .upsert([{ ...log, date: today }], { onConflict: 'date' });
        if (error) { console.error(error); return false; }
        return true;
    },

    // Meals
    getMealsForDate: async (date: string): Promise<NutriMeal[]> => {
        const { data, error } = await supabase
            .from('nutri_meals')
            .select('*')
            .eq('date', date)
            .order('created_at', { ascending: true });
        if (error) { console.error(error); return []; }
        return data || [];
    },

    getRecentMeals: async (limit = 60): Promise<NutriMeal[]> => {
        const { data, error } = await supabase
            .from('nutri_meals')
            .select('*')
            .order('date', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error) { console.error(error); return []; }
        return data || [];
    },

    saveMeal: async (meal: Partial<NutriMeal>): Promise<NutriMeal | null> => {
        const { data, error } = await supabase
            .from('nutri_meals')
            .insert([meal])
            .select()
            .single();
        if (error) { console.error(error); return null; }
        return data as NutriMeal;
    },

    // Diet Plan
    getDietPlan: async (): Promise<NutriDietPlan[]> => {
        const { data, error } = await supabase
            .from('nutri_diet_plan')
            .select('*')
            .eq('is_active', true)
            .order('meal_type');
        if (error) { console.error(error); return []; }
        return data || [];
    },

    saveDietPlanItem: async (item: Partial<NutriDietPlan>): Promise<boolean> => {
        if (item.id) {
            const { error } = await supabase.from('nutri_diet_plan').update(item).eq('id', item.id);
            if (error) { console.error(error); return false; }
        } else {
            const { error } = await supabase.from('nutri_diet_plan').insert([item]);
            if (error) { console.error(error); return false; }
        }
        return true;
    },

    deleteDietPlanItem: async (id: string): Promise<boolean> => {
        const { error } = await supabase.from('nutri_diet_plan').delete().eq('id', id);
        if (error) { console.error(error); return false; }
        return true;
    },

    // Photo upload
    uploadMealPhoto: async (file: File): Promise<string | null> => {
        const ext = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage
            .from('nutri-photos')
            .upload(fileName, file, { cacheControl: '3600', upsert: false });
        if (error) { console.error(error); return null; }
        const { data: publicUrl } = supabase.storage.from('nutri-photos').getPublicUrl(fileName);
        return publicUrl.publicUrl;
    },

    // AI Analysis
    analyzeFoodWithAI: async (params: {
        description?: string;
        image_base64?: string;
        meal_id?: string;
    }): Promise<AiFoodAnalysis | null> => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const res = await fetch(`${supabaseUrl}/functions/v1/nutri-analyze-food`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify(params),
        });
        if (!res.ok) return null;
        return await res.json() as AiFoodAnalysis;
    },
};
