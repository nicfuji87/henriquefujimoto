import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Buscar todos os posts publicados
    const { data: posts } = await supabase
        .from('blog_posts')
        .select('slug, updated_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

    const domain = 'https://henriquefujimoto.com.br'; // Altere para seu domínio final
    const lastMod = new Date().toISOString().split('T')[0];

    // 2. Montar o XML do Sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  <url>
    <loc>${domain}/</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${domain}/blog</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;

    // 3. Adicionar cada post do blog dinamicamente
    if (posts) {
        posts.forEach(post => {
            const postDate = new Date(post.updated_at).toISOString().split('T')[0];
            sitemap += `  <url>
    <loc>${domain}/blog/${post.slug}</loc>
    <lastmod>${postDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>\n`;
        });
    }

    sitemap += '</urlset>';

    return new Response(sitemap, {
        headers: {
            ...corsHeaders,
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600'
        },
    });
});
