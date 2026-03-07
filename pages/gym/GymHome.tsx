import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { gymApi, GymCheckin, GymWorkout, GymCompetition, calculateATRPhase, GymAthleteProfile } from '../../lib/api-gym';

const phaseLabels: Record<string, { label: string; color: string; icon: string; desc: string }> = {
    accumulation: { label: 'Acumulação', color: 'bg-blue-500/20 text-blue-400', icon: 'foundation', desc: 'Volume e base' },
    transmutation: { label: 'Transmutação', color: 'bg-purple-500/20 text-purple-400', icon: 'bolt', desc: 'Potência e transição' },
    realization: { label: 'Realização', color: 'bg-green-500/20 text-green-400', icon: 'emoji_events', desc: 'Taper e performance' },
};

export default function GymHome() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<GymAthleteProfile | null>(null);
    const [todayCheckin, setTodayCheckin] = useState<GymCheckin | null>(null);
    const [todayWorkout, setTodayWorkout] = useState<GymWorkout | null>(null);
    const [nextComp, setNextComp] = useState<GymCompetition | null>(null);
    const [weeklyLoad, setWeeklyLoad] = useState({ acute: 0, chronic: 0, acwr: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [p, checkin, workout, comp, load] = await Promise.all([
                    gymApi.getAthleteProfile(),
                    gymApi.getTodayCheckin(),
                    gymApi.getTodayWorkout(),
                    gymApi.getNextCompetition(),
                    gymApi.getWeeklyLoad(),
                ]);
                setProfile(p);
                setTodayCheckin(checkin);
                setTodayWorkout(workout);
                setNextComp(comp);
                setWeeklyLoad(load);

                // If not onboarded, redirect
                if (p && !p.gym_onboarded) {
                    navigate('/gym/onboarding', { replace: true });
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const atrPhase = useMemo(() => calculateATRPhase(nextComp?.date || null), [nextComp]);
    const phase = phaseLabels[atrPhase];

    const daysUntilComp = useMemo(() => {
        if (!nextComp) return null;
        return Math.ceil((new Date(nextComp.date + 'T12:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    }, [nextComp]);

    const getReadinessColor = (score: number) => {
        if (score >= 80) return 'text-gym-accent';
        if (score >= 60) return 'text-gym-primary';
        if (score >= 40) return 'text-gym-warning';
        return 'text-gym-danger';
    };

    const getACWRStatus = (acwr: number) => {
        if (acwr === 0) return { label: 'Sem dados', color: 'text-gym-muted' };
        if (acwr < 0.8) return { label: 'Baixa', color: 'text-gym-primary' };
        if (acwr <= 1.3) return { label: 'Ideal', color: 'text-gym-accent' };
        return { label: 'Alta', color: 'text-gym-danger' };
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gym-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col pb-24">
            {/* Header */}
            <header className="bg-gym-surface sticky top-0 z-10 border-b border-gym-surface-light">
                <div className="flex items-center justify-between p-4 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gym-primary to-blue-400 flex items-center justify-center text-white font-bold text-sm">
                            HF
                        </div>
                        <div>
                            <p className="text-xs text-gym-muted">Boa {new Date().getHours() < 12 ? 'manhã' : new Date().getHours() < 18 ? 'tarde' : 'noite'} 👊</p>
                            <h1 className="text-lg font-bold text-white leading-tight">Henrique</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {phase && (
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${phase.color}`}>
                                {phase.label}
                            </span>
                        )}
                        <button onClick={() => { localStorage.removeItem('gym_auth'); navigate('/gym/login'); }}
                            className="p-2 rounded-lg hover:bg-gym-surface-light transition-colors">
                            <span className="material-symbols-outlined text-gym-muted text-lg">logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-4 py-5 space-y-5">
                {/* Block 1: TODAY'S WORKOUT */}
                {todayWorkout ? (
                    <div className="bg-gradient-to-br from-gym-primary/20 to-gym-surface rounded-2xl border border-gym-primary/20 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-gym-primary">fitness_center</span>
                            <h2 className="text-sm font-bold text-gym-primary uppercase tracking-wider">Treino de Hoje</h2>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{todayWorkout.workout_name || 'Treino Complementar'}</h3>
                        <p className="text-sm text-gym-muted mb-4">{todayWorkout.objective}</p>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm text-gym-muted">timer</span>
                                <span className="text-sm text-gym-text font-medium">{todayWorkout.duration_minutes} min</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm text-gym-muted">speed</span>
                                <span className="text-sm text-gym-text font-medium capitalize">{todayWorkout.intensity}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm text-gym-muted">format_list_numbered</span>
                                <span className="text-sm text-gym-text font-medium">{(todayWorkout.exercises as any[])?.length || 0} exercícios</span>
                            </div>
                        </div>
                        <button onClick={() => navigate('/gym/workout')}
                            className={`w-full font-bold py-3.5 rounded-xl transition-all active:scale-95 ${todayWorkout.status === 'completed' ? 'bg-gym-accent text-white' : 'bg-gradient-to-r from-gym-primary to-blue-500 text-white shadow-lg shadow-gym-primary/30'}`}>
                            {todayWorkout.status === 'completed' ? '✓ Treino Concluído' : 'Iniciar Treino →'}
                        </button>
                    </div>
                ) : (
                    <div className="bg-gym-surface rounded-2xl border border-gym-surface-light p-5 text-center">
                        <span className="material-symbols-outlined text-4xl text-gym-muted/40 mb-2 block">fitness_center</span>
                        {todayCheckin ? (
                            <>
                                <p className="text-sm text-gym-muted mb-3">Check-in feito! Gere seu treino personalizado.</p>
                                <button onClick={() => navigate('/gym/workout')}
                                    className="bg-gradient-to-r from-gym-primary to-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-gym-primary/30 transition-all active:scale-95">
                                    Gerar Treino com IA
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-gym-muted mb-3">Faça o check-in do dia para receber seu treino</p>
                                <button onClick={() => navigate('/gym/checkin')}
                                    className="bg-gradient-to-r from-gym-primary to-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-gym-primary/30 transition-all active:scale-95">
                                    Fazer Check-in →
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Block 2: READINESS & LOAD */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Readiness */}
                    <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                            <span className="material-symbols-outlined text-sm text-gym-muted">favorite</span>
                            <span className="text-xs font-semibold text-gym-muted uppercase tracking-wider">Prontidão</span>
                        </div>
                        {todayCheckin ? (
                            <div className={`text-3xl font-bold ${getReadinessColor(todayCheckin.readiness_score || 0)}`}>
                                {todayCheckin.readiness_score}
                                <span className="text-sm text-gym-muted font-normal"> /100</span>
                            </div>
                        ) : (
                            <p className="text-sm text-gym-muted">—</p>
                        )}
                    </div>

                    {/* ACWR */}
                    <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                            <span className="material-symbols-outlined text-sm text-gym-muted">monitoring</span>
                            <span className="text-xs font-semibold text-gym-muted uppercase tracking-wider">Carga</span>
                        </div>
                        <div className={`text-3xl font-bold ${getACWRStatus(weeklyLoad.acwr).color}`}>
                            {weeklyLoad.acwr || '—'}
                        </div>
                        <p className={`text-xs font-semibold ${getACWRStatus(weeklyLoad.acwr).color}`}>
                            {getACWRStatus(weeklyLoad.acwr).label}
                        </p>
                    </div>
                </div>

                {/* Block 3: NEXT COMPETITION */}
                {nextComp && (
                    <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="material-symbols-outlined text-sm text-gym-warning">emoji_events</span>
                                    <span className="text-xs font-semibold text-gym-muted uppercase tracking-wider">Próxima Competição</span>
                                </div>
                                <h3 className="font-bold text-white text-sm">{nextComp.name}</h3>
                                <p className="text-xs text-gym-muted">
                                    {new Date(nextComp.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                                    {nextComp.location && ` · ${nextComp.location}`}
                                </p>
                            </div>
                            <div className={`text-center px-3 py-2 rounded-xl ${daysUntilComp! <= 7 ? 'bg-gym-danger/20' : daysUntilComp! <= 21 ? 'bg-gym-warning/20' : 'bg-gym-primary/20'}`}>
                                <div className={`text-2xl font-bold ${daysUntilComp! <= 7 ? 'text-gym-danger' : daysUntilComp! <= 21 ? 'text-gym-warning' : 'text-gym-primary'}`}>
                                    {daysUntilComp}
                                </div>
                                <div className="text-[10px] font-semibold text-gym-muted">dias</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Block 4: ATR PHASE (clickable) */}
                {phase && (
                    <button onClick={() => navigate('/gym/phase')} className="w-full text-left bg-gym-surface rounded-xl border border-gym-surface-light p-4 hover:border-gym-primary/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${phase.color}`}>
                                <span className="material-symbols-outlined text-lg">{phase.icon}</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gym-muted">Fase de Preparação</p>
                                <p className="font-bold text-white">{phase.label}</p>
                                <p className="text-xs text-gym-muted">{phase.desc}</p>
                            </div>
                            <span className="material-symbols-outlined text-gym-muted text-sm">chevron_right</span>
                        </div>
                    </button>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-4 gap-2">
                    <button onClick={() => navigate('/gym/checkin')}
                        className="bg-gym-surface rounded-xl border border-gym-surface-light p-3 text-center hover:border-gym-primary/50 transition-colors active:scale-95">
                        <span className="material-symbols-outlined text-gym-accent mb-1 block text-xl">mood</span>
                        <p className="font-semibold text-white text-[10px]">Check-in</p>
                    </button>
                    <button onClick={() => navigate('/gym/calendar')}
                        className="bg-gym-surface rounded-xl border border-gym-surface-light p-3 text-center hover:border-gym-primary/50 transition-colors active:scale-95">
                        <span className="material-symbols-outlined text-gym-primary mb-1 block text-xl">calendar_month</span>
                        <p className="font-semibold text-white text-[10px]">Calendário</p>
                    </button>
                    <button onClick={() => navigate('/gym/phase')}
                        className="bg-gym-surface rounded-xl border border-gym-surface-light p-3 text-center hover:border-gym-primary/50 transition-colors active:scale-95">
                        <span className="material-symbols-outlined text-purple-400 mb-1 block text-xl">timeline</span>
                        <p className="font-semibold text-white text-[10px]">Fase ATR</p>
                    </button>
                    <button onClick={() => navigate('/gym/grip')}
                        className="bg-gym-surface rounded-xl border border-gym-surface-light p-3 text-center hover:border-gym-primary/50 transition-colors active:scale-95">
                        <span className="material-symbols-outlined text-yellow-400 mb-1 block text-xl">front_hand</span>
                        <p className="font-semibold text-white text-[10px]">Grip</p>
                    </button>
                </div>
            </main>
        </div>
    );
}
