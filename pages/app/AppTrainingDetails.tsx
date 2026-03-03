import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { appApi, AppTraining } from '../../lib/api-app';
import { useTrainingWizard } from '../../components/app/AppLayout';

export default function AppTrainingDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { setTraining } = useTrainingWizard();
    const [trainingData, setTrainingData] = useState<AppTraining | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTraining = async () => {
            if (!id) return;
            try {
                // Fetch the training by ID from the API
                const data = await appApi.getTrainingById(id);
                setTrainingData(data);
            } catch (error) {
                console.error('Error loading training details:', error);
                alert('Erro ao carregar os detalhes do registro.');
            } finally {
                setLoading(false);
            }
        };
        loadTraining();
    }, [id]);

    const handleEdit = () => {
        if (!trainingData) return;
        setTraining(trainingData);
        if (trainingData.is_competition) {
            navigate('/app/competition-details');
        } else {
            navigate('/app/new-training');
        }
    };

    if (loading) {
        return (
            <div className="bg-app-bg-light dark:bg-app-bg-dark min-h-screen flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-app-primary text-4xl">progress_activity</span>
            </div>
        );
    }

    if (!trainingData) {
        return (
            <div className="bg-app-bg-light dark:bg-app-bg-dark min-h-screen flex flex-col items-center justify-center p-4">
                <h2 className="text-xl font-bold dark:text-white mb-4">Registro não encontrado.</h2>
                <button onClick={() => navigate(-1)} className="bg-app-primary text-white px-6 py-2 rounded-full font-bold">Voltar</button>
            </div>
        );
    }

    const isComp = trainingData.is_competition;
    const displayDate = trainingData.training_date || trainingData.created_at;
    const dateStr = displayDate ? new Date(displayDate + (trainingData.training_date ? 'T12:00:00' : '')).toLocaleDateString('pt-BR') : '';

    // Rendering dynamic rating colors for the header
    const getRatingColor = (r: number) => {
        if (r <= 2) return { bg: 'bg-red-100', text: 'text-red-500' };
        if (r <= 4) return { bg: 'bg-orange-100', text: 'text-orange-500' };
        if (r <= 6) return { bg: 'bg-yellow-100', text: 'text-yellow-500' };
        if (r <= 8) return { bg: 'bg-emerald-100', text: 'text-emerald-500' };
        return { bg: 'bg-green-100', text: 'text-green-500' };
    };
    const rConfig = getRatingColor(trainingData.rating || 0);

    return (
        <div className="bg-slate-50 dark:bg-app-bg-dark font-app-display min-h-screen flex flex-col">
            {/* Header */}
            <div className="flex items-center p-4 justify-between bg-white dark:bg-slate-900 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
                <button onClick={() => navigate(-1)} className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="flex-1 text-center">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                        {isComp ? 'Detalhes do Campeonato' : 'Detalhes do Treino'}
                    </h2>
                    <p className="text-xs text-slate-500">{dateStr}</p>
                </div>
                <button onClick={handleEdit} className="text-app-primary flex size-12 items-center justify-center rounded-full hover:bg-app-primary/10 transition-colors">
                    <span className="material-symbols-outlined">edit</span>
                </button>
            </div>

            <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full flex flex-col gap-4 pb-24">
                {/* Title Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center">
                    <div className={`size-16 rounded-full flex items-center justify-center mb-4 ${isComp ? 'bg-amber-100 text-amber-500' : 'bg-app-primary/10 text-app-primary'}`}>
                        <span className="material-symbols-outlined text-3xl">
                            {isComp ? 'emoji_events' : 'sports_martial_arts'}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">
                        {isComp ? trainingData.competition_name : `Treino de ${trainingData.modality}`}
                    </h1>
                    <div className="flex flex-wrap gap-2 mb-6 justify-center">
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold">
                            {isComp ? `${trainingData.competition_matches} lutas` : trainingData.training_type}
                        </span>
                        {trainingData.gym_name && (
                            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">location_on</span>
                                {trainingData.gym_name}
                            </span>
                        )}
                    </div>

                    <div className="w-full flex justify-between items-center py-4 border-t border-slate-100 dark:border-slate-700">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Nota Geral</span>
                        <div className={`flex items-center gap-1 ${rConfig.bg} dark:bg-opacity-20 px-3 py-1 rounded-lg`}>
                            <span className={`font-bold text-xl ${rConfig.text}`}>{trainingData.rating}</span>
                            <span className={`text-sm ${rConfig.text}`}>/10</span>
                        </div>
                    </div>
                </div>

                {isComp ? (
                    <>
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-500">military_tech</span>
                                Resultado Final
                            </h3>
                            <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg text-sm font-medium">
                                {trainingData.competition_result}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-500">psychology</span>
                                Reflexão e Sensações
                            </h3>
                            <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                                {trainingData.reflection || 'Sem reflexão'}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-green-500">trending_up</span>
                                O que aprendeu?
                            </h3>
                            <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                                {trainingData.learned_today || 'Nenhum aprendizado registrado'}
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center">
                                <span className="text-xs font-semibold text-slate-500 mb-2">Cansaço</span>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">{trainingData.fatigue_level}/10</span>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center">
                                <span className="text-xs font-semibold text-slate-500 mb-2">Energia</span>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">{trainingData.energy_level}/10</span>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center">
                                <span className="text-xs font-semibold text-slate-500 mb-2">Dor</span>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">{trainingData.pain_level}/10</span>
                            </div>
                        </div>

                        {(trainingData.pain_areas && trainingData.pain_areas.length > 0) && (
                            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-sm">Áreas de Dor</h3>
                                <div className="flex flex-wrap gap-2">
                                    {trainingData.pain_areas.map(area => (
                                        <span key={area} className="text-xs bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-bold px-3 py-1.5 rounded-full">
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Foco Mental</h3>
                                <span className="font-bold text-app-primary bg-app-primary/10 px-2 py-1 rounded text-xs">{trainingData.focus_level}/10</span>
                            </div>
                            {(trainingData.distractions && trainingData.distractions.length > 0) && (
                                <div className="mb-4">
                                    <p className="text-xs text-slate-500 mb-2">Distrações:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {trainingData.distractions.map(d => (
                                            <span key={d} className="text-[11px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold px-2 py-1 rounded">
                                                {d}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed italic">
                                    "{trainingData.mental_reflection}"
                                </p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Estado Emocional</h3>
                                <span className="font-bold text-app-primary bg-app-primary/10 px-2 py-1 rounded text-xs">Intensidade: {trainingData.emotion_intensity}/10</span>
                            </div>

                            {(trainingData.emotions && trainingData.emotions.length > 0) && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {trainingData.emotions.map(emo => (
                                        <span key={emo} className="text-sm bg-app-primary/10 text-app-primary font-bold px-3 py-1.5 rounded-full">
                                            {emo}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                                <p className="leading-relaxed">
                                    {trainingData.emotion_context}
                                </p>
                            </div>
                        </div>

                        {(trainingData.reflection || trainingData.learned_today) && (
                            <div className="bg-app-primary text-white p-5 rounded-2xl shadow-sm">
                                <h3 className="font-bold mb-3 text-sm border-b border-white/20 pb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">school</span>
                                    Reflexão Final e Aprendizado
                                </h3>
                                {trainingData.reflection && (
                                    <div className="mb-3">
                                        <p className="text-xs text-white/70 uppercase tracking-wider mb-1 font-bold">Resumo do dia</p>
                                        <p className="text-sm leading-relaxed">{trainingData.reflection}</p>
                                    </div>
                                )}
                                {trainingData.learned_today && (
                                    <div>
                                        <p className="text-xs text-white/70 uppercase tracking-wider mb-1 font-bold">O que foi aprendido</p>
                                        <p className="text-sm leading-relaxed">{trainingData.learned_today}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
