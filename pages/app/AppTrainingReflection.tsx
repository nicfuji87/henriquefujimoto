import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrainingWizard } from '../../components/app/AppLayout';

export default function AppTrainingReflection() {
    const navigate = useNavigate();
    const { training, updateTraining } = useTrainingWizard();

    const [rating, setRating] = useState(training.rating || 8);
    const [reflection, setReflection] = useState(training.reflection || '');

    const handleNext = () => {
        updateTraining({ rating, reflection });
        navigate('/app/physical-evaluation');
    };

    const getEmoji = () => {
        if (rating < 4) return 'sentiment_very_dissatisfied';
        if (rating < 7) return 'sentiment_neutral';
        return 'sentiment_very_satisfied';
    };

    const getAppreciation = () => {
        if (rating < 4) return 'Pode melhorar!';
        if (rating < 7) return 'Foi ok!';
        if (rating < 9) return 'Muito bom!';
        return 'Excelente!';
    };

    return (
        <div className="bg-app-bg-light dark:bg-app-bg-dark font-app-display antialiased text-slate-900 dark:text-slate-100 min-h-screen flex flex-col overflow-x-hidden">
            <style>{`
        input[type=range] {
            -webkit-appearance: none; 
            background: transparent; 
        }

        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
        }

        input[type=range]:focus {
            outline: none;
        }
        
        .material-symbols-outlined {
          font-variation-settings:
          'FILL' 0,
          'wght' 400,
          'GRAD' 0,
          'opsz' 24
        }
        
        .active-icon {
            font-variation-settings: 'FILL' 1 !important;
        }
      `}</style>

            {/* Top App Bar */}
            <div className="flex items-center px-4 py-4 justify-between bg-white dark:bg-slate-900 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
                <button onClick={() => navigate(-1)} className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Reflexão do Treino</h2>
            </div>

            {/* Main Content Container */}
            <div className="flex-1 flex flex-col p-4 w-full max-w-md mx-auto">
                {/* Progress Indicator */}
                <div className="flex flex-col gap-3 mb-8">
                    <div className="flex gap-6 justify-between items-end">
                        <p className="text-slate-900 dark:text-white text-base font-medium leading-normal">Passo 1 de 5</p>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">20% completo</span>
                    </div>
                    <div className="rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden h-2">
                        <div className="h-full rounded-full bg-app-primary" style={{ width: '20%' }}></div>
                    </div>
                </div>

                {/* Question Header */}
                <h1 className="text-slate-900 dark:text-white tracking-tight text-2xl md:text-[28px] font-bold leading-tight text-center mb-8">
                    Que nota você dá para o treino de hoje?
                </h1>

                {/* Slider Section */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
                    <div className="flex flex-col items-center gap-6">
                        {/* Dynamic Emoji Display */}
                        <div className="flex flex-col items-center justify-center">
                            <div className="size-20 rounded-full bg-app-primary/10 flex items-center justify-center mb-2 text-app-primary">
                                <span className="material-symbols-outlined text-5xl active-icon">{getEmoji()}</span>
                            </div>
                            <span className="text-3xl font-bold text-app-primary">{rating}</span>
                            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{getAppreciation()}</span>
                        </div>

                        {/* Custom Slider */}
                        <div className="w-full relative h-12 flex items-center">
                            {/* Track */}
                            <div className="absolute w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-app-primary rounded-full" style={{ width: `${(rating / 10) * 100}%` }}></div>
                            </div>
                            {/* Thumb */}
                            <div className="absolute -translate-x-1/2 w-8 h-8 bg-white dark:bg-slate-900 border-4 border-app-primary rounded-full shadow-lg z-10 pointer-events-none transition-all" style={{ left: `${(rating / 10) * 100}%` }}></div>
                            {/* Input Range */}
                            <input
                                className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                                max="10"
                                min="0"
                                step="1"
                                type="range"
                                value={rating}
                                onChange={(e) => setRating(Number(e.target.value))}
                            />
                        </div>

                        {/* Legend */}
                        <div className="flex justify-between w-full px-1">
                            <div className="flex flex-col items-center gap-1">
                                <span className="material-symbols-outlined text-slate-400 text-xl overflow-hidden">sentiment_very_dissatisfied</span>
                                <span className="text-xs font-medium text-slate-400">0</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="material-symbols-outlined text-slate-400 text-xl overflow-hidden">sentiment_neutral</span>
                                <span className="text-xs font-medium text-slate-400">5</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="material-symbols-outlined text-app-primary text-xl active-icon">sentiment_very_satisfied</span>
                                <span className="text-xs font-bold text-app-primary">10</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reflection Text Area */}
                <div className="flex flex-col gap-3 flex-1">
                    <label className="text-slate-900 dark:text-white text-base font-semibold" htmlFor="reflection">
                        Por que você deu essa nota? <span className="text-app-primary">*</span>
                    </label>
                    <div className="relative w-full">
                        <textarea
                            className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-app-primary focus:ring-2 focus:ring-app-primary/20 outline-none resize-none transition-all placeholder:text-slate-400"
                            id="reflection"
                            placeholder="Escreva aqui sobre como você se sentiu, o que aprendeu ou o que foi difícil hoje..."
                            rows={6}
                            value={reflection}
                            onChange={(e) => setReflection(e.target.value)}
                        ></textarea>
                    </div>
                </div>

                {/* Sticky Bottom Action */}
                <div className="mt-8 mb-4 sticky bottom-4 z-20">
                    <button onClick={handleNext} disabled={reflection.length < 5} className="w-full bg-app-primary hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-full shadow-lg shadow-app-primary/30 transition-all flex items-center justify-center gap-2 group">
                        <span>Próximo Passo</span>
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
