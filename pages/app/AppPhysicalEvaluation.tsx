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

    // Grouped pain areas
    const painAreaGroups = [
        {
            label: 'Cabeça / Rosto',
            areas: ['Cabeça', 'Olho', 'Orelha', 'Nariz'],
        },
        {
            label: 'Tronco',
            areas: ['Pescoço', 'Ombro (D)', 'Ombro (E)', 'Costas', 'Lombar', 'Quadril'],
        },
        {
            label: 'Braços / Mãos',
            areas: ['Cotovelo (D)', 'Cotovelo (E)', 'Punho (D)', 'Punho (E)', 'Dedo (mão D)', 'Dedo (mão E)'],
        },
        {
            label: 'Pernas / Pés',
            areas: ['Coxa (D)', 'Coxa (E)', 'Joelho (D)', 'Joelho (E)', 'Panturrilha (D)', 'Panturrilha (E)', 'Tornozelo (D)', 'Tornozelo (E)', 'Dedo (pé D)', 'Dedo (pé E)'],
        },
    ];

    // Map pain areas to body SVG regions
    const getBodyHighlights = () => {
        const highlights: Record<string, boolean> = {};
        painAreas.forEach(a => {
            if (a.includes('Cabeça') || a.includes('Olho') || a.includes('Orelha') || a.includes('Nariz')) highlights['head'] = true;
            if (a.includes('Pescoço')) highlights['neck'] = true;
            if (a.includes('Ombro')) highlights['shoulder'] = true;
            if (a.includes('Costas') || a.includes('Lombar')) highlights['back'] = true;
            if (a.includes('Quadril')) highlights['hip'] = true;
            if (a.includes('Cotovelo') || a.includes('Punho') || a.includes('mão')) highlights['arm'] = true;
            if (a.includes('Coxa')) highlights['thigh'] = true;
            if (a.includes('Joelho')) highlights['knee'] = true;
            if (a.includes('Panturrilha')) highlights['calf'] = true;
            if (a.includes('Tornozelo') || a.includes('pé')) highlights['foot'] = true;
        });
        return highlights;
    };

    const hl = getBodyHighlights();
    const hlColor = '#ef4444';
    const defaultColor = '#94a3b8';

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
                        <h3 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight mb-2">Como você está se sentindo após o treino?</h3>
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
                            <div className="relative w-full h-12 flex items-center">
                                <input value={fatigueLevel} onChange={(e) => setFatigueLevel(Number(e.target.value))} className="app-slider" max="10" min="0" type="range" />
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
                            <div className="relative w-full h-12 flex items-center">
                                <input value={energyLevel} onChange={(e) => setEnergyLevel(Number(e.target.value))} className="app-slider" max="10" min="0" type="range" />
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
                            <div className="relative w-full h-12 flex items-center">
                                <input value={painLevel} onChange={(e) => setPainLevel(Number(e.target.value))} className="app-slider" max="10" min="0" type="range" />
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
                            <h4 className="text-slate-900 dark:text-white text-lg font-bold mb-2">Onde doeu no treino?</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Toque no boneco ou selecione as áreas abaixo. (D) = Direito, (E) = Esquerdo.</p>

                            {/* Body Silhouette SVG */}
                            <div className="flex justify-center mb-6">
                                <svg viewBox="0 0 200 400" width="160" height="320" className="drop-shadow-sm">
                                    {/* Head */}
                                    <circle cx="100" cy="35" r="25" fill={hl.head ? hlColor : defaultColor} opacity={hl.head ? 0.85 : 0.3}
                                        className="cursor-pointer transition-all hover:opacity-60" onClick={() => togglePainArea('Cabeça')} />
                                    {/* Neck */}
                                    <rect x="90" y="58" width="20" height="18" rx="6" fill={hl.neck ? hlColor : defaultColor} opacity={hl.neck ? 0.85 : 0.3}
                                        className="cursor-pointer transition-all hover:opacity-60" onClick={() => togglePainArea('Pescoço')} />
                                    {/* Torso */}
                                    <rect x="60" y="75" width="80" height="90" rx="18" fill={hl.back ? hlColor : defaultColor} opacity={hl.back ? 0.85 : 0.3}
                                        className="cursor-pointer transition-all hover:opacity-60" onClick={() => togglePainArea('Costas')} />
                                    {/* Shoulders */}
                                    <ellipse cx="50" cy="90" rx="16" ry="12" fill={hl.shoulder ? hlColor : defaultColor} opacity={hl.shoulder ? 0.85 : 0.3}
                                        className="cursor-pointer transition-all hover:opacity-60" onClick={() => togglePainArea('Ombro (E)')} />
                                    <ellipse cx="150" cy="90" rx="16" ry="12" fill={hl.shoulder ? hlColor : defaultColor} opacity={hl.shoulder ? 0.85 : 0.3}
                                        className="cursor-pointer transition-all hover:opacity-60" onClick={() => togglePainArea('Ombro (D)')} />
                                    {/* Arms */}
                                    <rect x="25" y="100" width="18" height="75" rx="8" fill={hl.arm ? hlColor : defaultColor} opacity={hl.arm ? 0.85 : 0.3}
                                        className="cursor-pointer transition-all hover:opacity-60" onClick={() => togglePainArea('Cotovelo (E)')} />
                                    <rect x="157" y="100" width="18" height="75" rx="8" fill={hl.arm ? hlColor : defaultColor} opacity={hl.arm ? 0.85 : 0.3}
                                        className="cursor-pointer transition-all hover:opacity-60" onClick={() => togglePainArea('Cotovelo (D)')} />
                                    {/* Hip */}
                                    <ellipse cx="100" cy="175" rx="38" ry="16" fill={hl.hip ? hlColor : defaultColor} opacity={hl.hip ? 0.85 : 0.3}
                                        className="cursor-pointer transition-all hover:opacity-60" onClick={() => togglePainArea('Quadril')} />
                                    {/* Thighs */}
                                    <rect x="65" y="190" width="25" height="65" rx="10" fill={hl.thigh ? hlColor : defaultColor} opacity={hl.thigh ? 0.85 : 0.3}
                                        className="cursor-pointer transition-all hover:opacity-60" onClick={() => togglePainArea('Coxa (E)')} />
                                    <rect x="110" y="190" width="25" height="65" rx="10" fill={hl.thigh ? hlColor : defaultColor} opacity={hl.thigh ? 0.85 : 0.3}
                                        className="cursor-pointer transition-all hover:opacity-60" onClick={() => togglePainArea('Coxa (D)')} />
                                    {/* Knees */}
                                    <circle cx="77" cy="265" r="10" fill={hl.knee ? hlColor : defaultColor} opacity={hl.knee ? 0.85 : 0.3}
                                        className="cursor-pointer transition-all hover:opacity-60" onClick={() => togglePainArea('Joelho (E)')} />
                                    <circle cx="123" cy="265" r="10" fill={hl.knee ? hlColor : defaultColor} opacity={hl.knee ? 0.85 : 0.3}
                                        className="cursor-pointer transition-all hover:opacity-60" onClick={() => togglePainArea('Joelho (D)')} />
                                    {/* Calves */}
                                    <rect x="67" y="278" width="20" height="55" rx="8" fill={hl.calf ? hlColor : defaultColor} opacity={hl.calf ? 0.85 : 0.3}
                                        className="cursor-pointer transition-all hover:opacity-60" onClick={() => togglePainArea('Panturrilha (E)')} />
                                    <rect x="113" y="278" width="20" height="55" rx="8" fill={hl.calf ? hlColor : defaultColor} opacity={hl.calf ? 0.85 : 0.3}
                                        className="cursor-pointer transition-all hover:opacity-60" onClick={() => togglePainArea('Panturrilha (D)')} />
                                    {/* Feet */}
                                    <ellipse cx="77" cy="345" r="14" ry="9" fill={hl.foot ? hlColor : defaultColor} opacity={hl.foot ? 0.85 : 0.3}
                                        className="cursor-pointer transition-all hover:opacity-60" onClick={() => togglePainArea('Tornozelo (E)')} />
                                    <ellipse cx="123" cy="345" r="14" ry="9" fill={hl.foot ? hlColor : defaultColor} opacity={hl.foot ? 0.85 : 0.3}
                                        className="cursor-pointer transition-all hover:opacity-60" onClick={() => togglePainArea('Tornozelo (D)')} />
                                    {/* Labels */}
                                    <text x="30" y="90" fontSize="8" fill="#64748b" textAnchor="middle">E</text>
                                    <text x="170" y="90" fontSize="8" fill="#64748b" textAnchor="middle">D</text>
                                </svg>
                            </div>

                            {/* Grouped Quick Select Tags */}
                            <div className="flex flex-col gap-4">
                                {painAreaGroups.map(group => (
                                    <div key={group.label}>
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{group.label}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {group.areas.map(area => {
                                                const isSelected = painAreas.includes(area);
                                                return (
                                                    <button
                                                        key={area}
                                                        onClick={() => togglePainArea(area)}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shadow-sm
                                                        ${isSelected
                                                                ? 'bg-red-500 text-white border-red-500'
                                                                : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-red-300 hover:text-red-500'} 
                                                        border`}
                                                    >
                                                        {area}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {painAreas.length > 0 && (
                                <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30">
                                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                                        📍 Selecionados: {painAreas.join(', ')}
                                    </p>
                                </div>
                            )}
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
