import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nutriApi, NutriWeightLog, NutriDailyLog, NutriMeal, MEAL_TYPES } from '../../lib/api-nutri';

export default function NutriDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [todayWeight, setTodayWeight] = useState<NutriWeightLog | null>(null);
    const [todayDaily, setTodayDaily] = useState<NutriDailyLog | null>(null);
    const [todayMeals, setTodayMeals] = useState<NutriMeal[]>([]);
    const [recentWeights, setRecentWeights] = useState<NutriWeightLog[]>([]);
    const [showWeighIn, setShowWeighIn] = useState(false);
    const [weightInput, setWeightInput] = useState('');
    const [savingWeight, setSavingWeight] = useState(false);

    // Daily log form
    const [showDailyForm, setShowDailyForm] = useState(false);
    const [waterMl, setWaterMl] = useState('');
    const [bedtime, setBedtime] = useState('');
    const [waketime, setWaketime] = useState('');
    const [energyLevel, setEnergyLevel] = useState(3);
    const [bowelMovement, setBowelMovement] = useState(3);
    const [dietFollowed, setDietFollowed] = useState(true);
    const [savingDaily, setSavingDaily] = useState(false);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        const today = new Date().toISOString().slice(0, 10);
        const [tw, td, tm, rw] = await Promise.all([
            nutriApi.getTodayWeight(),
            nutriApi.getTodayDailyLog(),
            nutriApi.getMealsForDate(today),
            nutriApi.getWeightLogs(7),
        ]);
        setTodayWeight(tw);
        setTodayDaily(td);
        setTodayMeals(tm);
        setRecentWeights(rw);
        if (td) {
            setWaterMl(td.water_ml?.toString() || '');
            setBedtime(td.sleep_bedtime?.slice(0, 5) || '');
            setWaketime(td.sleep_waketime?.slice(0, 5) || '');
            setEnergyLevel(td.energy_level || 3);
            setBowelMovement(td.bowel_movement || 3);
            setDietFollowed(td.diet_followed);
        }
        setLoading(false);
    };

    const handleSaveWeight = async () => {
        if (!weightInput) return;
        setSavingWeight(true);
        const ok = await nutriApi.saveWeight(parseFloat(weightInput));
        if (ok) { setShowWeighIn(false); setWeightInput(''); loadData(); }
        setSavingWeight(false);
    };

    const handleSaveDaily = async () => {
        setSavingDaily(true);
        await nutriApi.saveDailyLog({
            water_ml: waterMl ? parseInt(waterMl) : 0,
            sleep_bedtime: bedtime || null,
            sleep_waketime: waketime || null,
            energy_level: energyLevel,
            bowel_movement: bowelMovement,
            diet_followed: dietFollowed,
        });
        setShowDailyForm(false);
        loadData();
        setSavingDaily(false);
    };

    const greeting = new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite';
    const todayCalories = todayMeals.reduce((s, m) => s + (m.ai_estimated_calories || 0), 0);

    // Weight trend
    const weightDiff = recentWeights.length >= 2
        ? (recentWeights[0].weight - recentWeights[recentWeights.length - 1].weight)
        : 0;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col pb-28">
            {/* Header */}
            <header className="p-5 pt-10">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-emerald-400/60 text-xs font-bold uppercase tracking-wider">{greeting} 💪</p>
                        <h1 className="text-2xl font-bold text-white mt-1">Henrique</h1>
                    </div>
                    <button onClick={() => { localStorage.removeItem('nutri_auth'); navigate('/nutri/login'); }}
                        className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                        <span className="material-symbols-outlined text-white/30 text-lg">logout</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 px-5 space-y-4 animate-enter">
                {/* ===== PESAGEM MATINAL ===== */}
                {!todayWeight && !showWeighIn ? (
                    <button onClick={() => setShowWeighIn(true)}
                        className="w-full nutri-card rounded-2xl p-5 flex items-center gap-4 transition-all hover:border-emerald-500/30 active:scale-[0.98]">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #059669, #34d399)' }}>
                            <span className="material-symbols-outlined text-white text-3xl">scale</span>
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-bold text-white">Pesagem Matinal</p>
                            <p className="text-white/40 text-xs mt-0.5">Registre seu peso de hoje</p>
                        </div>
                        <span className="material-symbols-outlined text-emerald-400">add_circle</span>
                    </button>
                ) : showWeighIn ? (
                    <div className="nutri-card rounded-2xl p-5 nutri-glow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-400">scale</span>
                                <h2 className="font-bold text-white">Pesagem Matinal</h2>
                            </div>
                            <button onClick={() => setShowWeighIn(false)} className="text-white/30 hover:text-white/60">
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <input type="number" step="0.01" value={weightInput} onChange={e => setWeightInput(e.target.value)}
                                placeholder="Ex: 85.50"
                                className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xl font-bold text-center focus:outline-none focus:border-emerald-500/50 placeholder:text-white/15 transition-all" autoFocus />
                            <button onClick={handleSaveWeight} disabled={savingWeight || !weightInput}
                                className="nutri-btn px-6 rounded-xl font-bold text-white disabled:opacity-40 transition-all">
                                {savingWeight ? '...' : 'kg'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="nutri-card rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/10">
                                    <span className="material-symbols-outlined text-emerald-400">scale</span>
                                </div>
                                <div>
                                    <p className="text-xs text-white/40 font-semibold">Peso Hoje</p>
                                    <p className="text-2xl font-bold text-white">{todayWeight.weight}<span className="text-sm text-white/40 ml-1">kg</span></p>
                                </div>
                            </div>
                            {weightDiff !== 0 && (
                                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${weightDiff < 0 ? 'bg-emerald-500/15 text-emerald-400' : weightDiff > 0 ? 'bg-red-500/15 text-red-400' : 'bg-white/5 text-white/40'}`}>
                                    <span className="material-symbols-outlined text-sm">{weightDiff < 0 ? 'trending_down' : 'trending_up'}</span>
                                    {Math.abs(weightDiff).toFixed(1)}kg
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ===== RESUMO DE MÉTRICAS DO DIA ===== */}
                <div className="grid grid-cols-3 gap-3">
                    <MetricCard icon="water_drop" label="Água" value={todayDaily?.water_ml ? `${todayDaily.water_ml}ml` : '—'} color="#38bdf8" />
                    <MetricCard icon="bedtime" label="Sono" value={todayDaily?.sleep_hours ? `${Number(todayDaily.sleep_hours).toFixed(1)}h` : '—'} color="#a78bfa" />
                    <MetricCard icon="local_fire_department" label="Calorias" value={todayCalories > 0 ? `${todayCalories}` : '—'} color="#fb923c" />
                </div>

                {/* ===== REGISTRO DIÁRIO (fim do dia) ===== */}
                {!showDailyForm ? (
                    <button onClick={() => setShowDailyForm(true)}
                        className="w-full nutri-card rounded-2xl p-4 flex items-center gap-3 hover:border-emerald-500/20 transition-all active:scale-[0.98]">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-purple-400">edit_note</span>
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-semibold text-white text-sm">{todayDaily ? 'Atualizar Registro Diário' : 'Registrar Métricas do Dia'}</p>
                            <p className="text-white/30 text-xs">Água, sono, energia, intestino</p>
                        </div>
                        <span className="material-symbols-outlined text-white/20 text-sm">chevron_right</span>
                    </button>
                ) : (
                    <div className="nutri-card rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-400">edit_note</span>
                                Registro Diário
                            </h3>
                            <button onClick={() => setShowDailyForm(false)} className="text-white/30 hover:text-white/60">
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                        <div className="space-y-4">
                            {/* Water */}
                            <div>
                                <label className="block text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider mb-1.5">Água (ml)</label>
                                <input type="number" value={waterMl} onChange={e => setWaterMl(e.target.value)} placeholder="Ex: 2000"
                                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder:text-white/15" />
                            </div>
                            {/* Sleep */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider mb-1.5">Dormiu às</label>
                                    <input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider mb-1.5">Acordou às</label>
                                    <input type="time" value={waketime} onChange={e => setWaketime(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
                                </div>
                            </div>
                            {/* Energy */}
                            <div>
                                <label className="block text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider mb-1.5">Energia</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <button key={n} onClick={() => setEnergyLevel(n)}
                                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${n <= energyLevel ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-white/20 border border-white/5'}`}>
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Bowel */}
                            <div>
                                <label className="block text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider mb-1.5">Funcionamento Intestinal</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <button key={n} onClick={() => setBowelMovement(n)}
                                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${n <= bowelMovement ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'bg-white/5 text-white/20 border border-white/5'}`}>
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Diet */}
                            <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
                                <span className="text-sm font-semibold text-white/70">Seguiu a dieta?</span>
                                <div onClick={() => setDietFollowed(!dietFollowed)} className={`w-12 h-7 rounded-full flex items-center transition-all cursor-pointer ${dietFollowed ? 'bg-emerald-500 justify-end' : 'bg-white/10 justify-start'}`}>
                                    <div className="w-5 h-5 rounded-full bg-white mx-1 shadow transition-all" />
                                </div>
                            </label>
                            <button onClick={handleSaveDaily} disabled={savingDaily}
                                className="w-full nutri-btn py-3 rounded-xl font-bold text-white disabled:opacity-50 transition-all">
                                {savingDaily ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ===== REFEIÇÕES DE HOJE ===== */}
                <div className="nutri-card rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-orange-400 text-lg">restaurant</span>
                            Refeições Hoje
                        </h3>
                        <button onClick={() => navigate('/nutri/meals')} className="text-emerald-400 text-xs font-bold">
                            Ver todas →
                        </button>
                    </div>
                    {todayMeals.length > 0 ? (
                        <div className="space-y-2">
                            {todayMeals.map(meal => (
                                <div key={meal.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/3 border border-white/5">
                                    {meal.photo_url ? (
                                        <img src={meal.photo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-white/30 text-sm">restaurant</span>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-white/80 truncate">{MEAL_TYPES[meal.meal_type]}</p>
                                        <p className="text-xs text-white/30 truncate">{meal.description || (meal.followed_diet ? '✓ Seguiu a dieta' : 'Refeição livre')}</p>
                                    </div>
                                    {meal.ai_estimated_calories && (
                                        <span className="text-xs font-bold text-orange-400">{meal.ai_estimated_calories} kcal</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-white/20 text-center py-3">Nenhuma refeição registrada hoje.</p>
                    )}
                </div>

                {/* ===== MINI GRÁFICO DE PESO ===== */}
                {recentWeights.length >= 2 && (
                    <button onClick={() => navigate('/nutri/analytics')} className="w-full nutri-card rounded-2xl p-5 text-left hover:border-emerald-500/20 transition-all active:scale-[0.98]">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-400 text-lg">show_chart</span>
                                Evolução do Peso
                            </h3>
                            <span className="material-symbols-outlined text-white/20 text-sm">chevron_right</span>
                        </div>
                        <MiniWeightChart weights={[...recentWeights].reverse()} />
                    </button>
                )}
            </main>
        </div>
    );
}

function MetricCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
    return (
        <div className="nutri-card rounded-2xl p-3.5 text-center">
            <span className="material-symbols-outlined text-lg block mb-1" style={{ color }}>{icon}</span>
            <p className="text-lg font-bold text-white">{value}</p>
            <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mt-0.5">{label}</p>
        </div>
    );
}

function MiniWeightChart({ weights }: { weights: NutriWeightLog[] }) {
    if (weights.length < 2) return null;
    const values = weights.map(w => w.weight);
    const min = Math.min(...values) - 0.5;
    const max = Math.max(...values) + 0.5;
    const range = max - min || 1;
    const h = 60;
    const w = 100;

    const points = values.map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16" preserveAspectRatio="none">
            <defs>
                <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={`0,${h} ${points} ${w},${h}`} fill="url(#wg)" />
            <polyline points={points} fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
