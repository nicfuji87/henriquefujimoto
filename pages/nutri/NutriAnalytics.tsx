import React, { useEffect, useState, useMemo } from 'react';
import { nutriApi, NutriWeightLog, NutriDailyLog, NutriMeal, NutriDietPlan, NutriHydrationLog, DRINK_TYPES, DRINK_COLORS } from '../../lib/api-nutri';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

export default function NutriAnalytics() {
    const [weights, setWeights] = useState<NutriWeightLog[]>([]);
    const [dailyLogs, setDailyLogs] = useState<NutriDailyLog[]>([]);
    const [meals, setMeals] = useState<NutriMeal[]>([]);
    const [dietPlan, setDietPlan] = useState<NutriDietPlan[]>([]);
    const [hydration, setHydration] = useState<NutriHydrationLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<7 | 14 | 30>(14);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        const [w, dl, m, dp, h] = await Promise.all([
            nutriApi.getWeightLogs(60),
            nutriApi.getDailyLogs(60),
            nutriApi.getRecentMeals(200),
            nutriApi.getDietPlan(),
            nutriApi.getRecentHydration(300),
        ]);
        setWeights(w);
        setDailyLogs(dl);
        setMeals(m);
        setDietPlan(dp);
        setHydration(h);
        setLoading(false);
    };

    // Filter by period
    const cutoff = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - period);
        return d.toISOString().slice(0, 10);
    }, [period]);

    const filteredWeights = useMemo(() => weights.filter(w => w.date >= cutoff).reverse(), [weights, cutoff]);
    const filteredDaily = useMemo(() => dailyLogs.filter(d => d.date >= cutoff).reverse(), [dailyLogs, cutoff]);

    // Weight chart data
    const weightChartData = filteredWeights.map(w => ({
        date: `${new Date(w.date + 'T12:00:00').getDate()}/${new Date(w.date + 'T12:00:00').getMonth() + 1}`,
        peso: w.weight,
    }));

    // Hydration per day from nutri_hydration_logs
    const hydrationPerDay: Record<string, { total: number; byType: Record<string, number> }> = {};
    hydration.filter(h => h.date >= cutoff).forEach(h => {
        if (!hydrationPerDay[h.date]) hydrationPerDay[h.date] = { total: 0, byType: {} };
        hydrationPerDay[h.date].total += h.amount_ml;
        hydrationPerDay[h.date].byType[h.drink_type] = (hydrationPerDay[h.date].byType[h.drink_type] || 0) + h.amount_ml;
    });
    const hydrationChartData = Object.entries(hydrationPerDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => ({
            date: `${new Date(date + 'T12:00:00').getDate()}/${new Date(date + 'T12:00:00').getMonth() + 1}`,
            total: data.total,
            water: data.byType['water'] || 0,
            electrolyte: data.byType['electrolyte'] || 0,
            other: data.total - (data.byType['water'] || 0) - (data.byType['electrolyte'] || 0),
        }));

    // Sleep chart data
    const sleepChartData = filteredDaily.filter(d => d.sleep_hours).map(d => ({
        date: `${new Date(d.date + 'T12:00:00').getDate()}/${new Date(d.date + 'T12:00:00').getMonth() + 1}`,
        horas: Number(d.sleep_hours),
    }));

    // Energy chart data with colors
    const energyColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
    const energyChartData = filteredDaily.filter(d => d.energy_level).map(d => ({
        date: `${new Date(d.date + 'T12:00:00').getDate()}/${new Date(d.date + 'T12:00:00').getMonth() + 1}`,
        energia: d.energy_level!,
        color: energyColors[Math.min((d.energy_level || 1) - 1, 4)],
    }));

    // Bowel chart: count per type over period
    const bowelCounts: Record<string, number> = {};
    let bowelDays = 0;
    let noBowelDays = 0;
    filteredDaily.forEach(d => {
        if (d.bowel_occurred) {
            bowelDays++;
            if (d.bowel_type) bowelCounts[d.bowel_type] = (bowelCounts[d.bowel_type] || 0) + 1;
        } else {
            noBowelDays++;
        }
    });

    // Calories chart data (per day)
    const prescribedTotal = dietPlan.reduce((s, d) => s + (d.estimated_calories || 0), 0);
    const caloriesPerDay: Record<string, number> = {};
    meals.filter(m => m.date >= cutoff).forEach(m => {
        caloriesPerDay[m.date] = (caloriesPerDay[m.date] || 0) + (m.ai_estimated_calories || 0);
    });
    const calorieChartData = Object.entries(caloriesPerDay).sort(([a], [b]) => a.localeCompare(b)).map(([date, cal]) => ({
        date: `${new Date(date + 'T12:00:00').getDate()}/${new Date(date + 'T12:00:00').getMonth() + 1}`,
        ingerido: cal,
        prescrito: prescribedTotal,
    }));

    // Stats
    const avgWeight = filteredWeights.length > 0 ? (filteredWeights.reduce((s, w) => s + w.weight, 0) / filteredWeights.length).toFixed(1) : '—';
    const avgHydration = Object.values(hydrationPerDay).length > 0 ? Math.round(Object.values(hydrationPerDay).reduce((s, d) => s + d.total, 0) / Object.values(hydrationPerDay).length) : 0;
    const avgSleep = filteredDaily.filter(d => d.sleep_hours).length > 0 ? (filteredDaily.filter(d => d.sleep_hours).reduce((s, d) => s + Number(d.sleep_hours || 0), 0) / filteredDaily.filter(d => d.sleep_hours).length).toFixed(1) : '—';

    const tooltipStyle = {
        contentStyle: { background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '8px 12px', fontSize: '12px', color: '#fff' },
        labelStyle: { color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginBottom: '4px' },
    };

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
                <h1 className="text-xl font-bold text-white">Evolução</h1>
                <p className="text-white/30 text-xs mt-1">Acompanhe todos os seus indicadores</p>
            </header>

            <main className="flex-1 px-5 space-y-4 animate-enter">
                {/* Period selector */}
                <div className="flex gap-2">
                    {([7, 14, 30] as const).map(p => (
                        <button key={p} onClick={() => setPeriod(p)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${period === p ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-white/30 border border-white/5'}`}>
                            {p}d
                        </button>
                    ))}
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="nutri-card rounded-2xl p-3 text-center">
                        <p className="text-lg font-bold text-emerald-400">{avgWeight}</p>
                        <p className="text-[9px] text-white/30 font-bold uppercase mt-0.5">Peso Médio</p>
                    </div>
                    <div className="nutri-card rounded-2xl p-3 text-center">
                        <p className="text-lg font-bold text-sky-400">{avgHydration}ml</p>
                        <p className="text-[9px] text-white/30 font-bold uppercase mt-0.5">Líquidos/Dia</p>
                    </div>
                    <div className="nutri-card rounded-2xl p-3 text-center">
                        <p className="text-lg font-bold text-purple-400">{avgSleep}h</p>
                        <p className="text-[9px] text-white/30 font-bold uppercase mt-0.5">Sono Médio</p>
                    </div>
                </div>

                {/* Weight Chart */}
                <ChartCard title="Peso" icon="scale" iconColor="#34d399" isEmpty={weightChartData.length < 2} emptyMsg="Registre pelo menos 2 pesagens">
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={weightChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)' }} dy={8} />
                            <YAxis domain={['dataMin - 1', 'dataMax + 1']} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)' }} dx={-5} />
                            <Tooltip {...tooltipStyle} />
                            <Line type="monotone" dataKey="peso" stroke="#34d399" strokeWidth={2.5} dot={{ r: 3, fill: '#34d399', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Hydration Chart - stacked by type */}
                <ChartCard title="Hidratação" icon="water_drop" iconColor="#38bdf8" isEmpty={hydrationChartData.length < 1} emptyMsg="Registre a hidratação">
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={hydrationChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)' }} dy={8} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)' }} dx={-5} />
                            <Tooltip {...tooltipStyle} />
                            <ReferenceLine y={2000} stroke="rgba(56,189,248,0.3)" strokeDasharray="4 4" label={{ value: '2L', position: 'right', fill: 'rgba(56,189,248,0.4)', fontSize: 10 }} />
                            <Bar dataKey="water" stackId="a" fill="#38bdf8" radius={[0, 0, 0, 0]} opacity={0.8} name="Água" />
                            <Bar dataKey="electrolyte" stackId="a" fill="#34d399" radius={[0, 0, 0, 0]} opacity={0.8} name="Eletrólito" />
                            <Bar dataKey="other" stackId="a" fill="#a78bfa" radius={[4, 4, 0, 0]} opacity={0.6} name="Outros" />
                        </BarChart>
                    </ResponsiveContainer>
                    {/* Legend */}
                    <div className="flex gap-4 mt-2 px-2">
                        <span className="flex items-center gap-1 text-[10px] text-white/40"><span className="w-2 h-2 rounded-full bg-sky-400 inline-block" /> Água</span>
                        <span className="flex items-center gap-1 text-[10px] text-white/40"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Eletrólito</span>
                        <span className="flex items-center gap-1 text-[10px] text-white/40"><span className="w-2 h-2 rounded-full bg-purple-400 inline-block" /> Outros</span>
                    </div>
                </ChartCard>

                {/* Sleep Chart */}
                <ChartCard title="Sono" icon="bedtime" iconColor="#a78bfa" isEmpty={sleepChartData.length < 2} emptyMsg="Registre as horas de sono">
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={sleepChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)' }} dy={8} />
                            <YAxis domain={[0, 12]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)' }} dx={-5} />
                            <Tooltip {...tooltipStyle} />
                            <ReferenceLine y={8} stroke="rgba(167,139,250,0.3)" strokeDasharray="4 4" label={{ value: '8h', position: 'right', fill: 'rgba(167,139,250,0.4)', fontSize: 10 }} />
                            <Bar dataKey="horas" fill="#a78bfa" radius={[4, 4, 0, 0]} opacity={0.7} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Energy Chart with coloured bars */}
                <ChartCard title="Nível de Energia" icon="bolt" iconColor="#fbbf24" isEmpty={energyChartData.length < 2} emptyMsg="Registre seu nível de energia">
                    <ResponsiveContainer width="100%" height={140}>
                        <BarChart data={energyChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)' }} dy={8} />
                            <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)' }} dx={-5} />
                            <Tooltip {...tooltipStyle} />
                            <Bar dataKey="energia" radius={[4, 4, 0, 0]}>
                                {energyChartData.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} opacity={0.8} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-between mt-1 px-2">
                        <span className="text-[9px] text-red-400/50">Baixa</span>
                        <span className="text-[9px] text-emerald-400/50">Alta</span>
                    </div>
                </ChartCard>

                {/* Bowel Overview */}
                {filteredDaily.length > 0 && (
                    <div className="nutri-card rounded-2xl p-5">
                        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-teal-400">monitoring</span>
                            Funcionamento Intestinal
                        </h3>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="bg-white/3 rounded-xl p-3 text-center">
                                <p className="text-xl font-bold text-teal-400">{bowelDays}</p>
                                <p className="text-[10px] text-white/30 font-bold uppercase">Dias OK</p>
                            </div>
                            <div className="bg-white/3 rounded-xl p-3 text-center">
                                <p className="text-xl font-bold text-orange-400">{noBowelDays}</p>
                                <p className="text-[10px] text-white/30 font-bold uppercase">Não foi</p>
                            </div>
                        </div>
                        {Object.keys(bowelCounts).length > 0 && (
                            <div className="space-y-1.5">
                                {Object.entries(bowelCounts).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
                                    const data = { normal: { icon: '✅', label: 'Normal' }, bolinha: { icon: '🔴', label: 'Bolinha' }, pastoso: { icon: '🟡', label: 'Pastoso' }, liquido: { icon: '🟠', label: 'Líquido' }, ressecado: { icon: '🟤', label: 'Ressecado' }, misto: { icon: '🔵', label: 'Misto' } }[type] || { icon: '⚪', label: type };
                                    const pct = bowelDays > 0 ? (count / bowelDays) * 100 : 0;
                                    return (
                                        <div key={type} className="flex items-center gap-2">
                                            <span className="text-sm">{data.icon}</span>
                                            <span className="text-xs text-white/60 w-20">{data.label}</span>
                                            <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                                                <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="text-[10px] text-white/30 w-6 text-right">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Calories: Prescribed vs Ingested */}
                <ChartCard title="Calorias: Prescrito × Ingerido" icon="local_fire_department" iconColor="#fb923c" isEmpty={calorieChartData.length < 1} emptyMsg="Registre refeições com análise da IA">
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={calorieChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)' }} dy={8} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)' }} dx={-5} />
                            <Tooltip {...tooltipStyle} />
                            {prescribedTotal > 0 && (
                                <ReferenceLine y={prescribedTotal} stroke="rgba(251,146,60,0.4)" strokeDasharray="4 4" label={{ value: 'Meta', position: 'right', fill: 'rgba(251,146,60,0.5)', fontSize: 10 }} />
                            )}
                            <Bar dataKey="ingerido" fill="#fb923c" radius={[4, 4, 0, 0]} opacity={0.8} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </main>
        </div>
    );
}

function ChartCard({ title, icon, iconColor, isEmpty, emptyMsg, children }: {
    title: string; icon: string; iconColor: string; isEmpty: boolean; emptyMsg: string; children: React.ReactNode;
}) {
    return (
        <div className="nutri-card rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg" style={{ color: iconColor }}>{icon}</span>
                {title}
            </h3>
            {isEmpty ? (
                <div className="h-24 flex flex-col items-center justify-center text-center">
                    <span className="material-symbols-outlined text-white/10 text-2xl mb-1">show_chart</span>
                    <p className="text-xs text-white/20">{emptyMsg}</p>
                </div>
            ) : (
                <div className="-ml-2">{children}</div>
            )}
        </div>
    );
}
