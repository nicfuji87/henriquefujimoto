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
    // Get the date 30 days ago to focus on recent, trending content
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoff = thirtyDaysAgo.toISOString();

    // First try: recent posts (last 30 days) sorted by engagement
    const { data: recentData, error: recentError } = await supabase
        .from('top_content')
        .select('*')
        .gte('timestamp', cutoff)
        .order('like_count', { ascending: false })
        .limit(8);

    if (!recentError && recentData && recentData.length >= 3) {
        // Sort by a weighted score: likes + comments*3 (comments are harder to get)
        const scored = recentData
            .map(item => ({
                ...item,
                _score: (item.like_count || 0) + (item.comments_count || 0) * 3,
            }))
            .sort((a, b) => b._score - a._score)
            .slice(0, 5);
        return scored as TopContentItem[];
    }

    // Fallback: if fewer than 3 recent posts, use all-time top
    const { data, error } = await supabase
        .from('top_content')
        .select('*')
        .order('like_count', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching top content:', error);
        return [];
    }

    return data as TopContentItem[];
}
