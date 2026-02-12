import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Edit, Trash2, Eye, EyeOff, Save, X, ExternalLink,
    Search, Sparkles, Upload, Link2, Clock, BarChart3, CheckCircle2,
    AlertTriangle, FileText, Globe, ChevronDown, ArrowLeft, Copy, Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ─── Types ───────────────────────────────────────────────
interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    meta_title: string | null;
    meta_description: string | null;
    keywords: string[];
    og_image: string | null;
    category: string;
    status: 'draft' | 'published' | 'archived';
    reading_time: number;
    source_url: string | null;
    author: string;
    created_at: string;
    updated_at: string;
    published_at: string | null;
}

const CATEGORIES = [
    { value: 'judô', label: '🥋 Judô' },
    { value: 'treino', label: '💪 Treino' },
    { value: 'competição', label: '🏆 Competição' },
    { value: 'nutrição', label: '🥗 Nutrição' },
    { value: 'vida-de-atleta', label: '🌟 Vida de Atleta' },
    { value: 'notícias', label: '📰 Notícias' },
    { value: 'geral', label: '📝 Geral' },
];

// ─── SEO Helpers ─────────────────────────────────────────
function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function estimateReadingTime(content: string): number {
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
}

function getSeoScore(post: Partial<BlogPost>): { score: number; issues: string[]; good: string[] } {
    const issues: string[] = [];
    const good: string[] = [];
    let score = 0;

    // Title
    const titleLen = (post.meta_title || post.title || '').length;
    if (titleLen >= 30 && titleLen <= 60) { score += 15; good.push('Meta título tem tamanho ideal (30-60 chars)'); }
    else if (titleLen > 0) { score += 5; issues.push(`Meta título tem ${titleLen} chars (ideal: 30-60)`); }
    else { issues.push('Meta título não definido'); }

    // Description
    const descLen = (post.meta_description || '').length;
    if (descLen >= 120 && descLen <= 160) { score += 15; good.push('Meta descrição tem tamanho ideal (120-160 chars)'); }
    else if (descLen > 0) { score += 5; issues.push(`Meta descrição tem ${descLen} chars (ideal: 120-160)`); }
    else { issues.push('Meta descrição não definida'); }

    // Slug
    if (post.slug && post.slug.length > 0 && post.slug.length <= 75) { score += 10; good.push('Slug definido e com bom tamanho'); }
    else if (!post.slug) { issues.push('Slug não definido'); }

    // Keywords
    if (post.keywords && post.keywords.length >= 3) { score += 15; good.push(`${post.keywords.length} palavras-chave definidas`); }
    else if (post.keywords && post.keywords.length > 0) { score += 5; issues.push('Adicione mais palavras-chave (mín. 3)'); }
    else { issues.push('Nenhuma palavra-chave definida'); }

    // Content length
    const contentLen = (post.content || '').length;
    if (contentLen >= 1500) { score += 15; good.push('Conteúdo com tamanho excelente para SEO'); }
    else if (contentLen >= 500) { score += 8; issues.push('Conteúdo poderia ser mais longo (ideal: 1500+ chars)'); }
    else { issues.push('Conteúdo muito curto para SEO'); }

    // OG Image
    if (post.og_image) { score += 10; good.push('Imagem de capa definida'); }
    else { issues.push('Imagem de capa não definida (importante para redes sociais)'); }

    // Excerpt
    if (post.excerpt && post.excerpt.length >= 50) { score += 10; good.push('Resumo definido'); }
    else { issues.push('Resumo (excerpt) não definido'); }

    // H2 headings in content
    const h2Count = (post.content || '').match(/^## /gm)?.length || 0;
    if (h2Count >= 2) { score += 10; good.push(`${h2Count} subtítulos H2 encontrados`); }
    else { issues.push('Adicione subtítulos (## ) para melhorar a estrutura'); }

    return { score: Math.min(100, score), issues, good };
}

// ─── SERP Preview ────────────────────────────────────────
function SERPPreview({ title, description, slug }: { title: string; description: string; slug: string }) {
    const baseUrl = 'henriquefujimoto.com.br';
    return (
        <div className="bg-white rounded-lg p-4 space-y-1">
            <p className="text-xs text-green-700 font-normal">{baseUrl}/blog/{slug || 'url-do-post'}</p>
            <p className="text-[#1a0dab] text-lg font-normal leading-tight hover:underline cursor-pointer truncate">
                {title || 'Título do Post — Henrique Fujimoto'}
            </p>
            <p className="text-sm text-[#545454] leading-snug line-clamp-2">
                {description || 'Meta descrição do post. Esta descrição aparecerá nos resultados de busca do Google. Escreva algo que convide o usuário a clicar.'}
            </p>
        </div>
    );
}

// ─── SEO Score Widget ────────────────────────────────────
function SEOScoreWidget({ post }: { post: Partial<BlogPost> }) {
    const { score, issues, good } = getSeoScore(post);
    const [expanded, setExpanded] = useState(false);

    const color = score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400';
    const bgColor = score >= 80 ? 'bg-emerald-500/20' : score >= 50 ? 'bg-amber-500/20' : 'bg-red-500/20';
    const ringColor = score >= 80 ? 'stroke-emerald-400' : score >= 50 ? 'stroke-amber-400' : 'stroke-red-400';

    return (
        <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/50">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    {/* Circular progress */}
                    <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15" fill="none" stroke="#27272a" strokeWidth="3" />
                            <circle
                                cx="18" cy="18" r="15" fill="none"
                                className={ringColor} strokeWidth="3"
                                strokeDasharray={`${score * 0.94} 100`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${color}`}>
                            {score}
                        </span>
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-medium text-white">Score SEO</p>
                        <p className={`text-xs ${color}`}>
                            {score >= 80 ? 'Excelente' : score >= 50 ? 'Pode melhorar' : 'Precisa de atenção'}
                        </p>
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 space-y-2">
                            {good.map((item, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-zinc-300">{item}</span>
                                </div>
                            ))}
                            {issues.map((item, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-zinc-400">{item}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Main BlogTab Component ─────────────────────────────
export default function BlogTab() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [sourceUrl, setSourceUrl] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [newKeyword, setNewKeyword] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    async function fetchPosts() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (err) {
            console.error('Error fetching blog posts:', err);
        } finally {
            setLoading(false);
        }
    }

    function openNewPost() {
        setEditingPost({
            title: '',
            slug: '',
            excerpt: '',
            content: '',
            meta_title: '',
            meta_description: '',
            keywords: [],
            og_image: '',
            category: 'geral',
            status: 'draft',
            reading_time: 1,
            source_url: '',
            author: 'Henrique Fujimoto',
        });
        setSourceUrl('');
        setView('editor');
    }

    function openEditPost(post: BlogPost) {
        setEditingPost({ ...post });
        setSourceUrl(post.source_url || '');
        setView('editor');
    }

    async function handleGenerateFromUrl() {
        if (!sourceUrl.trim()) {
            setMessage({ type: 'error', text: 'Cole uma URL para gerar o conteúdo' });
            return;
        }

        setGenerating(true);
        setMessage(null);

        try {
            const { data: { publicUrl } } = supabase.storage.from('site-images').getPublicUrl('dummy');
            const projectUrl = publicUrl.split('/storage/')[0];

            const response = await fetch(`${projectUrl}/functions/v1/generate-blog-post`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: sourceUrl.trim() }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Erro ${response.status}`);
            }

            const result = await response.json();

            setEditingPost(prev => ({
                ...prev,
                title: result.title || prev?.title || '',
                slug: slugify(result.title || ''),
                excerpt: result.excerpt || '',
                content: result.content || '',
                meta_title: result.meta_title || result.title || '',
                meta_description: result.meta_description || result.excerpt || '',
                keywords: result.keywords || [],
                category: result.category || prev?.category || 'geral',
                reading_time: estimateReadingTime(result.content || ''),
                source_url: sourceUrl.trim(),
            }));

            setMessage({ type: 'success', text: 'Conteúdo gerado com sucesso! Revise e publique.' });
        } catch (err) {
            console.error('Error generating post:', err);
            setMessage({ type: 'error', text: `Erro ao gerar: ${err instanceof Error ? err.message : 'Falha na geração'}` });
        } finally {
            setGenerating(false);
        }
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `blog-${Date.now()}.${fileExt}`;
            const filePath = `blog/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('site-images')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('site-images')
                .getPublicUrl(filePath);

            setEditingPost(prev => ({ ...prev, og_image: data.publicUrl }));
            setMessage({ type: 'success', text: 'Imagem de capa carregada!' });
        } catch (err) {
            console.error('Error uploading image:', err);
            setMessage({ type: 'error', text: 'Erro ao fazer upload da imagem' });
        } finally {
            setUploadingImage(false);
        }
    }

    async function handleSave(publish: boolean = false) {
        if (!editingPost) return;
        if (!editingPost.title?.trim()) {
            setMessage({ type: 'error', text: 'Título é obrigatório' });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            const slug = editingPost.slug || slugify(editingPost.title || '');
            const now = new Date().toISOString();

            const postData = {
                title: editingPost.title!.trim(),
                slug,
                excerpt: editingPost.excerpt || null,
                content: editingPost.content || '',
                meta_title: editingPost.meta_title || editingPost.title!.trim(),
                meta_description: editingPost.meta_description || editingPost.excerpt || null,
                keywords: editingPost.keywords || [],
                og_image: editingPost.og_image || null,
                category: editingPost.category || 'geral',
                status: publish ? 'published' : (editingPost.status || 'draft'),
                reading_time: estimateReadingTime(editingPost.content || ''),
                source_url: editingPost.source_url || null,
                author: editingPost.author || 'Henrique Fujimoto',
                updated_at: now,
                ...(publish && !editingPost.published_at ? { published_at: now } : {}),
            };

            let result;
            if (editingPost.id) {
                // Update
                result = await supabase
                    .from('blog_posts')
                    .update(postData)
                    .eq('id', editingPost.id)
                    .select()
                    .single();
            } else {
                // Insert
                result = await supabase
                    .from('blog_posts')
                    .insert({ ...postData, created_at: now })
                    .select()
                    .single();
            }

            if (result.error) throw result.error;

            setMessage({ type: 'success', text: publish ? 'Post publicado com sucesso!' : 'Rascunho salvo!' });
            await fetchPosts();

            if (result.data) {
                setEditingPost(result.data);
            }
        } catch (err) {
            console.error('Error saving post:', err);
            setMessage({ type: 'error', text: `Erro ao salvar: ${err instanceof Error ? err.message : 'Erro desconhecido'}` });
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza que deseja excluir este post?')) return;

        try {
            const { error } = await supabase.from('blog_posts').delete().eq('id', id);
            if (error) throw error;
            setPosts(prev => prev.filter(p => p.id !== id));
            setMessage({ type: 'success', text: 'Post excluído' });
        } catch (err) {
            console.error('Error deleting post:', err);
            setMessage({ type: 'error', text: 'Erro ao excluir post' });
        }
    }

    function addKeyword() {
        if (!newKeyword.trim() || !editingPost) return;
        const kw = newKeyword.trim().toLowerCase();
        if (editingPost.keywords?.includes(kw)) return;
        setEditingPost(prev => ({
            ...prev,
            keywords: [...(prev?.keywords || []), kw],
        }));
        setNewKeyword('');
    }

    function removeKeyword(kw: string) {
        setEditingPost(prev => ({
            ...prev,
            keywords: (prev?.keywords || []).filter(k => k !== kw),
        }));
    }

    // ─── Post List View ──────────────────────────────────
    if (view === 'list') {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Blog</h2>
                        <p className="text-zinc-400">Gerencie seus posts com IA e SEO profissional</p>
                    </div>
                    <button
                        onClick={openNewPost}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-black rounded-xl font-medium hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Post
                    </button>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <FileText className="w-12 h-12 text-zinc-700 mb-4" />
                        <p className="text-zinc-400 mb-2">Nenhum post ainda</p>
                        <p className="text-zinc-600 text-sm mb-4">Crie seu primeiro post com IA!</p>
                        <button
                            onClick={openNewPost}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            <Sparkles className="w-4 h-4" />
                            Criar Post com IA
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {posts.map(post => {
                            const seo = getSeoScore(post);
                            return (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4 hover:border-zinc-700/50 transition-colors"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Thumbnail */}
                                        {post.og_image && (
                                            <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                                                <img src={post.og_image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        )}

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${post.status === 'published'
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : 'bg-amber-500/20 text-amber-400'
                                                    }`}>
                                                    {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                                                </span>
                                                <span className="text-[10px] text-zinc-600">
                                                    {CATEGORIES.find(c => c.value === post.category)?.label || post.category}
                                                </span>
                                                {/* SEO mini badge */}
                                                <span className={`text-[10px] font-bold ${seo.score >= 80 ? 'text-emerald-400' : seo.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                                    SEO {seo.score}
                                                </span>
                                            </div>
                                            <h3 className="text-white font-medium truncate">{post.title}</h3>
                                            <p className="text-xs text-zinc-500 mt-1">
                                                {new Date(post.created_at).toLocaleDateString('pt-BR')} • {post.reading_time} min leitura
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => openEditPost(post)}
                                                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            {post.status === 'published' && (
                                                <a
                                                    href={`/blog/${post.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-zinc-400 hover:text-primary rounded-lg hover:bg-zinc-800 transition-colors"
                                                    title="Ver post"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="p-2 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // ─── Editor View ─────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { setView('list'); setEditingPost(null); setMessage(null); }}
                        className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            {editingPost?.id ? 'Editar Post' : 'Novo Post'}
                        </h2>
                        <p className="text-zinc-400 text-sm">
                            {editingPost?.id ? 'Edite e otimize seu post' : 'Gere conteúdo com IA ou escreva manualmente'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleSave(false)}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-xl font-medium hover:bg-zinc-700 transition-colors disabled:opacity-50 text-sm"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Salvando...' : 'Salvar Rascunho'}
                    </button>
                    <button
                        onClick={() => handleSave(true)}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
                    >
                        <Globe className="w-4 h-4" />
                        Publicar
                    </button>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {message.text}
                </div>
            )}

            {/* AI Generation Section */}
            <div className="bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-primary/10 border border-violet-500/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-violet-400" />
                    <h3 className="text-white font-semibold">Gerar com IA</h3>
                </div>
                <p className="text-zinc-400 text-xs mb-3">
                    Cole a URL de uma notícia, post ou artigo. A IA vai gerar um post otimizado para SEO.
                </p>
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="url"
                            value={sourceUrl}
                            onChange={(e) => setSourceUrl(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-zinc-900/80 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 placeholder-zinc-600"
                            placeholder="https://exemplo.com/artigo-de-referencia"
                        />
                    </div>
                    <button
                        onClick={handleGenerateFromUrl}
                        disabled={generating || !sourceUrl.trim()}
                        className="flex items-center gap-2 px-5 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-500 transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Gerando...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Gerar Post
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Content Editor (2 cols) */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">Título do Post</label>
                        <input
                            type="text"
                            value={editingPost?.title || ''}
                            onChange={(e) => {
                                const title = e.target.value;
                                setEditingPost(prev => ({
                                    ...prev,
                                    title,
                                    slug: prev?.slug || slugify(title),
                                    meta_title: prev?.meta_title || title,
                                }));
                            }}
                            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white text-lg font-semibold focus:outline-none focus:border-primary placeholder-zinc-600"
                            placeholder="Título impactante do seu post"
                        />
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">Resumo / Excerpt</label>
                        <textarea
                            value={editingPost?.excerpt || ''}
                            onChange={(e) => setEditingPost(prev => ({ ...prev, excerpt: e.target.value }))}
                            rows={2}
                            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary placeholder-zinc-600 resize-none"
                            placeholder="Resumo curto que aparece na listagem e redes sociais"
                        />
                    </div>

                    {/* Content Editor */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-medium text-zinc-400">Conteúdo (Markdown)</label>
                            <div className="flex items-center gap-3 text-xs text-zinc-500">
                                <span>
                                    <Clock className="w-3 h-3 inline mr-1" />
                                    {estimateReadingTime(editingPost?.content || '')} min leitura
                                </span>
                                <span>{(editingPost?.content || '').length} chars</span>
                            </div>
                        </div>
                        <textarea
                            value={editingPost?.content || ''}
                            onChange={(e) => setEditingPost(prev => ({
                                ...prev,
                                content: e.target.value,
                                reading_time: estimateReadingTime(e.target.value),
                            }))}
                            rows={20}
                            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary placeholder-zinc-600 resize-y font-mono leading-relaxed"
                            placeholder={`## Introdução\n\nEscreva o conteúdo do post aqui em Markdown...\n\n## Subtítulo\n\nParágrafo com **destaques** e [links](url).\n\n## Conclusão\n\nFinalize com um call-to-action.`}
                        />
                    </div>

                    {/* Cover Image */}
                    <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/50">
                        <label className="block text-xs font-medium text-zinc-400 mb-2">🖼️ Imagem de Capa (OG Image)</label>
                        <div className="flex gap-3">
                            <input
                                type="url"
                                value={editingPost?.og_image || ''}
                                onChange={(e) => setEditingPost(prev => ({ ...prev, og_image: e.target.value }))}
                                className="flex-1 px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary placeholder-zinc-600"
                                placeholder="URL da imagem ou faça upload"
                            />
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingImage}
                                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-700 text-white rounded-xl text-sm hover:bg-zinc-600 transition-colors disabled:opacity-50"
                            >
                                <Upload className="w-4 h-4" />
                                {uploadingImage ? 'Enviando...' : 'Upload'}
                            </button>
                        </div>
                        {editingPost?.og_image && (
                            <div className="mt-3 relative rounded-lg overflow-hidden h-40">
                                <img src={editingPost.og_image} alt="Cover" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: SEO Panel (1 col) */}
                <div className="space-y-4">
                    {/* SEO Score */}
                    <SEOScoreWidget post={editingPost || {}} />

                    {/* Google SERP Preview */}
                    <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/50">
                        <div className="flex items-center gap-2 mb-3">
                            <Search className="w-4 h-4 text-zinc-400" />
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Preview no Google</label>
                        </div>
                        <SERPPreview
                            title={editingPost?.meta_title || editingPost?.title || ''}
                            description={editingPost?.meta_description || editingPost?.excerpt || ''}
                            slug={editingPost?.slug || ''}
                        />
                    </div>

                    {/* Meta Title */}
                    <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/50">
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-medium text-zinc-400">Meta Título</label>
                            <span className={`text-[10px] font-medium ${(editingPost?.meta_title || '').length > 60 ? 'text-red-400'
                                    : (editingPost?.meta_title || '').length >= 30 ? 'text-emerald-400'
                                        : 'text-zinc-500'
                                }`}>
                                {(editingPost?.meta_title || '').length}/60
                            </span>
                        </div>
                        <input
                            type="text"
                            value={editingPost?.meta_title || ''}
                            onChange={(e) => setEditingPost(prev => ({ ...prev, meta_title: e.target.value }))}
                            className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                            placeholder="Título otimizado para o Google"
                        />
                        <div className="mt-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all ${(editingPost?.meta_title || '').length > 60 ? 'bg-red-400'
                                        : (editingPost?.meta_title || '').length >= 30 ? 'bg-emerald-400'
                                            : 'bg-zinc-600'
                                    }`}
                                style={{ width: `${Math.min(100, ((editingPost?.meta_title || '').length / 60) * 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Meta Description */}
                    <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/50">
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-medium text-zinc-400">Meta Descrição</label>
                            <span className={`text-[10px] font-medium ${(editingPost?.meta_description || '').length > 160 ? 'text-red-400'
                                    : (editingPost?.meta_description || '').length >= 120 ? 'text-emerald-400'
                                        : 'text-zinc-500'
                                }`}>
                                {(editingPost?.meta_description || '').length}/160
                            </span>
                        </div>
                        <textarea
                            value={editingPost?.meta_description || ''}
                            onChange={(e) => setEditingPost(prev => ({ ...prev, meta_description: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary resize-none"
                            placeholder="Descrição que aparece nos resultados do Google"
                        />
                        <div className="mt-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all ${(editingPost?.meta_description || '').length > 160 ? 'bg-red-400'
                                        : (editingPost?.meta_description || '').length >= 120 ? 'bg-emerald-400'
                                            : 'bg-zinc-600'
                                    }`}
                                style={{ width: `${Math.min(100, ((editingPost?.meta_description || '').length / 160) * 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Slug */}
                    <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/50">
                        <label className="text-xs font-medium text-zinc-400 mb-1 block">URL (Slug)</label>
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] text-zinc-600 whitespace-nowrap">/blog/</span>
                            <input
                                type="text"
                                value={editingPost?.slug || ''}
                                onChange={(e) => setEditingPost(prev => ({
                                    ...prev,
                                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                                }))}
                                className="flex-1 px-2 py-1.5 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white text-xs focus:outline-none focus:border-primary font-mono"
                                placeholder="url-amigavel-do-post"
                            />
                        </div>
                    </div>

                    {/* Keywords */}
                    <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/50">
                        <label className="text-xs font-medium text-zinc-400 mb-2 block">Palavras-chave</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
                                className="flex-1 px-3 py-1.5 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white text-xs focus:outline-none focus:border-primary"
                                placeholder="Adicionar keyword..."
                            />
                            <button
                                onClick={addKeyword}
                                className="px-3 py-1.5 bg-zinc-700 text-white rounded-lg text-xs hover:bg-zinc-600"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {(editingPost?.keywords || []).map(kw => (
                                <span
                                    key={kw}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-[10px] font-medium"
                                >
                                    {kw}
                                    <button onClick={() => removeKeyword(kw)} className="hover:text-red-400">
                                        <X className="w-2.5 h-2.5" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Category */}
                    <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/50">
                        <label className="text-xs font-medium text-zinc-400 mb-1 block">Categoria</label>
                        <select
                            value={editingPost?.category || 'geral'}
                            onChange={(e) => setEditingPost(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Author */}
                    <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/50">
                        <label className="text-xs font-medium text-zinc-400 mb-1 block">Autor</label>
                        <input
                            type="text"
                            value={editingPost?.author || 'Henrique Fujimoto'}
                            onChange={(e) => setEditingPost(prev => ({ ...prev, author: e.target.value }))}
                            className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
