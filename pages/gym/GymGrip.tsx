import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { gymApi, calculateATRPhase } from '../../lib/api-gym';
import type { GymCompetition, GymWorkout as GymWorkoutType } from '../../lib/api-gym';

const GRIP_PROTOCOLS = {
    LIGHT: {
        label: 'Leve',
        description: 'Manutenção / opcional',
        exercises: [
            { name: 'Towel Hold', sets: 2, time: '20s', rest: '30s' },
            { name: 'Light Carry', sets: 2, time: '20m', rest: '30s' },
        ],
    },
    STANDARD: {
        label: 'Padrão',
        description: 'Desenvolvimento geral de grip',
        exercises: [
            { name: 'Kimono Hang', sets: 3, time: '20-30s', rest: '45s' },
            { name: 'Towel Kettlebell Hold', sets: 3, time: '20s', rest: '30s' },
            { name: 'Farmer Carry', sets: 2, time: '30m', rest: '45s' },
        ],
    },
    COMPETITIVE: {
        label: 'Competitivo',
        description: 'Volume alto para atletas avançados',
        exercises: [
            { name: 'Kimono Hang', sets: 3, time: '30-45s', rest: '60s' },
            { name: 'Alternating Towel Hold', sets: 3, time: '20s', rest: '45s' },
            { name: 'Heavy Carry', sets: 3, time: '20m', rest: '60s' },
        ],
    },
};

type ProtocolKey = keyof typeof GRIP_PROTOCOLS;

export default function GymGrip() {
    const navigate = useNavigate();
    const [nextComp, setNextComp] = useState<GymCompetition | null>(null);
    const [workouts, setWorkouts] = useState<GymWorkoutType[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTimer, setActiveTimer] = useState<{ exerciseName: string; seconds: number; running: boolean } | null>(null);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        (async () => {
            try {
                const [comp, w] = await Promise.all([gymApi.getNextCompetition(), gymApi.getRecentWorkouts(30)]);
                setNextComp(comp);
                setWorkouts(w);
            } finally { setLoading(false); }
        })();
    }, []);

    // Determine protocol based on phase
    const daysToComp = nextComp ? Math.ceil((new Date(nextComp.date + 'T12:00:00').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
    const phase = calculateATRPhase(nextComp?.date || null);

    let protocolKey: ProtocolKey = 'STANDARD';
    if (phase === 'realization' || (daysToComp !== null && daysToComp <= 7)) protocolKey = 'LIGHT';
    else if (phase === 'transmutation') protocolKey = 'COMPETITIVE';
    const protocol = GRIP_PROTOCOLS[protocolKey];

    // Grip volume from recent workouts
    const gripWorkouts = workouts.filter(w =>
        w.status === 'completed' &&
        ((w.exercises as any[]) || []).some(e => e.category === 'grip' || e.exercise_name?.toLowerCase().includes('grip') || e.exercise_name?.toLowerCase().includes('hang'))
    );
    const weeklyGripSessions = gripWorkouts.filter(w => {
        const d = new Date((w.date || '') + 'T12:00:00');
        const week = new Date(); week.setDate(week.getDate() - 7);
        return d >= week;
    }).length;

    // Timer functions
    const startTimer = useCallback((exerciseName: string, targetSeconds: number) => {
        setActiveTimer({ exerciseName, seconds: targetSeconds, running: true });
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setActiveTimer(prev => {
                if (!prev || prev.seconds <= 1) {
                    clearInterval(timerRef.current);
                    return prev ? { ...prev, seconds: 0, running: false } : null;
                }
                return { ...prev, seconds: prev.seconds - 1 };
            });
        }, 1000);
    }, []);

    const stopTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setActiveTimer(null);
    }, []);

    useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

    const parseSeconds = (time: string): number => {
        const match = time.match(/(\d+)/);
        return match ? parseInt(match[1]) : 30;
    };

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    // Weekly recommended frequency
    const recommendedFreq = phase === 'accumulation' ? 2 : phase === 'transmutation' ? 3 : 1;

    // Estimated total time
    const totalTime = protocol.exercises.reduce((s, ex) => s + ex.sets * (parseSeconds(ex.time) + parseSeconds(ex.rest)), 0);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-3 border-gym-primary border-t-transparent rounded-full animate-spin" /></div>;
    }

    return (
        <div className="min-h-screen flex flex-col pb-6">
            {/* Header */}
            <div className="p-4 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gym-surface flex items-center justify-center">
                    <span className="material-symbols-outlined text-gym-muted">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-xl font-bold text-white">Protocolo de Grip</h1>
                    <p className="text-xs text-gym-muted">Desenvolvimento de pegada para combate</p>
                </div>
            </div>

            <div className="px-4 space-y-4">
                {/* Protocol Info */}
                <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/10 rounded-2xl border border-yellow-500/20 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="text-xs text-gym-muted font-bold uppercase tracking-wider">Protocolo Atual</p>
                            <h2 className="text-xl font-bold text-white">{protocol.label}</h2>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl">🤜</span>
                        </div>
                    </div>
                    <p className="text-sm text-gym-text">{protocol.description}</p>
                    <div className="flex gap-4 mt-3">
                        <div className="flex items-center gap-1 text-xs text-gym-muted">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            ~{Math.ceil(totalTime / 60)}min
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gym-muted">
                            <span className="material-symbols-outlined text-sm">repeat</span>
                            {recommendedFreq}x/semana
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gym-muted">
                            <span className="material-symbols-outlined text-sm">fitness_center</span>
                            {protocol.exercises.length} exercícios
                        </div>
                    </div>
                </div>

                {/* Weekly Tracking */}
                <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gym-muted">Esta semana</p>
                            <p className="text-lg font-bold text-white">{weeklyGripSessions} / {recommendedFreq} sessões</p>
                        </div>
                        <div className="flex gap-1">
                            {Array.from({ length: recommendedFreq }).map((_, i) => (
                                <div key={i} className={`w-4 h-4 rounded-full ${i < weeklyGripSessions ? 'bg-gym-accent' : 'bg-gym-surface-light'}`} />
                            ))}
                        </div>
                    </div>
                    {weeklyGripSessions >= recommendedFreq && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-gym-warning">
                            <span className="material-symbols-outlined text-sm">info</span>
                            Volume semanal atingido. Priorize recuperação.
                        </div>
                    )}
                </div>

                {/* Timer */}
                {activeTimer && (
                    <div className="bg-gradient-to-br from-gym-primary/20 to-blue-600/10 rounded-2xl border border-gym-primary/30 p-6 text-center">
                        <p className="text-xs text-gym-muted mb-1">{activeTimer.exerciseName}</p>
                        <div className="text-5xl font-bold text-white font-mono mb-4">{formatTime(activeTimer.seconds)}</div>
                        <button onClick={stopTimer} className="px-6 py-2 bg-gym-danger/20 text-gym-danger rounded-xl font-bold text-sm">
                            Parar
                        </button>
                    </div>
                )}

                {/* Exercises */}
                <div className="space-y-3">
                    <p className="text-xs font-semibold text-gym-muted uppercase tracking-wider">Exercícios</p>
                    {protocol.exercises.map((ex, i) => (
                        <div key={i} className="bg-gym-surface rounded-xl border border-gym-surface-light p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-white">{ex.name}</h3>
                                <button onClick={() => startTimer(ex.name, parseSeconds(ex.time))}
                                    className="w-8 h-8 bg-gym-primary/20 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-gym-primary text-lg">timer</span>
                                </button>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gym-muted">
                                <span>{ex.sets} séries</span>
                                <span>⏱ {ex.time}</span>
                                <span>💤 {ex.rest} descanso</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Volume Alert */}
                {(daysToComp !== null && daysToComp <= 3) && (
                    <div className="bg-gym-danger/10 rounded-xl border border-gym-danger/20 p-4 flex items-center gap-3">
                        <span className="material-symbols-outlined text-gym-danger">warning</span>
                        <div>
                            <p className="text-sm font-bold text-white">Competição em {daysToComp} dias</p>
                            <p className="text-xs text-gym-muted">Evite grip pesado. Foque em mobilidade e recuperação.</p>
                        </div>
                    </div>
                )}

                {/* Grip levels explanation */}
                <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-4">
                    <p className="text-xs font-semibold text-gym-muted mb-3 uppercase tracking-wider">Níveis de Protocolo</p>
                    <div className="space-y-3">
                        {Object.entries(GRIP_PROTOCOLS).map(([key, p]) => (
                            <div key={key} className={`flex items-center gap-3 ${key === protocolKey ? 'opacity-100' : 'opacity-40'}`}>
                                <div className={`w-2 h-8 rounded-full ${key === protocolKey ? 'bg-gym-primary' : 'bg-gym-surface-light'}`} />
                                <div>
                                    <p className="text-sm font-bold text-white">{p.label}</p>
                                    <p className="text-xs text-gym-muted">{p.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
