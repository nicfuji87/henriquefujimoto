import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { appApi, AppTraining } from '../../lib/api-app';
import { useTrainingWizard } from '../../components/app/AppLayout';

export default function AppHome() {
    const navigate = useNavigate();
    const { updateTraining, resetTraining } = useTrainingWizard();
    const [allTrainings, setAllTrainings] = useState<AppTraining[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchDocs() {
            try {
                const trainings = await appApi.getTrainings(100);
                setAllTrainings(trainings);
            } catch (err) {
                console.error("Failed to load trainings", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchDocs();
    }, []);

    const latestTraining = allTrainings.length > 0 ? allTrainings[0] : null;

    // Calculate real consecutive days streak
    const streak = useMemo(() => {
        if (allTrainings.length === 0) return 0;

        const toDateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const uniqueDates = [...new Set(allTrainings.map(t => toDateStr(new Date(t.created_at!))))].sort().reverse();

        if (uniqueDates.length === 0) return 0;

        let count = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
            const prev = new Date(uniqueDates[i - 1]);
            const curr = new Date(uniqueDates[i]);
            const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                count++;
            } else {
                break;
            }
        }
        return count;
    }, [allTrainings]);

    // Weekly summary computed from actual data
    const weeklySummary = useMemo(() => {
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const weekTrainings = allTrainings.filter(t => new Date(t.created_at || '') >= weekAgo);

        if (weekTrainings.length === 0) {
            return {
                count: 0,
                avgRating: 0,
                avgFocus: 0,
                avgFatigue: 0,
                topEmotion: null as string | null,
                topPainArea: null as string | null,
                modalityCounts: {} as Record<string, number>,
                insight: 'Nenhum treino registrado nesta semana. Que tal começar agora?',
                emoji: '💪'
            };
        }

        const count = weekTrainings.length;
        const avgRating = +(weekTrainings.reduce((s, t) => s + (t.rating || 0), 0) / count).toFixed(1);
        const focusTr = weekTrainings.filter(t => t.focus_level != null);
        const avgFocus = focusTr.length > 0 ? +(focusTr.reduce((s, t) => s + (t.focus_level || 0), 0) / focusTr.length).toFixed(1) : 0;
        const fatigueTr = weekTrainings.filter(t => t.fatigue_level != null);
        const avgFatigue = fatigueTr.length > 0 ? +(fatigueTr.reduce((s, t) => s + (t.fatigue_level || 0), 0) / fatigueTr.length).toFixed(1) : 0;

        // Most common emotion
        const emoFreq: Record<string, number> = {};
        weekTrainings.forEach(t => (t.emotions || []).forEach(e => { emoFreq[e] = (emoFreq[e] || 0) + 1; }));
        const topEmotion = Object.entries(emoFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

        // Most common pain area
        const painFreq: Record<string, number> = {};
        weekTrainings.forEach(t => (t.pain_areas || []).forEach(p => { painFreq[p] = (painFreq[p] || 0) + 1; }));
        const topPainArea = Object.entries(painFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

        // Modality counts
        const modalityCounts: Record<string, number> = {};
        weekTrainings.forEach(t => { modalityCounts[t.modality] = (modalityCounts[t.modality] || 0) + 1; });

        // Generate dynamic insight
        let insight = '';
        let emoji = '📊';

        if (avgRating >= 8) {
            insight = `Semana excelente! Sua nota média foi ${avgRating}/10. Continue assim!`;
            emoji = '🔥';
        } else if (avgRating >= 6) {
            insight = `Boa semana! Nota média de ${avgRating}/10. Sempre evoluindo.`;
            emoji = '💪';
        } else if (avgRating >= 4) {
            insight = `Semana com desafios. Nota média ${avgRating}/10. Cada treino conta!`;
            emoji = '🧠';
        } else {
            insight = `Semana difícil, nota média ${avgRating}/10. Descanse e volte mais forte!`;
            emoji = '🫂';
        }

        if (topEmotion) {
            insight += ` Emoção predominante: ${topEmotion}.`;
        }
        if (avgFatigue >= 8) {
            insight += ' Cansaço alto — cuide da recuperação!';
        }

        return { count, avgRating, avgFocus, avgFatigue, topEmotion, topPainArea, modalityCounts, insight, emoji };
    }, [allTrainings]);

    const handleNewTraining = () => {
        resetTraining();
        navigate('/app/new-training');
    };

    const handleNewCompetition = () => {
        resetTraining();
        updateTraining({ is_competition: true, training_type: 'Competição' });
        navigate('/app/new-training');
    };

    const formatTime = (isoString?: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    const getRatingColor = (r: number) => {
        if (r <= 3) return 'text-red-500 bg-red-50 dark:bg-red-900/20';
        if (r <= 5) return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
        if (r <= 7) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    };

    return (
        <div className="font-app-display text-slate-900 dark:text-slate-100 flex flex-col overflow-x-hidden min-h-screen">
            <style>{`
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        .filled {
            font-variation-settings: 'FILL' 1;
        }
      `}</style>

            {/* Header & Greeting Section */}
            <header className="bg-white dark:bg-slate-900 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center justify-between p-4 pb-2">
                    <div className="flex items-center gap-3">
                        <div
                            className="h-10 w-10 rounded-full bg-cover bg-center border-2 border-app-primary/20"
                            data-alt="Profile picture of a young athlete"
                            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA_LgeNOEAt47b2v3gTreWIQRrhVL3YNFCRzUof3KLI2oqovDhl3PPvo4E0t3G2p4zm9t-ousF-7JjW4E3OE7n2tbxnn0kRASoqrtgSPcO66BJ9F3OE6G3DlLmSZY3Q3AUyISJ2HxU30Z6wPxHeMHpR_g-IL4wFNG7r4uTi7OomF4SoCIiv7qOpupjkpqtrCWFQf_slekiDoA6FH9A0flAGgDqtPeTrL0s11ds6oB2cm3zFmG3aFpYtU_yDLEJfNEjJITslJsxHno-O")' }}
                        >
                        </div>
                        <div>
                            <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">Bem-vindo de volta</h2>
                            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Diário do Atleta</h1>
                        </div>
                    </div>
                    <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => {
                        localStorage.removeItem('app_auth');
                        navigate('/app/login');
                    }}>
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300" title="Sair">logout</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 py-6 flex flex-col gap-6 pb-24">
                {/* Greeting & Streak */}
                <div>
                    <h2 className="text-[28px] font-bold text-slate-900 dark:text-white leading-tight mb-2">Olá, Henrique! 🥋</h2>
                    {streak > 0 && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-full border border-orange-200 dark:border-orange-800">
                            <span className="text-lg">🔥</span>
                            <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                                {streak} dia{streak > 1 ? 's' : ''} consecutivo{streak > 1 ? 's' : ''} treinando
                            </span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={handleNewTraining} className="flex flex-col items-start justify-between p-4 h-40 bg-app-primary hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 group">
                        <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                            <span className="material-symbols-outlined text-3xl">add</span>
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-lg leading-tight">Registrar<br />Treino</p>
                            <p className="text-blue-100 text-xs mt-1">Judo ou Jiu-Jitsu</p>
                        </div>
                    </button>
                    <button onClick={handleNewCompetition} className="flex flex-col items-start justify-between p-4 h-40 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl shadow-lg shadow-slate-500/20 transition-all active:scale-95 group">
                        <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                            <span className="material-symbols-outlined text-3xl text-yellow-400">emoji_events</span>
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-lg leading-tight">Registrar<br />Competição</p>
                            <p className="text-slate-400 text-xs mt-1">Resultados e Medalhas</p>
                        </div>
                    </button>
                </div>

                {/* Latest Activity Card */}
                <section>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Último Registro</h3>
                        <a className="text-sm font-medium text-app-primary hover:text-blue-700 cursor-pointer" onClick={() => navigate('/app/history')}>Ver tudo</a>
                    </div>

                    {isLoading ? (
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 animate-pulse h-24"></div>
                    ) : latestTraining ? (
                        <div
                            className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 cursor-pointer hover:border-app-primary/50 transition-colors"
                            onClick={() => navigate(`/app/training/${latestTraining.id}`)}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`h-14 w-14 rounded-lg flex items-center justify-center shrink-0 ${latestTraining.is_competition ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'bg-blue-50 dark:bg-blue-900/20 text-app-primary'}`}>
                                    <span className="material-symbols-outlined text-2xl">
                                        {latestTraining.is_competition ? 'emoji_events' : (latestTraining.modality === 'Jiu-Jitsu' ? 'sports_kabaddi' : 'sports_martial_arts')}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white truncate">
                                                {latestTraining.is_competition ? latestTraining.competition_name || 'Competição' : `Treino de ${latestTraining.modality}`}
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{formatTime(latestTraining.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                        <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
                                            {latestTraining.training_type || 'Geral'}
                                        </span>
                                        {latestTraining.rating !== undefined && (
                                            <span className="inline-flex items-center px-2 py-1 rounded bg-green-50 dark:bg-green-900/20 text-xs font-medium text-green-700 dark:text-green-400">
                                                Nota {latestTraining.rating}/10
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 text-center text-slate-500 text-sm">
                            Nenhum treino registrado ainda.
                        </div>
                    )}
                </section>

                {/* Weekly Summary - REAL DATA */}
                <section>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 px-1">Resumo da Semana</h3>

                    {isLoading ? (
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/50 animate-pulse h-40"></div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                            {/* Insight Header */}
                            <div className="bg-gradient-to-r from-app-primary/10 via-blue-50 to-purple-50 dark:from-app-primary/10 dark:via-slate-800 dark:to-slate-800 p-4 border-b border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{weeklySummary.emoji}</span>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{weeklySummary.insight}</p>
                                        <p className="text-xs text-slate-500 mt-1">{weeklySummary.count} treino{weeklySummary.count !== 1 ? 's' : ''} nos últimos 7 dias</p>
                                    </div>
                                </div>
                            </div>

                            {weeklySummary.count > 0 && (
                                <div className="p-4">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        <div className="text-center">
                                            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-1 ${getRatingColor(weeklySummary.avgRating)}`}>
                                                <span className="font-bold text-sm">{weeklySummary.avgRating}</span>
                                            </div>
                                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Nota</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-1 text-blue-500 bg-blue-50 dark:bg-blue-900/20">
                                                <span className="font-bold text-sm">{weeklySummary.avgFocus}</span>
                                            </div>
                                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Foco</p>
                                        </div>
                                        <div className="text-center">
                                            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-1 ${weeklySummary.avgFatigue >= 7 ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'}`}>
                                                <span className="font-bold text-sm">{weeklySummary.avgFatigue}</span>
                                            </div>
                                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Cansaço</p>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(weeklySummary.modalityCounts).map(([mod, cnt]) => (
                                            <span key={mod} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                <span className="material-symbols-outlined text-[14px]">{mod === 'Jiu-Jitsu' ? 'sports_kabaddi' : 'sports_martial_arts'}</span>
                                                {mod}: {cnt}x
                                            </span>
                                        ))}
                                        {weeklySummary.topEmotion && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-xs font-semibold text-purple-600 dark:text-purple-400">
                                                <span className="material-symbols-outlined text-[14px]">mood</span>
                                                {weeklySummary.topEmotion}
                                            </span>
                                        )}
                                        {weeklySummary.topPainArea && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-xs font-semibold text-red-500 dark:text-red-400">
                                                <span className="material-symbols-outlined text-[14px]">healing</span>
                                                {weeklySummary.topPainArea}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
