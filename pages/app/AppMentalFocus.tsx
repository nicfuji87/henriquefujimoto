import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrainingWizard } from '../../components/app/AppLayout';

export default function AppMentalFocus() {
    const navigate = useNavigate();
    const { training, updateTraining } = useTrainingWizard();

    const [focusLevel, setFocusLevel] = useState(training.focus_level || 8);
    const [distractions, setDistractions] = useState<string[]>(training.distractions || []);
    const [mentalReflection, setMentalReflection] = useState(training.mental_reflection || '');

    const distractionOptions = [
        { id: 'Sono', icon: 'bedtime' },
        { id: 'Escola', icon: 'school' },
        { id: 'Pressão', icon: 'compress' },
        { id: 'Dor', icon: 'healing' },
        { id: 'Celular', icon: 'smartphone' },
        { id: 'Raiva', icon: 'mood_bad' },
        { id: 'Medo de errar', icon: 'error_outline', colSpan: 2 }
    ];

    const toggleDistraction = (id: string) => {
        setDistractions(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    const handleNext = () => {
        updateTraining({
            focus_level: focusLevel,
            distractions,
            mental_reflection: mentalReflection
        });
        navigate('/app/emotional-checkin');
    };

    const getFocusConfig = (v: number) => {
        if (v <= 2) return { text: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', hex: '#ef4444', label: 'Muito Disperso' };
        if (v <= 4) return { text: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30', hex: '#f97316', label: 'Disperso' };
        if (v <= 6) return { text: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', hex: '#eab308', label: 'Razoável' };
        if (v <= 8) return { text: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', hex: '#10b981', label: 'Focado' };
        return { text: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', hex: '#22c55e', label: 'Hiperfoco' };
    };

    const focusConfig = getFocusConfig(focusLevel);

    return (
        <div className="bg-app-bg-light dark:bg-app-bg-dark font-app-display text-slate-900 dark:text-slate-100 antialiased min-h-screen flex flex-col overflow-x-hidden">
            <style>{`
        /* Checkbox hidden */
        .chip-checkbox:checked + label {
            background-color: #eff6ff;
            border-color: #1152d4;
            color: #1152d4;
        }
        .dark .chip-checkbox:checked + label {
            background-color: rgba(17, 82, 212, 0.2);
            border-color: #1152d4;
            color: #60a5fa;
        }
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

            {/* Header */}
            <div className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-white/90 dark:bg-app-bg-dark/90 backdrop-blur-sm z-10 border-b border-slate-200 dark:border-slate-800 md:hidden">
                <button onClick={() => navigate(-1)} className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-lg font-bold flex-1 text-center pr-12">Foco Mental</h2>
            </div>
            {/* Desktop header version */}
            <div className="hidden md:flex items-center p-4 pb-2 justify-between sticky top-0 bg-white/90 dark:bg-app-bg-dark/90 backdrop-blur-sm z-10 border-b border-slate-200 dark:border-slate-800">
                <button onClick={() => navigate(-1)} className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-lg font-bold flex-1 text-center pr-12">Foco Mental</h2>
            </div>


            {/* Main Content */}
            <main className="flex-1 px-4 pb-24 max-w-lg mx-auto w-full pt-4">
                {/* Intro Text */}
                <div className="mb-8 mt-2">
                    <h1 className="text-2xl font-bold leading-tight mb-2">Qual foi o seu nível de foco hoje?</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Avalie o quanto você conseguiu se concentrar nas técnicas.</p>
                </div>

                {/* Slider Section */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm mb-8 border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-end mb-6">
                        <label className="text-slate-900 dark:text-white text-base font-semibold">Foco</label>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${focusConfig.text}`}>{focusConfig.label}</span>
                            <span className={`font-bold text-lg ${focusConfig.bg} ${focusConfig.text} px-3 py-1 rounded-lg`}>{focusLevel}</span>
                        </div>
                    </div>
                    <div className="relative w-full h-12 flex items-center" style={{ '--slider-color': focusConfig.hex } as React.CSSProperties}>
                        <input value={focusLevel} onChange={(e) => setFocusLevel(Number(e.target.value))} className="colored-slider" max="10" min="0" type="range" />
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 font-medium px-1">
                        <span>Disperso</span>
                        <span>Focado</span>
                    </div>
                </div>

                {/* Distractions Section */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-app-primary dark:text-blue-400">psychology</span>
                        Distrações
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Selecione o que atrapalhou seu foco:</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {distractionOptions.map((opt) => (
                            <div key={opt.id} className={`relative ${opt.colSpan ? 'col-span-2 sm:col-span-3' : ''}`}>
                                <input
                                    className="chip-checkbox peer sr-only"
                                    id={`dist-${opt.id}`}
                                    type="checkbox"
                                    checked={distractions.includes(opt.id)}
                                    onChange={() => toggleDistraction(opt.id)}
                                />
                                <label className={`flex ${opt.colSpan ? 'flex-row' : 'flex-col'} items-center justify-center ${opt.colSpan ? 'gap-3 p-3 h-16' : 'gap-2 p-3 h-24'} rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer transition-all hover:border-app-primary/50 dark:hover:border-blue-500/50 shadow-sm`} htmlFor={`dist-${opt.id}`}>
                                    <span className="material-symbols-outlined text-2xl">{opt.icon}</span>
                                    <span className="text-sm font-medium">{opt.id}</span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reflection Text Area */}
                <div className="mb-8">
                    <label className="block text-lg font-bold mb-2 text-slate-900 dark:text-slate-100" htmlFor="reflection">
                        O que passou na sua cabeça? <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Descreva um pensamento ou sentimento forte durante o treino.</p>
                    <textarea
                        value={mentalReflection}
                        onChange={(e) => setMentalReflection(e.target.value)}
                        className="w-full rounded-xl border-slate-200 bg-white p-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-app-primary focus:ring-app-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                        id="reflection"
                        placeholder="Ex: Fiquei pensando na prova de matemática amanhã..."
                        rows={4}
                    ></textarea>
                </div>

                {/* Submit Button */}
                <button onClick={handleNext} disabled={mentalReflection.length < 5} className="w-full disabled:opacity-50 disabled:cursor-not-allowed rounded-full bg-app-primary py-4 mt-6 text-center text-base font-bold text-white shadow-lg shadow-app-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
                    Próximo Passo
                    <span className="material-symbols-outlined">arrow_forward</span>
                </button>
            </main>
        </div>
    );
}
