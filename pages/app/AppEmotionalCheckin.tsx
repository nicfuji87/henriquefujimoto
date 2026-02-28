import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrainingWizard } from '../../components/app/AppLayout';

export default function AppEmotionalCheckin() {
    const navigate = useNavigate();
    const { training, updateTraining } = useTrainingWizard();

    const [selectedEmotions, setSelectedEmotions] = useState<string[]>(training.emotions || []);
    const [intensity, setIntensity] = useState(training.emotion_intensity || 8);
    const [context, setContext] = useState(training.emotion_context || '');

    const emotionOptions = [
        { id: 'Feliz', emoji: '😁', colorClass: 'bg-yellow-50 dark:bg-yellow-900/30' },
        { id: 'Normal', emoji: '🙂', colorClass: 'bg-slate-100 dark:bg-slate-800' },
        { id: 'Confiante', emoji: '🦁', colorClass: 'bg-blue-100 dark:bg-blue-900/30' },
        { id: 'Ansioso', emoji: '😰', colorClass: 'bg-yellow-100 dark:bg-yellow-900/30' },
        { id: 'Irritado', emoji: '😤', colorClass: 'bg-red-100 dark:bg-red-900/30' },
        { id: 'Calmo', emoji: '😌', colorClass: 'bg-green-100 dark:bg-green-900/30' },
        { id: 'Determinado', emoji: '🥋', colorClass: 'bg-white dark:bg-white/10' },
        { id: 'Frustrado', emoji: '😣', colorClass: 'bg-orange-100 dark:bg-orange-900/30' },
        { id: 'Solto', emoji: '🤸', colorClass: 'bg-purple-100 dark:bg-purple-900/30' },
        { id: 'Confuso', emoji: '😵‍💫', colorClass: 'bg-gray-200 dark:bg-gray-700' },
        { id: 'Orgulhoso', emoji: '💪', colorClass: 'bg-indigo-100 dark:bg-indigo-900/30' },
        { id: 'Triste', emoji: '😢', colorClass: 'bg-blue-50 dark:bg-blue-900/20' },
        { id: 'Motivado', emoji: '🙌', colorClass: 'bg-amber-100 dark:bg-amber-900/30' },
        { id: 'Tenso', emoji: '😬', colorClass: 'bg-rose-100 dark:bg-rose-900/30' },
        { id: 'Aliviado', emoji: '😮‍💨', colorClass: 'bg-teal-100 dark:bg-teal-900/30' },
        { id: 'Envergonhado', emoji: '😳', colorClass: 'bg-pink-100 dark:bg-pink-900/30' },
    ];

    const toggleEmotion = (id: string) => {
        if (selectedEmotions.includes(id)) {
            setSelectedEmotions(selectedEmotions.filter(e => e !== id));
        } else if (selectedEmotions.length < 3) {
            setSelectedEmotions([...selectedEmotions, id]);
        }
    };

    const handleNext = () => {
        updateTraining({
            emotions: selectedEmotions,
            emotion_intensity: intensity,
            emotion_context: context
        });
        navigate('/app/daily-evolution');
    };

    const getIntensityConfig = (v: number) => {
        if (v <= 3) return { text: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', hex: '#22c55e', label: 'Leve' };
        if (v <= 6) return { text: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', hex: '#eab308', label: 'Moderada' };
        if (v <= 8) return { text: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30', hex: '#f97316', label: 'Alta' };
        return { text: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', hex: '#ef4444', label: 'Extrema' };
    };

    const intensityConfig = getIntensityConfig(intensity);

    return (
        <div className="bg-app-bg-light dark:bg-app-bg-dark text-slate-900 dark:text-slate-100 font-app-display min-h-screen flex flex-col items-center justify-center">
            <style>{`
                .colored-slider {
                    -webkit-appearance: none;
                    width: 100%;
                    background: transparent;
                }
                .colored-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 24px;
                    width: 24px;
                    border-radius: 50%;
                    background: var(--slider-color, #1152d4);
                    cursor: pointer;
                    margin-top: -10px;
                    box-shadow: 0 0 0 4px var(--slider-color);
                    opacity: 0.9;
                    transition: transform 0.1s ease-in-out, background 0.2s;
                }
                .colored-slider::-webkit-slider-thumb:active {
                    transform: scale(1.1);
                }
                .colored-slider::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 6px;
                    cursor: pointer;
                    background: var(--slider-track, #e2e8f0);
                    border-radius: 3px;
                }
                .dark .colored-slider::-webkit-slider-runnable-track {
                    background: var(--slider-track, #334155);
                }
            `}</style>
            {/* Mobile Container */}
            <div className="relative flex h-full min-h-screen w-full max-w-md flex-col bg-white dark:bg-slate-900 overflow-x-hidden shadow-2xl mx-auto">

                {/* Header */}
                <div className="flex items-center bg-white dark:bg-slate-900 p-4 sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800">
                    <button onClick={() => navigate(-1)} className="text-slate-900 dark:text-slate-100 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                    </button>
                    <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">Check-in Emocional</h2>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto pb-24">
                    <div className="px-6 pt-6 pb-2">
                        <h1 className="text-slate-900 dark:text-slate-100 tracking-tight text-[28px] font-bold leading-tight text-left">
                            Como estão as emoções hoje, <span className="text-app-primary">Henrique</span>?
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal pt-2">
                            Selecione até 3 emoções que melhor descrevem como você se sente após o treino.
                        </p>
                    </div>

                    {/* Emotions Grid */}
                    <div className="grid grid-cols-3 gap-3 p-6">
                        {emotionOptions.map((emo) => {
                            const isSelected = selectedEmotions.includes(emo.id);
                            return (
                                <button
                                    key={emo.id}
                                    onClick={() => toggleEmotion(emo.id)}
                                    className={`group relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all shadow-sm
                                        ${isSelected
                                            ? 'border-app-primary bg-app-primary/10'
                                            : 'border-transparent bg-gray-50 dark:bg-gray-800 hover:border-app-primary/50'}`}
                                >
                                    <div className={`size-12 rounded-full flex items-center justify-center text-2xl shadow-sm ${emo.colorClass} ${isSelected && emo.id === 'Determinado' ? 'border border-app-primary/20' : ''}`}>
                                        {emo.emoji}
                                    </div>
                                    <span className={`${isSelected ? 'text-app-primary dark:text-app-primary-light font-bold' : 'text-slate-900 dark:text-slate-100 font-semibold'} text-[11px] leading-tight text-center`}>
                                        {emo.id}
                                    </span>
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 text-app-primary">
                                            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="px-6 space-y-8">
                        {/* Intensity Slider */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-slate-900 dark:text-slate-100 font-bold text-base">Intensidade das Emoções</label>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold ${intensityConfig.text}`}>{intensityConfig.label}</span>
                                    <span className={`font-bold text-base ${intensityConfig.bg} ${intensityConfig.text} px-2 py-1 rounded-md`}>{intensity}/10</span>
                                </div>
                            </div>
                            <div className="relative w-full h-12 flex items-center" style={{ '--slider-color': intensityConfig.hex } as React.CSSProperties}>
                                <input
                                    value={intensity}
                                    onChange={(e) => setIntensity(Number(e.target.value))}
                                    className="colored-slider"
                                    max="10"
                                    min="1"
                                    type="range"
                                />
                                <div className="absolute flex justify-between w-full px-1 top-8">
                                    <span className="text-[10px] text-gray-400 font-medium">Baixa</span>
                                    <span className="text-[10px] text-gray-400 font-medium">Extrema</span>
                                </div>
                            </div>
                        </div>

                        {/* Text Input */}
                        <div className="space-y-3">
                            <label className="text-slate-900 dark:text-slate-100 font-bold text-base flex gap-1" htmlFor="context">
                                Reflexão rápida <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <textarea
                                    value={context}
                                    onChange={(e) => setContext(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-0 rounded-xl p-4 text-slate-900 dark:text-slate-100 placeholder:text-gray-400 focus:ring-2 focus:ring-app-primary resize-none text-sm leading-relaxed"
                                    id="context"
                                    placeholder="Quando essa emoção apareceu e por quê? Ex: Durante o randori, me senti travado..."
                                    rows={4}
                                ></textarea>
                                <div className="absolute bottom-3 right-3">
                                    <span className="material-symbols-outlined text-gray-400 text-lg">edit_note</span>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button onClick={handleNext} disabled={selectedEmotions.length === 0 || context.length < 5} className="w-full disabled:opacity-50 disabled:cursor-not-allowed bg-app-primary hover:bg-app-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-app-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-4">
                            <span>Próximo Passo</span>
                            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
