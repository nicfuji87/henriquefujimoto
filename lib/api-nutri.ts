import { supabase } from './supabase';

export interface NutriLog {
    id: string;
    date: string;
    time: string;
    weight: number;
    water_ml: number;
    sleep_hours: number | null;
    sleep_quality: string | null;
    energy_level: number | null;
    diet_followed: boolean;
    bowel_movement: number | null;
    notes: string | null;
    created_at: string;
}

export async function fetchNutriLogs(limit = 30): Promise<NutriLog[]> {
    const { data, error } = await supabase
        .from('nutri_logs')
        .select('*')
        .order('date', { ascending: false })
        .order('time', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching nutri logs:', error);
        return [];
    }
    return data || [];
}

export async function insertNutriLog(log: Omit<NutriLog, 'id' | 'created_at'>): Promise<boolean> {
    const { error } = await supabase
        .from('nutri_logs')
        .insert([log]);

    if (error) {
        console.error('Error inserting nutri log:', error);
        return false;
    }
    return true;
}
