import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { gymApi } from '../../lib/api-gym';
import type { GymPostAnalysis } from '../../lib/api-gym';

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
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<GymPostAnalysis | null>(null);

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
            // Trigger AI analysis in background
            setAnalyzing(true);
            try {
                const result = await gymApi.analyzeWorkout(workoutId);
                setAnalysis(result);
            } catch { /* Analysis is optional */ }
            setAnalyzing(false);
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar');
        } finally {
            setSaving(false);
        }
    };

    if (done) {
        const loadColors = { adequate: 'text-gym-accent', high: 'text-gym-danger', low: 'text-gym-warning' };
        const progIcons = { progress: '↑', maintain: '→', regress: '↓' };
        const progColors = { progress: 'text-gym-accent', maintain: 'text-gym-primary', regress: 'text-gym-warning' };
        return (
            <div className="bg-gym-bg min-h-screen flex flex-col font-app-display text-gym-text px-6 py-8">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 bg-gym-accent/20 rounded-full flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-5xl text-gym-accent" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1">Treino Concluído! 🎉</h1>
                    <p className="text-gym-muted text-sm text-center">Cada sessão conta na sua evolução.</p>
                    <p className="text-gym-muted/60 text-xs mt-1">RPE: {rpe}/10 · Carga registrada</p>
                </div>

                {/* AI Analysis */}
                {analyzing && (
                    <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-4 mb-4 flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-gym-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gym-muted">Analisando seu treino com IA...</p>
                    </div>
                )}

                {analysis && (
                    <div className="space-y-3 mb-6">
                        <div className="bg-gym-primary/10 rounded-xl border border-gym-primary/20 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-gym-primary text-sm">auto_awesome</span>
                                <p className="text-xs font-bold text-gym-primary uppercase tracking-wider">Análise IA</p>
                                <span className={`ml-auto text-xs font-bold ${loadColors[analysis.load_assessment] || ''}`}>
                                    Carga: {analysis.load_assessment === 'adequate' ? 'Adequada' : analysis.load_assessment === 'high' ? 'Alta' : 'Baixa'}
                                </span>
                            </div>
                            <p className="text-sm text-gym-text leading-relaxed">{analysis.summary}</p>
                        </div>

                        {analysis.insights.length > 0 && (
                            <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-4">
                                <p className="text-xs font-bold text-gym-muted mb-2 uppercase tracking-wider">Insights</p>
                                <div className="space-y-2">
                                    {analysis.insights.map((ins, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <span className="material-symbols-outlined text-gym-primary text-sm mt-0.5">lightbulb</span>
                                            <p className="text-xs text-gym-text">{ins}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {analysis.recommendations.length > 0 && (
                            <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-4">
                                <p className="text-xs font-bold text-gym-muted mb-2 uppercase tracking-wider">Recomendações</p>
                                <div className="space-y-2">
                                    {analysis.recommendations.map((rec, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <span className="material-symbols-outlined text-gym-accent text-sm mt-0.5">check</span>
                                            <p className="text-xs text-gym-text">{rec}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {analysis.progression_suggestions.length > 0 && (
                            <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-4">
                                <p className="text-xs font-bold text-gym-muted mb-2 uppercase tracking-wider">Progressão</p>
                                <div className="space-y-2">
                                    {analysis.progression_suggestions.map((p, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className={`text-sm font-bold ${progColors[p.suggestion] || ''}`}>{progIcons[p.suggestion] || ''}</span>
                                            <span className="text-xs text-white font-bold">{p.exercise_name}</span>
                                            <span className="text-xs text-gym-muted flex-1">— {p.reason}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <button onClick={() => navigate('/gym', { replace: true })}
                    className="w-full bg-gradient-to-r from-gym-primary to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-gym-primary/30 transition-all active:scale-95">
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
