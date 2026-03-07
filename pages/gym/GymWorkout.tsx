import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { gymApi } from '../../lib/api-gym';
import type { GymWorkout as GymWorkoutType, GymWorkoutExercise, GymGripProtocol } from '../../lib/api-gym';

export default function GymWorkout() {
    const navigate = useNavigate();
    const [workout, setWorkout] = useState<GymWorkoutType | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
    const [showJustification, setShowJustification] = useState(false);
    const [gripTimer, setGripTimer] = useState<{ name: string; seconds: number; running: boolean } | null>(null);
    const gripTimerRef = useRef<any>(null);

    useEffect(() => { loadWorkout(); }, []);
    useEffect(() => () => { if (gripTimerRef.current) clearInterval(gripTimerRef.current); }, []);

    const loadWorkout = async () => {
        try {
            const existing = await gymApi.getTodayWorkout();
            if (existing) {
                setWorkout(existing);
                // Restore completed exercises
                const exercises = (existing.exercises as GymWorkoutExercise[]) || [];
                const done = new Set<number>();
                exercises.forEach((e, i) => { if (e.completed) done.add(i); });
                setCompletedExercises(done);
            } else {
                // Auto-generate
                await generateWorkout();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const generateWorkout = async () => {
        setGenerating(true);
        setError('');
        try {
            const checkin = await gymApi.getTodayCheckin();
            if (!checkin) {
                navigate('/gym/checkin', { replace: true });
                return;
            }
            const generated = await gymApi.generateWorkout(checkin.id!);
            setWorkout(generated);
        } catch (err: any) {
            setError(err.message || 'Erro ao gerar treino');
        } finally {
            setGenerating(false);
        }
    };

    const toggleExercise = (index: number) => {
        setCompletedExercises(prev => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };

    const exercises = (workout?.exercises as GymWorkoutExercise[]) || [];
    const allDone = exercises.length > 0 && completedExercises.size === exercises.length;
    const gripProtocol = workout?.grip_protocol as GymGripProtocol | undefined;
    const showGrip = gripProtocol && gripProtocol.level !== 'skip' && gripProtocol.exercises?.length > 0;

    const handleFinish = () => {
        // Save completed state to exercises
        const updatedExercises = exercises.map((e, i) => ({ ...e, completed: completedExercises.has(i) }));
        // Navigate to workout-done with workout id
        navigate('/gym/workout-done', { state: { workoutId: workout?.id, exercises: updatedExercises } });
    };

    const startGripTimer = useCallback((name: string, seconds: number) => {
        if (gripTimerRef.current) clearInterval(gripTimerRef.current);
        setGripTimer({ name, seconds, running: true });
        gripTimerRef.current = setInterval(() => {
            setGripTimer(prev => {
                if (!prev || prev.seconds <= 1) {
                    clearInterval(gripTimerRef.current);
                    return prev ? { ...prev, seconds: 0, running: false } : null;
                }
                return { ...prev, seconds: prev.seconds - 1 };
            });
        }, 1000);
    }, []);

    const stopGripTimer = useCallback(() => {
        if (gripTimerRef.current) clearInterval(gripTimerRef.current);
        setGripTimer(null);
    }, []);

    const formatTimer = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    const gripLevelLabels: Record<string, { label: string; color: string }> = {
        light: { label: 'Leve', color: 'bg-yellow-500/20 text-yellow-400' },
        standard: { label: 'Padrão', color: 'bg-blue-500/20 text-blue-400' },
        competitive: { label: 'Competitivo', color: 'bg-red-500/20 text-red-400' },
    };

    if (loading || generating) {
        return (
            <div className="bg-gym-bg min-h-screen flex flex-col items-center justify-center font-app-display">
                <div className="w-12 h-12 border-3 border-gym-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gym-muted text-sm">{generating ? 'Gerando treino com IA...' : 'Carregando...'}</p>
                <p className="text-gym-muted/60 text-xs mt-1">Isso pode levar alguns segundos</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gym-bg min-h-screen flex flex-col items-center justify-center font-app-display px-6">
                <span className="material-symbols-outlined text-5xl text-gym-danger mb-4">error</span>
                <p className="text-white font-bold mb-2">Erro ao gerar treino</p>
                <p className="text-gym-muted text-sm text-center mb-6">{error}</p>
                <button onClick={generateWorkout} className="bg-gym-primary text-white font-bold py-3 px-6 rounded-xl">
                    Tentar novamente
                </button>
                <button onClick={() => navigate('/gym')} className="text-gym-muted text-sm mt-4">Voltar ao início</button>
            </div>
        );
    }

    if (!workout) return null;

    const intensityColors: Record<string, string> = {
        low: 'bg-gym-accent/20 text-gym-accent',
        moderate: 'bg-gym-primary/20 text-gym-primary',
        high: 'bg-gym-danger/20 text-gym-danger',
    };
    const intensityLabels: Record<string, string> = { low: 'Baixa', moderate: 'Moderada', high: 'Alta' };

    return (
        <div className="bg-gym-bg min-h-screen flex flex-col font-app-display text-gym-text">
            {/* Header */}
            <div className="bg-gym-surface p-4 border-b border-gym-surface-light">
                <div className="flex items-center gap-3 mb-3">
                    <button onClick={() => navigate('/gym')} className="p-1 rounded-lg hover:bg-gym-surface-light">
                        <span className="material-symbols-outlined text-gym-muted">arrow_back</span>
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-white">{workout.workout_name || 'Treino do Dia'}</h1>
                        <p className="text-xs text-gym-muted">{workout.objective}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${intensityColors[workout.intensity || 'moderate']}`}>
                        {intensityLabels[workout.intensity || 'moderate']}
                    </span>
                    <span className="text-xs text-gym-muted flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">timer</span>
                        {workout.duration_minutes} min
                    </span>
                    <span className="text-xs text-gym-muted flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">format_list_numbered</span>
                        {exercises.length} exercícios
                    </span>
                    <span className="text-xs text-gym-accent flex items-center gap-1">
                        ✓ {completedExercises.size}/{exercises.length}
                    </span>
                </div>
            </div>

            {/* Justification Card */}
            {workout.ai_justification && (
                <div className="mx-4 mt-4">
                    <button onClick={() => setShowJustification(!showJustification)}
                        className="w-full bg-gym-primary/10 border border-gym-primary/20 rounded-xl p-3 text-left">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-gym-primary text-sm">auto_awesome</span>
                            <span className="text-xs font-bold text-gym-primary">Por que esse treino?</span>
                            <span className="material-symbols-outlined text-gym-muted text-sm ml-auto">
                                {showJustification ? 'expand_less' : 'expand_more'}
                            </span>
                        </div>
                        {showJustification && (
                            <p className="text-xs text-gym-text mt-2 leading-relaxed">
                                {workout.ai_detailed_justification || workout.ai_justification}
                            </p>
                        )}
                    </button>
                </div>
            )}

            {/* Exercise List */}
            <div className="flex-1 px-4 py-4 space-y-3">
                {exercises.map((ex, i) => {
                    const done = completedExercises.has(i);
                    return (
                        <div key={i} className={`bg-gym-surface rounded-xl border transition-all ${done ? 'border-gym-accent/30 opacity-70' : 'border-gym-surface-light'}`}>
                            <div className="p-4">
                                <div className="flex items-start gap-3">
                                    <button onClick={() => toggleExercise(i)}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${done ? 'bg-gym-accent text-white' : 'bg-gym-surface-light text-gym-muted'}`}>
                                        {done ? <span className="material-symbols-outlined text-lg">check</span> : <span className="text-sm font-bold">{i + 1}</span>}
                                    </button>
                                    <div className="flex-1">
                                        <h3 className={`font-bold text-sm ${done ? 'text-gym-muted line-through' : 'text-white'}`}>{ex.exercise_name}</h3>
                                        <div className="flex flex-wrap items-center gap-3 mt-2">
                                            <span className="text-xs text-gym-primary font-semibold">{ex.sets} séries × {ex.reps}</span>
                                            <span className="text-xs text-gym-muted">⏱ {ex.rest_seconds}s descanso</span>
                                            {ex.tempo && <span className="text-xs text-gym-muted">🎯 {ex.tempo}</span>}
                                        </div>
                                        {ex.technical_cues && ex.technical_cues.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {ex.technical_cues.map((cue, ci) => (
                                                    <span key={ci} className="text-[10px] bg-gym-primary/10 text-gym-primary px-2 py-0.5 rounded-full">💡 {cue}</span>
                                                ))}
                                            </div>
                                        )}
                                        {ex.notes && (
                                            <p className="text-xs text-gym-muted mt-2 bg-gym-surface-light/50 rounded-lg px-3 py-2">
                                                💡 {ex.notes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Grip Protocol Section */}
                {showGrip && (
                    <div className="mt-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">🤜</span>
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Protocolo de Grip</h2>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ml-auto ${gripLevelLabels[gripProtocol!.level]?.color || ''}`}>
                                {gripLevelLabels[gripProtocol!.level]?.label || gripProtocol!.level}
                            </span>
                        </div>
                        {gripProtocol!.justification && (
                            <p className="text-xs text-gym-muted mb-3 leading-relaxed">{gripProtocol!.justification}</p>
                        )}

                        {/* Grip Timer */}
                        {gripTimer && (
                            <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/10 rounded-xl border border-yellow-500/30 p-4 mb-3 text-center">
                                <p className="text-xs text-gym-muted mb-1">{gripTimer.name}</p>
                                <div className="text-4xl font-bold text-white font-mono mb-3">{formatTimer(gripTimer.seconds)}</div>
                                {gripTimer.running ? (
                                    <button onClick={stopGripTimer} className="px-5 py-1.5 bg-gym-danger/20 text-gym-danger rounded-lg font-bold text-xs">Parar</button>
                                ) : (
                                    <div className="flex gap-2 justify-center">
                                        <span className="text-gym-accent text-sm font-bold">✓ Feito!</span>
                                        <button onClick={stopGripTimer} className="text-xs text-gym-muted">Fechar</button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            {gripProtocol!.exercises.map((g, i) => (
                                <div key={i} className="bg-gym-surface rounded-xl border border-yellow-500/10 p-4 flex items-center gap-3">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white text-sm">{g.name}</h3>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gym-muted">
                                            <span>{g.sets} séries</span>
                                            <span>⏱ {g.hold_time_seconds}s</span>
                                            <span>💤 {g.rest_seconds}s</span>
                                        </div>
                                        {g.notes && <p className="text-xs text-gym-muted/70 mt-1">{g.notes}</p>}
                                    </div>
                                    <button onClick={() => startGripTimer(g.name, g.hold_time_seconds)}
                                        className="w-9 h-9 bg-yellow-500/20 rounded-full flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-yellow-400 text-lg">timer</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                        {gripProtocol!.estimated_time_seconds && (
                            <p className="text-[10px] text-gym-muted mt-2 text-center">
                                Tempo estimado: ~{Math.ceil(gripProtocol!.estimated_time_seconds / 60)} min
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom CTA */}
            <div className="px-4 pb-8 pt-4 bg-gradient-to-t from-gym-bg via-gym-bg to-transparent">
                <button onClick={handleFinish}
                    className={`w-full font-bold py-4 rounded-xl transition-all active:scale-95 ${allDone ? 'bg-gradient-to-r from-gym-accent to-emerald-400 text-white shadow-lg shadow-gym-accent/30' : 'bg-gym-surface text-gym-muted border border-gym-surface-light'}`}>
                    {allDone ? 'Finalizar Treino ✓' : `Finalizar (${completedExercises.size}/${exercises.length})`}
                </button>
            </div>
        </div>
    );
}
