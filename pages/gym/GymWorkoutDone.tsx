import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { gymApi } from '../../lib/api-gym';

export default function GymWorkoutDone() {
    const navigate = useNavigate();
    const location = useLocation();
    const { workoutId, exercises } = (location.state || {}) as { workoutId?: string; exercises?: any[] };

    const [rpe, setRpe] = useState(5);
    const [pain, setPain] = useState(false);
    const [hardest, setHardest] = useState('');
    const [easiest, setEasiest] = useState('');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);

    const exerciseNames = (exercises || []).map((e: any) => e.exercise_name);

    const handleSave = async () => {
        if (!workoutId) { navigate('/gym', { replace: true }); return; }
        setSaving(true);
        try {
            await gymApi.completeWorkout(workoutId, {
                rpe,
                post_workout_pain: pain,
                post_workout_notes: notes,
                hardest_exercise: hardest,
                easiest_exercise: easiest,
                exercises, // save with completed flags
            });
            setDone(true);
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar');
        } finally {
            setSaving(false);
        }
    };

    if (done) {
        return (
            <div className="bg-gym-bg min-h-screen flex flex-col items-center justify-center font-app-display text-gym-text px-6">
                <div className="w-20 h-20 bg-gym-accent/20 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-5xl text-gym-accent" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Treino Concluído! 🎉</h1>
                <p className="text-gym-muted text-sm text-center mb-2">
                    Parabéns, Henrique! Cada sessão conta na sua evolução.
                </p>
                <p className="text-gym-muted/60 text-xs mb-8">RPE: {rpe}/10 · Carga registrada</p>
                <button onClick={() => navigate('/gym', { replace: true })}
                    className="bg-gradient-to-r from-gym-primary to-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-gym-primary/30 transition-all active:scale-95">
                    Voltar ao Início
                </button>
            </div>
        );
    }

    const getRPEColor = (value: number) => {
        if (value <= 3) return 'bg-gym-accent/20 text-gym-accent';
        if (value <= 5) return 'bg-gym-primary/20 text-gym-primary';
        if (value <= 7) return 'bg-gym-warning/20 text-gym-warning';
        return 'bg-gym-danger/20 text-gym-danger';
    };

    const rpeLabels = ['', 'Muito fácil', 'Fácil', 'Leve', 'Moderado', 'Médio', 'Difícil', 'Muito difícil', 'Intenso', 'Muito intenso', 'Máximo'];

    return (
        <div className="bg-gym-bg min-h-screen flex flex-col font-app-display text-gym-text">
            {/* Header */}
            <div className="p-4">
                <h1 className="text-xl font-bold text-white">Como foi o treino?</h1>
                <p className="text-xs text-gym-muted mt-1">Registro rápido pós-treino</p>
            </div>

            <div className="flex-1 px-4 space-y-6 overflow-y-auto pb-4">
                {/* RPE */}
                <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-4">
                    <h3 className="text-sm font-bold text-white mb-1">Esforço Percebido (RPE)</h3>
                    <p className="text-xs text-gym-muted mb-4">{rpeLabels[rpe]}</p>
                    <div className="flex gap-1.5 justify-between">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                            <button key={val} onClick={() => setRpe(val)}
                                className={`flex-1 h-10 rounded-lg text-xs font-bold transition-all ${rpe === val ? getRPEColor(val) + ' ring-1 ring-white/20 scale-110' : 'bg-gym-surface-light text-gym-muted'}`}>
                                {val}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Pain */}
                <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-4">
                    <h3 className="text-sm font-bold text-white mb-3">Sentiu dor durante o treino?</h3>
                    <div className="flex gap-3">
                        <button onClick={() => setPain(false)}
                            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${!pain ? 'bg-gym-accent/20 text-gym-accent border border-gym-accent/30' : 'bg-gym-surface-light text-gym-muted'}`}>
                            Não
                        </button>
                        <button onClick={() => setPain(true)}
                            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${pain ? 'bg-gym-danger/20 text-gym-danger border border-gym-danger/30' : 'bg-gym-surface-light text-gym-muted'}`}>
                            Sim
                        </button>
                    </div>
                </div>

                {/* Hardest / Easiest */}
                {exerciseNames.length > 0 && (
                    <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-4 space-y-4">
                        <div>
                            <h3 className="text-sm font-bold text-white mb-2">Exercício mais difícil</h3>
                            <div className="flex flex-wrap gap-2">
                                {exerciseNames.map((name: string) => (
                                    <button key={name} onClick={() => setHardest(name)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${hardest === name ? 'bg-gym-danger/20 text-gym-danger border border-gym-danger/30' : 'bg-gym-surface-light text-gym-muted'}`}>
                                        {name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white mb-2">Exercício mais fácil</h3>
                            <div className="flex flex-wrap gap-2">
                                {exerciseNames.map((name: string) => (
                                    <button key={name} onClick={() => setEasiest(name)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${easiest === name ? 'bg-gym-accent/20 text-gym-accent border border-gym-accent/30' : 'bg-gym-surface-light text-gym-muted'}`}>
                                        {name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Notes */}
                <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-4">
                    <h3 className="text-sm font-bold text-white mb-2">Observações</h3>
                    <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                        placeholder="Algo que queira registrar sobre a sessão..."
                        className="w-full p-3 rounded-xl border border-gym-surface-light bg-gym-bg text-white text-sm placeholder:text-gym-muted/60 focus:outline-none focus:ring-2 focus:ring-gym-primary resize-none" />
                </div>
            </div>

            {/* CTA */}
            <div className="px-4 pb-8 pt-4">
                <button onClick={handleSave} disabled={saving}
                    className="w-full bg-gradient-to-r from-gym-accent to-emerald-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-gym-accent/30 transition-all active:scale-95 disabled:opacity-50">
                    {saving ? 'Salvando...' : 'Salvar e Concluir'}
                </button>
            </div>
        </div>
    );
}
