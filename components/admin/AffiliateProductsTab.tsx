import React, { useEffect, useState } from 'react';
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
}

export default function AffiliateProductsTab() {
    const [products, setProducts] = useState<AffiliateProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state for new/editing product
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formImageUrl, setFormImageUrl] = useState('');
    const [formAffiliateUrl, setFormAffiliateUrl] = useState('');
    const [formBadge, setFormBadge] = useState('');
    const [formOrder, setFormOrder] = useState(0);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        setLoading(true);
        const { data } = await supabase
            .from('affiliate_products')
            .select('*')
            .order('display_order', { ascending: true });
        setProducts(data || []);
        setLoading(false);
    }

    function resetForm() {
        setFormName('');
        setFormDescription('');
        setFormImageUrl('');
        setFormAffiliateUrl('');
        setFormBadge('');
        setFormOrder(0);
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
        setShowAddForm(false);
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
        });
        if (!error) {
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

    const formFields = (
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
            <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">URL da Imagem</label>
                <input
                    type="url"
                    value={formImageUrl}
                    onChange={e => setFormImageUrl(e.target.value)}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                    placeholder="https://..."
                />
            </div>
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

            {/* Image Preview */}
            {formImageUrl && (
                <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Preview</label>
                    <div className="w-20 h-20 rounded-lg bg-zinc-800 overflow-hidden border border-zinc-700">
                        <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    </div>
                </div>
            )}
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
                        {formFields}
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
                                        <Save className="w-4 h-4" />
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
                                        {formFields}
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
