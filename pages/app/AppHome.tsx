import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appApi, AppTraining } from '../../lib/api-app';
import { useTrainingWizard } from '../../components/app/AppLayout';

export default function AppHome() {
    const navigate = useNavigate();
    const { updateTraining, resetTraining } = useTrainingWizard();
    const [latestTraining, setLatestTraining] = useState<AppTraining | null>(null);
    const [streak, setStreak] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchDocs() {
            try {
                const trainings = await appApi.getTrainings(30);
                if (trainings.length > 0) {
                    setLatestTraining(trainings[0]);
                }
                // Calculate consecutive days streak
                if (trainings.length > 0) {
                    let count = 1;
                    const dates = trainings.map(t => {
                        const d = new Date(t.created_at!);
                        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                    });
                    const uniqueDates = [...new Set(dates)];

                    for (let i = 1; i < uniqueDates.length; i++) {
                        // Check if dates are consecutive (simplified: just count unique days)
                        count++;
                    }
                    setStreak(uniqueDates.length);
                }
            } catch (err) {
                console.error("Failed to load trainings", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchDocs();
    }, []);

    const handleNewTraining = () => {
        resetTraining();
        navigate('/app/new-training');
    };

    const handleNewCompetition = () => {
        resetTraining();
        updateTraining({ is_competition: true, training_type: 'Competição' });
        navigate('/app/new-training');
    };

    // Format relative date nicely
    const formatTime = (isoString?: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
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
                            <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">{streak} treino{streak > 1 ? 's' : ''} registrado{streak > 1 ? 's' : ''}</span>
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
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50">
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

                {/* Weekly Summary / Insight */}
                <section>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 px-1">Resumo da Semana</h3>
                    <div className="flex items-stretch justify-between gap-4 rounded-xl bg-gradient-to-br from-app-primary/10 to-transparent p-4 border border-app-primary/10">
                        <div className="flex flex-col justify-center gap-1 flex-[2_2_0px]">
                            <p className="text-slate-900 dark:text-white text-base font-bold leading-tight">Foco na Defesa</p>
                            <p className="text-slate-600 dark:text-slate-400 text-sm font-normal leading-normal">Você mencionou "guarda" em 80% dos seus registros esta semana.</p>
                        </div>
                        <div
                            className="w-24 bg-center bg-no-repeat bg-cover rounded-lg flex-1 shadow-sm opacity-90"
                            data-alt="Abstract training chart graphic"
                            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAdR0f_RMtnZura9AuM7W3CA_nnKEmrZkdSea9fakt6HXmlfarCrfCTEBBy7g2-l3qca-527Sm03fSXOyLPyD3hpk5KzILuVWOqib0cOt5W4JdspvJDpwdPbj_1_FRkZXpveVEoRDhUaE9vbr1WPZSASmvf195T2gFQ7STplecGnu1MuYTsy2ANvLxh3Zre8eP2JGBlSJ0jDK3o1ye2OAy6dCnH6nf7CcvQet_-D4DNE_byy4-ibqi_bekipiXZvT2fniPEmlmBAKTG")' }}
                        >
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
