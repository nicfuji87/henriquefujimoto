import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrainingWizard } from '../../components/app/AppLayout';
import { appApi } from '../../lib/api-app';

export default function AppDailyEvolution() {
    const navigate = useNavigate();
    const { training, updateTraining } = useTrainingWizard();

    const [learnedToday, setLearnedToday] = useState(training.learned_today || '');
    const [needsImprovement, setNeedsImprovement] = useState(training.needs_improvement || '');
    const [senseiFeedback, setSenseiFeedback] = useState(training.sensei_feedback || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleFinish = async () => {
        setIsSaving(true);
        const finalData = {
            ...training,
            learned_today: learnedToday,
            needs_improvement: needsImprovement,
            sensei_feedback: senseiFeedback
        };

        try {
            await appApi.saveTraining(finalData);
            // Clear context state or redirect (with our simple approach it will reset next time New Training is clicked because of layout recreation or AppNewTraining resetting state if we had a reset).
            navigate('/app/history', { replace: true });
        } catch (error) {
            console.error('Error saving training:', error);
            // In a real app we would show a toast here
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-app-bg-light dark:bg-app-bg-dark font-app-display text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden min-h-screen flex flex-col">
            <div className="relative flex h-full w-full flex-col max-w-md mx-auto bg-app-bg-light dark:bg-app-bg-dark overflow-x-hidden flex-1">
                {/* Header */}
                <div className="flex items-center bg-app-bg-light/95 dark:bg-app-bg-dark/95 p-4 pb-2 justify-between sticky top-0 z-10 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
                    <button onClick={() => navigate(-1)} className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                    </button>
                    <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Evolução Diária</h2>
                </div>

                {/* Content Scrollable Area */}
                <div className="flex-1 overflow-y-auto pb-24">
                    {/* Hero/Intro */}
                    <div className="px-4 pt-4 pb-2">
                        <h2 className="text-slate-900 dark:text-slate-100 tracking-tight text-[28px] font-bold leading-tight text-left">Resumo do Treino</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal pt-2">Reflita sobre seu desempenho no {training.modality || 'tatame'} hoje. A constância é a chave.</p>
                    </div>

                    {/* Form */}
                    <div className="flex flex-col gap-6 px-4 py-4">
                        {/* Question 1 */}
                        <label className="flex flex-col w-full">
                            <div className="flex items-center gap-2 pb-2">
                                <span className="material-symbols-outlined text-app-primary text-[20px]">lightbulb</span>
                                <p className="text-slate-900 dark:text-slate-100 text-base font-medium leading-normal">O que você aprendeu hoje? <span className="text-app-primary">*</span></p>
                            </div>
                            <textarea
                                value={learnedToday}
                                onChange={(e) => setLearnedToday(e.target.value)}
                                className="form-textarea flex w-full min-w-0 resize-none overflow-hidden rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-app-primary border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-app-primary min-h-[120px] p-4 text-base font-normal leading-normal shadow-sm"
                                placeholder="Ex: Nova técnica de queda, controle emocional ao perder uma luta..."
                            ></textarea>
                        </label>

                        {/* Question 2 */}
                        <label className="flex flex-col w-full">
                            <div className="flex items-center gap-2 pb-2">
                                <span className="material-symbols-outlined text-app-primary text-[20px]">trending_up</span>
                                <p className="text-slate-900 dark:text-slate-100 text-base font-medium leading-normal">O que precisa melhorar? <span className="text-app-primary">*</span></p>
                            </div>
                            <textarea
                                value={needsImprovement}
                                onChange={(e) => setNeedsImprovement(e.target.value)}
                                className="form-textarea flex w-full min-w-0 resize-none overflow-hidden rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-app-primary border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-app-primary min-h-[120px] p-4 text-base font-normal leading-normal shadow-sm"
                                placeholder="Ex: Preciso melhorar meu cardio, a pegada no kimono estava fraca..."
                            ></textarea>
                        </label>

                        {/* Question 3 (Optional) */}
                        <label className="flex flex-col w-full">
                            <div className="flex items-center gap-2 pb-2">
                                <span className="material-symbols-outlined text-app-primary text-[20px]">record_voice_over</span>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-slate-900 dark:text-slate-100 text-base font-medium leading-normal">Feedback do Sensei</p>
                                    <span className="text-slate-400 text-xs font-normal">(Opcional)</span>
                                </div>
                            </div>
                            <textarea
                                value={senseiFeedback}
                                onChange={(e) => setSenseiFeedback(e.target.value)}
                                className="form-textarea flex w-full min-w-0 resize-none overflow-hidden rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-app-primary border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-app-primary min-h-[100px] p-4 text-base font-normal leading-normal shadow-sm"
                                placeholder="Alguma observação específica que o professor fez?"
                            ></textarea>
                        </label>
                    </div>

                    {/* Finish Button */}
                    <div className="px-4 py-6">
                        <button
                            disabled={isSaving || learnedToday.length < 5 || needsImprovement.length < 5}
                            onClick={handleFinish}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-app-primary hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold h-14 shadow-lg shadow-app-primary/20 transition-all transform active:scale-[0.98]"
                        >
                            {isSaving ? (
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                            ) : (
                                <span className="material-symbols-outlined text-[24px]">check_circle</span>
                            )}
                            <span>{isSaving ? 'Salvando...' : 'Finalizar treino'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
