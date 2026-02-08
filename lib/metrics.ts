import { supabase } from './supabase';

export interface DailyMetrics {
    date: string;
    followers_count: number;
    reach_28d: number;
    impressions_28d: number;
    reach_daily: number;
    impressions_daily: number;
    profile_views_daily: number;
    email_contacts: number;
    phone_call_clicks: number;
    website_clicks: number;
    media_count: number;
    audience_city?: Record<string, number>;
    audience_country?: Record<string, number>;
    audience_gender_age?: Record<string, number>;
    audience_locale?: Record<string, number>;
}

export interface AggregatedMetrics {
    total_reach: number;
    total_impressions: number;
    total_interactions: number;
    followers_gained: number;
    reach_growth: number;
    impressions_growth: number;
    interactions_growth: number;
    followers_growth: number;
    audience_city: Record<string, number>;
    audience_gender_age: Record<string, number>;
}

export async function getAggregatedMetrics(days: number): Promise<AggregatedMetrics | null> {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days);

    const previousStartDate = new Date();
    previousStartDate.setDate(today.getDate() - (days * 2));

    const todayStr = today.toISOString().split('T')[0];
    const startDateStr = startDate.toISOString().split('T')[0];
    const previousStatsDateStr = previousStartDate.toISOString().split('T')[0];

    // Fetch current period data
    const { data: currentPeriod, error: currentError } = await supabase
        .from('daily_metrics')
        .select('*')
        .gte('date', startDateStr)
        .lte('date', todayStr)
        .order('date', { ascending: true });

    if (currentError || !currentPeriod) {
        console.error('Error fetching current period metrics:', currentError);
        return null;
    }

    // Fetch previous period data
    const { data: previousPeriod, error: previousError } = await supabase
        .from('daily_metrics')
        .select('*')
        .gte('date', previousStatsDateStr)
        .lt('date', startDateStr)
        .order('date', { ascending: true });

    if (previousError) {
        console.error('Error fetching previous period metrics:', previousError);
    }

    // Calculate Aggregates
    const sum = (arr: any[], key: string) => arr.reduce((acc, curr) => acc + (curr[key] || 0), 0);

    const currentReach = sum(currentPeriod, 'reach_daily');
    const currentImpressions = sum(currentPeriod, 'impressions_daily');
    // Interactions: profile_views + clicks
    const currentInteractions = currentPeriod.reduce((acc, curr) => {
        return acc + (curr.profile_views_daily || 0) +
            (curr.email_contacts || 0) +
            (curr.website_clicks || 0) +
            (curr.phone_call_clicks || 0) +
            (curr.text_message_clicks || 0) +
            (curr.get_directions_clicks || 0);
    }, 0);

    // Followers Gained: (Last Day Followers - First Day Followers)
    // If we have data for the period.
    let currentFollowersGained = 0;
    if (currentPeriod.length > 0) {
        const first = currentPeriod[0].followers_count;
        const last = currentPeriod[currentPeriod.length - 1].followers_count;
        currentFollowersGained = last - first; // Simple calc. Logic: gain over the period.
        // Or sum up 'new_followers' if we had that column. But we only have total count snapshots.
        // So Last - First is correct for net change.
    }

    // Previous Period aggregates
    const prevReach = previousPeriod ? sum(previousPeriod, 'reach_daily') : 0;
    const prevImpressions = previousPeriod ? sum(previousPeriod, 'impressions_daily') : 0;
    const prevInteractions = previousPeriod ? previousPeriod.reduce((acc, curr) => {
        return acc + (curr.profile_views_daily || 0) +
            (curr.email_contacts || 0) +
            (curr.website_clicks || 0) +
            (curr.phone_call_clicks || 0) +
            (curr.text_message_clicks || 0) +
            (curr.get_directions_clicks || 0);
    }, 0) : 0;

    let prevFollowersGained = 0;
    if (previousPeriod && previousPeriod.length > 0) {
        const first = previousPeriod[0].followers_count;
        const last = previousPeriod[previousPeriod.length - 1].followers_count;
        prevFollowersGained = last - first;
    }

    // Growth rates
    const calcGrowth = (curr: number, prev: number) => prev === 0 ? 0 : ((curr - prev) / prev) * 100;

    // Latest Audience Snapshot (from the most recent record available)
    // We can query explicitly for the absolute latest record just to be sure we get the newest snapshot
    const { data: latestRecord } = await supabase
        .from('daily_metrics')
        .select('audience_city, audience_gender_age')
        .order('date', { ascending: false })
        .limit(1)
        .single();

    const audience_city = latestRecord?.audience_city || {};
    const audience_gender_age = latestRecord?.audience_gender_age || {};

    return {
        total_reach: currentReach,
        total_impressions: currentImpressions,
        total_interactions: currentInteractions,
        followers_gained: currentFollowersGained,
        reach_growth: calcGrowth(currentReach, prevReach),
        impressions_growth: calcGrowth(currentImpressions, prevImpressions),
        interactions_growth: calcGrowth(currentInteractions, prevInteractions),
        followers_growth: calcGrowth(currentFollowersGained, prevFollowersGained),
        audience_city,
        audience_gender_age
    };
}
