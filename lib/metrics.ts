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
    total_followers: number;
    reach_growth: number;
    impressions_growth: number;
    interactions_growth: number;
    followers_growth: number;
    audience_city: Record<string, number>;
    audience_gender_age: Record<string, number>;
    audience_country: Record<string, number>;
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

    // reach_daily = reach diário real da API
    const currentReach = sum(currentPeriod, 'reach_daily');
    // impressions_daily na verdade armazena total_interactions da API
    // Usamos como "Interações" no dashboard
    const currentInteractions = sum(currentPeriod, 'impressions_daily');
    // Impressões: usamos o reach_28d mais recente do período como visão rolling
    const latestInPeriod = currentPeriod.length > 0 ? currentPeriod[currentPeriod.length - 1] : null;
    const currentImpressions = latestInPeriod?.reach_28d || 0;

    // Followers Gained: (Last Day Followers - First Day Followers)
    let currentFollowersGained = 0;
    let totalFollowers = 0;
    if (currentPeriod.length > 0) {
        const first = currentPeriod[0].followers_count;
        const last = currentPeriod[currentPeriod.length - 1].followers_count;
        currentFollowersGained = last - first;
        totalFollowers = last;
    }

    // Previous Period aggregates
    const prevReach = previousPeriod ? sum(previousPeriod, 'reach_daily') : 0;
    const prevInteractions = previousPeriod ? sum(previousPeriod, 'impressions_daily') : 0;
    const prevLatest = previousPeriod && previousPeriod.length > 0 ? previousPeriod[previousPeriod.length - 1] : null;
    const prevImpressions = prevLatest?.reach_28d || 0;

    let prevFollowersGained = 0;
    if (previousPeriod && previousPeriod.length > 0) {
        const first = previousPeriod[0].followers_count;
        const last = previousPeriod[previousPeriod.length - 1].followers_count;
        prevFollowersGained = last - first;
    }

    // Growth rates
    const calcGrowth = (curr: number, prev: number) => prev === 0 ? 0 : ((curr - prev) / prev) * 100;

    // Latest Audience Snapshot (from the most recent record available)
    const { data: latestRecord } = await supabase
        .from('daily_metrics')
        .select('audience_city, audience_gender_age, audience_country')
        .order('date', { ascending: false })
        .limit(1)
        .single();

    // Convert new API format: array [{value, dimension_values}] → Record<string, number>
    const convertBreakdownToRecord = (data: any): Record<string, number> => {
        if (!data) return {};
        // If it's already a simple Record<string, number> (old format)
        if (typeof data === 'object' && !Array.isArray(data) && Object.values(data).every(v => typeof v === 'number')) {
            return data;
        }
        // New API format: array of {value, dimension_values: [key]}
        if (Array.isArray(data)) {
            const result: Record<string, number> = {};
            for (const item of data) {
                if (item.dimension_values && item.value) {
                    result[item.dimension_values.join(', ')] = item.value;
                }
            }
            return result;
        }
        return {};
    };

    const audience_city = convertBreakdownToRecord(latestRecord?.audience_city);
    const audience_gender_age = convertBreakdownToRecord(latestRecord?.audience_gender_age);
    const audience_country = convertBreakdownToRecord(latestRecord?.audience_country);

    return {
        total_reach: currentReach,
        total_impressions: currentImpressions,
        total_interactions: currentInteractions,
        followers_gained: currentFollowersGained,
        total_followers: totalFollowers,
        reach_growth: calcGrowth(currentReach, prevReach),
        impressions_growth: calcGrowth(currentImpressions, prevImpressions),
        interactions_growth: calcGrowth(currentInteractions, prevInteractions),
        followers_growth: calcGrowth(currentFollowersGained, prevFollowersGained),
        audience_city,
        audience_gender_age,
        audience_country
    };
}

export interface MediaKitMetrics {
    monthsOfData: number;
    isFullYear: boolean;         // true when we actually have ~12 months of data
    monthlyAvgReach: number;
    annualReach: number;         // real 12-month sum if full year, else projection (monthly avg × 12)
    monthlyAvgInteractions: number;
    annualInteractions: number;
    totalFollowers: number;
    monthlyFollowerGain: number;      // avg new followers per month (real trend)
    projectedFollowers12mo: number;   // current + monthly gain × 12
}

/**
 * Metrics tailored for the partnership media kit: monthly average + annual figure.
 * When less than a full year of daily data exists, the "annual" number is a
 * projection based on the monthly average (isFullYear=false) — the UI labels it as such.
 */
export async function getMediaKitMetrics(): Promise<MediaKitMetrics | null> {
    const start = new Date();
    start.setDate(start.getDate() - 365);
    const startStr = start.toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('daily_metrics')
        .select('reach_daily, impressions_daily, followers_count')
        .gte('date', startStr)
        .order('date', { ascending: true });

    if (error || !data || data.length === 0) return null;

    const days = data.length;
    const months = days / 30.44;
    const totalReach = data.reduce((s, d) => s + (d.reach_daily || 0), 0);
    // impressions_daily actually stores total interactions (see getAggregatedMetrics)
    const totalInteractions = data.reduce((s, d) => s + (d.impressions_daily || 0), 0);
    const monthlyAvgReach = months > 0 ? totalReach / months : 0;
    const monthlyAvgInteractions = months > 0 ? totalInteractions / months : 0;
    const isFullYear = months >= 11.5;

    // Follower growth trend (linear): followers DO grow steadily, unlike reach.
    const followerVals = data.map(d => d.followers_count || 0).filter(v => v > 0);
    const firstF = followerVals[0] || 0;
    const totalFollowers = followerVals[followerVals.length - 1] || 0;
    const monthlyFollowerGain = months > 0 ? Math.max(0, Math.round((totalFollowers - firstF) / months)) : 0;
    const projectedFollowers12mo = totalFollowers + monthlyFollowerGain * 12;

    return {
        monthsOfData: months,
        isFullYear,
        monthlyAvgReach: Math.round(monthlyAvgReach),
        annualReach: Math.round(isFullYear ? totalReach : monthlyAvgReach * 12),
        monthlyAvgInteractions: Math.round(monthlyAvgInteractions),
        annualInteractions: Math.round(isFullYear ? totalInteractions : monthlyAvgInteractions * 12),
        totalFollowers,
        monthlyFollowerGain,
        projectedFollowers12mo,
    };
}
