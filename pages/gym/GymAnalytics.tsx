import React, { useEffect, useState } from 'react';
import { gymApi, calculateDailyLoad, calculateReadinessScore } from '../../lib/api-gym';
import type { GymWorkout as GymWorkoutType, GymCheckin as GymCheckinType, GymCompetition } from '../../lib/api-gym';

export default function GymAnalytics() {
    const [workouts, setWorkouts] = useState<GymWorkoutType[]>([]);
    const [checkins, setCheckins] = useState<GymCheckinType[]>([]);
    const [nextComp, setNextComp] = useState<GymCompetition | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [w, c, comp] = await Promise.all([
                    gymApi.getRecentWorkouts(60),
                    gymApi.getRecentCheckins(28),
                    gymApi.getNextCompetition(),
                ]);
                setWorkouts(w);
                setCheckins(c);
                setNextComp(comp);
            } finally { setLoading(false); }
        })();
    }, []);

    // Calculations
    const now = new Date();
    const since7 = new Date(now); since7.setDate(since7.getDate() - 7);
    const since28 = new Date(now); since28.setDate(since28.getDate() - 28);

    const completedWorkouts = workouts.filter(w => w.status === 'completed');
    const last7Workouts = completedWorkouts.filter(w => w.date && new Date(w.date + 'T12:00:00') >= since7);
    const last28Workouts = completedWorkouts.filter(w => w.date && new Date(w.date + 'T12:00:00') >= since28);

    const acuteLoad = last7Workouts.reduce((s, w) => s + calculateDailyLoad(w.duration_minutes || 0, w.rpe || 5), 0);
    const chronicLoad = last28Workouts.length > 0
        ? last28Workouts.reduce((s, w) => s + calculateDailyLoad(w.duration_minutes || 0, w.rpe || 5), 0) / 4
        : 0;
    const acwr = chronicLoad > 0 ? +(acuteLoad / chronicLoad).toFixed(2) : 0;

    const avgReadiness = checkins.length > 0
        ? Math.round(checkins.reduce((s, c) => s + (c.readiness_score || calculateReadinessScore(c)), 0) / checkins.length)
        : 0;

    const trainingFrequency = last7Workouts.length;

    // Focus distribution
    const focusCounts: Record<string, number> = {};
    completedWorkouts.forEach(w => {
        ((w.exercises as any[]) || []).forEach(ex => {
            const cat = ex.category || 'outro';
            focusCounts[cat] = (focusCounts[cat] || 0) + 1;
        });
    });
    const focusEntries = Object.entries(focusCounts).sort((a, b) => b[1] - a[1]);
    const maxFocus = Math.max(...Object.values(focusCounts), 1);

    // Days to competition
    let daysToComp: number | null = null;
    if (nextComp) {
        daysToComp = Math.ceil((new Date(nextComp.date + 'T12:00:00').getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Weekly loads for bar chart (last 4 weeks)
    const weeklyLoads: { label: string; load: number }[] = [];
    for (let w = 3; w >= 0; w--) {
        const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() - w * 7);
        const weekStart = new Date(weekEnd); weekStart.setDate(weekStart.getDate() - 6);
        const weekWorkouts = completedWorkouts.filter(wo => {
            const d = new Date((wo.date || '') + 'T12:00:00');
            return d >= weekStart && d <= weekEnd;
        });
        const load = weekWorkouts.reduce((s, wo) => s + calculateDailyLoad(wo.duration_minutes || 0, wo.rpe || 5), 0);
        weeklyLoads.push({ label: `S${4 - w}`, load });
    }
    const maxWeekLoad = Math.max(...weeklyLoads.map(w => w.load), 1);

    // Readiness trend (last 14 days)
    const readinessTrend = checkins.slice(0, 14).reverse().map(c => ({
        date: c.date || '',
        score: c.readiness_score || calculateReadinessScore(c),
    }));

    // Insight cards
    const insights: { text: string; icon: string; color: string }[] = [];
    if (chronicLoad > 0) {
        const loadDiff = Math.round(((acuteLoad - chronicLoad) / chronicLoad) * 100);
        if (loadDiff > 10) insights.push({ text: `Carga ${loadDiff}% acima da média crônica`, icon: 'trending_up', color: 'text-gym-warning' });
        else if (loadDiff < -10) insights.push({ text: `Carga ${Math.abs(loadDiff)}% abaixo da média crônica`, icon: 'trending_down', color: 'text-gym-accent' });
    }
    if (acwr > 1.3) insights.push({ text: 'ACWR alto — risco de sobrecarga. Considere reduzir volume.', icon: 'warning', color: 'text-gym-danger' });
    else if (acwr >= 0.8 && acwr <= 1.3) insights.push({ text: 'ACWR na zona ideal (0.8-1.3)', icon: 'check_circle', color: 'text-gym-accent' });
    if (checkins.length >= 3) {
        const last3 = checkins.slice(0, 3);
        const avgLast3 = last3.reduce((s, c) => s + (c.readiness_score || 0), 0) / 3;
        const avgPrev = checkins.length > 3 ? checkins.slice(3, 6).reduce((s, c) => s + (c.readiness_score || 0), 0) / Math.min(checkins.length - 3, 3) : avgLast3;
        if (avgLast3 < avgPrev - 5) insights.push({ text: 'Prontidão caiu nos últimos 3 dias', icon: 'mood_bad', color: 'text-gym-warning' });
    }
    if (daysToComp !== null && daysToComp <= 14 && daysToComp > 0) {
        insights.push({ text: `Competição em ${daysToComp} dias — foco na realização`, icon: 'emoji_events', color: 'text-gym-primary' });
    }

    const categoryLabels: Record<string, string> = {
        strength: 'Força', power: 'Potência', stability: 'Estabilidade',
        mobility: 'Mobilidade', grip: 'Grip', core: 'Core', outro: 'Outro',
    };
    const categoryColors: Record<string, string> = {
        strength: 'bg-blue-500', power: 'bg-red-500', stability: 'bg-purple-500',
        mobility: 'bg-green-500', grip: 'bg-yellow-500', core: 'bg-orange-500', outro: 'bg-gray-500',
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-3 border-gym-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col pb-24">
            <div className="p-4 pb-2">
                <h1 className="text-xl font-bold text-white">Analytics</h1>
                <p className="text-xs text-gym-muted mt-1">Visão inteligente do seu desempenho</p>
            </div>

            <div className="flex-1 px-4 py-4 space-y-4">
                {/* Insight Cards */}
                {insights.length > 0 && (
                    <div className="space-y-2">
                        {insights.map((ins, i) => (
                            <div key={i} className="bg-gym-surface rounded-xl border border-gym-surface-light p-3 flex items-center gap-3">
                                <span className={`material-symbols-outlined ${ins.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{ins.icon}</span>
                                <p className="text-sm text-gym-text flex-1">{ins.text}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Key Metrics Row */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-3 text-center">
                        <div className="text-2xl font-bold text-gym-primary">{trainingFrequency}</div>
                        <p className="text-[10px] text-gym-muted mt-1">Treinos/sem</p>
                    </div>
                    <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-3 text-center">
                        <div className={`text-2xl font-bold ${avgReadiness >= 70 ? 'text-gym-accent' : avgReadiness >= 50 ? 'text-gym-warning' : 'text-gym-danger'}`}>{avgReadiness}%</div>
                        <p className="text-[10px] text-gym-muted mt-1">Prontidão média</p>
                    </div>
                    <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-3 text-center">
                        <div className={`text-2xl font-bold ${acwr >= 0.8 && acwr <= 1.3 ? 'text-gym-accent' : acwr > 1.3 ? 'text-gym-danger' : 'text-gym-warning'}`}>{acwr}</div>
                        <p className="text-[10px] text-gym-muted mt-1">ACWR</p>
                    </div>
                </div>

                {/* Weekly Load Chart */}
                <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-4">
                    <p className="text-xs font-semibold text-gym-muted mb-3 uppercase tracking-wider">Carga Semanal</p>
                    <div className="flex items-end gap-3 h-28">
                        {weeklyLoads.map((w, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-[10px] text-gym-muted">{Math.round(w.load)}</span>
                                <div className="w-full rounded-t-lg bg-gradient-to-t from-gym-primary to-blue-400 transition-all"
                                    style={{ height: `${Math.max((w.load / maxWeekLoad) * 80, 4)}%` }} />
                                <span className="text-[10px] text-gym-muted font-bold">{w.label}</span>
                            </div>
                        ))}
                    </div>
                    {chronicLoad > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-gym-muted">
                            <div className="w-3 h-0.5 bg-gym-accent" />
                            <span>Carga crônica: {Math.round(chronicLoad)}</span>
                        </div>
                    )}
                </div>

                {/* Readiness Trend */}
                {readinessTrend.length > 1 && (
                    <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-4">
                        <p className="text-xs font-semibold text-gym-muted mb-3 uppercase tracking-wider">Prontidão (14 dias)</p>
                        <div className="flex items-end gap-1 h-20">
                            {readinessTrend.map((r, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center">
                                    <div className={`w-full rounded-t transition-all ${r.score >= 70 ? 'bg-gym-accent' : r.score >= 50 ? 'bg-gym-warning' : 'bg-gym-danger'}`}
                                        style={{ height: `${Math.max(r.score * 0.8, 4)}%` }} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Focus Distribution */}
                {focusEntries.length > 0 && (
                    <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-4">
                        <p className="text-xs font-semibold text-gym-muted mb-3 uppercase tracking-wider">Distribuição dos Focos</p>
                        <div className="space-y-2">
                            {focusEntries.slice(0, 6).map(([cat, count]) => (
                                <div key={cat} className="flex items-center gap-3">
                                    <span className="text-xs text-gym-text w-20 truncate">{categoryLabels[cat] || cat}</span>
                                    <div className="flex-1 h-3 bg-gym-surface-light rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${categoryColors[cat] || 'bg-gym-primary'}`}
                                            style={{ width: `${(count / maxFocus) * 100}%` }} />
                                    </div>
                                    <span className="text-xs text-gym-muted w-6 text-right">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Competition Countdown */}
                {nextComp && daysToComp !== null && (
                    <div className={`rounded-xl border p-4 ${daysToComp <= 7 ? 'bg-gym-danger/10 border-gym-danger/30' : 'bg-gym-surface border-gym-surface-light'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gym-muted">Próxima competição</p>
                                <h3 className="font-bold text-white">{nextComp.name}</h3>
                            </div>
                            <div className={`text-3xl font-bold ${daysToComp <= 7 ? 'text-gym-danger' : daysToComp <= 21 ? 'text-gym-warning' : 'text-gym-primary'}`}>
                                {daysToComp}d
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
