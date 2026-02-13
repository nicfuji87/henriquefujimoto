import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações (Substitua se necessário, mas peguei do seu projeto)
const SUPABASE_URL = 'https://pxremkvxoybqxfmxdyfc.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Precisa ser a service role para build
const DOMAIN = 'https://www.henriquefujimoto.com.br';

async function generateSitemap() {
    console.log('🚀 Gerando sitemap.xml...');

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // 1. Buscar posts
    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('slug, updated_at')
        .eq('status', 'published');

    if (error) {
        console.error('❌ Erro ao buscar posts:', error);
        return;
    }

    const lastMod = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${DOMAIN}/</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${DOMAIN}/blog</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;

    posts?.forEach((post) => {
        const postDate = new Date(post.updated_at).toISOString().split('T')[0];
        xml += `  <url>
    <loc>${DOMAIN}/blog/${post.slug}</loc>
    <lastmod>${postDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>\n`;
    });

    xml += '</urlset>';

    const publicPath = path.resolve(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(publicPath, xml);

    console.log(`✅ Sitemap gerado com sucesso em: ${publicPath}`);
}

// Para agora, vamos criar um sitemap estático inicial se não tivermos a KEY no ambiente de terminal
const generateStaticBase = () => {
    const lastMod = new Date().toISOString().split('T')[0];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${DOMAIN}/</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${DOMAIN}/blog</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
    const publicPath = path.resolve(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(publicPath, xml);
};

if (SUPABASE_KEY) {
    generateSitemap();
} else {
    console.log('⚠️ Service Role Key não encontrada. Gerando sitemap base estático...');
    generateStaticBase();
}
