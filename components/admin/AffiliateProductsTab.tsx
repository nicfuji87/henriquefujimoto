import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Trash2,
    Save,
    X,
    Eye,
    EyeOff,
    ExternalLink,
    GripVertical,
    ShoppingBag,
    Star,
    Upload,
    MousePointerClick,
    Edit,
    TrendingUp,
    Activity,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AffiliateProduct {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    affiliate_url: string;
    badge: string | null;
    display_order: number;
    is_active: boolean;
    click_count: number;
    tracking_event_id: string | null;
}

interface TrackingEvent {
    id: string;
    event_name: string;
    description: string | null;
    is_standard_meta: boolean;
}

export default function AffiliateProductsTab() {
    const [products, setProducts] = useState<AffiliateProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [totalClicks, setTotalClicks] = useState(0);

    // Form state
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formImageUrl, setFormImageUrl] = useState('');
    const [formAffiliateUrl, setFormAffiliateUrl] = useState('');
    const [formBadge, setFormBadge] = useState('');
    const [formOrder, setFormOrder] = useState(0);
    const [formTrackingEventId, setFormTrackingEventId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchProducts();
        fetchTrackingEvents();
    }, []);

    async function fetchTrackingEvents() {
        const { data } = await supabase.from('tracking_events').select('id, event_name, description, is_standard_meta').order('event_name');
        setTrackingEvents(data || []);
    }

    async function fetchProducts() {
        setLoading(true);
        const { data } = await supabase
            .from('affiliate_products')
            .select('*')
            .order('display_order', { ascending: true });
        const prods = data || [];
        setProducts(prods);
        setTotalClicks(prods.reduce((sum: number, p: AffiliateProduct) => sum + (p.click_count || 0), 0));
        setLoading(false);
    }

    function resetForm() {
        setFormName('');
        setFormDescription('');
        setFormImageUrl('');
        setFormAffiliateUrl('');
        setFormBadge('');
        setFormOrder(0);
        setFormTrackingEventId(null);
        setEditing(null);
        setShowAddForm(false);
    }

    function startEdit(product: AffiliateProduct) {
        setEditing(product.id);
        setFormName(product.name);
        setFormDescription(product.description || '');
        setFormImageUrl(product.image_url || '');
        setFormAffiliateUrl(product.affiliate_url);
        setFormBadge(product.badge || '');
        setFormOrder(product.display_order);
        setFormTrackingEventId(product.tracking_event_id);
        setShowAddForm(false);
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, productId?: string) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `product-${Date.now()}.${fileExt}`;
            const filePath = `products/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('site-images')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('site-images')
                .getPublicUrl(filePath);

            const publicUrl = data.publicUrl;

            if (productId) {
                // Update existing product
                await supabase
                    .from('affiliate_products')
                    .update({ image_url: publicUrl })
                    .eq('id', productId);
                await fetchProducts();
            }
            // Always set the form URL (for new product or editing)
            setFormImageUrl(publicUrl);
        } catch (err) {
            console.error('Error uploading image:', err);
            alert('Erro ao fazer upload da imagem');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    }

    async function handleAdd() {
        if (!formName.trim() || !formAffiliateUrl.trim()) return;
        setSaving(true);
        const { error } = await supabase.from('affiliate_products').insert({
            name: formName.trim(),
            description: formDescription.trim() || null,
            image_url: formImageUrl.trim() || null,
            affiliate_url: formAffiliateUrl.trim(),
            badge: formBadge.trim() || null,
            display_order: formOrder,
            is_active: true,
            tracking_event_id: formTrackingEventId,
        });
        if (error) {
            console.error('Error saving product:', error);
            alert('Erro ao salvar produto: ' + error.message);
        } else {
            resetForm();
            await fetchProducts();
        }
        setSaving(false);
    }

    async function handleUpdate() {
        if (!editing || !formName.trim() || !formAffiliateUrl.trim()) return;
        setSaving(true);
        const { error } = await supabase
            .from('affiliate_products')
            .update({
                name: formName.trim(),
                description: formDescription.trim() || null,
                image_url: formImageUrl.trim() || null,
                affiliate_url: formAffiliateUrl.trim(),
                badge: formBadge.trim() || null,
                display_order: formOrder,
                tracking_event_id: formTrackingEventId,
            })
            .eq('id', editing);
        if (!error) {
            resetForm();
            await fetchProducts();
        }
        setSaving(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza que deseja excluir este produto?')) return;
        await supabase.from('affiliate_products').delete().eq('id', id);
        await fetchProducts();
    }

    async function toggleActive(id: string, currentActive: boolean) {
        await supabase
            .from('affiliate_products')
            .update({ is_active: !currentActive })
            .eq('id', id);
        setProducts(prev =>
            prev.map(p => (p.id === id ? { ...p, is_active: !currentActive } : p))
        );
    }

    const imageUploadField = (inputRef: React.RefObject<HTMLInputElement | null>, productId?: string) => (
        <div className="md:col-span-2">
            <label className="block text-xs font-medium text-zinc-400 mb-1">Imagem do Produto</label>
            <div className="flex items-center gap-3">
                {/* Preview */}
                <div className="w-20 h-20 rounded-lg bg-zinc-800 overflow-hidden border border-zinc-700 flex-shrink-0 flex items-center justify-center">
                    {formImageUrl ? (
                        <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    ) : (
                        <ShoppingBag className="w-6 h-6 text-zinc-600" />
                    )}
                </div>
                <div className="flex-1 space-y-2">
                    {/* Upload Button */}
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
                    >
                        <Upload className="w-4 h-4" />
                        {uploading ? 'Enviando...' : 'Fazer upload'}
                    </button>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        onChange={e => handleImageUpload(e, productId)}
                        className="hidden"
                    />
                    {/* OR paste URL */}
                    <input
                        type="url"
                        value={formImageUrl}
                        onChange={e => setFormImageUrl(e.target.value)}
                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                        placeholder="ou cole a URL da imagem"
                    />
                </div>
            </div>
        </div>
    );

    const formFields = (isEdit: boolean = false) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Nome *</label>
                <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                    placeholder="Ex: Kimono Mizuno Yusho"
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Link de Afiliado *</label>
                <input
                    type="url"
                    value={formAffiliateUrl}
                    onChange={e => setFormAffiliateUrl(e.target.value)}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                    placeholder="https://..."
                />
            </div>
            <div className="md:col-span-2">
                <label className="block text-xs font-medium text-zinc-400 mb-1">Descrição</label>
                <input
                    type="text"
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                    placeholder="Breve descrição do produto"
                />
            </div>

            {/* Image Upload */}
            {imageUploadField(isEdit ? editFileInputRef : fileInputRef, isEdit ? editing || undefined : undefined)}

            <div className="flex gap-3">
                <div className="flex-1">
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Badge / Selo</label>
                    <input
                        type="text"
                        value={formBadge}
                        onChange={e => setFormBadge(e.target.value)}
                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                        placeholder="Ex: Uso diário"
                    />
                </div>
                <div className="w-24">
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Ordem</label>
                    <input
                        type="number"
                        value={formOrder}
                        onChange={e => setFormOrder(parseInt(e.target.value) || 0)}
                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                    />
                </div>
            </div>
            {/* Tracking Event Selector */}
            <div className="md:col-span-2">
                <label className="block text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Evento de Tracking (Meta + GA4)
                </label>
                <select
                    value={formTrackingEventId || ''}
                    onChange={e => setFormTrackingEventId(e.target.value || null)}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                >
                    <option value="">Padrão (Click_Affiliate_Product)</option>
                    {trackingEvents.map(ev => (
                        <option key={ev.id} value={ev.id}>
                            {ev.event_name}{ev.description ? ` — ${ev.description}` : ''}
                        </option>
                    ))}
                </select>
                <p className="text-[10px] text-zinc-600 mt-1">Escolha o evento que será disparado ao clicar neste produto</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Produtos Afiliados</h2>
                    <p className="text-zinc-400 text-sm">Gerencie os produtos que aparecem na Home para comissão</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowAddForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-500 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Novo Produto
                </button>
            </div>

            {/* Click Stats Summary */}
            {!loading && products.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <ShoppingBag className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs text-zinc-400">Total Produtos</span>
                        </div>
                        <p className="text-xl font-bold text-white">{products.length}</p>
                    </div>
                    <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Eye className="w-4 h-4 text-blue-400" />
                            <span className="text-xs text-zinc-400">Ativos</span>
                        </div>
                        <p className="text-xl font-bold text-white">{products.filter(p => p.is_active).length}</p>
                    </div>
                    <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <MousePointerClick className="w-4 h-4 text-amber-400" />
                            <span className="text-xs text-zinc-400">Cliques Totais</span>
                        </div>
                        <p className="text-xl font-bold text-white">{totalClicks}</p>
                    </div>
                    <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-purple-400" />
                            <span className="text-xs text-zinc-400">Média / Produto</span>
                        </div>
                        <p className="text-xl font-bold text-white">
                            {products.length > 0 ? Math.round(totalClicks / products.length) : 0}
                        </p>
                    </div>
                </div>
            )}

            {/* Add Form */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-zinc-900/60 border border-emerald-500/20 rounded-2xl p-6 overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                                Novo Produto
                            </h3>
                            <button onClick={resetForm} className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        {formFields(false)}
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleAdd}
                                disabled={saving || !formName.trim() || !formAffiliateUrl.trim()}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Products List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4 animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-lg bg-zinc-800" />
                                <div className="flex-1">
                                    <div className="h-4 bg-zinc-800 rounded w-40 mb-2" />
                                    <div className="h-3 bg-zinc-800 rounded w-24" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-16 text-zinc-500">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Nenhum produto cadastrado ainda.</p>
                    <p className="text-xs mt-1">Clique em "Novo Produto" para começar.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {products.map(product => (
                        <motion.div
                            key={product.id}
                            layout
                            className={`bg-zinc-900/60 border rounded-2xl overflow-hidden transition-colors ${editing === product.id
                                ? 'border-emerald-500/30'
                                : 'border-zinc-800/50 hover:border-zinc-700/50'
                                } ${!product.is_active ? 'opacity-50' : ''}`}
                        >
                            <div className="flex items-center gap-4 p-4">
                                <GripVertical className="w-4 h-4 text-zinc-600 flex-shrink-0 cursor-grab" />

                                {/* Thumbnail */}
                                <div className="w-14 h-14 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-700/50">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ShoppingBag className="w-5 h-5 text-zinc-600" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-medium text-white truncate">{product.name}</h4>
                                        {product.badge && (
                                            <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 whitespace-nowrap">
                                                <Star className="w-2 h-2" />
                                                {product.badge}
                                            </span>
                                        )}
                                    </div>
                                    {product.description && (
                                        <p className="text-xs text-zinc-500 truncate mt-0.5">{product.description}</p>
                                    )}
                                    <p className="text-[10px] text-zinc-600 truncate mt-0.5">{product.affiliate_url}</p>
                                </div>

                                {/* Click count */}
                                <div className="flex items-center gap-1 flex-shrink-0 bg-zinc-800/50 rounded-lg px-2 py-1" title="Cliques">
                                    <MousePointerClick className="w-3 h-3 text-amber-400" />
                                    <span className="text-xs font-bold text-white">{product.click_count || 0}</span>
                                </div>

                                {/* Order */}
                                <span className="text-xs text-zinc-600 font-mono flex-shrink-0">#{product.display_order}</span>

                                {/* Actions */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <a
                                        href={product.affiliate_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                                        title="Abrir link"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                    <button
                                        onClick={() => toggleActive(product.id, product.is_active)}
                                        className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                                        title={product.is_active ? 'Desativar' : 'Ativar'}
                                    >
                                        {product.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => editing === product.id ? resetForm() : startEdit(product)}
                                        className={`p-2 rounded-lg transition-colors ${editing === product.id
                                            ? 'text-emerald-400 bg-emerald-500/10'
                                            : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                                            }`}
                                        title="Editar"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="p-2 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Edit Form (inline) */}
                            <AnimatePresence>
                                {editing === product.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="border-t border-zinc-800/50 p-4 bg-zinc-900/40"
                                    >
                                        {formFields(true)}
                                        <div className="mt-4 flex justify-end gap-2">
                                            <button
                                                onClick={resetForm}
                                                className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleUpdate}
                                                disabled={saving || !formName.trim() || !formAffiliateUrl.trim()}
                                                className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors disabled:opacity-40"
                                            >
                                                <Save className="w-3.5 h-3.5" />
                                                {saving ? 'Salvando...' : 'Salvar'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
