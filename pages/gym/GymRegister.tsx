import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gymApi, GymAthleteProfile } from '../../lib/api-gym';

const modalities = ['Judô', 'Jiu-Jitsu', 'MMA', 'Wrestling', 'Boxe', 'Muay Thai', 'Karatê'];
const categories = ['Sub-13', 'Sub-15', 'Sub-18', 'Sub-21', 'Adulto', 'Master'];
const belts: Record<string, string[]> = {
    'Judô': ['Branca', 'Cinza', 'Azul', 'Amarela', 'Laranja', 'Verde', 'Roxa', 'Marrom', 'Preta'],
    'Jiu-Jitsu': ['Branca', 'Cinza', 'Amarela', 'Laranja', 'Verde', 'Azul', 'Roxa', 'Marrom', 'Preta'],
};
const lateralities = ['Destro', 'Canhoto', 'Ambidestro'];
const bodyAreas = ['Ombro', 'Cotovelo', 'Punho', 'Lombar', 'Quadril', 'Joelho', 'Tornozelo'];

export default function GymRegister() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<Partial<GymAthleteProfile>>({
        primary_modality: 'Judô',
        secondary_modalities: [],
        laterality: 'Destro',
        injury_history: [],
    });

    const update = (data: Partial<GymAthleteProfile>) => setProfile(prev => ({ ...prev, ...data }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await gymApi.updateAthleteProfile({ ...profile, gym_onboarded: true });
            navigate('/gym/schedule', { replace: true });
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar perfil.');
        } finally {
            setSaving(false);
        }
    };

    const canContinue = () => {
        if (step === 1) return profile.birth_date && profile.weight && profile.height;
        if (step === 2) return profile.primary_modality && profile.category && profile.belt;
        return true;
    };

    return (
        <div className="bg-gym-bg min-h-screen font-app-display text-gym-text flex flex-col">
            {/* Header */}
            <div className="p-4 pb-2">
                <div className="flex items-center gap-3 mb-4">
                    {step > 1 && (
                        <button onClick={() => setStep(step - 1)} className="p-2 -ml-2 rounded-lg hover:bg-gym-surface transition-colors">
                            <span className="material-symbols-outlined text-gym-muted">arrow_back</span>
                        </button>
                    )}
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-white">Cadastro do Atleta</h1>
                        <p className="text-xs text-gym-muted">Etapa {step} de 3</p>
                    </div>
                </div>
                {/* Progress bar */}
                <div className="flex gap-1.5">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-gym-primary' : 'bg-gym-surface-light'}`} />
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 px-4 py-6 overflow-y-auto">
                {step === 1 && (
                    <div className="space-y-5">
                        <h2 className="text-lg font-bold text-white mb-1">Dados Básicos</h2>
                        <Field label="Data de nascimento">
                            <input type="date" value={profile.birth_date || ''} onChange={e => update({ birth_date: e.target.value })}
                                className="gym-input" />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Peso (kg)">
                                <input type="number" step="0.1" value={profile.weight || ''} onChange={e => update({ weight: +e.target.value })}
                                    placeholder="65" className="gym-input" />
                            </Field>
                            <Field label="Altura (cm)">
                                <input type="number" step="1" value={profile.height || ''} onChange={e => update({ height: +e.target.value })}
                                    placeholder="170" className="gym-input" />
                            </Field>
                        </div>
                        <Field label="Lateralidade">
                            <div className="flex gap-2">
                                {lateralities.map(l => (
                                    <button key={l} onClick={() => update({ laterality: l })}
                                        className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${profile.laterality === l ? 'bg-gym-primary text-white' : 'bg-gym-surface text-gym-muted border border-gym-surface-light'}`}>
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </Field>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-5">
                        <h2 className="text-lg font-bold text-white mb-1">Dados Esportivos</h2>
                        <Field label="Modalidade principal">
                            <div className="grid grid-cols-2 gap-2">
                                {modalities.slice(0, 4).map(m => (
                                    <button key={m} onClick={() => update({ primary_modality: m })}
                                        className={`py-3 rounded-xl text-sm font-semibold transition-all ${profile.primary_modality === m ? 'bg-gym-primary text-white' : 'bg-gym-surface text-gym-muted border border-gym-surface-light'}`}>
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </Field>
                        <Field label="Categoria">
                            <select value={profile.category || ''} onChange={e => update({ category: e.target.value })}
                                className="gym-input">
                                <option value="">Selecione</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </Field>
                        <Field label="Faixa">
                            <div className="flex flex-wrap gap-2">
                                {(belts[profile.primary_modality || 'Judô'] || belts['Judô']).map(b => (
                                    <button key={b} onClick={() => update({ belt: b })}
                                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${profile.belt === b ? 'bg-gym-primary text-white' : 'bg-gym-surface text-gym-muted border border-gym-surface-light'}`}>
                                        {b}
                                    </button>
                                ))}
                            </div>
                        </Field>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-5">
                        <h2 className="text-lg font-bold text-white mb-1">Saúde e Observações</h2>
                        <Field label="Histórico de lesões (selecione as áreas)">
                            <div className="flex flex-wrap gap-2">
                                {bodyAreas.map(area => {
                                    const selected = profile.injury_history?.some(i => i.area === area);
                                    return (
                                        <button key={area} onClick={() => {
                                            const current = profile.injury_history || [];
                                            if (selected) {
                                                update({ injury_history: current.filter(i => i.area !== area) });
                                            } else {
                                                update({ injury_history: [...current, { area, description: '' }] });
                                            }
                                        }}
                                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${selected ? 'bg-gym-warning/20 text-gym-warning border border-gym-warning/30' : 'bg-gym-surface text-gym-muted border border-gym-surface-light'}`}>
                                            {area}
                                        </button>
                                    );
                                })}
                            </div>
                        </Field>
                        <Field label="Observações">
                            <textarea rows={4} value={profile.observations || ''} onChange={e => update({ observations: e.target.value })}
                                placeholder="Informações adicionais sobre saúde, limitações, objetivos..."
                                className="gym-input resize-none" />
                        </Field>
                    </div>
                )}
            </div>

            {/* Bottom CTA */}
            <div className="px-4 pb-8 pt-4">
                <button
                    disabled={!canContinue() || saving}
                    onClick={() => step < 3 ? setStep(step + 1) : handleSave()}
                    className="w-full bg-gradient-to-r from-gym-primary to-blue-500 disabled:from-gym-surface disabled:to-gym-surface disabled:text-gym-muted text-white font-bold py-4 rounded-xl shadow-lg shadow-gym-primary/30 disabled:shadow-none transition-all active:scale-95 disabled:active:scale-100"
                >
                    {saving ? 'Salvando...' : step < 3 ? 'Continuar' : 'Concluir Cadastro'}
                </button>
            </div>

            <style>{`
                .gym-input {
                    width: 100%;
                    padding: 0.875rem 1rem;
                    border-radius: 0.75rem;
                    border: 1px solid #243447;
                    background: #1a2634;
                    color: #e2e8f0;
                    font-size: 0.875rem;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .gym-input:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
                }
                .gym-input::placeholder {
                    color: #64748b;
                }
            `}</style>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-semibold mb-2 text-gym-muted">{label}</label>
            {children}
        </div>
    );
}
