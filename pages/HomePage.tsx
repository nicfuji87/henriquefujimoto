import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import PublicHeader from '../components/PublicHeader';
import HomeHero from '../components/home/HomeHero';
import BeyondTatame from '../components/home/BeyondTatame';
import StorySection from '../components/home/StorySection';
import type { StoryFact } from '../components/home/StorySection';
import FollowJourney from '../components/home/FollowJourney';
import ProofSection from '../components/home/ProofSection';
import AchievementsSection from '../components/home/AchievementsSection';
import SponsorsStrip from '../components/home/SponsorsStrip';
import HowToSupportSection from '../components/home/HowToSupportSection';
import ProductsSection from '../components/home/ProductsSection';
import BlogTeaser from '../components/home/BlogTeaser';
import ClosingCTA from '../components/home/ClosingCTA';
import StickyApoiar from '../components/home/StickyApoiar';
import { trackPageView } from '../lib/pageTracking';
import { getAggregatedMetrics } from '../lib/metrics';
import type { AggregatedMetrics } from '../lib/metrics';
import { supabase } from '../lib/supabase';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { ageFromBirth } from '../components/home/utils';

interface Partner {
    id: string;
    name: string;
    logo_url: string | null;
}

interface AthleteProfile {
    milestones: { media_items?: { url: string; type: string }[]; media_url?: string }[] | null;
    birth_date: string | null;
    weight: string | number | null;
    category: string | null;
    belt: string | null;
}

export default function HomePage() {
    const { config } = useSiteConfig();
    const [metrics, setMetrics] = useState<AggregatedMetrics | null>(null);
    const [metricsLoading, setMetricsLoading] = useState(true);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [profile, setProfile] = useState<AthleteProfile | null>(null);

    useEffect(() => {
        trackPageView('/', 'Hub Principal');

        async function load() {
            const [metricsData, partnersRes, profileRes] = await Promise.all([
                getAggregatedMetrics(30),
                supabase.from('partners').select('id, name, logo_url').eq('is_active', true).order('display_order', { ascending: true }),
                supabase.from('athlete_profile').select('milestones, birth_date, weight, category, belt').limit(1).maybeSingle(),
            ]);

            setMetrics(metricsData);
            setMetricsLoading(false);
            setPartners(partnersRes.data || []);
            setProfile(profileRes.data as AthleteProfile | null);
        }

        load();
    }, []);

    // ---- Dados derivados, sempre verificaveis ----
    const age = ageFromBirth(profile?.birth_date);
    const category = profile?.category || 'Sub-15';
    const weightKg = profile?.weight != null ? `${String(profile.weight).replace('.', ',')}kg` : null;

    const storyFacts: StoryFact[] = [
        age ? { label: 'Anos', value: `${age}` } : null,
        profile?.belt ? { label: 'Faixa', value: profile.belt } : null,
        { label: 'Base', value: 'Brasília' },
        weightKg ? { label: 'Peso', value: weightKg } : null,
        { label: 'Categoria', value: category },
    ].filter(Boolean) as StoryFact[];

    // Fotos reais dos marcos da trajetoria, na ordem em que foram cadastradas.
    // Sao as unicas imagens do atleta usadas fora do hero — nada de banco de imagens.
    const milestonePhotos = (profile?.milestones || [])
        .map((m) => m.media_items?.[0]?.url || m.media_url || null)
        .filter(Boolean) as string[];

    const fallbackPhoto = config.hero_image_desktop || config.hero_image || null;
    const portrait = milestonePhotos[0] || fallbackPhoto;
    const bandPhotos = [milestonePhotos[1] || fallbackPhoto, milestonePhotos[2] || milestonePhotos[0] || fallbackPhoto];
    const closingPhoto = milestonePhotos[milestonePhotos.length - 1] || fallbackPhoto;

    return (
        <main className="relative min-h-screen w-full overflow-x-hidden bg-hf-navy font-ui text-hf-ice">
            <PublicHeader variant="overlay" />

            <HomeHero age={age} category={category} />

            <BeyondTatame photos={bandPhotos} />

            <AchievementsSection />

            <StorySection portrait={portrait} facts={storyFacts} />

            <FollowJourney />

            <BlogTeaser />

            <ProofSection metrics={metrics} loading={metricsLoading} />

            <SponsorsStrip partners={partners} />

            <HowToSupportSection ctaLink={config.cta_link} />

            <ProductsSection />

            <ClosingCTA ctaLink={config.cta_link} photo={closingPhoto} />

            <Footer />
            <StickyApoiar ctaLink={config.cta_link} />
        </main>
    );
}