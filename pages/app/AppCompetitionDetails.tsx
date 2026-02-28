import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrainingWizard } from '../../components/app/AppLayout';

export default function AppCompetitionDetails() {
    const navigate = useNavigate();
    const { training, updateTraining } = useTrainingWizard();

    const [compName, setCompName] = useState(training.competition_name || '');
    const [compWeight, setCompWeight] = useState(training.competition_weight || '');
    const [compResult, setCompResult] = useState(training.competition_result || '');
    const [matches, setMatches] = useState<number>(training.competition_matches || 1);
    const [wins, setWins] = useState<number>(training.competition_wins || 0);

    const handleNext = () => {
        updateTraining({
            competition_name: compName,
            competition_weight: compWeight,
            competition_result: compResult,
            competition_matches: matches,
            competition_wins: wins,
            competition_losses: matches - wins,
        });
        navigate('/app/competition-reflection');
    };

    return (
        <div className="bg-app-bg-light dark:bg-app-bg-dark font-app-display antialiased text-slate-900 dark:text-slate-100 min-h-screen flex flex-col overflow-x-hidden">
            {/* Header */}
            <div className="flex items-center p-4 justify-between bg-white dark:bg-slate-900 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
                <button onClick={() => navigate(-1)} className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-lg font-bold flex-1 text-center pr-12">Dados do Campeonato</h2>
            </div>

            <main className="flex-1 px-4 py-8 max-w-md mx-auto w-full flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold mb-2">Detalhes da Competição</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Preencha as informações básicas do evento que você participou.</p>
                </div>

                <div className="flex flex-col gap-4">
                    {/* Event Name */}
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-sm">Nome do Campeonato</label>
                        <input
                            type="text"
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-slate-900 dark:text-white placeholder:text-slate-400"
                            placeholder="Ex: Paulista Fase Regional"
                            value={compName}
                            onChange={(e) => setCompName(e.target.value)}
                        />
                    </div>

                    {/* Weight Class */}
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-sm">Categoria de Peso / Idade</label>
                        <input
                            type="text"
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-slate-900 dark:text-white placeholder:text-slate-400"
                            placeholder="Ex: Sub-18 Meio-Leve (-66kg)"
                            value={compWeight}
                            onChange={(e) => setCompWeight(e.target.value)}
                        />
                    </div>

                    {/* Result Options */}
                    <div className="flex flex-col gap-2 pt-2">
                        <label className="font-bold text-sm mb-1">Qual foi o seu resultado? <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-2 gap-3">
                            {['Ouro', 'Prata', 'Bronze', 'Sem Medalha'].map(res => (
                                <button
                                    key={res}
                                    onClick={() => setCompResult(res)}
                                    className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all text-center
                                    ${compResult === res
                                            ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-300'}`}
                                >
                                    {res === 'Ouro' && '🥇 '}
                                    {res === 'Prata' && '🥈 '}
                                    {res === 'Bronze' && '🥉 '}
                                    {res}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Matches Counter */}
                    <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex-1 flex flex-col gap-2 items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Lutas</span>
                            <div className="flex items-center gap-3 mt-1">
                                <button onClick={() => setMatches(Math.max(1, matches - 1))} className="size-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600">-</button>
                                <span className="text-2xl font-black w-6 text-center">{matches}</span>
                                <button onClick={() => setMatches(matches + 1)} className="size-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600">+</button>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col gap-2 items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Vitórias</span>
                            <div className="flex items-center gap-3 mt-1">
                                <button onClick={() => setWins(Math.max(0, wins - 1))} className="size-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center font-bold text-emerald-600 border border-emerald-100 dark:border-emerald-800/50">-</button>
                                <span className="text-2xl font-black w-6 text-center text-emerald-600 dark:text-emerald-400">{wins}</span>
                                <button onClick={() => setWins(Math.min(matches, wins + 1))} className="size-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center font-bold text-emerald-600 border border-emerald-100 dark:border-emerald-800/50">+</button>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            <div className="p-4 mt-auto">
                <button
                    onClick={handleNext}
                    disabled={!compResult}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-full shadow-lg transition-all flex items-center justify-center gap-2"
                >
                    Avançar
                    <span className="material-symbols-outlined">arrow_forward</span>
                </button>
            </div>
        </div>
    );
}
