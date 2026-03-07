import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gymApi, calculateReadinessScore } from '../../lib/api-gym';
import type { GymCheckin as GymCheckinType } from '../../lib/api-gym';

const jointAreas = [
    { id: 'ombro', label: 'Ombro', icon: '🦴' },
    { id: 'cotovelo', label: 'Cotovelo', icon: '💪' },
    { id: 'punho', label: 'Punho', icon: '✊' },
    { id: 'lombar', label: 'Lombar', icon: '🔙' },
    { id: 'quadril', label: 'Quadril', icon: '🦵' },
    { id: 'joelho', label: 'Joelho', icon: '🦿' },
    { id: 'tornozelo', label: 'Tornozelo', icon: '🦶' },
];

const scaleLabels: Record<string, string[]> = {
    energy: ['Sem energia', 'Muito baixa', 'Baixa', 'Normal', 'Boa', 'Excelente'],
    sleep_quality: ['Péssimo', 'Ruim', 'Regular', 'Normal', 'Bom', 'Ótimo'],
    muscle_pain: ['Nenhuma', 'Leve', 'Moderada', 'Significativa', 'Alta', 'Intensa'],
    joint_pain: ['Nenhuma', 'Leve', 'Moderada', 'Significativa', 'Alta', 'Intensa'],
    motivation: ['Nenhuma', 'Muito baixa', 'Baixa', 'Normal', 'Alta', 'Máxima'],
};

const scaleColors = [
    ['bg-gym-danger/20 text-gym-danger', 'bg-gym-danger/30 text-gym-danger', 'bg-gym-warning/20 text-gym-warning', 'bg-gym-primary/20 text-gym-primary', 'bg-gym-accent/20 text-gym-accent', 'bg-gym-accent/30 text-gym-accent'],
    ['bg-gym-danger/20 text-gym-danger', 'bg-gym-danger/30 text-gym-danger', 'bg-gym-warning/20 text-gym-warning', 'bg-gym-primary/20 text-gym-primary', 'bg-gym-accent/20 text-gym-accent', 'bg-gym-accent/30 text-gym-accent'],
    ['bg-gym-accent/20 text-gym-accent', 'bg-gym-accent/30 text-gym-accent', 'bg-gym-primary/20 text-gym-primary', 'bg-gym-warning/20 text-gym-warning', 'bg-gym-danger/20 text-gym-danger', 'bg-gym-danger/30 text-gym-danger'],
    ['bg-gym-accent/20 text-gym-accent', 'bg-gym-accent/30 text-gym-accent', 'bg-gym-primary/20 text-gym-primary', 'bg-gym-warning/20 text-gym-warning', 'bg-gym-danger/20 text-gym-danger', 'bg-gym-danger/30 text-gym-danger'],
    ['bg-gym-danger/20 text-gym-danger', 'bg-gym-danger/30 text-gym-danger', 'bg-gym-warning/20 text-gym-warning', 'bg-gym-primary/20 text-gym-primary', 'bg-gym-accent/20 text-gym-accent', 'bg-gym-accent/30 text-gym-accent'],
];

const fields: { key: keyof Omit<GymCheckinType, 'id' | 'date' | 'joint_pain_areas' | 'observation' | 'readiness_score' | 'created_at'>; label: string; icon: string }[] = [
    { key: 'energy', label: 'Energia', icon: 'bolt' },
    { key: 'sleep_quality', label: 'Qualidade do Sono', icon: 'bedtime' },
    { key: 'muscle_pain', label: 'Dor Muscular', icon: 'fitness_center' },
    { key: 'joint_pain', label: 'Dor Articular', icon: 'healing' },
    { key: 'motivation', label: 'Motivação', icon: 'psychology' },
];

export default function GymCheckin() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [checkin, setCheckin] = useState<Partial<GymCheckinType>>({
        energy: 3,
        sleep_quality: 3,
        muscle_pain: 1,
        joint_pain: 0,
        joint_pain_areas: [],
        motivation: 3,
        observation: '',
    });

    const currentField = fields[step];
    const isLastStep = step === fields.length; // +1 for observation step

    const handleSave = async () => {
        setSaving(true);
        try {
            await gymApi.saveCheckin(checkin as GymCheckinType);
            navigate('/gym', { replace: true });
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar check-in');
        } finally {
            setSaving(false);
        }
    };

    const readiness = calculateReadinessScore(checkin as GymCheckinType);

    return (
        <div className="bg-gym-bg min-h-screen flex flex-col font-app-display text-gym-text">
            {/* Header */}
            <div className="p-4 flex items-center gap-3">
                <button onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}
                    className="p-2 -ml-2 rounded-lg hover:bg-gym-surface transition-colors">
                    <span className="material-symbols-outlined text-gym-muted">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-white">Check-in Diário</h1>
                    <p className="text-xs text-gym-muted">{step < fields.length ? `${step + 1} de ${fields.length + 1}` : 'Finalizar'}</p>
                </div>
                {/* Readiness preview */}
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${readiness >= 70 ? 'bg-gym-accent/20 text-gym-accent' : readiness >= 50 ? 'bg-gym-warning/20 text-gym-warning' : 'bg-gym-danger/20 text-gym-danger'}`}>
                    {readiness}%
                </div>
            </div>

            {/* Progress bar */}
            <div className="px-4 flex gap-1">
                {[...fields, { key: 'obs' }].map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-gym-primary' : 'bg-gym-surface-light'}`} />
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
                {step < fields.length ? (
                    <>
                        <span className="material-symbols-outlined text-5xl text-gym-primary mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {currentField.icon}
                        </span>
                        <h2 className="text-xl font-bold text-white mb-2">{currentField.label}</h2>
                        <p className="text-sm text-gym-muted mb-8">
                            {scaleLabels[currentField.key][(checkin as any)[currentField.key] || 0]}
                        </p>

                        {/* Scale buttons */}
                        <div className="flex gap-2 w-full max-w-sm justify-center mb-4">
                            {[0, 1, 2, 3, 4, 5].map(val => {
                                const fieldIdx = fields.findIndex(f => f.key === currentField.key);
                                const isActive = (checkin as any)[currentField.key] === val;
                                const colors = scaleColors[fieldIdx];
                                return (
                                    <button key={val} onClick={() => setCheckin(p => ({ ...p, [currentField.key]: val }))}
                                        className={`w-12 h-12 rounded-xl text-lg font-bold transition-all ${isActive ? colors[val] + ' ring-2 ring-white/20 scale-110' : 'bg-gym-surface text-gym-muted'}`}>
                                        {val}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Joint pain areas (only shown when on joint_pain step and value > 0) */}
                        {currentField.key === 'joint_pain' && (checkin.joint_pain || 0) > 0 && (
                            <div className="mt-6 w-full max-w-sm">
                                <p className="text-xs font-semibold text-gym-muted mb-3 text-center">Onde dói?</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {jointAreas.map(area => {
                                        const selected = checkin.joint_pain_areas?.includes(area.id);
                                        return (
                                            <button key={area.id} onClick={() => {
                                                const current = checkin.joint_pain_areas || [];
                                                setCheckin(p => ({
                                                    ...p,
                                                    joint_pain_areas: selected ? current.filter(a => a !== area.id) : [...current, area.id]
                                                }));
                                            }}
                                                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${selected ? 'bg-gym-danger/20 text-gym-danger border border-gym-danger/30' : 'bg-gym-surface text-gym-muted border border-gym-surface-light'}`}>
                                                {area.icon} {area.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    /* Observation + Summary */
                    <div className="w-full max-w-sm">
                        <h2 className="text-xl font-bold text-white mb-2 text-center">Observações</h2>
                        <p className="text-sm text-gym-muted mb-4 text-center">Algo mais que queira registrar?</p>
                        <textarea
                            rows={3}
                            value={checkin.observation || ''}
                            onChange={e => setCheckin(p => ({ ...p, observation: e.target.value }))}
                            placeholder="Ex: ontem fiz randori pesado, estou com o kimura doendo..."
                            className="w-full p-4 rounded-xl border border-gym-surface-light bg-gym-surface text-white text-sm placeholder:text-gym-muted/60 focus:outline-none focus:ring-2 focus:ring-gym-primary resize-none mb-6"
                        />

                        {/* Summary card */}
                        <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-4">
                            <p className="text-xs font-semibold text-gym-muted mb-3 uppercase tracking-wider">Resumo</p>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-gym-accent">{readiness}</div>
                                    <p className="text-[10px] text-gym-muted">Prontidão</p>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gym-primary">{checkin.energy}/5</div>
                                    <p className="text-[10px] text-gym-muted">Energia</p>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gym-warning">{checkin.muscle_pain}/5</div>
                                    <p className="text-[10px] text-gym-muted">Dor Musc.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom CTA */}
            <div className="px-6 pb-8 pt-2">
                <button
                    onClick={() => isLastStep ? handleSave() : setStep(step + 1)}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-gym-primary to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-gym-primary/30 transition-all active:scale-95"
                >
                    {saving ? 'Salvando...' : isLastStep ? 'Gerar Treino →' : 'Próximo'}
                </button>
            </div>
        </div>
    );
}
