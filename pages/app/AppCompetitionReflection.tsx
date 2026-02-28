import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrainingWizard } from '../../components/app/AppLayout';
import { appApi } from '../../lib/api-app';

export default function AppCompetitionReflection() {
    const navigate = useNavigate();
    const { training, updateTraining } = useTrainingWizard();

    const [rating, setRating] = useState(training.rating || 5);
    const [reflection, setReflection] = useState(training.reflection || '');
    const [learnedToday, setLearnedToday] = useState(training.learned_today || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleFinish = async () => {
        setIsSaving(true);
        const finalData = {
            ...training,
            rating,
            reflection,
            learned_today: learnedToday,
            is_competition: true
        };

        try {
            await appApi.saveTraining(finalData);
            navigate('/app/history', { replace: true });
        } catch (error) {
            console.error('Error saving competition:', error);
            alert('Erro ao salvar campeonato.');
        } finally {
            setIsSaving(false);
        }
    };

    const getRatingColor = () => {
        if (rating <= 2) return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-500', thumb: '#ef4444', label: 'Precisa melhorar muito' };
        if (rating <= 4) return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-500', thumb: '#f97316', label: 'Pode melhorar!' };
        if (rating <= 6) return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-500', thumb: '#eab308', label: 'Foi ok!' };
        if (rating <= 8) return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-500', thumb: '#10b981', label: 'Muito bom!' };
        return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-500', thumb: '#22c55e', label: 'Excelente! 🔥' };
    };

    const colors = getRatingColor();

    return (
        <div className="bg-app-bg-light dark:bg-app-bg-dark font-app-display antialiased text-slate-900 dark:text-slate-100 min-h-screen flex flex-col overflow-x-hidden">
            <style>{`
                .comp-slider {
                    -webkit-appearance: none;
                    width: 100%;
                    background: transparent;
                }
                .comp-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 28px;
                    width: 28px;
                    border-radius: 50%;
                    background: ${colors.thumb};
                    cursor: pointer;
                    margin-top: -12px;
                    box-shadow: 0 0 0 4px ${colors.thumb}33;
                    transition: background 0.3s, box-shadow 0.3s;
                }
                .comp-slider::-webkit-slider-thumb:active {
                    transform: scale(1.15);
                }
                .comp-slider::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 6px;
                    cursor: pointer;
                    background: linear-gradient(to right, #ef4444, #f97316, #eab308, #10b981, #22c55e);
                    border-radius: 3px;
                }
            `}</style>
            {/* Header */}
            <div className="flex items-center p-4 justify-between bg-white dark:bg-slate-900 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
                <button onClick={() => navigate(-1)} className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-lg font-bold flex-1 text-center pr-12">Avaliação do Campeonato</h2>
            </div>

            <main className="flex-1 px-4 py-8 max-w-md mx-auto w-full flex flex-col gap-6 overflow-y-auto pb-24">
                <div>
                    <h1 className="text-2xl font-bold mb-2">Desempenho Pessoal</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Pense mais no que você demonstrou do que apenas no resultado na chave.</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex flex-col items-center gap-4">
                        <label className="font-bold text-base text-center w-full">Que nota você dá pra sua atuação hoje?</label>
                        <div className="flex flex-col items-center gap-2">
                            <span className={`text-4xl font-bold transition-colors ${colors.text} ${colors.bg} px-4 py-2 rounded-xl`}>
                                {rating}
                            </span>
                            <span className={`text-sm font-bold ${colors.text}`}>
                                {colors.label}
                            </span>
                        </div>
                        <div className="w-full relative py-2">
                            <input
                                className="comp-slider"
                                type="range"
                                min="0"
                                max="10"
                                value={rating}
                                onChange={(e) => setRating(Number(e.target.value))}
                            />
                        </div>
                        <div className="flex justify-between w-full text-xs font-medium text-slate-500 px-1 mt-2">
                            <div className="flex flex-col items-center gap-1">
                                <span className="material-symbols-outlined text-red-400 text-xl overflow-hidden">sentiment_very_dissatisfied</span>
                                <span className="text-xs font-medium text-slate-400">0</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="material-symbols-outlined text-yellow-500 text-xl overflow-hidden">sentiment_neutral</span>
                                <span className="text-xs font-medium text-slate-400">5</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="material-symbols-outlined text-green-500 text-xl">sentiment_very_satisfied</span>
                                <span className="text-xs font-bold text-green-500">10</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <label className="font-bold text-base flex gap-2 items-center">
                        <span className="material-symbols-outlined text-amber-500">psychology</span>
                        Como você se sentiu lutando?
                    </label>
                    <textarea
                        className="w-full h-32 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-amber-500 resize-none placeholder:text-slate-400 shadow-sm"
                        placeholder="Ex: Fiquei ansioso na primeira luta, mas depois me soltei. A pegada do adversário tava muito forte..."
                        value={reflection}
                        onChange={(e) => setReflection(e.target.value)}
                    ></textarea>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                    <label className="font-bold text-base flex gap-2 items-center">
                        <span className="material-symbols-outlined text-amber-500">trending_up</span>
                        O que você aprendeu com essa competição?
                    </label>
                    <textarea
                        className="w-full h-32 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-amber-500 resize-none placeholder:text-slate-400 shadow-sm"
                        placeholder="Ex: Preciso melhorar minha defesa de golpes específicos e o meu cardio final..."
                        value={learnedToday}
                        onChange={(e) => setLearnedToday(e.target.value)}
                    ></textarea>
                </div>
            </main>

            <div className="p-4 fixed bottom-0 w-full bg-app-bg-light/90 dark:bg-app-bg-dark/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
                <button
                    onClick={handleFinish}
                    disabled={isSaving || reflection.length < 5 || learnedToday.length < 5}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-full shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2"
                >
                    {isSaving ? (
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                        <span className="material-symbols-outlined text-[24px]">done_all</span>
                    )}
                    {isSaving ? 'Registrando...' : 'Finalizar Registro'}
                </button>
            </div>
        </div>
    );
}
