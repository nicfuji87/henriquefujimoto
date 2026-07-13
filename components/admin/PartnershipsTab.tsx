import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import imageCompression from 'browser-image-compression';
import {
    Plus, Trash2, Save, X, Eye, EyeOff, Edit, ExternalLink, Upload,
    Handshake, GripVertical,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Cost { label: string; amount: number; period: 'mensal' | 'anual'; }
interface Counterpart { category: string; items: string[]; }
interface Institutional { title: string; text: string; }
interface TimelineItem { year: string; label: string; }
interface CustomSection { title: string; body: string; }
interface Photo { url: string; caption: string; section?: string; }
interface Goal { horizon: string; text: string; }
interface AcademicCard { title: string; text: string; }
interface RoutineStep { time: string; label: string; }

interface Project {
    id?: string;
    slug: string;
    is_active: boolean;
    project_title: string;
    partner_name: string;
    partner_logo_url: string;
    hero_kicker: string;
    hero_title: string;
    hero_subtitle: string;
    intro: string;
    why_now_title: string;
    why_now_body: string;
    comms_title: string;
    comms_body: string;
    show_metrics: boolean;
    costs: Cost[];
    costs_note: string;
    scholarship_label: string;
    scholarship_monthly: number;
    scholarship_body: string;
    ask_body: string;
    counterparts: Counterpart[];
    institutional: Institutional[];
    timeline: TimelineItem[];
    timeline_note: string;
    family_letter: string;
    family_letter_signature: string;
    custom_sections: CustomSection[];
    contact_name: string;
    contact_whatsapp: string;
    contact_email: string;
    closing_title: string;
    closing_body: string;
    photos: Photo[];
    executive_summary: string;
    federation_info: string;
    results_title: string;
    results_intro: string;
    show_competitions: boolean;
    academic_title: string;
    academic_body: string;
    discipline_title: string;
    discipline_body: string;
    routine_title: string;
    routine_body: string;
    goals_title: string;
    goals: Goal[];
    representation_title: string;
    representation_body: string;
    family_commitments: string[];
    executive_highlights: string[];
    executive_objective: string;
    why_marista_title: string;
    why_marista_body: string;
    academic_cards: AcademicCard[];
    routine_timeline: RoutineStep[];
    deliverables_title: string;
    deliverables: string[];
    closing_image_url: string;
}

const EMPTY: Project = {
    slug: '', is_active: true, project_title: '', partner_name: '', partner_logo_url: '',
    hero_kicker: '', hero_title: '', hero_subtitle: '', intro: '',
    why_now_title: '', why_now_body: '', comms_title: '', comms_body: '', show_metrics: true,
    costs: [], costs_note: '', scholarship_label: '', scholarship_monthly: 0, scholarship_body: '', ask_body: '',
    counterparts: [], institutional: [], timeline: [], timeline_note: '',
    family_letter: '', family_letter_signature: '', custom_sections: [],
    contact_name: '', contact_whatsapp: '', contact_email: '', closing_title: '', closing_body: '',
    photos: [], executive_summary: '', federation_info: '', results_title: '', results_intro: '', show_competitions: true,
    academic_title: '', academic_body: '', discipline_title: '', discipline_body: '', routine_title: '', routine_body: '',
    goals_title: '', goals: [], representation_title: '', representation_body: '', family_commitments: [],
    executive_highlights: [], executive_objective: '', why_marista_title: '', why_marista_body: '',
    academic_cards: [], routine_timeline: [], deliverables_title: '', deliverables: [], closing_image_url: '',
};

const inputCls = 'w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50';

function Labeled({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
    return (
        <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">{label}</label>
            {children}
            {hint && <p className="text-[10px] text-zinc-600 mt-1">{hint}</p>}
        </div>
    );
}

function GroupTitle({ children }: { children: React.ReactNode }) {
    return <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider pt-4 mt-2 border-t border-zinc-800">{children}</h4>;
}

function slugify(s: string) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const fmtBRL = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n || 0);

export default function PartnershipsTab() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<string | 'new' | null>(null);
    const [form, setForm] = useState<Project>(EMPTY);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
    const logoRef = useRef<HTMLInputElement>(null);
    const photoRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchProjects(); }, []);

    async function fetchProjects() {
        setLoading(true);
        const { data } = await supabase.from('partnership_projects').select('*').order('created_at', { ascending: false });
        setProjects((data as Project[]) || []);
        setLoading(false);
    }

    function set<K extends keyof Project>(key: K, value: Project[K]) {
        setForm(f => ({ ...f, [key]: value }));
    }

    // Generic array helpers
    function addItem<T>(key: keyof Project, item: T) {
        setForm(f => ({ ...f, [key]: [...(f[key] as unknown as T[]), item] }));
    }
    function removeItem(key: keyof Project, index: number) {
        setForm(f => ({ ...f, [key]: (f[key] as unknown as any[]).filter((_, i) => i !== index) }));
    }
    function patchItem(key: keyof Project, index: number, patch: any) {
        setForm(f => ({ ...f, [key]: (f[key] as unknown as any[]).map((it, i) => i === index ? { ...it, ...patch } : it) }));
    }

    function startNew() {
        setForm(EMPTY);
        setEditing('new');
        setMsg(null);
    }
    function startEdit(p: Project) {
        setForm({ ...EMPTY, ...p });
        setEditing(p.id!);
        setMsg(null);
    }
    function cancel() {
        setEditing(null);
        setForm(EMPTY);
    }

    async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const compressed = await imageCompression(file, { maxSizeMB: 0.2, maxWidthOrHeight: 600, useWebWorker: true });
            const ext = compressed.name.split('.').pop() || 'png';
            const path = `partnerships/logo-${Date.now()}.${ext}`;
            const { error } = await supabase.storage.from('site-images').upload(path, compressed, { upsert: true, cacheControl: '31536000' });
            if (error) throw error;
            const { data } = supabase.storage.from('site-images').getPublicUrl(path);
            set('partner_logo_url', data.publicUrl);
        } catch (err) {
            console.error(err);
            alert('Erro ao enviar logo');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    }

    async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files || !files.length) return;
        setUploading(true);
        try {
            for (const file of Array.from(files)) {
                const compressed = await imageCompression(file, { maxSizeMB: 0.4, maxWidthOrHeight: 1600, useWebWorker: true });
                const ext = compressed.name.split('.').pop() || 'jpg';
                const path = `partnerships/photo-${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`;
                const { error } = await supabase.storage.from('site-images').upload(path, compressed, { upsert: true, cacheControl: '31536000' });
                if (error) throw error;
                const { data } = supabase.storage.from('site-images').getPublicUrl(path);
                setForm(f => ({ ...f, photos: [...f.photos, { url: data.publicUrl, caption: '', section: 'gallery' }] }));
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao enviar foto');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    }

    async function handleSave() {
        if (!form.slug.trim()) { setMsg({ type: 'err', text: 'Slug é obrigatório (ex: marista).' }); return; }
        setSaving(true);
        setMsg(null);
        const payload: any = { ...form, slug: slugify(form.slug), updated_at: new Date().toISOString() };
        delete payload.id;
        delete payload.created_at;
        let error;
        if (editing === 'new') {
            ({ error } = await supabase.from('partnership_projects').insert(payload));
        } else {
            ({ error } = await supabase.from('partnership_projects').update(payload).eq('id', editing));
        }
        if (error) {
            setMsg({ type: 'err', text: 'Erro ao salvar: ' + error.message });
        } else {
            setMsg({ type: 'ok', text: 'Projeto salvo com sucesso!' });
            await fetchProjects();
            setEditing(null);
            setForm(EMPTY);
        }
        setSaving(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Excluir este projeto de parceria?')) return;
        await supabase.from('partnership_projects').delete().eq('id', id);
        await fetchProjects();
    }

    async function toggleActive(p: Project) {
        await supabase.from('partnership_projects').update({ is_active: !p.is_active }).eq('id', p.id);
        setProjects(prev => prev.map(x => x.id === p.id ? { ...x, is_active: !p.is_active } : x));
    }

    const annual = form.costs.reduce((s, c) => s + (Number(c.amount) || 0) * (c.period === 'mensal' ? 12 : 1), 0);
    const pct = annual > 0 ? Math.round(((Number(form.scholarship_monthly) || 0) * 12) / annual * 100) : 0;

    return (
        <div className="space-y-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Parcerias</h2>
                    <p className="text-zinc-400 text-sm">Projetos institucionais (media kit) — páginas ocultas em <code className="text-emerald-400">/parceria/slug</code></p>
                </div>
                {!editing && (
                    <button onClick={startNew} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-500 transition-colors w-full sm:w-auto justify-center">
                        <Plus className="w-4 h-4" /> Novo Projeto
                    </button>
                )}
            </div>

            {msg && (
                <div className={`rounded-xl px-4 py-3 text-sm ${msg.type === 'ok' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border border-red-500/20 text-red-300'}`}>
                    {msg.text}
                </div>
            )}

            {/* EDITOR */}
            <AnimatePresence>
                {editing && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="bg-zinc-900/60 border border-emerald-500/20 rounded-2xl overflow-hidden"
                    >
                        <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 px-5 py-3 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Handshake className="w-5 h-5 text-emerald-400" />
                                {editing === 'new' ? 'Novo Projeto' : 'Editar Projeto'}
                            </h3>
                            <div className="flex items-center gap-2">
                                {form.slug && (
                                    <a href={`/parceria/${slugify(form.slug)}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors">
                                        <ExternalLink className="w-3.5 h-3.5" /> Ver página
                                    </a>
                                )}
                                <button onClick={cancel} className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"><X className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Basics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Labeled label="Slug (URL) *" hint="A página fica em /parceria/[slug]">
                                    <input className={inputCls} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="marista" />
                                </Labeled>
                                <Labeled label="Título do projeto">
                                    <input className={inputCls} value={form.project_title} onChange={e => set('project_title', e.target.value)} placeholder="Projeto Aluno-Atleta Marista" />
                                </Labeled>
                                <Labeled label="Nome do parceiro">
                                    <input className={inputCls} value={form.partner_name} onChange={e => set('partner_name', e.target.value)} placeholder="Colégio Marista" />
                                </Labeled>
                                <Labeled label="Logo do parceiro">
                                    <div className="flex items-center gap-3">
                                        <div className="w-14 h-14 rounded-lg bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                                            {form.partner_logo_url ? <img src={form.partner_logo_url} alt="" className="w-full h-full object-contain" /> : <Handshake className="w-5 h-5 text-zinc-600" />}
                                        </div>
                                        <button type="button" onClick={() => logoRef.current?.click()} disabled={uploading} className="flex items-center gap-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white hover:bg-zinc-700 disabled:opacity-50">
                                            <Upload className="w-4 h-4" /> {uploading ? 'Enviando...' : 'Upload'}
                                        </button>
                                        <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                    </div>
                                </Labeled>
                            </div>

                            {/* Hero */}
                            <GroupTitle>Abertura (Hero)</GroupTitle>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Labeled label="Kicker"><input className={inputCls} value={form.hero_kicker} onChange={e => set('hero_kicker', e.target.value)} placeholder="Proposta de parceria" /></Labeled>
                                <Labeled label="Título"><input className={inputCls} value={form.hero_title} onChange={e => set('hero_title', e.target.value)} placeholder="Não é caridade. É parceria." /></Labeled>
                            </div>
                            <Labeled label="Subtítulo"><textarea rows={2} className={inputCls} value={form.hero_subtitle} onChange={e => set('hero_subtitle', e.target.value)} /></Labeled>

                            {/* Intro / thesis */}
                            <GroupTitle>Tese de abertura</GroupTitle>
                            <Labeled label="Parágrafo de abertura (não é caridade)"><textarea rows={3} className={inputCls} value={form.intro} onChange={e => set('intro', e.target.value)} /></Labeled>

                            {/* Why now */}
                            <GroupTitle>Por que agora</GroupTitle>
                            <div className="grid grid-cols-1 gap-4">
                                <Labeled label="Título"><input className={inputCls} value={form.why_now_title} onChange={e => set('why_now_title', e.target.value)} /></Labeled>
                                <Labeled label="Texto"><textarea rows={3} className={inputCls} value={form.why_now_body} onChange={e => set('why_now_body', e.target.value)} /></Labeled>
                            </div>

                            {/* Comms */}
                            <GroupTitle>Capacidade de comunicação</GroupTitle>
                            <div className="grid grid-cols-1 gap-4">
                                <Labeled label="Título"><input className={inputCls} value={form.comms_title} onChange={e => set('comms_title', e.target.value)} /></Labeled>
                                <Labeled label="Texto"><textarea rows={3} className={inputCls} value={form.comms_body} onChange={e => set('comms_body', e.target.value)} /></Labeled>
                                <label className="flex items-center gap-2 text-sm text-zinc-300">
                                    <input type="checkbox" checked={form.show_metrics} onChange={e => set('show_metrics', e.target.checked)} className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-emerald-500" />
                                    Mostrar números reais do Instagram (ao vivo)
                                </label>
                            </div>

                            {/* Resumo executivo & federação */}
                            <GroupTitle>Resumo executivo & federação</GroupTitle>
                            <Labeled label="Resumo executivo do atleta" hint="Idade, modalidade, categoria, equipe, federação e objetivo.">
                                <textarea rows={3} className={inputCls} value={form.executive_summary} onChange={e => set('executive_summary', e.target.value)} />
                            </Labeled>
                            <Labeled label="Federação / ranking / clube">
                                <textarea rows={2} className={inputCls} value={form.federation_info} onChange={e => set('federation_info', e.target.value)} />
                            </Labeled>
                            <Labeled label="Destaques (Nos últimos 12 meses)" hint="Lista curta de pontos fortes que aparece no topo.">
                                <div className="space-y-2">
                                    {form.executive_highlights.map((h, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <input className={inputCls + ' flex-1'} value={h} onChange={e => setForm(f => ({ ...f, executive_highlights: f.executive_highlights.map((x, k) => k === i ? e.target.value : x) }))} placeholder="Ex: 13 pódios" />
                                            <button onClick={() => setForm(f => ({ ...f, executive_highlights: f.executive_highlights.filter((_, k) => k !== i) }))} className="p-2 text-zinc-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => setForm(f => ({ ...f, executive_highlights: [...f.executive_highlights, ''] }))} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar destaque</button>
                                </div>
                            </Labeled>
                            <Labeled label="Objetivo" hint="Frase de objetivo que fecha o resumo executivo.">
                                <textarea rows={2} className={inputCls} value={form.executive_objective} onChange={e => set('executive_objective', e.target.value)} />
                            </Labeled>

                            {/* Resultados */}
                            <GroupTitle>Resultados esportivos</GroupTitle>
                            <Labeled label="Título"><input className={inputCls} value={form.results_title} onChange={e => set('results_title', e.target.value)} /></Labeled>
                            <Labeled label="Introdução"><textarea rows={2} className={inputCls} value={form.results_intro} onChange={e => set('results_intro', e.target.value)} /></Labeled>
                            <label className="flex items-center gap-2 text-sm text-zinc-300">
                                <input type="checkbox" checked={form.show_competitions} onChange={e => set('show_competitions', e.target.checked)} className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-emerald-500" />
                                Mostrar o histórico de competições (puxado automaticamente do banco)
                            </label>

                            {/* Metas */}
                            <GroupTitle>Metas (12 e 24 meses)</GroupTitle>
                            <Labeled label="Título da seção"><input className={inputCls} value={form.goals_title} onChange={e => set('goals_title', e.target.value)} /></Labeled>
                            <div className="space-y-2">
                                {form.goals.map((g, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <input className={inputCls + ' w-40'} value={g.horizon} onChange={e => patchItem('goals', i, { horizon: e.target.value })} placeholder="Próximos 12 meses" />
                                        <textarea rows={2} className={inputCls + ' flex-1'} value={g.text} onChange={e => patchItem('goals', i, { text: e.target.value })} placeholder="Meta" />
                                        <button onClick={() => removeItem('goals', i)} className="p-2 text-zinc-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                <button onClick={() => addItem<Goal>('goals', { horizon: '', text: '' })} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar meta</button>
                            </div>

                            {/* Por que o Marista */}
                            <GroupTitle>Por que o parceiro? (identificação de valores)</GroupTitle>
                            <Labeled label="Título"><input className={inputCls} value={form.why_marista_title} onChange={e => set('why_marista_title', e.target.value)} placeholder="Por que o Marista?" /></Labeled>
                            <Labeled label="Texto" hint="Por que esta escola especificamente. Deixe vazio para ocultar.">
                                <textarea rows={3} className={inputCls} value={form.why_marista_body} onChange={e => set('why_marista_body', e.target.value)} />
                            </Labeled>

                            {/* Representação */}
                            <GroupTitle>Como representa a escola</GroupTitle>
                            <Labeled label="Título"><input className={inputCls} value={form.representation_title} onChange={e => set('representation_title', e.target.value)} /></Labeled>
                            <Labeled label="Texto" hint="As contrapartidas em si são editadas na seção Contrapartidas mais abaixo."><textarea rows={2} className={inputCls} value={form.representation_body} onChange={e => set('representation_body', e.target.value)} /></Labeled>

                            {/* Acadêmico, disciplina e rotina */}
                            <GroupTitle>Acadêmico, disciplina e rotina</GroupTitle>
                            <Labeled label="Vida acadêmica — título"><input className={inputCls} value={form.academic_title} onChange={e => set('academic_title', e.target.value)} /></Labeled>
                            <Labeled label="Vida acadêmica — texto" hint="Boletins, média, frequência, comportamento. Deixe vazio para ocultar a seção na página.">
                                <textarea rows={3} className={inputCls} value={form.academic_body} onChange={e => set('academic_body', e.target.value)} />
                            </Labeled>
                            <Labeled label="Disciplina — título"><input className={inputCls} value={form.discipline_title} onChange={e => set('discipline_title', e.target.value)} /></Labeled>
                            <Labeled label="Disciplina — texto" hint="Ex.: uma carta curta da coordenação/professor. Deixe vazio para ocultar.">
                                <textarea rows={3} className={inputCls} value={form.discipline_body} onChange={e => set('discipline_body', e.target.value)} />
                            </Labeled>
                            <Labeled label="Rotina — título"><input className={inputCls} value={form.routine_title} onChange={e => set('routine_title', e.target.value)} /></Labeled>
                            <Labeled label="Rotina — texto"><textarea rows={2} className={inputCls} value={form.routine_body} onChange={e => set('routine_body', e.target.value)} /></Labeled>
                            <Labeled label="Vida acadêmica — cards" hint="Cards curtos: rendimento, comportamento, participação, frequência.">
                                <div className="space-y-2">
                                    {form.academic_cards.map((c, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <input className={inputCls + ' w-40'} value={c.title} onChange={e => patchItem('academic_cards', i, { title: e.target.value })} placeholder="Título" />
                                            <textarea rows={2} className={inputCls + ' flex-1'} value={c.text} onChange={e => patchItem('academic_cards', i, { text: e.target.value })} placeholder="Descrição" />
                                            <button onClick={() => removeItem('academic_cards', i)} className="p-2 text-zinc-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => addItem<AcademicCard>('academic_cards', { title: '', text: '' })} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar card</button>
                                </div>
                            </Labeled>
                            <Labeled label="Rotina — timeline (horário → atividade)" hint="Ex.: 05:30 → Treino. Vira uma linha do tempo do dia.">
                                <div className="space-y-2">
                                    {form.routine_timeline.map((r, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <input className={inputCls + ' w-24'} value={r.time} onChange={e => patchItem('routine_timeline', i, { time: e.target.value })} placeholder="05:30" />
                                            <input className={inputCls + ' flex-1'} value={r.label} onChange={e => patchItem('routine_timeline', i, { label: e.target.value })} placeholder="Atividade" />
                                            <button onClick={() => removeItem('routine_timeline', i)} className="p-2 text-zinc-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => addItem<RoutineStep>('routine_timeline', { time: '', label: '' })} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar etapa</button>
                                </div>
                            </Labeled>

                            {/* Fotos */}
                            <GroupTitle>Fotos</GroupTitle>
                            <div className="space-y-3">
                                {form.photos.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {form.photos.map((ph, i) => (
                                            <div key={i} className="rounded-xl border border-zinc-700/50 bg-zinc-800/30 overflow-hidden">
                                                <div className="aspect-video bg-zinc-800"><img src={ph.url} alt="" className="w-full h-full object-cover" /></div>
                                                <div className="p-2 space-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <input className={inputCls + ' text-xs py-1'} value={ph.caption} onChange={e => patchItem('photos', i, { caption: e.target.value })} placeholder="Legenda (opcional)" />
                                                        <button onClick={() => removeItem('photos', i)} className="p-1.5 text-zinc-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                    <select className={inputCls + ' text-xs py-1'} value={ph.section || 'gallery'} onChange={e => patchItem('photos', i, { section: e.target.value })}>
                                                        <option value="gallery">Galeria (fim)</option>
                                                        <option value="results">Resultados</option>
                                                        <option value="why_partner">Por que o parceiro</option>
                                                        <option value="potential">Por que agora / potencial</option>
                                                        <option value="closing">Fechamento</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button type="button" onClick={() => photoRef.current?.click()} disabled={uploading} className="flex items-center gap-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white hover:bg-zinc-700 disabled:opacity-50">
                                    <Upload className="w-4 h-4" /> {uploading ? 'Enviando...' : 'Adicionar fotos'}
                                </button>
                                <input ref={photoRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                            </div>

                            {/* Compromissos da família */}
                            <GroupTitle>Compromissos da família</GroupTitle>
                            <div className="space-y-2">
                                {form.family_commitments.map((c, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <input className={inputCls + ' flex-1'} value={c} onChange={e => setForm(f => ({ ...f, family_commitments: f.family_commitments.map((x, k) => k === i ? e.target.value : x) }))} placeholder="Compromisso" />
                                        <button onClick={() => setForm(f => ({ ...f, family_commitments: f.family_commitments.filter((_, k) => k !== i) }))} className="p-2 text-zinc-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                <button onClick={() => setForm(f => ({ ...f, family_commitments: [...f.family_commitments, ''] }))} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar compromisso</button>
                            </div>

                            {/* Entregas ano letivo */}
                            <GroupTitle>Entregas do ano letivo</GroupTitle>
                            <Labeled label="Título"><input className={inputCls} value={form.deliverables_title} onChange={e => set('deliverables_title', e.target.value)} placeholder="O que o Marista receberá durante um ano letivo" /></Labeled>
                            <div className="space-y-2">
                                {form.deliverables.map((d, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <input className={inputCls + ' flex-1'} value={d} onChange={e => setForm(f => ({ ...f, deliverables: f.deliverables.map((x, k) => k === i ? e.target.value : x) }))} placeholder="Ex: 40+ reels ao longo do ano" />
                                        <button onClick={() => setForm(f => ({ ...f, deliverables: f.deliverables.filter((_, k) => k !== i) }))} className="p-2 text-zinc-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                <button onClick={() => setForm(f => ({ ...f, deliverables: [...f.deliverables, ''] }))} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar entrega</button>
                            </div>

                            {/* Costs */}
                            <GroupTitle>Custos de formação</GroupTitle>
                            <div className="space-y-2">
                                {form.costs.map((c, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <input className={inputCls + ' flex-1'} value={c.label} onChange={e => patchItem('costs', i, { label: e.target.value })} placeholder="Ex: Escola (mensalidade)" />
                                        <input type="number" className={inputCls + ' w-28'} value={c.amount} onChange={e => patchItem('costs', i, { amount: parseFloat(e.target.value) || 0 })} placeholder="0" />
                                        <select className={inputCls + ' w-28'} value={c.period} onChange={e => patchItem('costs', i, { period: e.target.value })}>
                                            <option value="mensal">/ mês</option>
                                            <option value="anual">/ ano</option>
                                        </select>
                                        <button onClick={() => removeItem('costs', i)} className="p-2 text-zinc-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                <button onClick={() => addItem<Cost>('costs', { label: '', amount: 0, period: 'mensal' })} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar custo</button>
                                <div className="flex items-center justify-between bg-zinc-800/40 rounded-lg px-3 py-2 mt-1">
                                    <span className="text-xs text-zinc-400">Investimento anual (calculado)</span>
                                    <span className="text-sm font-bold text-emerald-400">{fmtBRL(annual)}</span>
                                </div>
                            </div>
                            <Labeled label="Observação sobre custos"><input className={inputCls} value={form.costs_note} onChange={e => set('costs_note', e.target.value)} /></Labeled>

                            {/* Scholarship */}
                            <GroupTitle>Impacto da bolsa</GroupTitle>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Labeled label="Rótulo da bolsa"><input className={inputCls} value={form.scholarship_label} onChange={e => set('scholarship_label', e.target.value)} placeholder="Bolsa de estudos (mensalidade)" /></Labeled>
                                <Labeled label="Valor mensal da bolsa" hint={`Impacto calculado: ${pct}% do investimento anual`}>
                                    <input type="number" className={inputCls} value={form.scholarship_monthly} onChange={e => set('scholarship_monthly', parseFloat(e.target.value) || 0)} />
                                </Labeled>
                            </div>
                            <Labeled label="Texto do impacto"><textarea rows={2} className={inputCls} value={form.scholarship_body} onChange={e => set('scholarship_body', e.target.value)} /></Labeled>
                            <Labeled label="Texto do pedido (porta aberta)"><textarea rows={2} className={inputCls} value={form.ask_body} onChange={e => set('ask_body', e.target.value)} /></Labeled>

                            {/* Counterparts */}
                            <GroupTitle>Contrapartidas</GroupTitle>
                            <div className="space-y-3">
                                {form.counterparts.map((cp, ci) => (
                                    <div key={ci} className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-3 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <input className={inputCls + ' flex-1 font-semibold'} value={cp.category} onChange={e => patchItem('counterparts', ci, { category: e.target.value })} placeholder="Categoria (ex: Visibilidade)" />
                                            <button onClick={() => removeItem('counterparts', ci)} className="p-2 text-zinc-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                        {cp.items.map((it, ii) => (
                                            <div key={ii} className="flex items-center gap-2 pl-3">
                                                <GripVertical className="w-3 h-3 text-zinc-600" />
                                                <input className={inputCls + ' flex-1'} value={it} onChange={e => {
                                                    const items = cp.items.map((x, k) => k === ii ? e.target.value : x);
                                                    patchItem('counterparts', ci, { items });
                                                }} placeholder="Item" />
                                                <button onClick={() => patchItem('counterparts', ci, { items: cp.items.filter((_, k) => k !== ii) })} className="p-1.5 text-zinc-500 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
                                            </div>
                                        ))}
                                        <button onClick={() => patchItem('counterparts', ci, { items: [...cp.items, ''] })} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 pl-3"><Plus className="w-3 h-3" /> Adicionar item</button>
                                    </div>
                                ))}
                                <button onClick={() => addItem<Counterpart>('counterparts', { category: '', items: [] })} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar categoria</button>
                            </div>

                            {/* Institutional */}
                            <GroupTitle>O que o parceiro ganha (institucional)</GroupTitle>
                            <div className="space-y-2">
                                {form.institutional.map((it, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <div className="flex-1 space-y-2">
                                            <input className={inputCls} value={it.title} onChange={e => patchItem('institutional', i, { title: e.target.value })} placeholder="Título" />
                                            <textarea rows={2} className={inputCls} value={it.text} onChange={e => patchItem('institutional', i, { text: e.target.value })} placeholder="Descrição" />
                                        </div>
                                        <button onClick={() => removeItem('institutional', i)} className="p-2 text-zinc-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                <button onClick={() => addItem<Institutional>('institutional', { title: '', text: '' })} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar</button>
                            </div>

                            {/* Timeline */}
                            <GroupTitle>Linha do tempo (projeto)</GroupTitle>
                            <div className="space-y-2">
                                {form.timeline.map((t, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <input className={inputCls + ' w-24'} value={t.year} onChange={e => patchItem('timeline', i, { year: e.target.value })} placeholder="2026" />
                                        <input className={inputCls + ' flex-1'} value={t.label} onChange={e => patchItem('timeline', i, { label: e.target.value })} placeholder="Sub-15 — Brasileiros" />
                                        <button onClick={() => removeItem('timeline', i)} className="p-2 text-zinc-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                <button onClick={() => addItem<TimelineItem>('timeline', { year: '', label: '' })} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar etapa</button>
                            </div>
                            <Labeled label="Observação da linha do tempo"><input className={inputCls} value={form.timeline_note} onChange={e => set('timeline_note', e.target.value)} /></Labeled>

                            {/* Family letter */}
                            <GroupTitle>Carta da família</GroupTitle>
                            <Labeled label="Texto da carta"><textarea rows={6} className={inputCls} value={form.family_letter} onChange={e => set('family_letter', e.target.value)} /></Labeled>
                            <Labeled label="Assinatura"><input className={inputCls} value={form.family_letter_signature} onChange={e => set('family_letter_signature', e.target.value)} placeholder="Família Fujimoto" /></Labeled>

                            {/* Custom sections */}
                            <GroupTitle>Seções personalizadas (qualquer informação)</GroupTitle>
                            <div className="space-y-2">
                                {form.custom_sections.map((s, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <div className="flex-1 space-y-2">
                                            <input className={inputCls} value={s.title} onChange={e => patchItem('custom_sections', i, { title: e.target.value })} placeholder="Título da seção" />
                                            <textarea rows={3} className={inputCls} value={s.body} onChange={e => patchItem('custom_sections', i, { body: e.target.value })} placeholder="Conteúdo (aceita quebras de linha)" />
                                        </div>
                                        <button onClick={() => removeItem('custom_sections', i)} className="p-2 text-zinc-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                <button onClick={() => addItem<CustomSection>('custom_sections', { title: '', body: '' })} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar seção</button>
                            </div>

                            {/* Closing + contact */}
                            <GroupTitle>Fechamento e contato</GroupTitle>
                            <div className="grid grid-cols-1 gap-4">
                                <Labeled label="Título do fechamento"><input className={inputCls} value={form.closing_title} onChange={e => set('closing_title', e.target.value)} /></Labeled>
                                <Labeled label="Texto do fechamento"><textarea rows={2} className={inputCls} value={form.closing_body} onChange={e => set('closing_body', e.target.value)} /></Labeled>
                                <Labeled label="Foto de fechamento (URL)" hint="Uma foto forte do Henrique para o final. Suba na seção Fotos acima e cole aqui a URL.">
                                    <input className={inputCls} value={form.closing_image_url} onChange={e => set('closing_image_url', e.target.value)} placeholder="https://..." />
                                </Labeled>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Labeled label="Nome do contato"><input className={inputCls} value={form.contact_name} onChange={e => set('contact_name', e.target.value)} /></Labeled>
                                <Labeled label="WhatsApp (link wa.me)"><input className={inputCls} value={form.contact_whatsapp} onChange={e => set('contact_whatsapp', e.target.value)} placeholder="https://wa.me/55..." /></Labeled>
                                <Labeled label="E-mail"><input className={inputCls} value={form.contact_email} onChange={e => set('contact_email', e.target.value)} /></Labeled>
                            </div>

                            {/* Save bar */}
                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
                                <button onClick={cancel} className="px-4 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800">Cancelar</button>
                                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 disabled:opacity-40">
                                    <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar projeto'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* LIST */}
            {!editing && (
                loading ? (
                    <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-16 bg-zinc-900/60 border border-zinc-800/50 rounded-2xl animate-pulse" />)}</div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-16 text-zinc-500">
                        <Handshake className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Nenhum projeto de parceria ainda.</p>
                        <p className="text-xs mt-1">Clique em "Novo Projeto" para começar.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {projects.map(p => (
                            <div key={p.id} className={`bg-zinc-900/60 border rounded-2xl p-4 flex items-center gap-4 ${p.is_active ? 'border-zinc-800/50' : 'border-zinc-800/50 opacity-50'}`}>
                                <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-zinc-700/50 overflow-hidden flex items-center justify-center flex-shrink-0">
                                    {p.partner_logo_url ? <img src={p.partner_logo_url} alt="" className="w-full h-full object-contain" /> : <Handshake className="w-5 h-5 text-zinc-600" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{p.project_title || p.slug}</p>
                                    <p className="text-xs text-zinc-500 truncate">/parceria/{p.slug} · {p.partner_name}</p>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <a href={`/parceria/${p.slug}`} target="_blank" rel="noreferrer" className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800" title="Ver página"><ExternalLink className="w-4 h-4" /></a>
                                    <button onClick={() => toggleActive(p)} className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800" title={p.is_active ? 'Desativar' : 'Ativar'}>{p.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
                                    <button onClick={() => startEdit(p)} className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800" title="Editar"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(p.id!)} className="p-2 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
