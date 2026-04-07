import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import imageCompression from 'browser-image-compression';
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
    slug: string | null;
    instagram_url: string | null;
    extended_description: string | null;
    price: string | null;
    meta_title: string | null;
    meta_description: string | null;
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
    const [formTrackingEventIds, setFormTrackingEventIds] = useState<string[]>([]);
    const [formSlug, setFormSlug] = useState('');
    const [formInstagramUrl, setFormInstagramUrl] = useState('');
    const [formExtendedDescription, setFormExtendedDescription] = useState('');
    const [formPrice, setFormPrice] = useState('');
    const [formMetaTitle, setFormMetaTitle] = useState('');
    const [formMetaDescription, setFormMetaDescription] = useState('');
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

    function generateSlug(name: string) {
        return name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }

    function resetForm() {
        setFormName('');
        setFormDescription('');
        setFormImageUrl('');
        setFormAffiliateUrl('');
        setFormBadge('');
        setFormOrder(0);
        setFormTrackingEventIds([]);
        setFormSlug('');
        setFormInstagramUrl('');
        setFormExtendedDescription('');
        setFormPrice('');
        setFormMetaTitle('');
        setFormMetaDescription('');
        setEditing(null);
        setShowAddForm(false);
    }

    async function startEdit(product: AffiliateProduct) {
        setEditing(product.id);
        setFormName(product.name);
        setFormDescription(product.description || '');
        setFormImageUrl(product.image_url || '');
        setFormAffiliateUrl(product.affiliate_url);
        setFormBadge(product.badge || '');
        setFormOrder(product.display_order);
        setFormSlug(product.slug || '');
        setFormInstagramUrl(product.instagram_url || '');
        setFormExtendedDescription(product.extended_description || '');
        setFormPrice(product.price || '');
        setFormMetaTitle(product.meta_title || '');
        setFormMetaDescription(product.meta_description || '');
        // Fetch associated tracking event ids from junction table
        const { data: junctionData } = await supabase
            .from('product_tracking_events')
            .select('tracking_event_id')
            .eq('product_id', product.id);
        setFormTrackingEventIds((junctionData || []).map((j: any) => j.tracking_event_id));
        setShowAddForm(false);
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, productId?: string) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const options = { maxSizeMB: 0.2, maxWidthOrHeight: 1080, useWebWorker: true };
            const compressedFile = await imageCompression(file, options);
            const fileExt = compressedFile.name.split('.').pop() || 'jpg';
            const fileName = `product-${Date.now()}.${fileExt}`;
            const filePath = `products/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('site-images')
                .upload(filePath, compressedFile, { upsert: true, cacheControl: '31536000' });

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
        const slug = formSlug.trim() || generateSlug(formName);
        const { data: newProduct, error } = await supabase.from('affiliate_products').insert({
            name: formName.trim(),
            description: formDescription.trim() || null,
            image_url: formImageUrl.trim() || null,
            affiliate_url: formAffiliateUrl.trim(),
            badge: formBadge.trim() || null,
            display_order: formOrder,
            is_active: true,
            slug,
            instagram_url: formInstagramUrl.trim() || null,
            extended_description: formExtendedDescription.trim() || null,
            price: formPrice.trim() || null,
            meta_title: formMetaTitle.trim() || null,
            meta_description: formMetaDescription.trim() || null,
        }).select('id').single();
        if (error) {
            console.error('Error saving product:', error);
            alert('Erro ao salvar produto: ' + error.message);
        } else if (newProduct) {
            // Sync junction table
            if (formTrackingEventIds.length > 0) {
                await supabase.from('product_tracking_events').insert(
                    formTrackingEventIds.map(eid => ({ product_id: newProduct.id, tracking_event_id: eid }))
                );
            }
            resetForm();
            await fetchProducts();
        }
        setSaving(false);
    }

    async function handleUpdate() {
        if (!editing || !formName.trim() || !formAffiliateUrl.trim()) return;
        setSaving(true);
        const slug = formSlug.trim() || generateSlug(formName);
        const { error } = await supabase
            .from('affiliate_products')
            .update({
                name: formName.trim(),
                description: formDescription.trim() || null,
                image_url: formImageUrl.trim() || null,
                affiliate_url: formAffiliateUrl.trim(),
                badge: formBadge.trim() || null,
                display_order: formOrder,
                slug,
                instagram_url: formInstagramUrl.trim() || null,
                extended_description: formExtendedDescription.trim() || null,
                price: formPrice.trim() || null,
                meta_title: formMetaTitle.trim() || null,
                meta_description: formMetaDescription.trim() || null,
            })
            .eq('id', editing);
        if (!error) {
            // Sync junction table: delete old, insert new
            const { error: delErr } = await supabase.from('product_tracking_events').delete().eq('product_id', editing);
            if (delErr) console.error('[Junction] delete error:', delErr.message);
            if (formTrackingEventIds.length > 0) {
                const { error: insErr } = await supabase.from('product_tracking_events').insert(
                    formTrackingEventIds.map(eid => ({ product_id: editing, tracking_event_id: eid }))
                );
                if (insErr) {
                    console.error('[Junction] insert error:', insErr.message);
                    alert('Erro ao salvar eventos de tracking: ' + insErr.message);
                } else {
                    console.log('[Junction] Saved events:', formTrackingEventIds);
                }
            }
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
            {/* Tracking Events Selector (Multi) */}
            <div className="md:col-span-2">
                <label className="block text-xs font-medium text-zinc-400 mb-2 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Eventos de Tracking (Meta + GA4) — selecione um ou mais
                </label>
                <div className="flex flex-wrap gap-2">
                    {trackingEvents.map(ev => {
                        const isSelected = formTrackingEventIds.includes(ev.id);
                        return (
                            <button
                                key={ev.id}
                                type="button"
                                onClick={() => {
                                    setFormTrackingEventIds(prev =>
                                        isSelected
                                            ? prev.filter(id => id !== ev.id)
                                            : [...prev, ev.id]
                                    );
                                }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                    isSelected
                                        ? ev.is_standard_meta
                                            ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                                            : 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                                        : 'bg-zinc-800/50 border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600'
                                }`}
                            >
                                <span className={`w-3 h-3 rounded border flex items-center justify-center text-[8px] ${
                                    isSelected
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : 'border-zinc-600'
                                }`}>
                                    {isSelected && '✓'}
                                </span>
                                {ev.event_name}
                                {ev.is_standard_meta && (
                                    <span className="text-[8px] uppercase px-1 py-0.5 rounded bg-indigo-500/20 text-indigo-400">padrão</span>
                                )}
                            </button>
                        );
                    })}
                </div>
                <p className="text-[10px] text-zinc-600 mt-1.5">Todos os eventos selecionados serão disparados quando o usuário clicar no botão de compra</p>
            </div>

            {/* Landing Page Fields */}
            <div className="md:col-span-2 mt-4 pt-4 border-t border-zinc-700/50">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    🚀 Landing Page (para Anúncios)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">Slug (URL)</label>
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] text-zinc-600">/produto/</span>
                            <input
                                type="text"
                                value={formSlug}
                                onChange={e => setFormSlug(e.target.value)}
                                className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                                placeholder={formName ? generateSlug(formName) : 'auto-gerado'}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">Preço</label>
                        <input
                            type="text"
                            value={formPrice}
                            onChange={e => setFormPrice(e.target.value)}
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                            placeholder="R$ 299,90"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-zinc-400 mb-1">Link do Instagram (post/reel)</label>
                        <input
                            type="url"
                            value={formInstagramUrl}
                            onChange={e => setFormInstagramUrl(e.target.value)}
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                            placeholder="https://www.instagram.com/p/..."
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-zinc-400 mb-1">Descrição Detalhada (Markdown)</label>
                        <textarea
                            value={formExtendedDescription}
                            onChange={e => setFormExtendedDescription(e.target.value)}
                            rows={5}
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 resize-y"
                            placeholder="Descreva por que você recomenda esse produto... (suporta markdown: **negrito**, - listas, ## títulos)"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">Título SEO</label>
                        <input
                            type="text"
                            value={formMetaTitle}
                            onChange={e => setFormMetaTitle(e.target.value)}
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                            placeholder="Título para SEO (opcional)"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">Descrição SEO</label>
                        <input
                            type="text"
                            value={formMetaDescription}
                            onChange={e => setFormMetaDescription(e.target.value)}
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                            placeholder="Descrição para SEO (opcional)"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Produtos Afiliados</h2>
                    <p className="text-zinc-400 text-sm">Gerencie os produtos que aparecem na Home para comissão</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowAddForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-500 transition-colors w-full sm:w-auto justify-center"
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
                            <div className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4">
                                <GripVertical className="w-4 h-4 text-zinc-600 flex-shrink-0 cursor-grab hidden sm:block" />

                                {/* Thumbnail */}
                                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-700/50">
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
                                <div className="flex items-center gap-1 flex-shrink-0 bg-zinc-800/50 rounded-lg px-2 py-1 hidden sm:flex" title="Cliques">
                                    <MousePointerClick className="w-3 h-3 text-amber-400" />
                                    <span className="text-xs font-bold text-white">{product.click_count || 0}</span>
                                </div>

                                {/* Order */}
                                <span className="text-xs text-zinc-600 font-mono flex-shrink-0 hidden sm:inline">#{product.display_order}</span>

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
