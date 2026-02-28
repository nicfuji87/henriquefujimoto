import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrainingWizard } from '../../components/app/AppLayout';

export default function AppPhysicalEvaluation() {
    const navigate = useNavigate();
    const { training, updateTraining } = useTrainingWizard();

    const [fatigueLevel, setFatigueLevel] = useState(training.fatigue_level || 3);
    const [energyLevel, setEnergyLevel] = useState(training.energy_level || 8);
    const [painLevel, setPainLevel] = useState(training.pain_level || 1);
    const [painAreas, setPainAreas] = useState<string[]>(training.pain_areas || []);

    const togglePainArea = (area: string) => {
        setPainAreas(prev =>
            prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
        );
    };

    const handleNext = () => {
        updateTraining({
            fatigue_level: fatigueLevel,
            energy_level: energyLevel,
            pain_level: painLevel,
            pain_areas: painAreas
        });
        navigate('/app/mental-focus');
    };

    // Quick Select Buttons
    const commonAreas = ['Pescoço', 'Ombro', 'Costas', 'Lombar', 'Joelho', 'Tornozelo'];

    return (
        <div className="bg-app-bg-light dark:bg-app-bg-dark font-app-display text-slate-900 dark:text-slate-100 min-h-screen flex justify-center items-start pt-4 pb-8">
            <div className="w-full max-w-md bg-white dark:bg-[#1e2736] min-h-[95vh] rounded-[2rem] shadow-2xl overflow-hidden relative flex flex-col">
                {/* Top App Bar */}
                <div className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-white/90 dark:bg-[#1e2736]/90 backdrop-blur-sm z-10">
                    <button onClick={() => navigate(-1)} className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight flex-1 text-center">Avaliação Física</h2>
                    <div className="flex w-12 items-center justify-end">
                        <button className="text-app-primary dark:text-app-primary-light text-base font-bold shrink-0">Ajuda</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pb-24">
                    {/* Header Text */}
                    <div className="px-6 py-4">
                        <h3 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight mb-2">Como você está se sentindo hoje?</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-relaxed">Avalie seus níveis de energia e corpo após o treino.</p>
                    </div>

                    {/* Sliders Section */}
                    <div className="flex flex-col gap-6 px-6">
                        {/* Cansaço Slider */}
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-end">
                                <label className="text-slate-900 dark:text-white text-base font-semibold">Cansaço</label>
                                <span className="text-app-primary font-bold text-lg bg-app-primary/10 px-3 py-1 rounded-lg">{fatigueLevel}</span>
                            </div>
                            <div className="relative w-full h-8 flex items-center">
                                <input value={fatigueLevel} onChange={(e) => setFatigueLevel(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-app-primary" max="10" min="0" type="range" />
                            </div>
                            <div className="flex justify-between text-xs text-slate-400 font-medium px-1">
                                <span>Descansado</span>
                                <span>Exausto</span>
                            </div>
                        </div>

                        {/* Energia Slider */}
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-end">
                                <label className="text-slate-900 dark:text-white text-base font-semibold">Energia</label>
                                <span className="text-app-primary font-bold text-lg bg-app-primary/10 px-3 py-1 rounded-lg">{energyLevel}</span>
                            </div>
                            <div className="relative w-full h-8 flex items-center">
                                <input value={energyLevel} onChange={(e) => setEnergyLevel(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-app-primary" max="10" min="0" type="range" />
                            </div>
                            <div className="flex justify-between text-xs text-slate-400 font-medium px-1">
                                <span>Baixa</span>
                                <span>Máxima</span>
                            </div>
                        </div>

                        {/* Dor Slider */}
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-end">
                                <label className="text-slate-900 dark:text-white text-base font-semibold">Dor</label>
                                <span className="text-app-primary font-bold text-lg bg-app-primary/10 px-3 py-1 rounded-lg">{painLevel}</span>
                            </div>
                            <div className="relative w-full h-8 flex items-center">
                                <input value={painLevel} onChange={(e) => setPainLevel(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-app-primary" max="10" min="0" type="range" />
                            </div>
                            <div className="flex justify-between text-xs text-slate-400 font-medium px-1">
                                <span>Sem dor</span>
                                <span>Muita dor</span>
                            </div>
                        </div>
                    </div>

                    {/* Body Map Section */}
                    {painLevel > 0 && (
                        <div className="px-6 py-8 transition-all">
                            <h4 className="text-slate-900 dark:text-white text-lg font-bold mb-4">Onde doeu no treino?</h4>
                            <div className="bg-app-bg-light dark:bg-app-bg-dark/50 rounded-xl p-4 flex flex-col items-center">

                                {/* Quick Select Tags */}
                                <div className="flex flex-wrap justify-center gap-2 w-full mt-2">
                                    {commonAreas.map(area => {
                                        const isSelected = painAreas.includes(area);
                                        return (
                                            <button
                                                key={area}
                                                onClick={() => togglePainArea(area)}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors shadow-sm
                                                ${isSelected
                                                        ? 'bg-app-primary text-white border-app-primary'
                                                        : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-app-primary hover:text-app-primary'} 
                                                border`}
                                            >
                                                {area}
                                            </button>
                                        );
                                    })}
                                </div>
                                {painAreas.length > 0 && (
                                    <p className="text-xs text-slate-500 mt-4 text-center">
                                        Selecionados: {painAreas.join(', ')}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Floating Action Button Area */}
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-white via-white to-transparent dark:from-[#1e2736] dark:via-[#1e2736] pt-12">
                    <button onClick={handleNext} className="w-full bg-app-primary hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-app-primary/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                        <span>Próximo Passo</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
