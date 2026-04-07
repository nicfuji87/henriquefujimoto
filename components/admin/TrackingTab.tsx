import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, BarChart3, Globe, Code, Eye, AlertTriangle,
    CheckCircle2, ExternalLink, Search, Share2,
    Plus, Trash2, Zap, X, Activity, Pencil
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TrackingConfig {
    id: string;
    ga4_measurement_id: string;
    google_search_console_verification: string;
    google_tag_manager_id: string;
    meta_pixel_id: string;
    meta_domain_verification: string;
    tiktok_pixel_id: string;
    custom_head_scripts: string;
    site_title: string;
    site_description: string;
    site_keywords: string;
    og_default_image: string;
}

interface TrackingEvent {
    id: string;
    event_name: string;
    description: string | null;
    is_standard_meta: boolean;
    meta_params: Record<string, any>;
    ga4_params: Record<string, any>;
    created_at: string;
}

const META_STANDARD_EVENTS = [
    'AddPaymentInfo', 'AddToCart', 'AddToWishlist', 'CompleteRegistration',
    'Contact', 'CustomizeProduct', 'Donate', 'FindLocation', 'InitiateCheckout',
    'Lead', 'Purchase', 'Schedule', 'Search', 'StartTrial', 'SubmitApplication',
    'Subscribe', 'ViewContent'
];

function StatusBadge({ active }: { active: boolean }) {
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700/30 text-zinc-500'
            }`}>
            {active ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            {active ? 'Ativo' : 'Não configurado'}
        </span>
    );
}

export default function TrackingTab() {
    const [config, setConfig] = useState<TrackingConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Custom Events State
    const [events, setEvents] = useState<TrackingEvent[]>([]);
    const [showEventForm, setShowEventForm] = useState(false);
    const [newEventName, setNewEventName] = useState('');
    const [newEventDesc, setNewEventDesc] = useState('');
    const [newEventIsStandard, setNewEventIsStandard] = useState(false);
    const [newEventStandardName, setNewEventStandardName] = useState(META_STANDARD_EVENTS[0]);
    const [savingEvent, setSavingEvent] = useState(false);

    // Edit event state
    const [editingEventId, setEditingEventId] = useState<string | null>(null);
    const [editEventName, setEditEventName] = useState('');
    const [editEventDesc, setEditEventDesc] = useState('');
    const [editEventIsStandard, setEditEventIsStandard] = useState(false);

    useEffect(() => {
        fetchConfig();
        fetchEvents();
    }, []);

    async function fetchConfig() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('tracking_config')
                .select('*')
                .limit(1)
                .single();

            if (error) throw error;
            setConfig(data);
        } catch (err) {
            console.error('Error fetching tracking config:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!config) return;
        setSaving(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('tracking_config')
                .update({
                    ga4_measurement_id: config.ga4_measurement_id,
                    google_search_console_verification: config.google_search_console_verification,
                    google_tag_manager_id: config.google_tag_manager_id,
                    meta_pixel_id: config.meta_pixel_id,
                    meta_domain_verification: config.meta_domain_verification,
                    tiktok_pixel_id: config.tiktok_pixel_id,
                    custom_head_scripts: config.custom_head_scripts,
                    site_title: config.site_title,
                    site_description: config.site_description,
                    site_keywords: config.site_keywords,
                    og_default_image: config.og_default_image,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', config.id);

            if (error) throw error;
            setMessage({ type: 'success', text: 'Configurações de tracking salvas! As alterações serão aplicadas ao recarregar o site.' });
        } catch (err) {
            console.error('Error saving tracking config:', err);
            setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
        } finally {
            setSaving(false);
        }
    }

    function updateField(field: keyof TrackingConfig, value: string) {
        setConfig(prev => prev ? { ...prev, [field]: value } : prev);
    }

    // ---- Custom Events Functions ----
    async function fetchEvents() {
        const { data } = await supabase
            .from('tracking_events')
            .select('*')
            .order('created_at', { ascending: false });
        setEvents(data || []);
    }

    async function handleAddEvent() {
        const eventName = newEventIsStandard ? newEventStandardName : newEventName.trim();
        if (!eventName) return;
        setSavingEvent(true);
        try {
            const { error } = await supabase.from('tracking_events').insert({
                event_name: eventName,
                description: newEventDesc.trim() || null,
                is_standard_meta: newEventIsStandard,
                meta_params: {},
                ga4_params: {},
            });
            if (error) throw error;
            setNewEventName('');
            setNewEventDesc('');
            setNewEventIsStandard(false);
            setShowEventForm(false);
            fetchEvents();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Erro ao criar evento' });
        } finally {
            setSavingEvent(false);
        }
    }

    async function handleDeleteEvent(id: string) {
        if (!confirm('Excluir este evento? Produtos e cards associados perderão o vínculo.')) return;
        await supabase.from('tracking_events').delete().eq('id', id);
        fetchEvents();
    }

    function startEditEvent(ev: TrackingEvent) {
        setEditingEventId(ev.id);
        setEditEventName(ev.event_name);
        setEditEventDesc(ev.description || '');
        setEditEventIsStandard(ev.is_standard_meta);
    }

    function cancelEditEvent() {
        setEditingEventId(null);
        setEditEventName('');
        setEditEventDesc('');
        setEditEventIsStandard(false);
    }

    async function handleUpdateEvent() {
        if (!editingEventId || !editEventName.trim()) return;
        setSavingEvent(true);
        try {
            const { error } = await supabase
                .from('tracking_events')
                .update({
                    event_name: editEventName.trim(),
                    description: editEventDesc.trim() || null,
                    is_standard_meta: editEventIsStandard,
                })
                .eq('id', editingEventId);
            if (error) throw error;
            cancelEditEvent();
            fetchEvents();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Erro ao atualizar evento' });
        } finally {
            setSavingEvent(false);
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Tracking & SEO</h2>
                    <p className="text-zinc-400">Carregando...</p>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 animate-pulse">
                            <div className="h-5 bg-zinc-800 rounded w-40 mb-4"></div>
                            <div className="h-10 bg-zinc-800 rounded w-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!config) return null;

    return (
        <div className="space-y-6 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Tracking & SEO</h2>
                    <p className="text-zinc-400">Configure pixels, analytics e meta tags para indexação</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 w-full sm:w-auto justify-center"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Salvando...' : 'Salvar Tudo'}
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {message.text}
                </div>
            )}

            {/* Status Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5"
            >
                <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Status dos Serviços</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2">
                        <StatusBadge active={!!config.ga4_measurement_id} />
                        <span className="text-xs text-zinc-400">Google Analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge active={!!config.meta_pixel_id} />
                        <span className="text-xs text-zinc-400">Meta Pixel</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge active={!!config.google_tag_manager_id} />
                        <span className="text-xs text-zinc-400">Tag Manager</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge active={!!config.google_search_console_verification} />
                        <span className="text-xs text-zinc-400">Search Console</span>
                    </div>
                </div>
            </motion.div>

            {/* Google Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 space-y-5"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Google</h3>
                        <p className="text-xs text-zinc-500">Analytics, Tag Manager e Search Console</p>
                    </div>
                </div>

                {/* GA4 */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium text-zinc-300">Google Analytics 4 (GA4)</label>
                        <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline flex items-center gap-1">
                            Obter ID <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                    </div>
                    <input
                        type="text"
                        value={config.ga4_measurement_id}
                        onChange={(e) => updateField('ga4_measurement_id', e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 placeholder-zinc-600"
                        placeholder="G-XXXXXXXXXX"
                    />
                    <p className="text-[10px] text-zinc-600 mt-1">
                        Encontre em: Analytics → Admin → Fluxos de dados → ID da métrica
                    </p>
                </div>

                {/* GTM */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium text-zinc-300">Google Tag Manager</label>
                        <a href="https://tagmanager.google.com" target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline flex items-center gap-1">
                            Obter ID <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                    </div>
                    <input
                        type="text"
                        value={config.google_tag_manager_id}
                        onChange={(e) => updateField('google_tag_manager_id', e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 placeholder-zinc-600"
                        placeholder="GTM-XXXXXXX"
                    />
                    <p className="text-[10px] text-zinc-600 mt-1">
                        Opcional. Se usar GTM, pode não precisar do GA4 direto
                    </p>
                </div>

                {/* Search Console */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium text-zinc-300">Google Search Console — Verificação</label>
                        <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline flex items-center gap-1">
                            Verificar <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                    </div>
                    <input
                        type="text"
                        value={config.google_search_console_verification}
                        onChange={(e) => updateField('google_search_console_verification', e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 placeholder-zinc-600"
                        placeholder="Código de verificação (meta tag content)"
                    />
                    <p className="text-[10px] text-zinc-600 mt-1">
                        Cole apenas o valor do "content" da meta tag de verificação
                    </p>
                </div>
            </motion.div>

            {/* Meta / Facebook Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 space-y-5"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                        <Share2 className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Meta (Facebook / Instagram)</h3>
                        <p className="text-xs text-zinc-500">Pixel para remarketing e públicos personalizados</p>
                    </div>
                </div>

                {/* Meta Pixel */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium text-zinc-300">Meta Pixel ID</label>
                        <a href="https://business.facebook.com/events_manager2" target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1">
                            Obter Pixel <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                    </div>
                    <input
                        type="text"
                        value={config.meta_pixel_id}
                        onChange={(e) => updateField('meta_pixel_id', e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-zinc-600"
                        placeholder="1234567890123456"
                    />
                    <p className="text-[10px] text-zinc-600 mt-1">
                        Events Manager → Fontes de dados → ID do Pixel (16 dígitos)
                    </p>
                </div>

                {/* Meta Domain Verification */}
                <div>
                    <label className="text-sm font-medium text-zinc-300 mb-1 block">Verificação de Domínio Meta</label>
                    <input
                        type="text"
                        value={config.meta_domain_verification}
                        onChange={(e) => updateField('meta_domain_verification', e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-zinc-600"
                        placeholder="Código de verificação do domínio"
                    />
                    <p className="text-[10px] text-zinc-600 mt-1">
                        Business Settings → Brand Safety → Domains → Meta tag content
                    </p>
                </div>
            </motion.div>

            {/* TikTok */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 space-y-5"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                        <span className="text-lg">🎵</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">TikTok</h3>
                        <p className="text-xs text-zinc-500">Pixel para campanhas no TikTok Ads</p>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-zinc-300 mb-1 block">TikTok Pixel ID</label>
                    <input
                        type="text"
                        value={config.tiktok_pixel_id}
                        onChange={(e) => updateField('tiktok_pixel_id', e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-pink-500 placeholder-zinc-600"
                        placeholder="CXXXXXXXXXXXXXXXXX"
                    />
                </div>
            </motion.div>

            {/* SEO Global */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 space-y-5"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Search className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">SEO Global</h3>
                        <p className="text-xs text-zinc-500">Meta tags padrão para todas as páginas</p>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-zinc-300 mb-1 block">Título do Site</label>
                    <input
                        type="text"
                        value={config.site_title}
                        onChange={(e) => updateField('site_title', e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 placeholder-zinc-600"
                        placeholder="Henrique Fujimoto — Judô & Alta Performance"
                    />
                    <p className="text-[10px] text-zinc-600 mt-1">{config.site_title.length}/60 caracteres</p>
                </div>

                <div>
                    <label className="text-sm font-medium text-zinc-300 mb-1 block">Descrição do Site</label>
                    <textarea
                        value={config.site_description}
                        onChange={(e) => updateField('site_description', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 placeholder-zinc-600 resize-none"
                        placeholder="Descrição do site que aparece nos resultados do Google"
                    />
                    <p className="text-[10px] text-zinc-600 mt-1">{config.site_description.length}/160 caracteres</p>
                </div>

                <div>
                    <label className="text-sm font-medium text-zinc-300 mb-1 block">Palavras-chave</label>
                    <input
                        type="text"
                        value={config.site_keywords}
                        onChange={(e) => updateField('site_keywords', e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 placeholder-zinc-600"
                        placeholder="judô, atleta, henrique fujimoto, alta performance"
                    />
                    <p className="text-[10px] text-zinc-600 mt-1">Separadas por vírgula</p>
                </div>

                <div>
                    <label className="text-sm font-medium text-zinc-300 mb-1 block">Imagem OG padrão (compartilhamento social)</label>
                    <input
                        type="url"
                        value={config.og_default_image}
                        onChange={(e) => updateField('og_default_image', e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 placeholder-zinc-600"
                        placeholder="https://..."
                    />
                    <p className="text-[10px] text-zinc-600 mt-1">Imagem exibida ao compartilhar o link nas redes sociais (ideal: 1200x630px)</p>
                </div>
            </motion.div>

            {/* Custom Scripts */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 space-y-5"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <Code className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Scripts Personalizados</h3>
                        <p className="text-xs text-zinc-500">Código customizado inserido no &lt;head&gt; do site</p>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-zinc-300 mb-1 block">Scripts no &lt;head&gt;</label>
                    <textarea
                        value={config.custom_head_scripts}
                        onChange={(e) => updateField('custom_head_scripts', e.target.value)}
                        rows={6}
                        className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 placeholder-zinc-600 resize-y font-mono"
                        placeholder={"<!-- Cole aqui scripts que devem ir no <head> -->\n<script>...</script>"}
                    />
                    <div className="flex items-start gap-1.5 mt-2">
                        <AlertTriangle className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                        <p className="text-[10px] text-amber-400/80">
                            Atenção: scripts mal escritos podem quebrar o site. Use com cuidado.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Custom Events Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 space-y-5"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Eventos Personalizados</h3>
                            <p className="text-xs text-zinc-500">Crie eventos para rastrear cliques no Meta e GA4</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowEventForm(!showEventForm)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-500/30 transition-colors"
                    >
                        {showEventForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        {showEventForm ? 'Cancelar' : 'Novo Evento'}
                    </button>
                </div>

                <AnimatePresence>
                    {showEventForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="border border-purple-500/20 rounded-xl p-4 space-y-3 bg-purple-500/5">
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newEventIsStandard}
                                            onChange={e => setNewEventIsStandard(e.target.checked)}
                                            className="rounded border-zinc-600 bg-zinc-800"
                                        />
                                        Usar evento padrão do Meta
                                    </label>
                                </div>
                                {newEventIsStandard ? (
                                    <div>
                                        <label className="block text-xs text-zinc-400 mb-1">Evento Padrão Meta</label>
                                        <select
                                            value={newEventStandardName}
                                            onChange={e => setNewEventStandardName(e.target.value)}
                                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                        >
                                            {META_STANDARD_EVENTS.map(ev => (
                                                <option key={ev} value={ev}>{ev}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-xs text-zinc-400 mb-1">Nome do Evento *</label>
                                        <input
                                            type="text"
                                            value={newEventName}
                                            onChange={e => setNewEventName(e.target.value)}
                                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                                            placeholder="Ex: Click_Kimono ou View_Support_Page"
                                        />
                                        <p className="text-[10px] text-zinc-600 mt-1">Sem espaços: use underscores. Ex: Click_Produto_X</p>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Descrição (opcional)</label>
                                    <input
                                        type="text"
                                        value={newEventDesc}
                                        onChange={e => setNewEventDesc(e.target.value)}
                                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                                        placeholder="Descrição amigável para lembrar do propósito"
                                    />
                                </div>
                                <button
                                    onClick={handleAddEvent}
                                    disabled={savingEvent}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-bold hover:bg-purple-600 transition-colors disabled:opacity-50"
                                >
                                    <Zap className="w-3 h-3" />
                                    {savingEvent ? 'Criando...' : 'Criar Evento'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Events List */}
                {events.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-4">Nenhum evento personalizado criado ainda.</p>
                ) : (
                    <div className="space-y-2">
                        {events.map(ev => (
                            <div key={ev.id} className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl px-4 py-3">
                                {editingEventId === ev.id ? (
                                    /* Inline Edit Form */
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={editEventIsStandard}
                                                    onChange={e => setEditEventIsStandard(e.target.checked)}
                                                    className="rounded border-zinc-600 bg-zinc-800"
                                                />
                                                Evento padrão Meta
                                            </label>
                                        </div>
                                        {editEventIsStandard ? (
                                            <select
                                                value={editEventName}
                                                onChange={e => setEditEventName(e.target.value)}
                                                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                            >
                                                {META_STANDARD_EVENTS.map(se => (
                                                    <option key={se} value={se}>{se}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                value={editEventName}
                                                onChange={e => setEditEventName(e.target.value)}
                                                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                                                placeholder="Nome do evento"
                                            />
                                        )}
                                        <input
                                            type="text"
                                            value={editEventDesc}
                                            onChange={e => setEditEventDesc(e.target.value)}
                                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                                            placeholder="Descrição (opcional)"
                                        />
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handleUpdateEvent}
                                                disabled={savingEvent}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                            >
                                                <Save className="w-3 h-3" />
                                                {savingEvent ? 'Salvando...' : 'Salvar'}
                                            </button>
                                            <button
                                                onClick={cancelEditEvent}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold hover:bg-zinc-600 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Display Mode */
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Zap className={`w-4 h-4 flex-shrink-0 ${ev.is_standard_meta ? 'text-indigo-400' : 'text-purple-400'}`} />
                                            <div>
                                                <span className="text-sm font-semibold text-white">{ev.event_name}</span>
                                                {ev.description && <p className="text-[10px] text-zinc-500">{ev.description}</p>}
                                            </div>
                                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${ev.is_standard_meta ? 'bg-indigo-500/20 text-indigo-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                                {ev.is_standard_meta ? 'Padrão Meta' : 'Custom'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => startEditEvent(ev)}
                                                className="p-1.5 text-zinc-500 hover:text-purple-400 transition-colors"
                                                title="Editar evento"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEvent(ev.id)}
                                                className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                                                title="Excluir evento"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Save button bottom */}
            <div className="flex justify-end pb-8">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-black rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Salvando...' : 'Salvar Configurações'}
                </button>
            </div>
        </div>
    );
}
