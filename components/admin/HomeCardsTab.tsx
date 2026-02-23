import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2, GripVertical, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface HomeCard {
    id: string;
    title: string;
    subtitle: string;
    cta_text: string;
    teaser_text: string;
    display_order: number;
    is_visible: boolean;
}

const CARD_LABELS: Record<string, { emoji: string; description: string }> = {
    numeros: { emoji: '📊', description: 'Exibe métricas de alcance e interações do Instagram. O teaser é preenchido automaticamente com dados reais.' },
    apoiar: { emoji: '💖', description: 'Mostra o carrossel de parceiros. O teaser_text aparece como descrição abaixo dos logos.' },
    conteudo: { emoji: '🥋', description: 'Link para a página biográfica. O teaser_text aparece como a descrição curta no card.' },
    blog: { emoji: '📰', description: 'Mostra o último post publicado. O teaser_text aparece quando não há nenhum post.' },
};

export default function HomeCardsTab() {
    const [cards, setCards] = useState<HomeCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchCards();
    }, []);

    async function fetchCards() {
        try {
            const { data, error } = await supabase
                .from('home_cards')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            setCards(data || []);
        } catch (err) {
            console.error('Error fetching cards:', err);
            setMessage({ type: 'error', text: 'Erro ao carregar cards.' });
        } finally {
            setLoading(false);
        }
    }

    function updateCard(id: string, field: keyof HomeCard, value: string | number | boolean) {
        setCards(cards.map(c => c.id === id ? { ...c, [field]: value } : c));
    }

    function moveCard(index: number, direction: -1 | 1) {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= cards.length) return;
        const updated = [...cards];
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
        // Update display_order
        updated.forEach((c, i) => c.display_order = i);
        setCards(updated);
    }

    async function handleSave() {
        setSaving(true);
        setMessage(null);

        try {
            for (const card of cards) {
                const { error } = await supabase
                    .from('home_cards')
                    .update({
                        title: card.title,
                        subtitle: card.subtitle,
                        cta_text: card.cta_text,
                        teaser_text: card.teaser_text,
                        display_order: card.display_order,
                        is_visible: card.is_visible,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', card.id);

                if (error) throw error;
            }
            setMessage({ type: 'success', text: 'Cards da home atualizados com sucesso!' });
        } catch (err) {
            console.error('Error saving cards:', err);
            setMessage({ type: 'error', text: 'Erro ao salvar. Tente novamente.' });
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white">Cards da Home</h2>
                <p className="text-sm text-zinc-400 mt-1">
                    Edite títulos, subtítulos, textos e ordem dos cards da página principal
                </p>
            </div>

            {/* Message */}
            {message && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="text-sm font-medium">{message.text}</span>
                </div>
            )}

            {/* Cards Editor */}
            <div className="space-y-4">
                {cards.map((card, index) => {
                    const meta = CARD_LABELS[card.id] || { emoji: '📦', description: '' };
                    return (
                        <div
                            key={card.id}
                            className={`bg-zinc-900/50 border rounded-2xl p-6 space-y-4 transition-all ${card.is_visible ? 'border-zinc-800' : 'border-zinc-800/50 opacity-60'
                                }`}
                        >
                            {/* Card Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <GripVertical className="w-4 h-4 text-zinc-600" />
                                    <span className="text-lg">{meta.emoji}</span>
                                    <div>
                                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Card: {card.id}</span>
                                        <p className="text-[10px] text-zinc-600 mt-0.5">{meta.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => moveCard(index, -1)}
                                        disabled={index === 0}
                                        className="p-1.5 text-zinc-500 hover:text-white disabled:opacity-30 rounded-lg hover:bg-zinc-700 transition-colors"
                                        title="Mover para cima"
                                    >↑</button>
                                    <button
                                        onClick={() => moveCard(index, 1)}
                                        disabled={index === cards.length - 1}
                                        className="p-1.5 text-zinc-500 hover:text-white disabled:opacity-30 rounded-lg hover:bg-zinc-700 transition-colors"
                                        title="Mover para baixo"
                                    >↓</button>
                                    <button
                                        onClick={() => updateCard(card.id, 'is_visible', !card.is_visible)}
                                        className={`p-1.5 rounded-lg transition-colors ${card.is_visible ? 'text-green-400 hover:bg-green-500/10' : 'text-zinc-600 hover:bg-zinc-700'}`}
                                        title={card.is_visible ? 'Visível' : 'Oculto'}
                                    >
                                        {card.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Título</label>
                                    <input
                                        type="text"
                                        value={card.title}
                                        onChange={(e) => updateCard(card.id, 'title', e.target.value)}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Subtítulo</label>
                                    <input
                                        type="text"
                                        value={card.subtitle}
                                        onChange={(e) => updateCard(card.id, 'subtitle', e.target.value)}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Texto do CTA</label>
                                    <input
                                        type="text"
                                        value={card.cta_text}
                                        onChange={(e) => updateCard(card.id, 'cta_text', e.target.value)}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Ex: Ver mais"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Texto do Teaser</label>
                                    <input
                                        type="text"
                                        value={card.teaser_text}
                                        onChange={(e) => updateCard(card.id, 'teaser_text', e.target.value)}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Texto descritivo curto..."
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Save Button */}
            <div className="flex justify-end pb-8">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                >
                    <Save className="w-5 h-5" />
                    {saving ? 'Salvando...' : 'Salvar Cards'}
                </button>
            </div>
        </div>
    );
}
