import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appApi, AppTraining } from '../../lib/api-app';

export default function AppHistory() {
    const navigate = useNavigate();
    const [trainings, setTrainings] = useState<AppTraining[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('Todos');

    useEffect(() => {
        async function fetchDocs() {
            try {
                const data = await appApi.getTrainings(20);
                setTrainings(data);
            } catch (err) {
                console.error("Failed to load trainings", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchDocs();
    }, []);

    const formatTime = (training: AppTraining) => {
        const displayDate = training.training_date || training.created_at;
        if (!displayDate) return '';
        const d = new Date(displayDate + (training.training_date ? 'T12:00:00' : ''));
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const filteredTrainings = filter === 'Todos'
        ? trainings
        : trainings.filter(t => t.modality === filter);

    return (
        <div className="text-slate-900 dark:text-slate-100 font-app-display antialiased flex-1 flex flex-col items-center">
            <style>{`
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
            <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-app-bg-light/90 dark:bg-app-bg-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between p-4 pt-6">
                        <button onClick={() => navigate('/app')} className="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-900 dark:text-slate-100">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">Diário de Treinos</h2>
                        <div className="flex w-10 items-center justify-end">
                            <button className="flex items-center justify-center rounded-full text-app-primary hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors p-2">
                                <span className="material-symbols-outlined">calendar_month</span>
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-3 px-4 pb-4 overflow-x-auto no-scrollbar">
                        <button onClick={() => setFilter('Todos')} className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-transform active:scale-95 ${filter === 'Todos' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}>
                            <span className="material-symbols-outlined text-[18px]">apps</span>
                            <p className="text-sm font-medium">Todos</p>
                        </button>
                        <button onClick={() => setFilter('Judô')} className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-transform active:scale-95 ${filter === 'Judô' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}>
                            <span className="material-symbols-outlined text-[18px]">sports_martial_arts</span>
                            <p className="text-sm font-medium">Judô</p>
                        </button>
                        <button onClick={() => setFilter('Jiu-Jitsu')} className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-transform active:scale-95 ${filter === 'Jiu-Jitsu' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}>
                            <span className="material-symbols-outlined text-[18px]">sports_kabaddi</span>
                            <p className="text-sm font-medium">Jiu-Jitsu</p>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col gap-6 p-4 pb-32">
                    {/* Stats Summary Card */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-app-primary to-blue-600 p-5 shadow-lg shadow-blue-500/20">
                        <div className="relative z-10 flex justify-between items-end text-white">
                            <div>
                                <p className="text-blue-100 text-sm font-medium mb-1">Este Mês</p>
                                <h3 className="text-3xl font-bold">{trainings.length} <span className="text-lg font-normal text-blue-200">Treinos</span></h3>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 justify-end text-blue-100 text-sm font-medium mb-1">
                                    <span>Evolução Física</span>
                                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                                </div>
                                <h3 className="text-2xl font-bold">Boa</h3>
                            </div>
                        </div>
                        {/* Abstract decorative circles */}
                        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
                    </div>

                    {/* Recent Activity Section */}
                    <div>
                        <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight mb-4 px-1">Atividades Recentes</h3>

                        {isLoading ? (
                            <div className="flex flex-col gap-3">
                                <div className="animate-pulse h-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                                <div className="animate-pulse h-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                                <div className="animate-pulse h-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                            </div>
                        ) : filteredTrainings.length === 0 ? (
                            <div className="text-center text-slate-500 py-10">
                                Nenhum registro encontrado.
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {filteredTrainings.map(t => (
                                    <div
                                        key={t.id}
                                        className="group flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-4 shadow-sm hover:shadow-md hover:border-app-primary/50 transition-all cursor-pointer"
                                        onClick={() => navigate(`/app/training/${t.id}`)}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-app-primary ${t.is_competition ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                                                    <span className="material-symbols-outlined">
                                                        {t.is_competition ? 'emoji_events' : (t.modality === 'Jiu-Jitsu' ? 'sports_kabaddi' : 'sports_martial_arts')}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h4 className="text-slate-900 dark:text-white font-bold leading-tight">
                                                        {t.is_competition ? t.competition_name || 'Competição' : `Treino de ${t.modality}`}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${t.is_competition ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                                            {t.is_competition ? t.competition_result || t.training_type : t.training_type || 'Geral'}
                                                        </span>
                                                        {t.gym_name && (
                                                            <>
                                                                <span className="text-xs text-slate-400">•</span>
                                                                <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                                                    <span className="material-symbols-outlined text-[12px]">location_on</span>
                                                                    {t.gym_name}
                                                                </span>
                                                            </>
                                                        )}
                                                        <span className="text-xs text-slate-400">•</span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">{formatTime(t)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                {t.rating !== undefined && (
                                                    <span className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${t.is_competition ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                                                        {t.rating}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {(t.reflection || t.learned_today) && (
                                            <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 p-3">
                                                <div className="flex gap-2 items-start">
                                                    <span className="material-symbols-outlined text-[18px] text-app-primary mt-0.5">psychology</span>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">"{t.reflection || t.learned_today}"</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
