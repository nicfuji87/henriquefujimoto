import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * Lê o texto de um cronograma de avaliações (PDF da escola) e devolve as provas
 * estruturadas para o módulo Escola. Não grava nada: quem confirma é a professora,
 * na tela de revisão.
 */
Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { text, reference_year, subjects } = await req.json();

        if (!text || typeof text !== 'string' || text.trim().length < 40) {
            return new Response(
                JSON.stringify({ error: 'Não consegui ler texto suficiente no PDF. Ele pode ser um documento escaneado (imagem).' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const openaiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openaiKey) {
            return new Response(
                JSON.stringify({ error: 'OPENAI_API_KEY não configurada' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const year = Number(reference_year) || new Date().getFullYear();
        const subjectNames: string[] = Array.isArray(subjects)
            ? subjects.map((s: { name: string }) => s.name)
            : [];

        const systemPrompt = `Você extrai o calendário de avaliações de documentos escolares brasileiros.

Devolva SOMENTE um JSON no formato:
{
  "term": "rótulo do período letivo como aparece no documento, ex.: '2º Trimestre'",
  "grade_level": "ano/série, ex.: '7º ano', ou null",
  "exams": [
    {
      "subject_raw": "nome da matéria exatamente como aparece no documento",
      "subject_match": "um nome da LISTA DE MATÉRIAS que corresponda, ou null se nenhum servir",
      "title": "título curto da avaliação, ex.: 'Globalizante de Matemática'",
      "date": "AAAA-MM-DD",
      "weekday_in_document": "dia da semana como escrito no documento, ou null",
      "time_slot": "horário/aula como escrito, ex.: '4.º ao 6.º horário', ou null",
      "kind": "globalizante | parcial | prova | trabalho | simulado | apresentacao",
      "content": "conteúdos cobrados e materiais de estudo, em tópicos com '- ', preservando capítulos e páginas",
      "confidence": "alta | media | baixa"
    }
  ]
}

REGRAS
- Uma entrada por avaliação/matéria. Não invente avaliações que não estejam no texto.
- Datas no documento costumam vir como "12/8" ou "12/08". Use o ano ${year} para montar a data ISO.
- "Avaliação Globalizante" => kind "globalizante". "Parcial" => "parcial".
- Em content, junte CONTEÚDOS e MATERIAIS DE ESTUDO. Se a matéria tiver vários níveis
  (BRIDGING, MS1, MS2, MS3...), inclua todos, cada um com seu subtítulo.
- Não resuma demais: capítulos, unidades e páginas são o que o aluno usa para estudar.
- confidence "baixa" quando a data ou a matéria estiverem ambíguas.
- Responda em português do Brasil.

LISTA DE MATÉRIAS já cadastradas (use exatamente estes nomes em subject_match):
${subjectNames.length ? subjectNames.join(', ') : '(nenhuma)'}`;

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
                    { role: 'user', content: `Documento:\n\n${text.slice(0, 60000)}\n\nExtraia o JSON.` },
                ],
                temperature: 0,
                max_tokens: 8000,
                response_format: { type: 'json_object' },
            }),
        });

        if (!openaiResponse.ok) {
            const errText = await openaiResponse.text();
            console.error('OpenAI error:', errText);
            throw new Error(`OpenAI API Error: ${openaiResponse.status}`);
        }

        const openaiData = await openaiResponse.json();
        const raw = openaiData.choices?.[0]?.message?.content;
        if (!raw) throw new Error('A IA não devolveu conteúdo.');

        const parsed = JSON.parse(raw);
        const exams = Array.isArray(parsed.exams) ? parsed.exams : [];

        // Confere se o dia da semana escrito no documento bate com a data montada.
        const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
        const normalize = (s: string) =>
            s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

        for (const exam of exams) {
            exam.warnings = [];

            // O modelo às vezes devolve os tópicos como lista em vez de texto corrido.
            if (Array.isArray(exam.content)) exam.content = exam.content.join('\n');
            if (exam.content && typeof exam.content !== 'string') exam.content = String(exam.content);

            if (!exam.date || !/^\d{4}-\d{2}-\d{2}$/.test(exam.date)) {
                exam.warnings.push('Data não reconhecida — confira antes de salvar.');
                continue;
            }
            if (exam.weekday_in_document) {
                const [y, m, d] = exam.date.split('-').map(Number);
                const expected = WEEKDAYS[new Date(y, m - 1, d).getDay()];
                if (!normalize(exam.weekday_in_document).includes(normalize(expected))) {
                    exam.warnings.push(
                        `O documento diz ${exam.weekday_in_document}, mas ${d}/${m}/${y} cai em ${expected}-feira. Confira o ano.`
                    );
                }
            }
        }

        return new Response(
            JSON.stringify({ term: parsed.term || null, grade_level: parsed.grade_level || null, exams }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error:', error);
        return new Response(
            JSON.stringify({ error: (error as Error).message || 'Erro interno no servidor' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
