import React, { useEffect, useState } from 'react';
import { gymApi, GymScheduleEntry } from '../../lib/api-gym';

const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const dayNamesShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const modalityColors: Record<string, string> = {
    'Judô': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Jiu-Jitsu': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Musculação': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Competição': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Descanso': 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function GymSchedule() {
    const [schedule, setSchedule] = useState<GymScheduleEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editEntry, setEditEntry] = useState<Partial<GymScheduleEntry>>({});

    useEffect(() => {
        loadSchedule();
    }, []);

    const loadSchedule = async () => {
        try {
            const data = await gymApi.getSchedule();
            setSchedule(data);
        } finally {
            setLoading(false);
        }
    };

    const openAdd = (day: number) => {
        setEditEntry({ day_of_week: day, modality: 'Judô', start_time: '19:00', end_time: '21:00' });
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            await gymApi.saveScheduleEntry(editEntry);
            await loadSchedule();
            setShowModal(false);
        } catch (err) {
            alert('Erro ao salvar');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remover este treino?')) return;
        await gymApi.deleteScheduleEntry(id);
        await loadSchedule();
    };

    return (
        <div className="min-h-screen flex flex-col pb-24">
            {/* Header */}
            <div className="p-4 pb-2">
                <h1 className="text-xl font-bold text-white">Agenda Semanal</h1>
                <p className="text-xs text-gym-muted mt-1">Seus treinos técnicos fixos da semana</p>
            </div>

            {/* Schedule Grid */}
            <div className="flex-1 px-4 py-4 space-y-3">
                {loading ? (
                    Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="bg-gym-surface rounded-xl h-16 animate-pulse" />
                    ))
                ) : (
                    dayNames.map((name, dayIdx) => {
                        const dayEntries = schedule.filter(s => s.day_of_week === dayIdx);
                        return (
                            <div key={dayIdx} className="bg-gym-surface rounded-xl border border-gym-surface-light overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-gym-muted w-8">{dayNamesShort[dayIdx]}</span>
                                        <span className="text-sm font-semibold text-white">{name}</span>
                                    </div>
                                    <button onClick={() => openAdd(dayIdx)} className="p-1 rounded-lg hover:bg-gym-surface-light transition-colors">
                                        <span className="material-symbols-outlined text-gym-primary text-lg">add</span>
                                    </button>
                                </div>
                                {dayEntries.length > 0 && (
                                    <div className="px-4 pb-3 space-y-2">
                                        {dayEntries.map(entry => (
                                            <div key={entry.id} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${modalityColors[entry.modality] || 'bg-gym-surface-light text-gym-text border-gym-surface-light'}`}>
                                                <div>
                                                    <span className="text-xs font-bold">{entry.modality}</span>
                                                    <span className="text-xs opacity-70 ml-2">{entry.start_time?.slice(0, 5)} – {entry.end_time?.slice(0, 5)}</span>
                                                </div>
                                                <button onClick={() => handleDelete(entry.id!)} className="opacity-50 hover:opacity-100 transition-opacity">
                                                    <span className="material-symbols-outlined text-sm">close</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center" onClick={() => setShowModal(false)}>
                    <div className="bg-gym-surface w-full max-w-md rounded-t-2xl p-6 space-y-5" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white">Adicionar Treino</h3>
                        <p className="text-sm text-gym-muted">{dayNames[editEntry.day_of_week || 0]}</p>

                        <div>
                            <label className="block text-xs font-semibold text-gym-muted mb-2">Modalidade</label>
                            <div className="flex flex-wrap gap-2">
                                {Object.keys(modalityColors).map(m => (
                                    <button key={m} onClick={() => setEditEntry(prev => ({ ...prev, modality: m }))}
                                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${editEntry.modality === m ? 'bg-gym-primary text-white' : 'bg-gym-surface-light text-gym-muted'}`}>
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gym-muted mb-2">Início</label>
                                <input type="time" value={editEntry.start_time || ''} onChange={e => setEditEntry(prev => ({ ...prev, start_time: e.target.value }))}
                                    className="gym-input" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gym-muted mb-2">Fim</label>
                                <input type="time" value={editEntry.end_time || ''} onChange={e => setEditEntry(prev => ({ ...prev, end_time: e.target.value }))}
                                    className="gym-input" />
                            </div>
                        </div>

                        <button onClick={handleSave}
                            className="w-full bg-gradient-to-r from-gym-primary to-blue-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95">
                            Salvar
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .gym-input {
                    width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem;
                    border: 1px solid #243447; background: #1a2634; color: #e2e8f0;
                    font-size: 0.875rem; outline: none; transition: border-color 0.2s;
                }
                .gym-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.2); }
            `}</style>
        </div>
    );
}
