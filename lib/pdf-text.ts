/**
 * Extrai o texto de um PDF no próprio navegador.
 *
 * O pdf.js entra por import dinâmico para não pesar no bundle de quem nunca
 * abre a importação de provas. Só funciona com PDF de texto — documento
 * escaneado (imagem) volta vazio, e quem chama avisa o usuário.
 */
export async function extractPdfText(file: File): Promise<string> {
    const pdfjs = await import('pdfjs-dist');
    const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

    const data = await file.arrayBuffer();
    const doc = await pdfjs.getDocument({ data }).promise;

    const pages: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();

        // Reagrupa os fragmentos por linha (mesma coordenada Y): sem isso o texto
        // vira um parágrafo só e a IA perde a associação entre matéria e data.
        const lines = new Map<number, string[]>();
        for (const item of content.items) {
            if (!('str' in item) || !item.str) continue;
            const y = Math.round((item.transform?.[5] ?? 0) / 3);
            if (!lines.has(y)) lines.set(y, []);
            lines.get(y)!.push(item.str);
        }

        const ordered = [...lines.entries()]
            .sort((a, b) => b[0] - a[0]) // PDF conta o Y de baixo para cima
            .map(([, parts]) => parts.join(' ').replace(/\s+/g, ' ').trim())
            .filter(Boolean);

        pages.push(ordered.join('\n'));
    }

    await doc.destroy();
    return pages.join('\n\n');
}
