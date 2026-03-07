import React, { useEffect, useState } from 'react';
import { gymApi, GymCompetition } from '../../lib/api-gym';

const importanceLabels: Record<string, { label: string; color: string }> = {
    A: { label: 'Principal', color: 'bg-gym-danger/20 text-gym-danger border-gym-danger/30' },
    B: { label: 'Importante', color: 'bg-gym-warning/20 text-gym-warning border-gym-warning/30' },
    C: { label: 'Preparatório', color: 'bg-gym-accent/20 text-gym-accent border-gym-accent/30' },
};

export default function GymCompetitions() {
    const [competitions, setCompetitions] = useState<GymCompetition[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editComp, setEditComp] = useState<Partial<GymCompetition>>({ importance: 'B' });

    useEffect(() => { load(); }, []);

    const load = async () => {
        try { setCompetitions(await gymApi.getCompetitions()); }
        finally { setLoading(false); }
    };

    const daysUntil = (date: string) => {
        const d = new Date(date + 'T12:00:00');
        const now = new Date();
        return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    };

    const handleSave = async () => {
        try {
            await gymApi.saveCompetition(editComp);
            await load();
            setShowModal(false);
            setEditComp({ importance: 'B' });
        } catch {
            alert('Erro ao salvar');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remover esta competição?')) return;
        await gymApi.deleteCompetition(id);
        await load();
    };

    const futureComps = competitions.filter(c => daysUntil(c.date) >= 0);
    const pastComps = competitions.filter(c => daysUntil(c.date) < 0);

    return (
        <div className="min-h-screen flex flex-col pb-24">
            <div className="p-4 pb-2 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Calendário Competitivo</h1>
                    <p className="text-xs text-gym-muted mt-1">Campeonatos e eventos</p>
                </div>
                <button onClick={() => { setEditComp({ importance: 'B' }); setShowModal(true); }}
                    className="p-2 bg-gym-primary rounded-xl hover:bg-gym-primary-dark transition-colors">
                    <span className="material-symbols-outlined text-white">add</span>
                </button>
            </div>

            <div className="flex-1 px-4 py-4 space-y-4">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-gym-surface rounded-xl h-24 animate-pulse" />)
                ) : futureComps.length === 0 && pastComps.length === 0 ? (
                    <div className="text-center py-16">
                        <span className="material-symbols-outlined text-5xl text-gym-muted/40 mb-3 block">emoji_events</span>
                        <p className="text-gym-muted text-sm">Nenhuma competição cadastrada</p>
                        <p className="text-gym-muted/60 text-xs mt-1">Adicione campeonatos para ajustar sua preparação</p>
                    </div>
                ) : (
                    <>
                        {futureComps.map(comp => {
                            const days = daysUntil(comp.date);
                            const imp = importanceLabels[comp.importance] || importanceLabels.B;
                            return (
                                <div key={comp.id} className="bg-gym-surface rounded-xl border border-gym-surface-light p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white">{comp.name}</h3>
                                            <p className="text-xs text-gym-muted mt-0.5">
                                                {new Date(comp.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${days <= 7 ? 'bg-gym-danger/20 text-gym-danger animate-pulse' : days <= 21 ? 'bg-gym-warning/20 text-gym-warning' : 'bg-gym-primary/20 text-gym-primary'}`}>
                                            {days === 0 ? 'Hoje!' : days === 1 ? 'Amanhã' : `${days} dias`}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${imp.color}`}>{imp.label}</span>
                                        {comp.location && <span className="text-xs text-gym-muted">📍 {comp.location}</span>}
                                        <div className="flex-1" />
                                        <button onClick={() => handleDelete(comp.id!)} className="text-gym-muted hover:text-gym-danger transition-colors">
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {pastComps.length > 0 && (
                            <div className="pt-4">
                                <p className="text-xs text-gym-muted font-semibold mb-3 uppercase tracking-wider">Passadas</p>
                                {pastComps.map(comp => (
                                    <div key={comp.id} className="bg-gym-surface/50 rounded-xl border border-gym-surface-light/50 p-4 mb-2 opacity-60">
                                        <h3 className="font-bold text-white text-sm">{comp.name}</h3>
                                        <p className="text-xs text-gym-muted">{new Date(comp.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center" onClick={() => setShowModal(false)}>
                    <div className="bg-gym-surface w-full max-w-md rounded-t-2xl p-6 pb-8 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white">Adicionar Competição</h3>
                        <div>
                            <label className="block text-xs font-semibold text-gym-muted mb-2">Nome</label>
                            <input value={editComp.name || ''} onChange={e => setEditComp(p => ({ ...p, name: e.target.value }))}
                                placeholder="Ex: Campeonato Paulista" className="gym-input" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gym-muted mb-2">Data</label>
                                <input type="date" value={editComp.date || ''} onChange={e => setEditComp(p => ({ ...p, date: e.target.value }))} className="gym-input" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gym-muted mb-2">Local</label>
                                <input value={editComp.location || ''} onChange={e => setEditComp(p => ({ ...p, location: e.target.value }))} placeholder="Cidade" className="gym-input" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gym-muted mb-2">Importância</label>
                            <div className="flex gap-2">
                                {(['A', 'B', 'C'] as const).map(i => (
                                    <button key={i} onClick={() => setEditComp(p => ({ ...p, importance: i }))}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${editComp.importance === i ? 'bg-gym-primary text-white' : 'bg-gym-surface-light text-gym-muted'}`}>
                                        {importanceLabels[i].label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button onClick={handleSave} disabled={!editComp.name || !editComp.date}
                            className="w-full bg-gradient-to-r from-gym-primary to-blue-500 disabled:from-gym-surface disabled:to-gym-surface text-white font-bold py-3 rounded-xl transition-all active:scale-95">
                            Salvar
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .gym-input { width:100%;padding:0.75rem 1rem;border-radius:0.75rem;border:1px solid #243447;background:#1a2634;color:#e2e8f0;font-size:0.875rem;outline:none; }
                .gym-input:focus { border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59,130,246,0.2); }
                .gym-input::placeholder { color:#64748b; }
            `}</style>
        </div>
    );
}
