import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { url } = await req.json();

        if (!url || typeof url !== 'string') {
            return new Response(
                JSON.stringify({ error: 'URL é obrigatória' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 1. Fetch page content
        let pageContent = '';
        try {
            const pageResponse = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; blog-generator/1.0)',
                    'Accept': 'text/html,application/xhtml+xml',
                },
            });
            const html = await pageResponse.text();

            // Extract text content from HTML (strip tags)
            pageContent = html
                .replace(/<script[\s\S]*?<\/script>/gi, '')
                .replace(/<style[\s\S]*?<\/style>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 8000); // Limit to avoid token overflow
        } catch (fetchError) {
            console.error('Error fetching URL:', fetchError);
            pageContent = `URL: ${url} (não foi possível extrair o conteúdo automaticamente)`;
        }

        // 2. Call OpenAI to generate blog post
        const openaiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openaiKey) {
            return new Response(
                JSON.stringify({ error: 'OPENAI_API_KEY não configurada no Supabase Secrets' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const systemPrompt = `Você é um redator de blog profissional especializado em SEO para o atleta de judô Henrique Fujimoto.

Seu trabalho é transformar conteúdo de referência em posts de blog originais, informativos e otimizados para mecanismos de busca.

REGRAS:
- Escreva em português brasileiro
- Tom: profissional mas acessível, inspirador
- Sempre em primeira pessoa quando mencionar o Henrique, ou em terceira se for notícia
- Otimize para SEO: use headers H2, parágrafos curtos, palavras-chave naturalmente distribuídas
- Inclua um parágrafo de introdução cativante
- Termine com um call-to-action (convidar a acompanhar, seguir, apoiar)
- O conteúdo deve ter pelo menos 800 palavras
- Use formatação Markdown: ## para subtítulos, **negrito** para ênfase, listas quando apropriado

RETORNE um JSON válido com exatamente esta estrutura:
{
    "title": "Título do post (máx 70 chars, SEO otimizado)",
    "excerpt": "Resumo do post (1-2 frases, 100-160 chars)",
    "content": "Conteúdo completo em Markdown",
    "meta_title": "Título SEO (30-60 chars, com keyword principal)",
    "meta_description": "Descrição para Google (120-155 chars, com CTA)",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
    "category": "judô|treino|competição|nutrição|vida-de-atleta|notícias|geral"
}`;

        const userPrompt = `Com base no conteúdo abaixo, escreva um post de blog completo e otimizado para SEO.

URL de referência: ${url}

Conteúdo extraído:
${pageContent}

Gere o post em formato JSON conforme instruído.`;

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                temperature: 0.7,
                max_tokens: 4000,
                response_format: { type: 'json_object' },
            }),
        });

        if (!openaiResponse.ok) {
            const errText = await openaiResponse.text();
            console.error('OpenAI error:', errText);
            return new Response(
                JSON.stringify({ error: `Erro na API OpenAI: ${openaiResponse.status}` }),
                { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const openaiData = await openaiResponse.json();
        const generatedContent = openaiData.choices?.[0]?.message?.content;

        if (!generatedContent) {
            return new Response(
                JSON.stringify({ error: 'A IA não retornou conteúdo' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const parsedContent = JSON.parse(generatedContent);

        return new Response(
            JSON.stringify(parsedContent),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Erro interno' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
