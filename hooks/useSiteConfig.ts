import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type SiteConfig = {
    hero_image: string;
    hero_image_desktop: string;
    hero_video_mobile: string;
    hero_video_desktop: string;
    athlete_name: string;
    tagline: string;
    cta_text: string;
    cta_link: string;
    live_views: string;
};

const defaultConfig: SiteConfig = {
    hero_image: '',
    hero_image_desktop: '',
    hero_video_mobile: '',
    hero_video_desktop: '',
    athlete_name: 'Henrique Fujimoto',
    tagline: 'Judô & Alta Performance',
    cta_text: 'Apoiar o Atleta',
    cta_link: '#',
    live_views: '73.4k',
};

export function useSiteConfig() {
    const [config, setConfig] = useState<SiteConfig>(defaultConfig);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    async function fetchConfig() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('site_config')
                .select('key, value');

            if (error) throw error;

            if (data) {
                const configObj = data.reduce((acc, item) => {
                    acc[item.key as keyof SiteConfig] = item.value;
                    return acc;
                }, {} as SiteConfig);

                setConfig({ ...defaultConfig, ...configObj });
            }
        } catch (err) {
            console.error('Error fetching site config:', err);
            setError(err instanceof Error ? err.message : 'Failed to load config');
        } finally {
            setLoading(false);
        }
    }

    async function updateConfig(key: keyof SiteConfig, value: string) {
        try {
            const { error } = await supabase
                .from('site_config')
                .update({ value })
                .eq('key', key);

            if (error) throw error;

            setConfig(prev => ({ ...prev, [key]: value }));
            return true;
        } catch (err) {
            console.error('Error updating config:', err);
            return false;
        }
    }

    return { config, loading, error, updateConfig, refetch: fetchConfig };
}
