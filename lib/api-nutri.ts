import { supabase } from './supabase';
import imageCompression from 'browser-image-compression';

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
    sleep_date_bedtime: string | null;
    sleep_date_waketime: string | null;
    sleep_hours: number | null;
    energy_level: number | null;
    bowel_occurred: boolean;
    bowel_type: string | null;
    bowel_notes: string | null;
    diet_followed: boolean;
    notes: string | null;
    created_at: string;
}

export interface NutriHydrationLog {
    id: string;
    date: string;
    time: string;
    drink_type: string;
    amount_ml: number;
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
    satiety: string | null;
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

export const DRINK_TYPES: Record<string, string> = {
    water: 'Água',
    electrolyte: 'Eletrólito',
    juice: 'Suco',
    tea: 'Chá',
    coffee: 'Café',
    milk: 'Leite',
    sports_drink: 'Isotônico',
    other: 'Outro',
};

export const DRINK_ICONS: Record<string, string> = {
    water: 'water_drop',
    electrolyte: 'bolt',
    juice: 'local_bar',
    tea: 'emoji_food_beverage',
    coffee: 'coffee',
    milk: 'water_full',
    sports_drink: 'sports_bar',
    other: 'local_drink',
};

export const DRINK_COLORS: Record<string, string> = {
    water: '#38bdf8',
    electrolyte: '#34d399',
    juice: '#fb923c',
    tea: '#a3e635',
    coffee: '#a78bfa',
    milk: '#f9fafb',
    sports_drink: '#f472b6',
    other: '#94a3b8',
};

export const BOWEL_TYPES: Record<string, { label: string; icon: string; desc: string }> = {
    normal: { label: 'Normal', icon: '✅', desc: 'Formato e consistência normais' },
    bolinha: { label: 'Bolinha', icon: '🔴', desc: 'Pequenas bolinhas, duras, ressecadas' },
    pastoso: { label: 'Pastoso', icon: '🟡', desc: 'Mole, sem forma definida' },
    liquido: { label: 'Líquido', icon: '🟠', desc: 'Aquoso, diarréia' },
    ressecado: { label: 'Ressecado', icon: '🟤', desc: 'Duro, com esforço' },
    misto: { label: 'Misto', icon: '🔵', desc: 'Combinação de tipos' },
};

export const SATIETY_LEVELS: Record<string, { label: string; icon: string }> = {
    very_hungry: { label: 'Muita fome', icon: '😫' },
    hungry: { label: 'Fome', icon: '😕' },
    satisfied: { label: 'Na medida', icon: '😊' },
    full: { label: 'Cheio', icon: '😮‍💨' },
    very_full: { label: 'Muito cheio', icon: '🤢' },
};

// ============================================================
// API
// ============================================================

export const nutriApi = {
    // Weight
    getWeightLogs: async (limit = 60): Promise<NutriWeightLog[]> => {
        const { data, error } = await supabase
            .from('nutri_weight_logs')
            .select('*')
            .order('date', { ascending: false })
            .order('time', { ascending: false })
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
            .order('time', { ascending: false })
            .limit(1)
            .single();
        return data as NutriWeightLog | null;
    },

    saveWeight: async (date: string, time: string, weight: number): Promise<boolean> => {
        const { error } = await supabase
            .from('nutri_weight_logs')
            .insert([{ date, time, weight }]);
        if (error) { console.error(error); return false; }
        return true;
    },

    deleteWeight: async (id: string): Promise<boolean> => {
        const { error } = await supabase.from('nutri_weight_logs').delete().eq('id', id);
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
        const date = log.date || new Date().toISOString().slice(0, 10);
        const { error } = await supabase
            .from('nutri_daily_logs')
            .upsert([{ ...log, date }], { onConflict: 'date' });
        if (error) { console.error(error); return false; }
        return true;
    },

    // Hydration
    getHydrationForDate: async (date: string): Promise<NutriHydrationLog[]> => {
        const { data, error } = await supabase
            .from('nutri_hydration_logs')
            .select('*')
            .eq('date', date)
            .order('time', { ascending: true })
            .order('created_at', { ascending: true });
        if (error) { console.error(error); return []; }
        return data || [];
    },

    getRecentHydration: async (limit = 200): Promise<NutriHydrationLog[]> => {
        const { data, error } = await supabase
            .from('nutri_hydration_logs')
            .select('*')
            .order('date', { ascending: false })
            .order('time', { ascending: false })
            .limit(limit);
        if (error) { console.error(error); return []; }
        return data || [];
    },

    saveHydration: async (entry: Partial<NutriHydrationLog>): Promise<boolean> => {
        const { error } = await supabase
            .from('nutri_hydration_logs')
            .insert([entry]);
        if (error) { console.error(error); return false; }
        return true;
    },

    deleteHydration: async (id: string): Promise<boolean> => {
        const { error } = await supabase.from('nutri_hydration_logs').delete().eq('id', id);
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
        try {
            const options = {
                maxSizeMB: 0.2, // Compress to max ~200KB
                maxWidthOrHeight: 1200,
                useWebWorker: true
            };
            const compressedFile = await imageCompression(file, options);
            
            const ext = compressedFile.name.split('.').pop() || 'jpg';
            const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
            const { error } = await supabase.storage
                .from('nutri-photos')
                .upload(fileName, compressedFile, { cacheControl: '31536000', upsert: false }); // Cache strong
            if (error) { console.error(error); return null; }
            const { data: publicUrl } = supabase.storage.from('nutri-photos').getPublicUrl(fileName);
            return publicUrl.publicUrl;
        } catch (error) {
            console.error('Compression or upload error:', error);
            return null;
        }
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
