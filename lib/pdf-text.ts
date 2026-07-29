/**
 * Extrai o texto de um PDF no próprio navegador.
 *
 * O pdf.js entra por import dinâmico para não pesar no bundle de quem nunca
 * abre a importação de provas. Só funciona com PDF de texto — documento
 * escaneado (imagem) volta vazio, e quem chama avisa o usuário.
 *
 * Documento de escola costuma vir em duas colunas (conteúdos de um lado,
 * materiais de estudo do outro), com títulos e parágrafos ocupando a largura
 * toda. Ler linha a linha embaralharia as colunas, então cada linha é
 * classificada como coluna esquerda, coluna direita ou largura total, e as
 * colunas são despejadas em ordem a cada linha de largura total.
 */

interface Fragment {
    x: number;
    right: number;
    y: number;
    text: string;
}

interface Row {
    frags: Fragment[];
}

/** Agrupa fragmentos em linhas pela coordenada vertical (o PDF conta o Y de baixo para cima). */
function groupRows(fragments: Fragment[]): Row[] {
    const map = new Map<number, Fragment[]>();
    for (const f of fragments) {
        const key = Math.round(f.y / 3);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(f);
    }
    return [...map.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([, frags]) => ({ frags: frags.sort((a, b) => a.x - b.x) }));
}

const joinFrags = (frags: Fragment[]): string =>
    frags.map(f => f.text).join(' ').replace(/\s+/g, ' ').trim();

/**
 * A linha ocupa a largura toda? É o caso quando o texto passa pelo meio da
 * página sem interrupção — título de matéria, data, parágrafo de objetivo.
 */
function isFullWidth(row: Row, gutter: number): boolean {
    const f = row.frags;
    for (let i = 0; i < f.length; i++) {
        if (f[i].x < gutter && f[i].right > gutter) return true;
        const next = f[i + 1];
        if (next && f[i].right <= gutter && next.x >= gutter && next.x - f[i].right < 24) return true;
    }
    return false;
}

/**
 * Procura a faixa vertical no meio da página menos atravessada por texto — o vão
 * entre as colunas. Devolve null quando a página é de coluna única.
 */
function findGutter(fragments: Fragment[], pageWidth: number): number | null {
    const from = pageWidth * 0.38;
    const to = pageWidth * 0.62;
    const steps = 24;

    let best: { x: number; crossing: number } | null = null;
    for (let i = 0; i <= steps; i++) {
        const candidate = from + ((to - from) * i) / steps;
        const crossing = fragments.filter(f => f.x < candidate && f.right > candidate).length;
        const left = fragments.filter(f => f.right <= candidate).length;
        const right = fragments.filter(f => f.x >= candidate).length;
        if (left < 8 || right < 8) continue;
        if (!best || crossing < best.crossing) best = { x: candidate, crossing };
    }

    if (!best || best.crossing > fragments.length * 0.25) return null;
    return best.x;
}

export async function extractPdfText(file: File): Promise<string> {
    const pdfjs = await import('pdfjs-dist');
    const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

    const data = await file.arrayBuffer();
    const doc = await pdfjs.getDocument({ data }).promise;

    const pages: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const pageWidth = page.getViewport({ scale: 1 }).width;
        const content = await page.getTextContent();

        const fragments: Fragment[] = [];
        for (const item of content.items) {
            if (!('str' in item) || !item.str?.trim()) continue;
            const x = item.transform?.[4] ?? 0;
            fragments.push({
                x,
                right: x + (item.width ?? 0),
                y: item.transform?.[5] ?? 0,
                text: item.str,
            });
        }

        const rows = groupRows(fragments);
        const gutter = findGutter(fragments, pageWidth);

        if (!gutter) {
            pages.push(rows.map(r => joinFrags(r.frags)).filter(Boolean).join('\n'));
            continue;
        }

        const out: string[] = [];
        let left: string[] = [];
        let right: string[] = [];
        const flush = () => {
            out.push(...left, ...right);
            left = [];
            right = [];
        };

        for (const row of rows) {
            if (isFullWidth(row, gutter)) {
                flush();
                const line = joinFrags(row.frags);
                if (line) out.push(line);
                continue;
            }
            const l = joinFrags(row.frags.filter(f => f.right <= gutter));
            const r = joinFrags(row.frags.filter(f => f.x >= gutter));
            if (l) left.push(l);
            if (r) right.push(r);
        }
        flush();

        pages.push(out.filter(Boolean).join('\n'));
    }

    await doc.destroy();
    return pages.join('\n\n');
}
