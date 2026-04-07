import React, { useEffect, useState, useRef } from 'react';
import { nutriApi, NutriMeal, NutriDietPlan, MEAL_TYPES, MEAL_ICONS, AiFoodAnalysis, SATIETY_LEVELS } from '../../lib/api-nutri';

type MealMode = 'diet_check' | 'custom_text' | 'photo';

export default function NutriMeals() {
    const [meals, setMeals] = useState<NutriMeal[]>([]);
    const [dietPlan, setDietPlan] = useState<NutriDietPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [mealDate, setMealDate] = useState(new Date().toISOString().slice(0, 10));
    const [mealType, setMealType] = useState('lunch');
    const [mode, setMode] = useState<MealMode>('diet_check');
    const [description, setDescription] = useState('');
    const [satiety, setSatiety] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState<AiFoodAnalysis | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    // Diet plan editor
    const [showDietEditor, setShowDietEditor] = useState(false);
    const [dietMealType, setDietMealType] = useState('breakfast');
    const [dietDesc, setDietDesc] = useState('');
    const [dietCal, setDietCal] = useState('');

    const today = new Date().toISOString().slice(0, 10);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        const [m, dp] = await Promise.all([
            nutriApi.getMealsForDate(today),
            nutriApi.getDietPlan(),
        ]);
        setMeals(m);
        setDietPlan(dp);
        setLoading(false);
    };

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleAnalyze = async () => {
        setAnalyzing(true);
        setAiResult(null);
        let image_base64: string | undefined;
        if (photoFile) {
            const reader = new FileReader();
            image_base64 = await new Promise<string>((resolve) => {
                reader.onloadend = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    resolve(base64);
                };
                reader.readAsDataURL(photoFile);
            });
        }
        const result = await nutriApi.analyzeFoodWithAI({
            description: description || undefined,
            image_base64,
        });
        setAiResult(result);
        setAnalyzing(false);
    };

    const handleSaveMeal = async () => {
        setSaving(true);
        let photo_url: string | null = null;
        if (photoFile) {
            photo_url = await nutriApi.uploadMealPhoto(photoFile);
        }

        const mealData: Partial<NutriMeal> = {
            date: mealDate,
            meal_type: mealType,
            followed_diet: mode === 'diet_check',
            description: mode === 'diet_check' ? 'Seguiu a dieta prescrita' : description,
            photo_url,
            ai_estimated_calories: aiResult?.total_calories || null,
            ai_analysis: aiResult ? JSON.stringify(aiResult) : null,
            satiety,
        };

        // If diet_check, get prescribed calories
        if (mode === 'diet_check') {
            const prescribed = dietPlan.find(d => d.meal_type === mealType);
            if (prescribed) {
                mealData.ai_estimated_calories = prescribed.estimated_calories;
                mealData.description = `✓ ${prescribed.description}`;
            }
        }

        const saved = await nutriApi.saveMeal(mealData);

        // If we have AI result and a saved meal, update the meal with AI data via the edge function
        if (saved && (description || photoFile) && !aiResult) {
            // Auto-analyze after saving
        }

        setShowForm(false);
        setDescription('');
        setPhotoFile(null);
        setPhotoPreview(null);
        setAiResult(null);
        setMode('diet_check');
        setSatiety(null);
        loadData();
        setSaving(false);
    };

    const handleSaveDietItem = async () => {
        if (!dietDesc) return;
        await nutriApi.saveDietPlanItem({
            meal_type: dietMealType,
            description: dietDesc,
            estimated_calories: dietCal ? parseInt(dietCal) : null,
        });
        setDietDesc('');
        setDietCal('');
        loadData();
    };

    const totalCalories = meals.reduce((s, m) => s + (m.ai_estimated_calories || 0), 0);
    const prescribedCalories = dietPlan.reduce((s, d) => s + (d.estimated_calories || 0), 0);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col pb-28">
            <header className="p-5 pt-10">
                <h1 className="text-xl font-bold text-white">Refeições</h1>
                <p className="text-white/30 text-xs mt-1">Acompanhe sua alimentação diária</p>
            </header>

            <main className="flex-1 px-5 space-y-4 animate-enter">
                {/* Calorie Summary */}
                {(totalCalories > 0 || prescribedCalories > 0) && (
                    <div className="nutri-card rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Calorias Hoje</span>
                            {prescribedCalories > 0 && (
                                <span className="text-xs text-white/30">Meta: {prescribedCalories} kcal</span>
                            )}
                        </div>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-3xl font-bold text-orange-400">{totalCalories}</span>
                            <span className="text-white/30 text-sm mb-1">kcal</span>
                        </div>
                        {prescribedCalories > 0 && (
                            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{
                                    width: `${Math.min((totalCalories / prescribedCalories) * 100, 100)}%`,
                                    background: totalCalories > prescribedCalories ? '#ef4444' : 'linear-gradient(90deg, #059669, #34d399)',
                                }} />
                            </div>
                        )}
                    </div>
                )}

                {/* Add meal button */}
                {!showForm ? (
                    <button onClick={() => { setShowForm(true); setMealDate(today); }}
                        className="w-full nutri-btn rounded-2xl py-4 font-bold text-white flex items-center justify-center gap-2 transition-all">
                        <span className="material-symbols-outlined">add</span>
                        Registrar Refeição
                    </button>
                ) : (
                    <div className="nutri-card rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white">Nova Refeição</h3>
                            <button onClick={() => { setShowForm(false); setAiResult(null); setPhotoPreview(null); }} className="text-white/30 hover:text-white/60">
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>

                        {/* Date selector */}
                        <div className="mb-4">
                            <label className="block text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider mb-2">Data da refeição</label>
                            <input type="date" value={mealDate} onChange={e => setMealDate(e.target.value)}
                                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all" />
                        </div>

                        {/* Meal type selector */}
                        <div className="mb-4">
                            <label className="block text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider mb-2">Tipo de refeição</label>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(MEAL_TYPES).map(([key, label]) => (
                                    <button key={key} onClick={() => setMealType(key)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mealType === key ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-white/30 border border-white/5'}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mode selector */}
                        <div className="mb-4">
                            <label className="block text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider mb-2">Como registrar?</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button onClick={() => setMode('diet_check')}
                                    className={`p-3 rounded-xl text-center transition-all ${mode === 'diet_check' ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-white/5 border border-white/5'}`}>
                                    <span className="material-symbols-outlined block mb-1" style={{ color: mode === 'diet_check' ? '#34d399' : 'rgba(255,255,255,0.2)' }}>check_circle</span>
                                    <p className={`text-[10px] font-bold ${mode === 'diet_check' ? 'text-emerald-400' : 'text-white/30'}`}>Seguiu dieta</p>
                                </button>
                                <button onClick={() => setMode('custom_text')}
                                    className={`p-3 rounded-xl text-center transition-all ${mode === 'custom_text' ? 'bg-blue-500/15 border border-blue-500/30' : 'bg-white/5 border border-white/5'}`}>
                                    <span className="material-symbols-outlined block mb-1" style={{ color: mode === 'custom_text' ? '#60a5fa' : 'rgba(255,255,255,0.2)' }}>edit</span>
                                    <p className={`text-[10px] font-bold ${mode === 'custom_text' ? 'text-blue-400' : 'text-white/30'}`}>Descrever</p>
                                </button>
                                <button onClick={() => setMode('photo')}
                                    className={`p-3 rounded-xl text-center transition-all ${mode === 'photo' ? 'bg-purple-500/15 border border-purple-500/30' : 'bg-white/5 border border-white/5'}`}>
                                    <span className="material-symbols-outlined block mb-1" style={{ color: mode === 'photo' ? '#a78bfa' : 'rgba(255,255,255,0.2)' }}>photo_camera</span>
                                    <p className={`text-[10px] font-bold ${mode === 'photo' ? 'text-purple-400' : 'text-white/30'}`}>Foto</p>
                                </button>
                            </div>
                        </div>

                        {/* Mode-specific content */}
                        {mode === 'diet_check' && (
                            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 mb-4">
                                {dietPlan.find(d => d.meal_type === mealType) ? (
                                    <div>
                                        <p className="text-xs text-emerald-400 font-semibold mb-1">Dieta prescrita:</p>
                                        <p className="text-sm text-white/80">{dietPlan.find(d => d.meal_type === mealType)?.description}</p>
                                        {dietPlan.find(d => d.meal_type === mealType)?.estimated_calories && (
                                            <p className="text-xs text-white/40 mt-1">~{dietPlan.find(d => d.meal_type === mealType)?.estimated_calories} kcal</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-xs text-white/30">Nenhuma dieta cadastrada para esta refeição. <button onClick={() => setShowDietEditor(true)} className="text-emerald-400 underline">Cadastrar</button></p>
                                )}
                            </div>
                        )}

                        {mode === 'custom_text' && (
                            <div className="mb-4">
                                <textarea value={description} onChange={e => setDescription(e.target.value)}
                                    placeholder="Descreva o que comeu... Ex: Arroz integral, frango grelhado, salada de alface e tomate"
                                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder:text-white/15 h-24 resize-none" />
                                {description && !aiResult && (
                                    <button onClick={handleAnalyze} disabled={analyzing}
                                        className="w-full mt-2 py-2.5 rounded-xl bg-blue-500/15 text-blue-400 text-sm font-bold border border-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                                        <span className="material-symbols-outlined text-sm">{analyzing ? 'hourglass_empty' : 'auto_awesome'}</span>
                                        {analyzing ? 'Analisando com IA...' : 'Estimar Calorias com IA'}
                                    </button>
                                )}
                            </div>
                        )}

                        {mode === 'photo' && (
                            <div className="mb-4">
                                <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} className="hidden" />
                                {!photoPreview ? (
                                    <button onClick={() => fileRef.current?.click()}
                                        className="w-full h-36 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:border-purple-500/30 transition-all">
                                        <span className="material-symbols-outlined text-2xl text-white/20">add_a_photo</span>
                                        <p className="text-xs text-white/20">Tirar foto ou selecionar da galeria</p>
                                    </button>
                                ) : (
                                    <div className="relative">
                                        <img src={photoPreview} alt="" className="w-full h-52 object-cover rounded-xl" />
                                        <button onClick={() => { setPhotoFile(null); setPhotoPreview(null); setAiResult(null); }}
                                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-white text-sm">close</span>
                                        </button>
                                    </div>
                                )}
                                {photoPreview && !aiResult && (
                                    <button onClick={handleAnalyze} disabled={analyzing}
                                        className="w-full mt-3 py-2.5 rounded-xl bg-purple-500/15 text-purple-400 text-sm font-bold border border-purple-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                                        <span className="material-symbols-outlined text-sm">{analyzing ? 'hourglass_empty' : 'auto_awesome'}</span>
                                        {analyzing ? 'Analisando foto com IA...' : 'Analisar Foto com IA'}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Satiety Selector */}
                        <div className="mb-4">
                            <label className="block text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider mb-2">Como se sentiu?</label>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(SATIETY_LEVELS).map(([key, data]) => (
                                    <button key={key} onClick={() => setSatiety(key)}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${satiety === key ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-white/5 text-white/30 border border-white/5 hover:bg-white/10'}`}>
                                        <span className="text-sm">{data.icon}</span>
                                        {data.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* AI Result */}
                        {aiResult && (
                            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/15 mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-blue-400 text-sm">auto_awesome</span>
                                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Análise IA</span>
                                </div>
                                <p className="text-2xl font-bold text-white mb-1">{aiResult.total_calories} <span className="text-sm text-white/40">kcal</span></p>
                                <p className="text-xs text-white/50">{aiResult.analysis}</p>
                                {aiResult.food_items && (
                                    <div className="mt-2 space-y-1">
                                        {aiResult.food_items.map((item, i) => (
                                            <div key={i} className="flex justify-between text-xs">
                                                <span className="text-white/60">{item.name}</span>
                                                <span className="text-white/40">{item.estimated_calories} kcal</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {aiResult.suggestions && (
                                    <p className="text-xs text-emerald-400/60 mt-2 pt-2 border-t border-white/5">💡 {aiResult.suggestions}</p>
                                )}
                            </div>
                        )}

                        <button onClick={handleSaveMeal} disabled={saving}
                            className="w-full nutri-btn py-3 rounded-xl font-bold text-white disabled:opacity-50 transition-all">
                            {saving ? 'Salvando...' : 'Salvar Refeição'}
                        </button>
                    </div>
                )}

                {/* Diet Plan Editor */}
                {showDietEditor && (
                    <div className="nutri-card rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-400 text-lg">menu_book</span>
                                Cadastrar Dieta
                            </h3>
                            <button onClick={() => setShowDietEditor(false)} className="text-white/30 hover:text-white/60">
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(MEAL_TYPES).map(([key, label]) => (
                                    <button key={key} onClick={() => setDietMealType(key)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${dietMealType === key ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/30'}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <textarea value={dietDesc} onChange={e => setDietDesc(e.target.value)} placeholder="O que o nutricionista prescreveu..."
                                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder:text-white/15 h-20 resize-none" />
                            <input type="number" value={dietCal} onChange={e => setDietCal(e.target.value)} placeholder="Calorias estimadas (opcional)"
                                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder:text-white/15" />
                            <button onClick={handleSaveDietItem} className="w-full py-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 font-bold text-sm border border-emerald-500/20 transition-all">
                                Salvar Item da Dieta
                            </button>
                        </div>
                        {/* Existing diet items */}
                        {dietPlan.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                                {dietPlan.map(item => (
                                    <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/3">
                                        <span className="material-symbols-outlined text-emerald-400/50 text-sm">{MEAL_ICONS[item.meal_type] || 'restaurant'}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-white/60">{MEAL_TYPES[item.meal_type]}</p>
                                            <p className="text-xs text-white/30 truncate">{item.description}</p>
                                        </div>
                                        <button onClick={() => nutriApi.deleteDietPlanItem(item.id).then(loadData)} className="text-red-400/40 hover:text-red-400">
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Diet Plan toggle */}
                {!showDietEditor && (
                    <button onClick={() => setShowDietEditor(true)}
                        className="w-full nutri-card rounded-2xl p-3.5 flex items-center gap-3 hover:border-emerald-500/20 transition-all active:scale-[0.98]">
                        <span className="material-symbols-outlined text-emerald-400/40">menu_book</span>
                        <span className="text-sm text-white/40 font-medium">Gerenciar Dieta Prescrita ({dietPlan.length} itens)</span>
                        <span className="material-symbols-outlined text-white/10 text-sm ml-auto">chevron_right</span>
                    </button>
                )}

                {/* Today's Meals List */}
                {meals.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-white/30 uppercase tracking-wider px-1">Hoje</h3>
                        {meals.map(meal => (
                            <div key={meal.id} className="nutri-card rounded-2xl p-4">
                                <div className="flex items-start gap-3">
                                    {meal.photo_url ? (
                                        <img src={meal.photo_url} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-white/15 text-2xl">{MEAL_ICONS[meal.meal_type] || 'restaurant'}</span>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="text-sm font-bold text-white">{MEAL_TYPES[meal.meal_type]}</p>
                                            {meal.followed_diet && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold">✓ Dieta</span>}
                                        </div>
                                        <p className="text-xs text-white/40 line-clamp-2">{meal.description}</p>
                                        {meal.ai_estimated_calories && (
                                            <p className="text-xs font-bold text-orange-400 mt-1">{meal.ai_estimated_calories} kcal</p>
                                        )}
                                        {meal.satiety && SATIETY_LEVELS[meal.satiety] && (
                                            <p className="text-[10px] text-white/40 mt-1 flex items-center gap-1">
                                                <span>{SATIETY_LEVELS[meal.satiety].icon}</span>
                                                {SATIETY_LEVELS[meal.satiety].label}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
