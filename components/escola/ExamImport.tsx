import React, { useState } from 'react';
import {
    escolaApi, EscolaSubject, EXAM_KINDS, formatDate, ImportedExam, parseImportedTerm,
    TERMS, WEEKDAYS, parseISO,
} from '../../lib/api-escola';
import { extractPdfText } from '../../lib/pdf-text';
import { getEscolaRole } from '../../lib/escola-auth';

/** Uma prova lida do PDF, já editável na tela de revisão. */
interface Row extends ImportedExam {
    selected: boolean;
    subject_id: string;
    term: string;
    expanded: boolean;
}

type Stage = 'pick' | 'reading' | 'review' | 'saving';

export default function ExamImport({ subjects, onDone, onCancel }: {
    subjects: EscolaSubject[];
    onDone: (created: number) => void;
    onCancel: () => void;
}) {
    const role = getEscolaRole();

    const [stage, setStage] = useState<Stage>('pick');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [rows, setRows] = useState<Row[]>([]);
    const [docInfo, setDocInfo] = useState<{ term: string | null; grade: string | null }>({ term: null, grade: null });
    // Quem monta o plano de estudo é a professora. A sugestão automática fica
    // disponível, mas desmarcada — ninguém enche a agenda do Henrique sem querer.
    const [withPlan, setWithPlan] = useState(false);
    const [saveToLibrary, setSaveToLibrary] = useState(true);
    const [progress, setProgress] = useState(0);

    const read = async (picked: File) => {
        setFile(picked);
        setError('');
        setStage('reading');

        let text = '';
        try {
            text = await extractPdfText(picked);
        } catch (e) {
            console.error(e);
            setError('Não consegui abrir esse PDF. Ele pode estar protegido por senha.');
            setStage('pick');
            return;
        }

        if (text.trim().length < 40) {
            setError('Esse PDF parece ser digitalizado (imagem), então não tem texto para ler. Peça o arquivo original ao colégio.');
            setStage('pick');
            return;
        }

        const result = await escolaApi.importExamsFromText(text, subjects);
        if ('error' in result) {
            setError(result.error);
            setStage('pick');
            return;
        }
        if (!result.exams.length) {
            setError('Li o documento, mas não encontrei nenhuma avaliação com data.');
            setStage('pick');
            return;
        }

        const term = parseImportedTerm(result.term);
        setDocInfo({ term: result.term, grade: result.grade_level });
        setRows(result.exams.map(e => ({
            ...e,
            selected: true,
            subject_id: subjects.find(s => s.name === e.subject_match)?.id || '',
            term,
            expanded: false,
        })));
        setStage('review');
    };

    const patch = (index: number, change: Partial<Row>) =>
        setRows(prev => prev.map((r, i) => (i === index ? { ...r, ...change } : r)));

    const save = async () => {
        const chosen = rows.filter(r => r.selected && r.date);
        if (!chosen.length) return;

        setStage('saving');
        setProgress(0);
        let created = 0;

        for (const row of chosen) {
            const payload = {
                title: row.title || `Avaliação de ${row.subject_raw}`,
                subject_id: row.subject_id || null,
                date: row.date,
                kind: EXAM_KINDS[row.kind] ? row.kind : 'prova',
                term: row.term || null,
                content: [row.time_slot ? `Horário: ${row.time_slot}` : '', row.content]
                    .filter(Boolean).join('\n\n') || null,
            };
            const exam = withPlan
                ? await escolaApi.createExamWithPlan(payload)
                : await escolaApi.createExam(payload);
            if (exam) created++;
            setProgress(created);
        }

        if (saveToLibrary && file) {
            await escolaApi.uploadLibraryFile(file, {
                title: `Orientações de estudo — ${docInfo.term || 'avaliações'}`,
                description: docInfo.grade ? `Cronograma do colégio · ${docInfo.grade}` : 'Cronograma do colégio',
                kind: 'material',
                needs_print: false,
                uploaded_by: role === 'professora' ? 'professora' : 'familia',
            });
        }

        onDone(created);
    };

    const selectedCount = rows.filter(r => r.selected).length;

    // ---------- Etapa 1: escolher o arquivo ----------
    if (stage === 'pick' || stage === 'reading') {
        return (
            <div className="escola-card p-5 space-y-4 escola-enter">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-[17px] font-semibold">Importar do PDF do colégio</p>
                        <p className="text-[13px] mt-1" style={{ color: 'var(--fg-soft)' }}>
                            Mande o cronograma de avaliações e eu leio todas as provas de uma vez — data,
                            matéria e conteúdo cobrado. Você confere antes de salvar.
                        </p>
                    </div>
                    <button onClick={onCancel} style={{ color: 'var(--fg-soft)' }}>
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {stage === 'reading' ? (
                    <div className="p-6 rounded-xl text-center" style={{ background: 'var(--surface-2)' }}>
                        <span className="material-symbols-outlined text-[28px] animate-spin" style={{ color: 'var(--accent)' }}>
                            progress_activity
                        </span>
                        <p className="text-[14px] font-semibold mt-2">Lendo o documento...</p>
                        <p className="text-[12px] mt-0.5" style={{ color: 'var(--fg-soft)' }}>
                            {file?.name}
                        </p>
                        <p className="text-[12px] mt-2" style={{ color: 'var(--fg-soft)' }}>
                            Documento grande leva até um minuto. Pode deixar a tela aberta.
                        </p>
                    </div>
                ) : (
                    <label className="flex items-center gap-3 p-4 rounded-xl cursor-pointer"
                        style={{ background: 'var(--surface-2)', border: '1px dashed var(--fg-soft)' }}>
                        <span className="material-symbols-outlined text-[24px]" style={{ color: 'var(--accent)' }}>picture_as_pdf</span>
                        <span className="flex-1">
                            <span className="block text-[14px] font-semibold">Escolher o PDF</span>
                            <span className="block text-[12px]" style={{ color: 'var(--fg-soft)' }}>
                                Ex.: "Orientações de Estudos para as Avaliações Globalizantes"
                            </span>
                        </span>
                        <input type="file" accept="application/pdf,.pdf" className="hidden"
                            onChange={e => { const f = e.target.files?.[0]; if (f) read(f); }} />
                    </label>
                )}

                {error && (
                    <p className="text-[13px] font-semibold flex items-start gap-1.5" style={{ color: 'var(--danger)' }}>
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        {error}
                    </p>
                )}
            </div>
        );
    }

    // ---------- Etapa 3: gravando ----------
    if (stage === 'saving') {
        return (
            <div className="escola-card p-6 text-center escola-enter">
                <span className="material-symbols-outlined text-[30px] animate-spin" style={{ color: 'var(--accent)' }}>
                    progress_activity
                </span>
                <p className="text-[15px] font-semibold mt-2">Criando as provas...</p>
                <p className="text-[13px]" style={{ color: 'var(--fg-soft)' }}>
                    {progress} de {selectedCount}
                </p>
            </div>
        );
    }

    // ---------- Etapa 2: revisão ----------
    return (
        <div className="escola-card p-5 space-y-4 escola-enter">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[17px] font-semibold">
                        {rows.length} avaliaç{rows.length === 1 ? 'ão encontrada' : 'ões encontradas'}
                    </p>
                    <p className="text-[13px] mt-0.5" style={{ color: 'var(--fg-soft)' }}>
                        {[docInfo.grade, docInfo.term].filter(Boolean).join(' · ') || 'Confira antes de salvar'}
                    </p>
                </div>
                <button onClick={onCancel} style={{ color: 'var(--fg-soft)' }}>
                    <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
            </div>

            <ul className="space-y-2.5">
                {rows.map((row, i) => {
                    const subject = subjects.find(s => s.id === row.subject_id);
                    const weekday = row.date ? WEEKDAYS.find(w => w.value === parseISO(row.date).getDay())?.long : null;
                    return (
                        <li key={i} className="rounded-xl p-3.5"
                            style={{
                                background: 'var(--surface-2)',
                                border: `1px solid ${row.warnings?.length ? 'rgba(251,191,36,.4)' : 'var(--line)'}`,
                                opacity: row.selected ? 1 : 0.5,
                            }}>
                            <div className="flex items-start gap-3">
                                <button onClick={() => patch(i, { selected: !row.selected })} className="shrink-0 mt-0.5">
                                    <span className="material-symbols-outlined text-[22px]"
                                        style={{ color: row.selected ? 'var(--accent)' : 'var(--fg-soft)' }}>
                                        {row.selected ? 'check_circle' : 'radio_button_unchecked'}
                                    </span>
                                </button>

                                <div className="flex-1 min-w-0 space-y-2">
                                    <input className="escola-input" value={row.title}
                                        onChange={e => patch(i, { title: e.target.value })} />

                                    <div className="grid grid-cols-2 gap-2">
                                        <select className="escola-input" value={row.subject_id}
                                            onChange={e => patch(i, { subject_id: e.target.value })}>
                                            <option value="">Sem matéria</option>
                                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                        <input type="date" className="escola-input" value={row.date}
                                            onChange={e => patch(i, { date: e.target.value })} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <select className="escola-input" value={row.kind}
                                            onChange={e => patch(i, { kind: e.target.value })}>
                                            {Object.entries(EXAM_KINDS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                        </select>
                                        <select className="escola-input" value={row.term}
                                            onChange={e => patch(i, { term: e.target.value })}>
                                            {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>

                                    <p className="text-[11px]" style={{ color: 'var(--fg-soft)' }}>
                                        No documento: {row.subject_raw}
                                        {row.date ? ` · ${weekday}, ${formatDate(row.date)}` : ''}
                                        {row.time_slot ? ` · ${row.time_slot}` : ''}
                                    </p>

                                    {!row.subject_id && (
                                        <p className="text-[12px] font-semibold" style={{ color: 'var(--warn)' }}>
                                            Não achei essa matéria na lista — escolha uma acima.
                                        </p>
                                    )}

                                    {row.warnings?.map((w, k) => (
                                        <p key={k} className="text-[12px] font-semibold flex items-start gap-1.5" style={{ color: 'var(--warn)' }}>
                                            <span className="material-symbols-outlined text-[16px]">warning</span>
                                            {w}
                                        </p>
                                    ))}

                                    <button onClick={() => patch(i, { expanded: !row.expanded })}
                                        className="text-[12px] font-semibold flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                                        <span className="material-symbols-outlined text-[16px]">
                                            {row.expanded ? 'expand_less' : 'expand_more'}
                                        </span>
                                        conteúdo cobrado ({(row.content || '').split('\n').filter(Boolean).length} itens)
                                    </button>

                                    {row.expanded && (
                                        <textarea className="escola-input" rows={10} value={row.content || ''}
                                            onChange={e => patch(i, { content: e.target.value })} />
                                    )}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>

            <div className="space-y-2.5 p-3.5 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
                <label className="flex items-center gap-2.5 text-[14px] font-semibold cursor-pointer">
                    <input type="checkbox" checked={withPlan} className="w-4 h-4 rounded"
                        onChange={e => setWithPlan(e.target.checked)} />
                    Já sugerir um plano de estudo
                </label>
                <p className="text-[12px] pl-7" style={{ color: 'var(--fg-soft)' }}>
                    {withPlan
                        ? `São ${selectedCount} prova${selectedCount === 1 ? '' : 's'} — a sugestão criaria até ${selectedCount * 4} blocos. A professora pode apagar e refazer à vontade.`
                        : 'Sem isso, as provas entram só com data e conteúdo, e a professora monta os blocos de estudo como preferir.'}
                </p>
                <label className="flex items-center gap-2.5 text-[14px] font-semibold cursor-pointer">
                    <input type="checkbox" checked={saveToLibrary} className="w-4 h-4 rounded"
                        onChange={e => setSaveToLibrary(e.target.checked)} />
                    Guardar o PDF na biblioteca
                </label>
            </div>

            <div className="flex gap-2">
                <button onClick={onCancel} className="flex-1 py-3 rounded-full font-semibold"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
                    Cancelar
                </button>
                <button onClick={save} disabled={!selectedCount} className="escola-btn flex-[2] py-3">
                    Criar {selectedCount} prova{selectedCount === 1 ? '' : 's'}
                </button>
            </div>
        </div>
    );
}
