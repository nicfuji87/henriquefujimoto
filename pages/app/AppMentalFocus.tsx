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

    return (
        <div className="bg-app-bg-light dark:bg-app-bg-dark font-app-display text-slate-900 dark:text-slate-100 antialiased min-h-screen flex flex-col overflow-x-hidden">
            <style>{`
        /* Custom range slider styling for better cross-browser consistency */
        input[type=range] {
            -webkit-appearance: none;
            width: 100%;
            background: transparent;
        }
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background: #1152d4;
            cursor: pointer;
            margin-top: -10px;
            box-shadow: 0 0 0 4px rgba(17, 82, 212, 0.2);
        }
        input[type=range]::-webkit-slider-runnable-track {
            width: 100%;
            height: 4px;
            cursor: pointer;
            background: #e2e8f0;
            border-radius: 2px;
        }
        .dark input[type=range]::-webkit-slider-runnable-track {
            background: #334155;
        }
        
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
      `}</style>

            {/* Header */}
            <div className="flex items-center justify-between p-4 sticky top-0 z-10 bg-app-bg-light/95 dark:bg-app-bg-dark/95 backdrop-blur-sm">
                <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">arrow_back</span>
                </button>
                <h2 className="text-lg font-bold flex-1 text-center pr-10">Foco Mental</h2>
            </div>

            {/* Main Content */}
            <main className="flex-1 px-4 pb-24 max-w-lg mx-auto w-full">
                {/* Intro Text */}
                <div className="mb-8 mt-2">
                    <h1 className="text-2xl font-bold leading-tight mb-2">Qual foi o seu nível de foco hoje?</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Avalie o quanto você conseguiu se concentrar nas técnicas.</p>
                </div>

                {/* Slider Section */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm mb-8 border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Nível de Foco</span>
                        <span className="text-3xl font-bold text-app-primary dark:text-blue-400">{focusLevel}<span className="text-lg text-slate-400 font-normal">/10</span></span>
                    </div>
                    <div className="relative w-full h-8 flex items-center">
                        <input value={focusLevel} onChange={(e) => setFocusLevel(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-app-primary focus:outline-none focus:ring-2 focus:ring-app-primary/50" max="10" min="0" type="range" />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
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
