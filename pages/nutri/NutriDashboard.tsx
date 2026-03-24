import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nutriApi, NutriWeightLog, NutriDailyLog, NutriMeal, NutriHydrationLog, MEAL_TYPES, DRINK_TYPES, DRINK_COLORS, BOWEL_TYPES } from '../../lib/api-nutri';

export default function NutriDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [todayWeight, setTodayWeight] = useState<NutriWeightLog | null>(null);
    const [todayDaily, setTodayDaily] = useState<NutriDailyLog | null>(null);
    const [todayMeals, setTodayMeals] = useState<NutriMeal[]>([]);
    const [todayHydration, setTodayHydration] = useState<NutriHydrationLog[]>([]);
    const [recentWeights, setRecentWeights] = useState<NutriWeightLog[]>([]);

    // Weight form
    const [showWeighIn, setShowWeighIn] = useState(false);
    const [weightDate, setWeightDate] = useState(new Date().toISOString().slice(0, 10));
    const [weightTime, setWeightTime] = useState(new Date().toTimeString().slice(0, 5));
    const [weightInput, setWeightInput] = useState('');
    const [savingWeight, setSavingWeight] = useState(false);

    // Daily log form
    const [showDailyForm, setShowDailyForm] = useState(false);
    const [dailyDate, setDailyDate] = useState(new Date().toISOString().slice(0, 10));
    const [sleepDateBedtime, setSleepDateBedtime] = useState(new Date().toISOString().slice(0, 10));
    const [bedtime, setBedtime] = useState('');
    const [sleepDateWaketime, setSleepDateWaketime] = useState(new Date().toISOString().slice(0, 10));
    const [waketime, setWaketime] = useState('');
    const [energyLevel, setEnergyLevel] = useState(3);
    const [bowelOccurred, setBowelOccurred] = useState(false);
    const [bowelType, setBowelType] = useState('');
    const [bowelNotes, setBowelNotes] = useState('');
    const [dietFollowed, setDietFollowed] = useState(true);
    const [savingDaily, setSavingDaily] = useState(false);

    // Hydration quick-add
    const [showHydration, setShowHydration] = useState(false);
    const [hydDate, setHydDate] = useState(new Date().toISOString().slice(0, 10));
    const [hydTime, setHydTime] = useState(new Date().toTimeString().slice(0, 5));
    const [hydDrinkType, setHydDrinkType] = useState('water');
    const [hydAmount, setHydAmount] = useState('');
    const [hydNotes, setHydNotes] = useState('');
    const [savingHyd, setSavingHyd] = useState(false);

    const today = new Date().toISOString().slice(0, 10);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        const [tw, td, tm, rw, th] = await Promise.all([
            nutriApi.getTodayWeight(),
            nutriApi.getTodayDailyLog(),
            nutriApi.getMealsForDate(today),
            nutriApi.getWeightLogs(7),
            nutriApi.getHydrationForDate(today),
        ]);
        setTodayWeight(tw);
        setTodayDaily(td);
        setTodayMeals(tm);
        setRecentWeights(rw);
        setTodayHydration(th);
        if (td) {
            setSleepDateBedtime(td.sleep_date_bedtime || new Date().toISOString().slice(0, 10));
            setBedtime(td.sleep_bedtime?.slice(0, 5) || '');
            setSleepDateWaketime(td.sleep_date_waketime || new Date().toISOString().slice(0, 10));
            setWaketime(td.sleep_waketime?.slice(0, 5) || '');
            setEnergyLevel(td.energy_level || 3);
            setBowelOccurred(td.bowel_occurred || false);
            setBowelType(td.bowel_type || '');
            setBowelNotes(td.bowel_notes || '');
            setDietFollowed(td.diet_followed);
        }
        setLoading(false);
    };

    const handleSaveWeight = async () => {
        if (!weightInput) return;
        setSavingWeight(true);
        const ok = await nutriApi.saveWeight(weightDate, weightTime + ':00', parseFloat(weightInput));
        if (ok) { setShowWeighIn(false); setWeightInput(''); loadData(); }
        setSavingWeight(false);
    };

    const handleSaveDaily = async () => {
        setSavingDaily(true);
        await nutriApi.saveDailyLog({
            date: dailyDate,
            sleep_bedtime: bedtime || null,
            sleep_waketime: waketime || null,
            sleep_date_bedtime: sleepDateBedtime || null,
            sleep_date_waketime: sleepDateWaketime || null,
            energy_level: energyLevel,
            bowel_occurred: bowelOccurred,
            bowel_type: bowelOccurred && bowelType ? bowelType : null,
            bowel_notes: bowelOccurred && bowelNotes ? bowelNotes : null,
            diet_followed: dietFollowed,
        } as any);
        setShowDailyForm(false);
        loadData();
        setSavingDaily(false);
    };

    const handleSaveHydration = async () => {
        if (!hydAmount) return;
        setSavingHyd(true);
        await nutriApi.saveHydration({
            date: hydDate,
            time: hydTime + ':00',
            drink_type: hydDrinkType,
            amount_ml: parseInt(hydAmount),
            notes: hydNotes || null,
        });
        setShowHydration(false);
        setHydAmount('');
        setHydNotes('');
        setHydDrinkType('water');
        loadData();
        setSavingHyd(false);
    };

    const greeting = new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite';
    const todayCalories = todayMeals.reduce((s, m) => s + (m.ai_estimated_calories || 0), 0);
    const totalHydrationMl = todayHydration.reduce((s, h) => s + h.amount_ml, 0);
    const totalWaterMl = todayHydration.filter(h => h.drink_type === 'water').reduce((s, h) => s + h.amount_ml, 0);

    // Weight trend
    const weightDiff = recentWeights.length >= 2
        ? (recentWeights[0].weight - recentWeights[recentWeights.length - 1].weight)
        : 0;

    // Energy colors
    const energyColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

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
                {/* ===== PESAGEM ===== */}
                {!showWeighIn ? (
                    <button onClick={() => { setShowWeighIn(true); setWeightDate(today); setWeightTime(new Date().toTimeString().slice(0, 5)); }}
                        className="w-full nutri-card rounded-2xl p-5 flex items-center gap-4 transition-all hover:border-emerald-500/30 active:scale-[0.98]">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #059669, #34d399)' }}>
                            <span className="material-symbols-outlined text-white text-3xl">scale</span>
                        </div>
                        <div className="flex-1 text-left">
                            {todayWeight ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        <p className="text-2xl font-bold text-white">{todayWeight.weight}<span className="text-sm text-white/40 ml-1">kg</span></p>
                                        {weightDiff !== 0 && (
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${weightDiff < 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                                                {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-white/30 text-xs">Toque para novo registro</p>
                                </>
                            ) : (
                                <>
                                    <p className="font-bold text-white">Registrar Pesagem</p>
                                    <p className="text-white/40 text-xs mt-0.5">Data, hora e peso</p>
                                </>
                            )}
                        </div>
                        <span className="material-symbols-outlined text-emerald-400">add_circle</span>
                    </button>
                ) : (
                    <div className="nutri-card rounded-2xl p-5 nutri-glow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-400">scale</span>
                                <h2 className="font-bold text-white">Registrar Pesagem</h2>
                            </div>
                            <button onClick={() => setShowWeighIn(false)} className="text-white/30 hover:text-white/60">
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                        <div className="space-y-3">
                            {/* Date & Time */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider mb-1.5">Data</label>
                                    <input type="date" value={weightDate} onChange={e => setWeightDate(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider mb-1.5">Hora</label>
                                    <input type="time" value={weightTime} onChange={e => setWeightTime(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all" />
                                </div>
                            </div>
                            {/* Weight */}
                            <div>
                                <label className="block text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider mb-1.5">Peso (kg)</label>
                                <div className="flex gap-3">
                                    <input type="number" step="0.01" value={weightInput} onChange={e => setWeightInput(e.target.value)}
                                        placeholder="Ex: 85.50"
                                        className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xl font-bold text-center focus:outline-none focus:border-emerald-500/50 placeholder:text-white/15 transition-all" autoFocus />
                                    <button onClick={handleSaveWeight} disabled={savingWeight || !weightInput}
                                        className="nutri-btn px-6 rounded-xl font-bold text-white disabled:opacity-40 transition-all">
                                        {savingWeight ? '...' : 'Salvar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== RESUMO DO DIA ===== */}
                <div className="grid grid-cols-3 gap-3">
                    <MetricCard icon="water_drop" label="Líquidos" value={totalHydrationMl > 0 ? `${totalHydrationMl}ml` : '—'} color="#38bdf8" />
                    <MetricCard icon="bedtime" label="Sono" value={todayDaily?.sleep_hours ? `${Number(todayDaily.sleep_hours).toFixed(1)}h` : '—'} color="#a78bfa" />
                    <MetricCard icon="local_fire_department" label="Calorias" value={todayCalories > 0 ? `${todayCalories}` : '—'} color="#fb923c" />
                </div>

                {/* ===== HIDRATAÇÃO ===== */}
                {!showHydration ? (
                    <button onClick={() => { setShowHydration(true); setHydDate(today); setHydTime(new Date().toTimeString().slice(0, 5)); }}
                        className="w-full nutri-card rounded-2xl p-4 flex items-center gap-3 hover:border-sky-500/20 transition-all active:scale-[0.98]">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-sky-400">water_drop</span>
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-semibold text-white text-sm">Registrar Líquido</p>
                            <p className="text-white/30 text-xs">
                                {todayHydration.length > 0 ? `${todayHydration.length} registro(s) hoje • ${totalHydrationMl}ml total` : 'Água, eletrólitos, sucos...'}
                            </p>
                        </div>
                        <span className="material-symbols-outlined text-sky-400">add_circle</span>
                    </button>
                ) : (
                    <div className="nutri-card rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-sky-400">water_drop</span>
                                Registrar Líquido
                            </h3>
                            <button onClick={() => setShowHydration(false)} className="text-white/30 hover:text-white/60">
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                        <div className="space-y-3">
                            {/* Date & Time */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-sky-400/70 uppercase tracking-wider mb-1.5">Data</label>
                                    <input type="date" value={hydDate} onChange={e => setHydDate(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-sky-500/50 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-sky-400/70 uppercase tracking-wider mb-1.5">Hora</label>
                                    <input type="time" value={hydTime} onChange={e => setHydTime(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-sky-500/50 transition-all" />
                                </div>
                            </div>
                            {/* Drink Type */}
                            <div>
                                <label className="block text-[10px] font-bold text-sky-400/70 uppercase tracking-wider mb-2">Tipo</label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(DRINK_TYPES).map(([key, label]) => (
                                        <button key={key} onClick={() => setHydDrinkType(key)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${hydDrinkType === key ? 'border' : 'bg-white/5 text-white/30 border border-white/5'}`}
                                            style={hydDrinkType === key ? { background: `${DRINK_COLORS[key]}15`, color: DRINK_COLORS[key], borderColor: `${DRINK_COLORS[key]}40` } : {}}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Amount */}
                            <div>
                                <label className="block text-[10px] font-bold text-sky-400/70 uppercase tracking-wider mb-1.5">Quantidade (ml)</label>
                                <div className="flex gap-2 mb-2">
                                    {[200, 300, 500, 750].map(ml => (
                                        <button key={ml} onClick={() => setHydAmount(ml.toString())}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${hydAmount === ml.toString() ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' : 'bg-white/5 text-white/20 border border-white/5'}`}>
                                            {ml}ml
                                        </button>
                                    ))}
                                </div>
                                <input type="number" value={hydAmount} onChange={e => setHydAmount(e.target.value)} placeholder="Ou digite a quantidade..."
                                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-sky-500/50 placeholder:text-white/15" />
                            </div>
                            {/* Notes */}
                            <input type="text" value={hydNotes} onChange={e => setHydNotes(e.target.value)} placeholder="Observação (opcional)"
                                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-sky-500/50 placeholder:text-white/15" />
                            <button onClick={handleSaveHydration} disabled={savingHyd || !hydAmount}
                                className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-50 transition-all" style={{ background: 'linear-gradient(135deg, #0284c7, #38bdf8)', boxShadow: '0 4px 20px rgba(56,189,248,0.2)' }}>
                                {savingHyd ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                        {/* Today's hydration list */}
                        {todayHydration.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5">
                                {todayHydration.map(h => (
                                    <div key={h.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/3">
                                        <div className="w-2 h-2 rounded-full" style={{ background: DRINK_COLORS[h.drink_type] || '#94a3b8' }} />
                                        <span className="text-xs font-semibold text-white/70 flex-1">
                                            {h.time && <span className="text-white/40 mr-1">{h.time.slice(0, 5)}</span>}
                                            {DRINK_TYPES[h.drink_type]} — {h.amount_ml}ml
                                        </span>
                                        {h.notes && <span className="text-[10px] text-white/30">{h.notes}</span>}
                                        <button onClick={async () => { await nutriApi.deleteHydration(h.id); loadData(); }} className="text-red-400/30 hover:text-red-400">
                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ===== REGISTRO DIÁRIO ===== */}
                {!showDailyForm ? (
                    <button onClick={() => { setShowDailyForm(true); setDailyDate(today); }}
                        className="w-full nutri-card rounded-2xl p-4 flex items-center gap-3 hover:border-emerald-500/20 transition-all active:scale-[0.98]">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-purple-400">edit_note</span>
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-semibold text-white text-sm">{todayDaily ? 'Atualizar Registro Diário' : 'Registrar Dia'}</p>
                            <p className="text-white/30 text-xs">Sono, energia, intestino, dieta</p>
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
                            {/* Daily Log Date */}
                            <div>
                                <label className="block text-[10px] font-bold text-purple-400/70 uppercase tracking-wider mb-2">Data do Registro</label>
                                <input type="date" value={dailyDate} onChange={e => setDailyDate(e.target.value)}
                                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500/50" />
                            </div>

                            {/* Sleep with dates */}
                            <div>
                                <label className="block text-[10px] font-bold text-purple-400/70 uppercase tracking-wider mb-2">Sono</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] text-white/30 mb-1">Data que dormiu</label>
                                        <input type="date" value={sleepDateBedtime} onChange={e => setSleepDateBedtime(e.target.value)}
                                            className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500/50" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-white/30 mb-1">Hora que dormiu</label>
                                        <input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)}
                                            className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500/50" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-white/30 mb-1">Data que acordou</label>
                                        <input type="date" value={sleepDateWaketime} onChange={e => setSleepDateWaketime(e.target.value)}
                                            className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500/50" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-white/30 mb-1">Hora que acordou</label>
                                        <input type="time" value={waketime} onChange={e => setWaketime(e.target.value)}
                                            className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500/50" />
                                    </div>
                                </div>
                            </div>

                            {/* Energy with gradient colors */}
                            <div>
                                <label className="block text-[10px] font-bold text-purple-400/70 uppercase tracking-wider mb-2">Nível de Energia</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <button key={n} onClick={() => setEnergyLevel(n)}
                                            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border"
                                            style={{
                                                background: n <= energyLevel ? `${energyColors[n]}20` : 'rgba(255,255,255,0.03)',
                                                color: n <= energyLevel ? energyColors[n] : 'rgba(255,255,255,0.15)',
                                                borderColor: n <= energyLevel ? `${energyColors[n]}40` : 'rgba(255,255,255,0.05)',
                                            }}>
                                            {n}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-1.5 px-1">
                                    <span className="text-[9px] text-red-400/50">Sem energia</span>
                                    <span className="text-[9px] text-emerald-400/50">Muito bem</span>
                                </div>
                            </div>

                            {/* Bowel Movement */}
                            <div>
                                <label className="block text-[10px] font-bold text-purple-400/70 uppercase tracking-wider mb-2">Funcionamento Intestinal</label>
                                {/* Did it happen? */}
                                <div className="flex items-center gap-3 mb-3">
                                    <label className="flex items-center gap-2 cursor-pointer flex-1 p-2.5 rounded-xl bg-white/5 border border-white/5">
                                        <div onClick={() => setBowelOccurred(!bowelOccurred)}
                                            className={`w-12 h-7 rounded-full flex items-center transition-all cursor-pointer ${bowelOccurred ? 'bg-teal-500 justify-end' : 'bg-white/10 justify-start'}`}>
                                            <div className="w-5 h-5 rounded-full bg-white mx-1 shadow transition-all" />
                                        </div>
                                        <span className="text-sm text-white/70">{bowelOccurred ? 'Foi ao banheiro' : 'Não foi ao banheiro'}</span>
                                    </label>
                                </div>
                                {/* Type selector */}
                                {bowelOccurred && (
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-3 gap-2">
                                            {Object.entries(BOWEL_TYPES).map(([key, data]) => (
                                                <button key={key} onClick={() => setBowelType(key)}
                                                    className={`p-2.5 rounded-xl text-center transition-all border ${bowelType === key ? 'bg-teal-500/10 border-teal-500/30' : 'bg-white/3 border-white/5'}`}>
                                                    <span className="text-lg block">{data.icon}</span>
                                                    <p className={`text-[10px] font-bold mt-1 ${bowelType === key ? 'text-teal-400' : 'text-white/30'}`}>{data.label}</p>
                                                </button>
                                            ))}
                                        </div>
                                        <input type="text" value={bowelNotes} onChange={e => setBowelNotes(e.target.value)}
                                            placeholder="Observação (opcional)"
                                            className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-teal-500/50 placeholder:text-white/15" />
                                    </div>
                                )}
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
