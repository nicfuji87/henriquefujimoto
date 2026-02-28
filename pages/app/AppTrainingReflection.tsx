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
        if (rating <= 2) return 'sentiment_very_dissatisfied';
        if (rating <= 4) return 'sentiment_dissatisfied';
        if (rating <= 6) return 'sentiment_neutral';
        if (rating <= 8) return 'sentiment_satisfied';
        return 'sentiment_very_satisfied';
    };

    const getAppreciation = () => {
        if (rating <= 2) return 'Precisa melhorar muito';
        if (rating <= 4) return 'Pode melhorar!';
        if (rating <= 6) return 'Foi ok!';
        if (rating <= 8) return 'Muito bom!';
        return 'Excelente! 🔥';
    };

    const getRatingColor = () => {
        if (rating <= 2) return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-500', thumb: '#ef4444' };
        if (rating <= 4) return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-500', thumb: '#f97316' };
        if (rating <= 6) return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-500', thumb: '#eab308' };
        if (rating <= 8) return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-500', thumb: '#10b981' };
        return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-500', thumb: '#22c55e' };
    };

    const colors = getRatingColor();

    return (
        <div className="bg-app-bg-light dark:bg-app-bg-dark font-app-display antialiased text-slate-900 dark:text-slate-100 min-h-screen flex flex-col overflow-x-hidden">
            <style>{`
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

        .rating-slider {
            -webkit-appearance: none;
            width: 100%;
            background: transparent;
        }
        .rating-slider::-webkit-slider-thumb {
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
        .rating-slider::-webkit-slider-thumb:active {
            transform: scale(1.15);
        }
        .rating-slider::-webkit-slider-runnable-track {
            width: 100%;
            height: 6px;
            cursor: pointer;
            background: linear-gradient(to right, #ef4444, #f97316, #eab308, #10b981, #22c55e);
            border-radius: 3px;
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
                            <div className={`size-20 rounded-full ${colors.bg} flex items-center justify-center mb-2 ${colors.text} transition-colors duration-300`}>
                                <span className="material-symbols-outlined text-5xl active-icon">{getEmoji()}</span>
                            </div>
                            <span className={`text-3xl font-bold ${colors.text} transition-colors duration-300`}>{rating}</span>
                            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{getAppreciation()}</span>
                        </div>

                        <div className="w-full relative py-4 flex items-center">
                            <input
                                className="rating-slider"
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
                                <span className="material-symbols-outlined text-red-400 text-xl overflow-hidden">sentiment_very_dissatisfied</span>
                                <span className="text-xs font-medium text-slate-400">0</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="material-symbols-outlined text-yellow-400 text-xl overflow-hidden">sentiment_neutral</span>
                                <span className="text-xs font-medium text-slate-400">5</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="material-symbols-outlined text-green-500 text-xl active-icon">sentiment_very_satisfied</span>
                                <span className="text-xs font-bold text-green-500">10</span>
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
