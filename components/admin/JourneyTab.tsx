import React, { useState, useEffect, useRef } from 'react';
import { Save, Plus, Trash2, GripVertical, AlertCircle, CheckCircle2, Upload, Image, Film, Trophy, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Milestone {
    year: string;
    title: string;
    description: string;
    media_url?: string;
    media_type?: 'image' | 'video';
}

interface Stat {
    value: string;
    label: string;
}

interface AthleteProfile {
    id: string;
    bio_title: string;
    bio_description: string;
    milestones: Milestone[];
    stats: Stat[];
    values_list: string[];
}

interface Competition {
    id: string;
    name: string;
    date: string;
    location: string;
    category: string;
    weight_class: string;
    placement: string;
    medal_type: string | null;
    notes: string;
    display_order: number;
}

const MEDAL_OPTIONS = [
    { value: '', label: 'Sem medalha' },
    { value: 'gold', label: '🥇 Ouro' },
    { value: 'silver', label: '🥈 Prata' },
    { value: 'bronze', label: '🥉 Bronze' },
];

export default function JourneyTab() {
    const [profile, setProfile] = useState<AthleteProfile | null>(null);
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [newValue, setNewValue] = useState('');
    const [uploadingMilestone, setUploadingMilestone] = useState<number | null>(null);
    const [activeSection, setActiveSection] = useState<'bio' | 'competitions'>('bio');
    const [editingComp, setEditingComp] = useState<Competition | null>(null);
    const [savingComp, setSavingComp] = useState(false);
    const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

    useEffect(() => {
        fetchAll();
    }, []);

    async function fetchAll() {
        try {
            const [profileRes, compRes] = await Promise.all([
                supabase.from('athlete_profile').select('*').limit(1).single(),
                supabase.from('competitions').select('*').order('date', { ascending: false }),
            ]);

            if (profileRes.error) throw profileRes.error;
            setProfile(profileRes.data);
            setCompetitions(compRes.data || []);
        } catch (err) {
            console.error('Error fetching data:', err);
            setMessage({ type: 'error', text: 'Erro ao carregar dados' });
        } finally {
            setLoading(false);
        }
    }

    // ─── Profile Save ───
    async function handleSave() {
        if (!profile) return;
        setSaving(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('athlete_profile')
                .update({
                    bio_title: profile.bio_title,
                    bio_description: profile.bio_description,
                    milestones: profile.milestones,
                    stats: profile.stats,
                    values_list: profile.values_list,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', profile.id);

            if (error) throw error;
            setMessage({ type: 'success', text: 'Jornada atualizada com sucesso!' });
        } catch (err) {
            console.error('Error saving profile:', err);
            setMessage({ type: 'error', text: 'Erro ao salvar. Tente novamente.' });
        } finally {
            setSaving(false);
        }
    }

    // ─── Milestone handlers ───
    function addMilestone() {
        if (!profile) return;
        setProfile({
            ...profile,
            milestones: [...profile.milestones, { year: new Date().getFullYear().toString(), title: '', description: '' }],
        });
    }

    function updateMilestone(index: number, field: keyof Milestone, value: string) {
        if (!profile) return;
        const updated = [...profile.milestones];
        updated[index] = { ...updated[index], [field]: value };
        setProfile({ ...profile, milestones: updated });
    }

    function removeMilestone(index: number) {
        if (!profile) return;
        setProfile({ ...profile, milestones: profile.milestones.filter((_, i) => i !== index) });
    }

    function moveMilestone(index: number, direction: -1 | 1) {
        if (!profile) return;
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= profile.milestones.length) return;
        const updated = [...profile.milestones];
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
        setProfile({ ...profile, milestones: updated });
    }

    async function handleMilestoneMediaUpload(e: React.ChangeEvent<HTMLInputElement>, index: number) {
        const file = e.target.files?.[0];
        if (!file || !profile) return;

        setUploadingMilestone(index);
        setMessage(null);

        try {
            const isVideo = file.type.startsWith('video/');
            const bucket = isVideo ? 'site-videos' : 'site-images';
            const fileExt = file.name.split('.').pop();
            const fileName = `milestone-${index}-${Date.now()}.${fileExt}`;
            const filePath = `journey/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            const updated = [...profile.milestones];
            updated[index] = {
                ...updated[index],
                media_url: publicUrl,
                media_type: isVideo ? 'video' : 'image',
            };
            setProfile({ ...profile, milestones: updated });
            setMessage({ type: 'success', text: `Mídia do marco ${index + 1} enviada!` });
        } catch (err) {
            console.error('Upload error:', err);
            setMessage({ type: 'error', text: 'Erro ao enviar arquivo.' });
        } finally {
            setUploadingMilestone(null);
            if (e.target) e.target.value = '';
        }
    }

    function removeMilestoneMedia(index: number) {
        if (!profile) return;
        const updated = [...profile.milestones];
        updated[index] = { ...updated[index], media_url: undefined, media_type: undefined };
        setProfile({ ...profile, milestones: updated });
    }

    // ─── Stats handlers ───
    function addStat() {
        if (!profile) return;
        setProfile({ ...profile, stats: [...profile.stats, { value: '', label: '' }] });
    }

    function updateStat(index: number, field: keyof Stat, value: string) {
        if (!profile) return;
        const updated = [...profile.stats];
        updated[index] = { ...updated[index], [field]: value };
        setProfile({ ...profile, stats: updated });
    }

    function removeStat(index: number) {
        if (!profile) return;
        setProfile({ ...profile, stats: profile.stats.filter((_, i) => i !== index) });
    }

    // ─── Values handlers ───
    function addValue() {
        if (!profile || !newValue.trim()) return;
        setProfile({ ...profile, values_list: [...profile.values_list, newValue.trim()] });
        setNewValue('');
    }

    function removeValue(index: number) {
        if (!profile) return;
        setProfile({ ...profile, values_list: profile.values_list.filter((_, i) => i !== index) });
    }

    // ─── Competition handlers ───
    function newCompetition(): Competition {
        return {
            id: '',
            name: '',
            date: new Date().toISOString().split('T')[0],
            location: '',
            category: '',
            weight_class: '',
            placement: '',
            medal_type: null,
            notes: '',
            display_order: competitions.length,
        };
    }

    async function saveCompetition(comp: Competition) {
        setSavingComp(true);
        setMessage(null);

        try {
            if (comp.id) {
                // Update
                const { error } = await supabase
                    .from('competitions')
                    .update({
                        name: comp.name,
                        date: comp.date,
                        location: comp.location,
                        category: comp.category,
                        weight_class: comp.weight_class,
                        placement: comp.placement,
                        medal_type: comp.medal_type || null,
                        notes: comp.notes,
                        display_order: comp.display_order,
                    })
                    .eq('id', comp.id);

                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase.from('competitions').insert({
                    name: comp.name,
                    date: comp.date,
                    location: comp.location,
                    category: comp.category,
                    weight_class: comp.weight_class,
                    placement: comp.placement,
                    medal_type: comp.medal_type || null,
                    notes: comp.notes,
                    display_order: comp.display_order,
                });

                if (error) throw error;
            }

            setMessage({ type: 'success', text: 'Competição salva com sucesso!' });
            setEditingComp(null);
            // Reload competitions
            const { data } = await supabase.from('competitions').select('*').order('date', { ascending: false });
            setCompetitions(data || []);
        } catch (err) {
            console.error('Error saving competition:', err);
            setMessage({ type: 'error', text: 'Erro ao salvar competição.' });
        } finally {
            setSavingComp(false);
        }
    }

    async function deleteCompetition(id: string) {
        if (!confirm('Excluir esta competição?')) return;
        try {
            const { error } = await supabase.from('competitions').delete().eq('id', id);
            if (error) throw error;
            setCompetitions(competitions.filter((c) => c.id !== id));
            setMessage({ type: 'success', text: 'Competição removida.' });
        } catch (err) {
            console.error('Error deleting:', err);
            setMessage({ type: 'error', text: 'Erro ao excluir.' });
        }
    }

    // ─── Render ───
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center text-zinc-400 py-20">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                <p>Perfil não encontrado. Verifique a tabela athlete_profile.</p>
            </div>
        );
    }

    const medalEmoji = (type: string | null) => {
        if (type === 'gold') return '🥇';
        if (type === 'silver') return '🥈';
        if (type === 'bronze') return '🥉';
        return '🏅';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">A Jornada do Atleta</h2>
                    <p className="text-sm text-zinc-400 mt-1">Edite as informações da página "Conheça o Henrique"</p>
                </div>
            </div>

            {/* Section Toggle */}
            <div className="flex gap-2 border-b border-zinc-800 pb-1">
                <button
                    onClick={() => setActiveSection('bio')}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeSection === 'bio' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    📝 Bio & Timeline
                </button>
                <button
                    onClick={() => setActiveSection('competitions')}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeSection === 'competitions' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    🏆 Competições ({competitions.length})
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="text-sm font-medium">{message.text}</span>
                </div>
            )}

            {/* ══════════════════════════════════════════ */}
            {/* BIO & TIMELINE SECTION */}
            {/* ══════════════════════════════════════════ */}
            {activeSection === 'bio' && (
                <>
                    {/* ─── Bio Section ─── */}
                    <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">📝 Bio Principal</h3>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Título</label>
                            <input
                                type="text"
                                value={profile.bio_title}
                                onChange={(e) => setProfile({ ...profile, bio_title: e.target.value })}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                                placeholder="Ex: Do tatame para o mundo"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Descrição</label>
                            <textarea
                                value={profile.bio_description}
                                onChange={(e) => setProfile({ ...profile, bio_description: e.target.value })}
                                rows={4}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                                placeholder="Conte a história do atleta..."
                            />
                        </div>
                    </section>

                    {/* ─── Stats Section ─── */}
                    <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">📊 Estatísticas Rápidas</h3>
                            <button onClick={addStat} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 hover:border-primary/50 transition-colors">
                                <Plus className="w-3 h-3" /> Adicionar
                            </button>
                        </div>
                        <div className="space-y-3">
                            {profile.stats.map((stat, index) => (
                                <div key={index} className="flex items-center gap-3 bg-zinc-800/50 rounded-xl p-3">
                                    <div className="flex-1 grid grid-cols-2 gap-3">
                                        <input type="text" value={stat.value} onChange={(e) => updateStat(index, 'value', e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" placeholder="Valor (ex: +9, 🥇)" />
                                        <input type="text" value={stat.label} onChange={(e) => updateStat(index, 'label', e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" placeholder="Label (ex: Anos no Judô)" />
                                    </div>
                                    <button onClick={() => removeStat(index)} className="p-2 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                            {profile.stats.length === 0 && <p className="text-sm text-zinc-500 text-center py-4">Nenhuma estatística adicionada</p>}
                        </div>
                    </section>

                    {/* ─── Milestones Section ─── */}
                    <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">🕐 Linha do Tempo</h3>
                            <button onClick={addMilestone} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 hover:border-primary/50 transition-colors">
                                <Plus className="w-3 h-3" /> Adicionar marco
                            </button>
                        </div>
                        <div className="space-y-4">
                            {profile.milestones.map((milestone, index) => (
                                <div key={index} className="bg-zinc-800/50 rounded-xl p-4 space-y-3 border border-zinc-700/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <GripVertical className="w-4 h-4 text-zinc-600" />
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Marco {index + 1}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => moveMilestone(index, -1)} disabled={index === 0} className="p-1.5 text-zinc-500 hover:text-white disabled:opacity-30 rounded-lg hover:bg-zinc-700 transition-colors" title="Mover para cima">↑</button>
                                            <button onClick={() => moveMilestone(index, 1)} disabled={index === profile.milestones.length - 1} className="p-1.5 text-zinc-500 hover:text-white disabled:opacity-30 rounded-lg hover:bg-zinc-700 transition-colors" title="Mover para baixo">↓</button>
                                            <button onClick={() => removeMilestone(index)} className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[100px_1fr] gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Ano</label>
                                            <input type="text" value={milestone.year} onChange={(e) => updateMilestone(index, 'year', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" placeholder="2024" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Título</label>
                                            <input type="text" value={milestone.title} onChange={(e) => updateMilestone(index, 'title', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" placeholder="Nome do marco" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Descrição</label>
                                        <textarea value={milestone.description} onChange={(e) => updateMilestone(index, 'description', e.target.value)} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary resize-none" placeholder="Descreva este momento da jornada..." />
                                    </div>

                                    {/* Media Upload */}
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Foto ou Vídeo</label>
                                        {milestone.media_url ? (
                                            <div className="relative inline-block">
                                                {milestone.media_type === 'video' ? (
                                                    <video src={milestone.media_url} className="h-24 w-auto rounded-lg border border-zinc-700" muted />
                                                ) : (
                                                    <img src={milestone.media_url} alt="" className="h-24 w-auto rounded-lg border border-zinc-700 object-cover" />
                                                )}
                                                <button
                                                    onClick={() => removeMilestoneMedia(index)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                                <div className="absolute bottom-1 left-1">
                                                    <span className="text-[9px] font-bold uppercase bg-black/60 text-white px-1.5 py-0.5 rounded flex items-center gap-1">
                                                        {milestone.media_type === 'video' ? <><Film className="w-2.5 h-2.5" /> Vídeo</> : <><Image className="w-2.5 h-2.5" /> Foto</>}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <input
                                                    ref={(el) => { fileInputRefs.current[index] = el; }}
                                                    type="file"
                                                    accept="image/*,video/*"
                                                    onChange={(e) => handleMilestoneMediaUpload(e, index)}
                                                    className="hidden"
                                                />
                                                <button
                                                    onClick={() => fileInputRefs.current[index]?.click()}
                                                    disabled={uploadingMilestone === index}
                                                    className="flex items-center gap-2 px-3 py-2 bg-zinc-800 border border-dashed border-zinc-600 rounded-lg text-xs text-zinc-400 hover:border-primary/50 hover:text-zinc-300 transition-colors disabled:opacity-50"
                                                >
                                                    {uploadingMilestone === index ? (
                                                        <><div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" /> Enviando...</>
                                                    ) : (
                                                        <><Upload className="w-3 h-3" /> Enviar foto ou vídeo</>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {profile.milestones.length === 0 && <p className="text-sm text-zinc-500 text-center py-4">Nenhum marco adicionado</p>}
                        </div>
                    </section>

                    {/* ─── Values Section ─── */}
                    <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
                        <h3 className="text-lg font-bold text-white">🥋 Valores do Atleta</h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.values_list.map((val, index) => (
                                <span key={index} className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-full text-sm text-white">
                                    {val}
                                    <button onClick={() => removeValue(index)} className="text-zinc-500 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addValue()} className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" placeholder="Digite um valor e pressione Enter..." />
                            <button onClick={addValue} className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 hover:border-primary/50 transition-colors">
                                <Plus className="w-3 h-3" /> Adicionar
                            </button>
                        </div>
                    </section>

                    {/* Bio Save Button */}
                    <div className="flex justify-end pb-8">
                        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20">
                            <Save className="w-5 h-5" />
                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </>
            )}

            {/* ══════════════════════════════════════════ */}
            {/* COMPETITIONS SECTION */}
            {/* ══════════════════════════════════════════ */}
            {activeSection === 'competitions' && (
                <>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-amber-400" />
                            Histórico de Competições
                        </h3>
                        <button
                            onClick={() => setEditingComp(newCompetition())}
                            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black font-bold rounded-lg text-sm hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Nova Competição
                        </button>
                    </div>

                    {/* Competition Editor Modal */}
                    {editingComp && (
                        <div className="bg-zinc-900/80 border border-zinc-700 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-white font-bold">{editingComp.id ? 'Editar' : 'Nova'} Competição</h4>
                                <button onClick={() => setEditingComp(null)} className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800"><X className="w-4 h-4" /></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Nome da Competição*</label>
                                    <input type="text" value={editingComp.name} onChange={(e) => setEditingComp({ ...editingComp, name: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" placeholder="Ex: Campeonato Paulista Sub-15" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Data*</label>
                                    <input type="date" value={editingComp.date} onChange={(e) => setEditingComp({ ...editingComp, date: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Local</label>
                                    <input type="text" value={editingComp.location} onChange={(e) => setEditingComp({ ...editingComp, location: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" placeholder="Ex: São Paulo, SP" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Categoria</label>
                                    <input type="text" value={editingComp.category} onChange={(e) => setEditingComp({ ...editingComp, category: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" placeholder="Ex: Sub-15" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Peso</label>
                                    <input type="text" value={editingComp.weight_class} onChange={(e) => setEditingComp({ ...editingComp, weight_class: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" placeholder="Ex: -55kg" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Colocação*</label>
                                    <input type="text" value={editingComp.placement} onChange={(e) => setEditingComp({ ...editingComp, placement: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" placeholder="Ex: 1º lugar" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Medalha</label>
                                    <select
                                        value={editingComp.medal_type || ''}
                                        onChange={(e) => setEditingComp({ ...editingComp, medal_type: e.target.value || null })}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                                    >
                                        {MEDAL_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Observações</label>
                                    <input type="text" value={editingComp.notes} onChange={(e) => setEditingComp({ ...editingComp, notes: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" placeholder="Detalhes adicionais..." />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button onClick={() => setEditingComp(null)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">Cancelar</button>
                                <button
                                    onClick={() => saveCompetition(editingComp)}
                                    disabled={savingComp || !editingComp.name || !editingComp.placement}
                                    className="flex items-center gap-2 px-5 py-2 bg-primary text-black font-bold rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    {savingComp ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Competitions List */}
                    {competitions.length === 0 ? (
                        <div className="text-center py-16 text-zinc-500">
                            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p className="text-sm">Nenhuma competição cadastrada ainda</p>
                            <p className="text-xs mt-1">Clique em "Nova Competição" para começar</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {competitions.map((comp) => (
                                <div
                                    key={comp.id}
                                    className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 hover:border-zinc-700 transition-colors group"
                                >
                                    {/* Medal Icon */}
                                    <div className="text-2xl flex-shrink-0">{medalEmoji(comp.medal_type)}</div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-white font-bold text-sm">{comp.name}</span>
                                            {comp.category && <span className="text-[10px] px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-400">{comp.category}</span>}
                                            {comp.weight_class && <span className="text-[10px] px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-400">{comp.weight_class}</span>}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                                            <span>{new Date(comp.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                                            {comp.location && <span>📍 {comp.location}</span>}
                                        </div>
                                    </div>

                                    {/* Placement */}
                                    <div className="text-right flex-shrink-0">
                                        <span className="text-sm font-bold text-primary">{comp.placement}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setEditingComp(comp)} className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors" title="Editar">
                                            <Save className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => deleteCompetition(comp.id)} className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors" title="Excluir">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
