import React, { useEffect, useMemo, useState } from 'react';
import {
    escolaApi, EscolaLibraryItem, EscolaSubject, formatBytes, formatDate,
    LIBRARY_KINDS,
} from '../../lib/api-escola';
import { canWrite, getEscolaRole } from '../../lib/escola-auth';

export default function EscolaLibrary() {
    const role = getEscolaRole();
    const writable = canWrite(role);

    const [items, setItems] = useState<EscolaLibraryItem[]>([]);
    const [subjects, setSubjects] = useState<EscolaSubject[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState<string>('');
    const [busy, setBusy] = useState<string | null>(null);

    const load = async () => {
        const [l, s] = await Promise.all([escolaApi.getLibrary(), escolaApi.getSubjects()]);
        setItems(l); setSubjects(s); setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const subjectOf = (id: string | null) => subjects.find(s => s.id === id);

    const printQueue = useMemo(() => items.filter(i => i.needs_print && !i.printed), [items]);
    const listed = useMemo(
        () => filter ? items.filter(i => i.subject_id === filter) : items,
        [items, filter]
    );

    const open = async (item: EscolaLibraryItem) => {
        setBusy(item.id);
        const url = await escolaApi.getLibraryFileUrl(item.file_path);
        setBusy(null);
        if (url) window.open(url, '_blank', 'noopener');
        else alert('Não deu para abrir o arquivo. Tente de novo.');
    };

    const togglePrinted = async (item: EscolaLibraryItem) => {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, printed: !i.printed } : i));
        await escolaApi.setLibraryPrinted(item.id, !item.printed);
    };

    const remove = async (item: EscolaLibraryItem) => {
        if (!confirm(`Excluir "${item.title}"? O arquivo também sai da biblioteca.`)) return;
        await escolaApi.deleteLibraryItem(item);
        load();
    };

    if (loading) {
        return <div className="py-24 text-center" style={{ color: 'var(--fg-soft)' }}>
            <span className="material-symbols-outlined text-[32px] animate-spin">progress_activity</span>
        </div>;
    }

    return (
        <div className="escola-enter space-y-5">
            <div>
                <h1 className="text-[26px] font-semibold leading-tight">Biblioteca de <span className="escola-mark">materiais</span></h1>
                <p className="text-[13px] mt-1" style={{ color: 'var(--fg-soft)' }}>
                    Listas, resumos e apostilas que a professora deixa — com a fila do que precisa ser impresso.
                </p>
            </div>

            {/* Fila de impressão */}
            {printQueue.length > 0 && (
                <section className="escola-card p-5" style={{ borderLeft: '3px solid var(--warn)' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-[20px]" style={{ color: 'var(--warn)' }}>print</span>
                        <h2 className="text-[15px] font-semibold">Para imprimir ({printQueue.length})</h2>
                    </div>
                    <ul className="space-y-2">
                        {printQueue.map(item => (
                            <li key={item.id} className="flex items-center gap-3 p-3 rounded-xl"
                                style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
                                <button onClick={() => togglePrinted(item)} className="shrink-0" title="Marcar como impresso">
                                    <span className="material-symbols-outlined text-[22px]" style={{ color: 'var(--fg-soft)' }}>
                                        radio_button_unchecked
                                    </span>
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[14px] font-semibold truncate">{item.title}</p>
                                    <p className="text-[12px]" style={{ color: 'var(--fg-soft)' }}>
                                        {item.print_copies > 1 ? `${item.print_copies} cópias · ` : ''}
                                        {subjectOf(item.subject_id)?.name || 'Sem matéria'}
                                    </p>
                                </div>
                                <button onClick={() => open(item)} className="shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                                    style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>
                                    {busy === item.id ? 'abrindo...' : 'abrir'}
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {writable && (
                <button onClick={() => setShowForm(v => !v)} className="escola-btn w-full py-3 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">{showForm ? 'close' : 'upload_file'}</span>
                    {showForm ? 'Cancelar' : 'Subir material'}
                </button>
            )}

            {showForm && (
                <UploadForm
                    subjects={subjects}
                    onCancel={() => setShowForm(false)}
                    onSaved={() => { setShowForm(false); load(); }}
                />
            )}

            {/* Filtro por matéria */}
            {subjects.some(s => items.some(i => i.subject_id === s.id)) && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    <FilterChip label="Todos" active={!filter} onClick={() => setFilter('')} />
                    {subjects.filter(s => items.some(i => i.subject_id === s.id)).map(s => (
                        <FilterChip key={s.id} label={s.name} color={s.color}
                            active={filter === s.id} onClick={() => setFilter(s.id)} />
                    ))}
                </div>
            )}

            {listed.length === 0 ? (
                <div className="escola-card-soft p-6 text-center">
                    <span className="material-symbols-outlined text-[30px]" style={{ color: 'var(--fg-soft)' }}>folder_open</span>
                    <p className="font-semibold mt-1">Nenhum material por aqui ainda</p>
                </div>
            ) : (
                <ul className="space-y-2.5">
                    {listed.map(item => {
                        const kind = LIBRARY_KINDS[item.kind] || LIBRARY_KINDS.outro;
                        const subject = subjectOf(item.subject_id);
                        return (
                            <li key={item.id} className="escola-card-soft p-4">
                                <div className="flex items-start gap-3">
                                    <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ background: 'rgba(198,242,78,.10)', color: 'var(--accent)' }}>
                                        <span className="material-symbols-outlined text-[21px]">{kind.icon}</span>
                                    </span>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {subject && (
                                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                                                    style={{ background: `${subject.color}1a`, color: subject.color }}>
                                                    {subject.name}
                                                </span>
                                            )}
                                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                                                style={{ background: 'var(--surface-2)', color: 'var(--fg-soft)' }}>
                                                {kind.label}
                                            </span>
                                            {item.needs_print && (
                                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                                                    style={item.printed
                                                        ? { background: 'rgba(198,242,78,.14)', color: 'var(--accent)' }
                                                        : { background: 'rgba(251,191,36,.14)', color: 'var(--warn)' }}>
                                                    {item.printed ? 'IMPRESSO' : 'IMPRIMIR'}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-[15px] font-semibold leading-snug mt-1">{item.title}</p>
                                        {item.description && (
                                            <p className="text-[13px] mt-0.5 leading-snug" style={{ color: 'var(--fg-soft)' }}>
                                                {item.description}
                                            </p>
                                        )}
                                        <p className="text-[11px] mt-1" style={{ color: 'var(--fg-soft)' }}>
                                            {item.file_name}
                                            {item.size_bytes ? ` · ${formatBytes(item.size_bytes)}` : ''}
                                            {' · '}{formatDate(item.created_at.slice(0, 10))}
                                        </p>

                                        <div className="flex items-center gap-3 mt-2.5">
                                            <button onClick={() => open(item)}
                                                className="text-[12px] font-semibold flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                                                <span className="material-symbols-outlined text-[16px]">download</span>
                                                {busy === item.id ? 'abrindo...' : 'abrir arquivo'}
                                            </button>
                                            {item.needs_print && (
                                                <button onClick={() => togglePrinted(item)}
                                                    className="text-[12px] font-semibold" style={{ color: 'var(--fg-soft)' }}>
                                                    {item.printed ? 'desmarcar impressão' : 'marcar como impresso'}
                                                </button>
                                            )}
                                            {writable && (
                                                <button onClick={() => remove(item)}
                                                    className="text-[12px] font-semibold ml-auto" style={{ color: 'var(--danger)' }}>
                                                    excluir
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

function FilterChip({ label, color, active, onClick }: {
    label: string; color?: string; active: boolean; onClick: () => void;
}) {
    return (
        <button onClick={onClick} className="shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all"
            style={active
                ? { background: `${color || '#c6f24e'}22`, color: color || 'var(--accent)', border: `1px solid ${color || 'var(--accent)'}` }
                : { background: 'var(--surface)', color: 'var(--fg-soft)', border: '1px solid var(--line)' }}>
            {label}
        </button>
    );
}

function UploadForm({ subjects, onCancel, onSaved }: {
    subjects: EscolaSubject[];
    onCancel: () => void;
    onSaved: () => void;
}) {
    const role = getEscolaRole();
    const [file, setFile] = useState<File | null>(null);
    const [form, setForm] = useState({
        title: '', description: '', subject_id: '', kind: 'material',
        needs_print: false, print_copies: '1',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const pick = (f: File | null) => {
        setFile(f);
        setError('');
        // Sugere o título a partir do nome do arquivo, sem a extensão.
        if (f && !form.title) setForm(prev => ({ ...prev, title: f.name.replace(/\.[^.]+$/, '') }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !form.title) return;
        if (file.size > 25 * 1024 * 1024) {
            setError('O arquivo passa de 25 MB. Tente compactar ou dividir.');
            return;
        }
        setSaving(true);
        const ok = await escolaApi.uploadLibraryFile(file, {
            title: form.title,
            description: form.description || null,
            subject_id: form.subject_id || null,
            kind: form.kind,
            needs_print: form.needs_print,
            print_copies: parseInt(form.print_copies) || 1,
            uploaded_by: role === 'professora' ? 'professora' : 'familia',
        });
        setSaving(false);
        if (ok) onSaved();
        else setError('Não deu para subir o arquivo. Tente de novo.');
    };

    return (
        <form onSubmit={handleSubmit} className="escola-card p-5 space-y-4 escola-enter">
            <div>
                <label className="escola-label block mb-1.5">Arquivo</label>
                <label className="flex items-center gap-3 p-4 rounded-xl cursor-pointer"
                    style={{ background: 'var(--surface-2)', border: '1px dashed var(--fg-soft)' }}>
                    <span className="material-symbols-outlined text-[24px]" style={{ color: 'var(--accent)' }}>upload_file</span>
                    <span className="flex-1 min-w-0">
                        <span className="block text-[14px] font-semibold truncate">
                            {file ? file.name : 'Escolher arquivo'}
                        </span>
                        <span className="block text-[12px]" style={{ color: 'var(--fg-soft)' }}>
                            {file ? formatBytes(file.size) : 'PDF, imagem, Word... até 25 MB'}
                        </span>
                    </span>
                    <input type="file" className="hidden"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,image/*"
                        onChange={e => pick(e.target.files?.[0] || null)} />
                </label>
            </div>

            <div>
                <label className="escola-label block mb-1.5">Título</label>
                <input className="escola-input" value={form.title} placeholder="Ex.: Lista de frações — capítulo 3"
                    onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="escola-label block mb-1.5">Matéria</label>
                    <select className="escola-input" value={form.subject_id}
                        onChange={e => setForm({ ...form, subject_id: e.target.value })}>
                        <option value="">Selecione</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="escola-label block mb-1.5">Tipo</label>
                    <select className="escola-input" value={form.kind}
                        onChange={e => setForm({ ...form, kind: e.target.value })}>
                        {Object.entries(LIBRARY_KINDS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="escola-label block mb-1.5">Observação (opcional)</label>
                <textarea className="escola-input" rows={2} value={form.description}
                    placeholder="Como usar em aula, o que fazer antes..."
                    onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="p-3.5 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
                <label className="flex items-center gap-2.5 text-[14px] font-semibold cursor-pointer">
                    <input type="checkbox" checked={form.needs_print} className="w-4 h-4 rounded"
                        onChange={e => setForm({ ...form, needs_print: e.target.checked })} />
                    Precisa ser impresso para a aula
                </label>
                {form.needs_print && (
                    <div className="mt-3">
                        <label className="escola-label block mb-1.5">Quantas cópias</label>
                        <input className="escola-input" inputMode="numeric" value={form.print_copies}
                            onChange={e => setForm({ ...form, print_copies: e.target.value })} />
                    </div>
                )}
            </div>

            {error && <p className="text-[13px] font-semibold" style={{ color: 'var(--danger)' }}>{error}</p>}

            <div className="flex gap-2">
                <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-full font-semibold"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
                    Cancelar
                </button>
                <button type="submit" disabled={saving || !file || !form.title} className="escola-btn flex-[2] py-3">
                    {saving ? 'Subindo...' : 'Salvar material'}
                </button>
            </div>
        </form>
    );
}
