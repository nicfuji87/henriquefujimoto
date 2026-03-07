import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gymApi, GymAthleteProfile, GymWorkout } from '../../lib/api-gym';

export default function GymProfile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<GymAthleteProfile | null>(null);
    const [recentWorkouts, setRecentWorkouts] = useState<GymWorkout[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<GymAthleteProfile>>({});

    useEffect(() => {
        const load = async () => {
            try {
                const [p, w] = await Promise.all([
                    gymApi.getAthleteProfile(),
                    gymApi.getRecentWorkouts(7),
                ]);
                setProfile(p);
                setEditData(p || {});
                setRecentWorkouts(w);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleSave = async () => {
        try {
            await gymApi.updateAthleteProfile(editData);
            setProfile({ ...profile, ...editData });
            setEditing(false);
        } catch (err) {
            alert('Erro ao salvar');
        }
    };

    const completedWorkouts = recentWorkouts.filter(w => w.status === 'completed');

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gym-primary border-t-transparent rounded-full animate-spin" />
        </div>;
    }

    return (
        <div className="min-h-screen flex flex-col pb-24">
            {/* Header */}
            <div className="bg-gradient-to-b from-gym-primary/20 to-gym-bg p-6 pt-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gym-primary to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg shadow-gym-primary/30">
                    HF
                </div>
                <h1 className="text-xl font-bold text-white">Henrique Fujimoto</h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                    {profile?.primary_modality && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gym-primary/20 text-gym-primary">
                            {profile.primary_modality}
                        </span>
                    )}
                    {profile?.belt && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gym-warning/20 text-gym-warning">
                            Faixa {profile.belt}
                        </span>
                    )}
                    {profile?.category && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gym-surface-light text-gym-muted">
                            {profile.category}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex-1 px-4 space-y-4 -mt-2">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-3 text-center">
                        <div className="text-xl font-bold text-gym-primary">{profile?.weight || '—'}</div>
                        <p className="text-[10px] text-gym-muted font-semibold">Peso (kg)</p>
                    </div>
                    <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-3 text-center">
                        <div className="text-xl font-bold text-gym-primary">{profile?.height || '—'}</div>
                        <p className="text-[10px] text-gym-muted font-semibold">Altura (cm)</p>
                    </div>
                    <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-3 text-center">
                        <div className="text-xl font-bold text-gym-accent">{completedWorkouts.length}</div>
                        <p className="text-[10px] text-gym-muted font-semibold">Treinos (7d)</p>
                    </div>
                </div>

                {/* Details */}
                <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-white">Dados do Atleta</h3>
                        <button onClick={() => editing ? handleSave() : setEditing(true)}
                            className="text-xs font-semibold text-gym-primary">
                            {editing ? 'Salvar' : 'Editar'}
                        </button>
                    </div>
                    <div className="space-y-3">
                        <ProfileField label="Lateralidade" value={profile?.laterality} editing={editing}
                            onChange={v => setEditData(p => ({ ...p, laterality: v }))} editValue={editData.laterality} />
                        <ProfileField label="Peso (kg)" value={profile?.weight?.toString()} editing={editing}
                            onChange={v => setEditData(p => ({ ...p, weight: +v }))} editValue={editData.weight?.toString()} type="number" />
                        <ProfileField label="Altura (cm)" value={profile?.height?.toString()} editing={editing}
                            onChange={v => setEditData(p => ({ ...p, height: +v }))} editValue={editData.height?.toString()} type="number" />
                        <ProfileField label="Observações" value={profile?.observations} editing={editing}
                            onChange={v => setEditData(p => ({ ...p, observations: v }))} editValue={editData.observations} />
                    </div>
                </div>

                {/* Injuries */}
                {profile?.injury_history && profile.injury_history.length > 0 && (
                    <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-4">
                        <h3 className="text-sm font-bold text-white mb-3">Histórico de Lesões</h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.injury_history.map((injury: any, i: number) => (
                                <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gym-warning/10 text-gym-warning border border-gym-warning/20">
                                    {injury.area}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                    <button onClick={() => navigate('/gym/schedule')}
                        className="w-full bg-gym-surface rounded-xl border border-gym-surface-light p-4 text-left flex items-center gap-3 hover:border-gym-primary/50 transition-colors">
                        <span className="material-symbols-outlined text-gym-primary">calendar_month</span>
                        <span className="text-sm font-semibold text-white">Editar Agenda Semanal</span>
                    </button>
                    <button onClick={() => navigate('/gym/competitions')}
                        className="w-full bg-gym-surface rounded-xl border border-gym-surface-light p-4 text-left flex items-center gap-3 hover:border-gym-primary/50 transition-colors">
                        <span className="material-symbols-outlined text-gym-warning">emoji_events</span>
                        <span className="text-sm font-semibold text-white">Calendário de Competições</span>
                    </button>
                    <button onClick={() => { localStorage.removeItem('gym_auth'); navigate('/gym/login'); }}
                        className="w-full bg-gym-surface rounded-xl border border-gym-danger/20 p-4 text-left flex items-center gap-3 hover:border-gym-danger/50 transition-colors">
                        <span className="material-symbols-outlined text-gym-danger">logout</span>
                        <span className="text-sm font-semibold text-gym-danger">Sair</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function ProfileField({ label, value, editing, onChange, editValue, type = 'text' }: {
    label: string; value?: string; editing: boolean; onChange: (v: string) => void; editValue?: string; type?: string;
}) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-gym-surface-light/50 last:border-0">
            <span className="text-xs text-gym-muted">{label}</span>
            {editing ? (
                <input type={type} value={editValue || ''} onChange={e => onChange(e.target.value)}
                    className="text-sm text-white bg-gym-bg px-3 py-1 rounded-lg border border-gym-surface-light w-32 text-right focus:outline-none focus:border-gym-primary" />
            ) : (
                <span className="text-sm text-white font-medium">{value || '—'}</span>
            )}
        </div>
    );
}
