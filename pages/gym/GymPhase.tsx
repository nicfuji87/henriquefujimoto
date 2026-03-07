import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gymApi, calculateATRPhase } from '../../lib/api-gym';
import type { GymCompetition, GymTrainingPlan } from '../../lib/api-gym';

export default function GymPhase() {
    const navigate = useNavigate();
    const [nextComp, setNextComp] = useState<GymCompetition | null>(null);
    const [activePlan, setActivePlan] = useState<GymTrainingPlan | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [comp, plan] = await Promise.all([gymApi.getNextCompetition(), gymApi.getActivePlan()]);
                setNextComp(comp);
                setActivePlan(plan);
            } finally { setLoading(false); }
        })();
    }, []);

    const daysToComp = nextComp ? Math.ceil((new Date(nextComp.date + 'T12:00:00').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
    const currentPhase = calculateATRPhase(nextComp?.date || null);

    const phases = [
        {
            key: 'accumulation',
            label: 'Acumulação',
            icon: '🏋️',
            color: 'from-blue-600 to-blue-400',
            border: 'border-blue-500/30',
            bg: 'bg-blue-500/10',
            objective: 'Construir base de força, resistência e estabilidade articular.',
            duration: '4-6 semanas',
            focus: ['Força geral', 'Resistência muscular', 'Estabilidade', 'Mobilidade', 'Correção postural'],
            stimuli: ['Séries de 8-12 repetições', 'Tempo controlado', 'Exercícios unilaterais', 'Trabalho de core anti-rotação'],
            nextPhase: 'Transmutação',
            range: '> 35 dias para competição',
        },
        {
            key: 'transmutation',
            label: 'Transmutação',
            icon: '⚡',
            color: 'from-purple-600 to-purple-400',
            border: 'border-purple-500/30',
            bg: 'bg-purple-500/10',
            objective: 'Converter força geral em potência específica para o combate.',
            duration: '2-3 semanas',
            focus: ['Potência', 'Transferência de força', 'Explosividade controlada', 'Grip funcional', 'Velocidade de reação'],
            stimuli: ['Séries de 4-6 rep explosivas', 'Tempos curtos (15-20s)', 'Intenção rápida', 'Complexos de força+plio'],
            nextPhase: 'Realização',
            range: '15-35 dias para competição',
        },
        {
            key: 'realization',
            label: 'Realização',
            icon: '🎯',
            color: 'from-red-600 to-red-400',
            border: 'border-red-500/30',
            bg: 'bg-red-500/10',
            objective: 'Afiar o sistema nervoso. Chegar pronto, não cansado.',
            duration: '1-2 semanas',
            focus: ['Ativação neural', 'Mobilidade', 'Prontidão', 'Grip leve (opcional)', 'Redução de volume'],
            stimuli: ['Séries de 3-5 rep secas', 'Tempo seco e limpo', 'Sem fadiga residual', 'Sessões de 8-15min'],
            nextPhase: 'Acumulação (próximo bloco)',
            range: '< 15 dias para competição',
        },
    ];

    const currentPhaseData = phases.find(p => p.key === currentPhase)!;
    const currentIndex = phases.findIndex(p => p.key === currentPhase);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-3 border-gym-primary border-t-transparent rounded-full animate-spin" /></div>;
    }

    return (
        <div className="min-h-screen flex flex-col pb-6">
            {/* Header */}
            <div className="p-4 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gym-surface flex items-center justify-center">
                    <span className="material-symbols-outlined text-gym-muted">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-xl font-bold text-white">Fase de Preparação</h1>
                    <p className="text-xs text-gym-muted">Periodização ATR</p>
                </div>
            </div>

            <div className="px-4 space-y-4">
                {/* Current Phase Card */}
                <div className={`rounded-2xl border ${currentPhaseData.border} p-5 bg-gradient-to-br ${currentPhaseData.color} bg-opacity-10`}
                    style={{ background: `linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.1))` }}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-3xl">{currentPhaseData.icon}</span>
                            <div>
                                <p className="text-xs text-gym-muted font-bold uppercase tracking-wider">Fase Atual</p>
                                <h2 className="text-2xl font-bold text-white">{currentPhaseData.label}</h2>
                            </div>
                        </div>
                        {daysToComp !== null && (
                            <div className="text-right">
                                <div className="text-2xl font-bold text-white">{daysToComp}d</div>
                                <p className="text-[10px] text-gym-muted">p/ competição</p>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-gym-text leading-relaxed">{currentPhaseData.objective}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-gym-muted">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span>Duração típica: {currentPhaseData.duration}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gym-muted">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        <span>{currentPhaseData.range}</span>
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-4">
                    <p className="text-xs font-semibold text-gym-muted mb-4 uppercase tracking-wider">Timeline de Blocos</p>
                    <div className="flex items-center gap-2">
                        {phases.map((p, i) => (
                            <React.Fragment key={p.key}>
                                <div className={`flex-1 rounded-xl p-3 text-center transition-all ${p.key === currentPhase ? `bg-gradient-to-br ${p.color} shadow-lg` : p.bg}`}>
                                    <span className="text-xl block mb-1">{p.icon}</span>
                                    <p className={`text-[10px] font-bold ${p.key === currentPhase ? 'text-white' : 'text-gym-muted'}`}>{p.label}</p>
                                </div>
                                {i < phases.length - 1 && (
                                    <span className={`material-symbols-outlined text-sm ${i < currentIndex ? 'text-gym-accent' : 'text-gym-muted/30'}`}>chevron_right</span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Focus */}
                <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-4">
                    <p className="text-xs font-semibold text-gym-muted mb-3 uppercase tracking-wider">Foco do Bloco</p>
                    <div className="flex flex-wrap gap-2">
                        {currentPhaseData.focus.map((f, i) => (
                            <span key={i} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${currentPhaseData.bg} text-gym-text`}>{f}</span>
                        ))}
                    </div>
                </div>

                {/* Example Stimuli */}
                <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-4">
                    <p className="text-xs font-semibold text-gym-muted mb-3 uppercase tracking-wider">Exemplos de Estímulo</p>
                    <div className="space-y-2">
                        {currentPhaseData.stimuli.map((s, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-gym-primary text-sm mt-0.5">bolt</span>
                                <p className="text-sm text-gym-text">{s}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Next Transition */}
                <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-gym-muted">swap_horiz</span>
                    <div>
                        <p className="text-xs text-gym-muted">Próxima transição</p>
                        <p className="text-sm font-bold text-white">{currentPhaseData.nextPhase}</p>
                    </div>
                </div>

                {/* Active Plan */}
                {activePlan && (
                    <div className="bg-gym-primary/10 rounded-xl border border-gym-primary/20 p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-gym-primary text-sm">event_note</span>
                            <p className="text-xs font-bold text-gym-primary uppercase tracking-wider">Plano Ativo</p>
                        </div>
                        <h3 className="font-bold text-white">{activePlan.name}</h3>
                        {activePlan.objective && <p className="text-xs text-gym-text mt-1">{activePlan.objective}</p>}
                    </div>
                )}

                {/* Competition info */}
                {nextComp && (
                    <div className="bg-gym-surface rounded-xl border border-gym-surface-light p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-gym-warning">emoji_events</span>
                            <p className="text-xs font-bold text-gym-muted uppercase tracking-wider">Próxima Competição</p>
                        </div>
                        <h3 className="font-bold text-white">{nextComp.name}</h3>
                        <p className="text-xs text-gym-muted mt-1">
                            {new Date(nextComp.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                            {nextComp.location && ` · ${nextComp.location}`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
