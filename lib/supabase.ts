import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: 'tournament' | 'training' | 'tips' | 'news';
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type BioConfig = {
  id: string;
  athlete_name: string;
  tagline: string;
  profile_image: string;
  background_image: string;
  instagram_followers: string;
  total_views: string;
  engagement_rate: string;
  cta_text: string;
  cta_link: string;
  sponsors: {
    name: string;
    logo: string;
  }[];
  highlights: {
    title: string;
    thumbnail: string;
    views: string;
    platform: string;
  }[];
};
