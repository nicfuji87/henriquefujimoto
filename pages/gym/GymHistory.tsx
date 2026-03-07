import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gymApi } from '../../lib/api-gym';
import type { GymWorkout as GymWorkoutType, GymTrainingPlan, GymCompetition } from '../../lib/api-gym';

type Tab = 'history' | 'plans';

export default function GymHistory() {
    const navigate = useNavigate();
    const [tab, setTab] = useState<Tab>('history');
    const [workouts, setWorkouts] = useState<GymWorkoutType[]>([]);
    const [plans, setPlans] = useState<GymTrainingPlan[]>([]);
    const [competitions, setCompetitions] = useState<GymCompetition[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [editPlan, setEditPlan] = useState<Partial<GymTrainingPlan>>({ phase: 'accumulation', focus_tags: [] });

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        try {
            const [w, p, c] = await Promise.all([
                gymApi.getAllWorkouts(),
                gymApi.getTrainingPlans(),
                gymApi.getCompetitions(),
            ]);
            setWorkouts(w);
            setPlans(p);
            setCompetitions(c);
        } finally { setLoading(false); }
    };

    const handleSavePlan = async () => {
        try {
            await gymApi.saveTrainingPlan(editPlan);
            await loadAll();
            setShowPlanModal(false);
            setEditPlan({ phase: 'accumulation', focus_tags: [] });
        } catch { alert('Erro ao salvar plano'); }
    };

    // Group workouts by week
    const groupedByWeek = workouts.reduce<Record<string, GymWorkoutType[]>>((acc, w) => {
        if (!w.date) return acc;
        const d = new Date(w.date + 'T12:00:00');
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const key = weekStart.toISOString().slice(0, 10);
        if (!acc[key]) acc[key] = [];
        acc[key].push(w);
        return acc;
    }, {});

    const phaseLabels: Record<string, { label: string; color: string }> = {
        accumulation: { label: 'Acumulação', color: 'bg-blue-500/20 text-blue-400' },
        transmutation: { label: 'Transmutação', color: 'bg-purple-500/20 text-purple-400' },
        realization: { label: 'Realização', color: 'bg-red-500/20 text-red-400' },
    };

    const sessionLabels: Record<string, string> = {
        complete: 'Completo', standard: 'Padrão', light: 'Leve', regenerative: 'Regenerativo', short_activation: 'Ativação Curta',
    };

    return (
        <div className="min-h-screen flex flex-col pb-24">
            {/* Header */}
            <div className="p-4 pb-2">
                <h1 className="text-xl font-bold text-white">Treinos</h1>
                <p className="text-xs text-gym-muted mt-1">Histórico e planos de treino</p>
            </div>

            {/* Tab bar */}
            <div className="px-4 flex gap-2 mb-4">
                {(['history', 'plans'] as Tab[]).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t ? 'bg-gym-primary text-white' : 'bg-gym-surface text-gym-muted'}`}>
                        {t === 'history' ? 'Histórico' : 'Planos'}
                    </button>
                ))}
            </div>

            <div className="flex-1 px-4 space-y-4">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-gym-surface rounded-xl h-20 animate-pulse" />)
                ) : tab === 'history' ? (
                    workouts.length === 0 ? (
                        <div className="text-center py-16">
                            <span className="material-symbols-outlined text-5xl text-gym-muted/40 block mb-3">fitness_center</span>
                            <p className="text-gym-muted text-sm">Nenhum treino registrado</p>
                        </div>
                    ) : (
                        Object.entries(groupedByWeek).map(([weekKey, weekWorkouts]) => (
                            <div key={weekKey}>
                                <p className="text-xs font-semibold text-gym-muted mb-2 uppercase tracking-wider">
                                    Semana de {new Date(weekKey + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                </p>
                                <div className="space-y-2">
                                    {weekWorkouts.map(w => (
                                        <div key={w.id} className="bg-gym-surface rounded-xl border border-gym-surface-light p-4"
                                            onClick={() => w.id && navigate(`/gym/workout`, { state: { workoutId: w.id } })}>
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-bold text-white text-sm">{w.workout_name || 'Treino'}</h3>
                                                    <p className="text-xs text-gym-muted">
                                                        {w.date && new Date(w.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {w.atr_phase && (
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${phaseLabels[w.atr_phase]?.color || ''}`}>
                                                            {phaseLabels[w.atr_phase]?.label}
                                                        </span>
                                                    )}
                                                    {w.status === 'completed' ? (
                                                        <span className="material-symbols-outlined text-gym-accent text-sm">check_circle</span>
                                                    ) : w.status === 'skipped' ? (
                                                        <span className="material-symbols-outlined text-gym-warning text-sm">skip_next</span>
                                                    ) : (
                                                        <span className="material-symbols-outlined text-gym-muted text-sm">pending</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gym-muted">
                                                {w.duration_minutes && <span>⏱ {w.duration_minutes}min</span>}
                                                {w.rpe && <span>RPE {w.rpe}</span>}
                                                {w.session_type && <span>{sessionLabels[w.session_type] || w.session_type}</span>}
                                                {(w.exercises as any[])?.length > 0 && <span>{(w.exercises as any[]).length} exercícios</span>}
                                            </div>
                                            {/* AI Analysis Preview */}
                                            {w.ai_post_analysis && (
                                                <div className="mt-2 p-2 bg-gym-primary/10 rounded-lg border border-gym-primary/20">
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <span className="material-symbols-outlined text-gym-primary text-xs">auto_awesome</span>
                                                        <span className="text-[10px] font-bold text-gym-primary">Análise IA</span>
                                                    </div>
                                                    <p className="text-xs text-gym-text line-clamp-2">{(w.ai_post_analysis as any).summary}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )
                ) : (
                    /* Plans tab */
                    <>
                        {plans.length === 0 ? (
                            <div className="text-center py-16">
                                <span className="material-symbols-outlined text-5xl text-gym-muted/40 block mb-3">event_note</span>
                                <p className="text-gym-muted text-sm">Nenhum plano de treino</p>
                                <p className="text-gym-muted/60 text-xs mt-1">Crie um plano para periodizar seus treinos</p>
                            </div>
                        ) : (
                            plans.map(plan => {
                                const linkedComp = competitions.find(c => c.id === plan.competition_id);
                                const planWorkouts = workouts.filter(w => w.plan_id === plan.id);
                                return (
                                    <div key={plan.id} className="bg-gym-surface rounded-xl border border-gym-surface-light p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-bold text-white">{plan.name}</h3>
                                                <p className="text-xs text-gym-muted mt-0.5">
                                                    {new Date(plan.start_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                                    {plan.end_date && ` — ${new Date(plan.end_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`}
                                                </p>
                                            </div>
                                            {plan.phase && (
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${phaseLabels[plan.phase]?.color || ''}`}>
                                                    {phaseLabels[plan.phase]?.label}
                                                </span>
                                            )}
                                        </div>
                                        {linkedComp && (
                                            <div className="flex items-center gap-1 text-xs text-gym-warning mb-2">
                                                <span className="material-symbols-outlined text-sm">emoji_events</span>
                                                {linkedComp.name}
                                            </div>
                                        )}
                                        {plan.objective && <p className="text-xs text-gym-text mb-2">{plan.objective}</p>}
                                        <div className="flex items-center gap-3 text-xs text-gym-muted">
                                            <span>{planWorkouts.length} treinos</span>
                                            {plan.focus_tags && plan.focus_tags.length > 0 && (
                                                <span>{plan.focus_tags.join(', ')}</span>
                                            )}
                                            {plan.is_active && <span className="text-gym-accent font-bold">Ativo</span>}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <button onClick={() => setShowPlanModal(true)}
                            className="w-full bg-gradient-to-r from-gym-primary to-blue-500 text-white font-bold py-3 rounded-xl mt-4">
                            + Novo Plano
                        </button>
                    </>
                )}
            </div>

            {/* Plan Modal */}
            {showPlanModal && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center" onClick={() => setShowPlanModal(false)}>
                    <div className="bg-gym-surface w-full max-w-md rounded-t-2xl p-6 pb-8 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white">Novo Plano de Treino</h3>
                        <div>
                            <label className="block text-xs font-semibold text-gym-muted mb-2">Nome</label>
                            <input value={editPlan.name || ''} onChange={e => setEditPlan(p => ({ ...p, name: e.target.value }))}
                                placeholder="Ex: Prep. Campeonato Paulista" className="gym-input" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gym-muted mb-2">Competição vinculada (opcional)</label>
                            <select value={editPlan.competition_id || ''} onChange={e => setEditPlan(p => ({ ...p, competition_id: e.target.value || undefined }))} className="gym-input">
                                <option value="">Nenhuma</option>
                                {competitions.filter(c => new Date(c.date + 'T12:00:00') > new Date()).map(c => (
                                    <option key={c.id} value={c.id}>{c.name} ({new Date(c.date + 'T12:00:00').toLocaleDateString('pt-BR')})</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gym-muted mb-2">Início</label>
                                <input type="date" value={editPlan.start_date || ''} onChange={e => setEditPlan(p => ({ ...p, start_date: e.target.value }))} className="gym-input" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gym-muted mb-2">Fim</label>
                                <input type="date" value={editPlan.end_date || ''} onChange={e => setEditPlan(p => ({ ...p, end_date: e.target.value }))} className="gym-input" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gym-muted mb-2">Fase</label>
                            <div className="flex gap-2">
                                {(['accumulation', 'transmutation', 'realization'] as const).map(ph => (
                                    <button key={ph} onClick={() => setEditPlan(p => ({ ...p, phase: ph }))}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${editPlan.phase === ph ? 'bg-gym-primary text-white' : 'bg-gym-surface-light text-gym-muted'}`}>
                                        {phaseLabels[ph]?.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gym-muted mb-2">Objetivo</label>
                            <textarea rows={2} value={editPlan.objective || ''} onChange={e => setEditPlan(p => ({ ...p, objective: e.target.value }))}
                                placeholder="Ex: Aumentar base de força e resistência" className="gym-input" style={{ resize: 'none' }} />
                        </div>
                        <button onClick={handleSavePlan} disabled={!editPlan.name || !editPlan.start_date}
                            className="w-full bg-gradient-to-r from-gym-primary to-blue-500 disabled:from-gym-surface disabled:to-gym-surface text-white font-bold py-3 rounded-xl">
                            Salvar Plano
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
