import { supabase } from './supabase';

export interface TopContentItem {
    id: string;
    media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
    media_url: string;
    thumbnail_url: string;
    caption: string;
    permalink: string;
    like_count: number;
    comments_count: number;
    timestamp: string;
}

export async function getTopContent() {
    const { data, error } = await supabase
        .from('top_content')
        .select('*')
        // A simple heuristic for "Viral": likes + comments * 2 (comments are harder to get)
        // Or just sort by total engagement
        .order('like_count', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching top content:', error);
        return [];
    }

    return data as TopContentItem[];
}
