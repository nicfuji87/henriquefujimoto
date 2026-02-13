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
        const { url, text, type } = await req.json();

        // Determinar o conteúdo base
        let baseContent = '';
        let sourceLabel = '';

        if (type === 'text' || text) {
            // Modo Texto Direto (Rascunho)
            if (!text || typeof text !== 'string') {
                return new Response(
                    JSON.stringify({ error: 'Texto é obrigatório para geração manual' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }
            baseContent = text;
            sourceLabel = 'Rascunho/Ideia original do usuário';

        } else if (url) {
            // Modo URL (Notícia/Artigo Externo)
            sourceLabel = `URL de referência: ${url}`;
            try {
                const pageResponse = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; blog-generator/1.0)',
                        'Accept': 'text/html,application/xhtml+xml',
                    },
                });
                const html = await pageResponse.text();

                // Extract text content from HTML (strip tags simpler version)
                baseContent = html
                    .replace(/<script[\s\S]*?<\/script>/gi, '')
                    .replace(/<style[\s\S]*?<\/style>/gi, '')
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .slice(0, 12000);
            } catch (fetchError) {
                console.error('Error fetching URL:', fetchError);
                return new Response(
                    JSON.stringify({ error: `Erro ao buscar URL: ${fetchError.message}` }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }
        } else {
            return new Response(
                JSON.stringify({ error: 'Forneça uma URL ou texto para gerar o post' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 2. Call OpenAI to generate blog post
        const openaiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openaiKey) {
            return new Response(
                JSON.stringify({ error: 'OPENAI_API_KEY não configurada' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const systemPrompt = `Você é um editor-chefe de blog profissional e especialista em SEO para o atleta de judô Henrique Fujimoto.
Seu trabalho é pegar um conteúdo bruto (rascunho, ideia ou notícia) e transformá-lo em um artigo de blog de ALTO NÍVEL.

CONTEXTO:
- Henrique é um atleta Sub-15 faixa amarela, federado.
- Foco: Jornada para a faixa preta, superação, treinos, competições e vida saudável.
- Tom de voz: Inspirador, resiliente, educado, mas com energia de atleta.

REGRAS DE FORMATAÇÃO:
- Use Markdown avançado.
- Título H1 não precisa colocar no corpo (já vai no campo title), comece com uma introdução forte.
- Use H2 (##) para seções principais e H3 (###) para subseções.
- Use **negrito** para palavras-chave e frases de impacto.
- Use listas (bullets ou numeradas) para facilitar a leitura.
- Parágrafos curtos (máx 3-4 linhas) para leitura mobile.

REGRAS DE SEO:
- Foque em uma palavra-chave principal.
- Inclua termos relacionados semanticamente.
- O texto deve ter entre 600 a 1200 palavras (se o input permitir).

ESTRUTURA DE RETORNO (JSON OBRIGATÓRIO):
{
    "title": "Título H1 Irresistível (máx 60 chars, SEO forte)",
    "excerpt": "Resumo magnético para o card do blog (140-160 chars)",
    "content": "Conteúdo completo em Markdown...",
    "meta_title": "Título SEO para o Google (focado na keyword)",
    "meta_description": "Descrição SEO para o Google (com CTA e keyword)",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
    "category": "judô|treino|competição|vida-de-atleta|notícias|geral"
}`;

        const userPrompt = `Transforme este conteúdo base em um post de blog incrível:

ORIGEM: ${sourceLabel}

CONTEÚDO BASE:
${baseContent.slice(0, 15000)}

Gere o JSON completo.`;

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
            throw new Error(`OpenAI API Error: ${openaiResponse.status}`);
        }

        const openaiData = await openaiResponse.json();
        const generatedContent = openaiData.choices?.[0]?.message?.content;

        return new Response(generatedContent, {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Erro interno no servidor' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
