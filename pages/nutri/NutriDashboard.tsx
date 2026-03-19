import React, { useEffect, useState } from 'react';
import { fetchNutriLogs, insertNutriLog, NutriLog } from '../../lib/api-nutri';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function NutriDashboard() {
    const [logs, setLogs] = useState<NutriLog[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Form states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
    const [weight, setWeight] = useState('');
    const [waterCups, setWaterCups] = useState('0'); // 1 cup ~ 250ml
    const [sleepHours, setSleepHours] = useState('');
    const [energyLevel, setEnergyLevel] = useState('3');
    const [bowelMovement, setBowelMovement] = useState('3');
    const [dietFollowed, setDietFollowed] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await fetchNutriLogs();
        setLogs(data);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!weight) return;

        setIsSaving(true);
        const success = await insertNutriLog({
            date,
            time,
            weight: parseFloat(weight),
            water_ml: parseInt(waterCups) * 250,
            sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
            sleep_quality: null,
            energy_level: parseInt(energyLevel),
            diet_followed: dietFollowed,
            bowel_movement: parseInt(bowelMovement),
            notes: null
        });

        if (success) {
            setIsFormOpen(false);
            setWeight('');
            setWaterCups('0');
            setSleepHours('');
            loadData();
        } else {
            alert('Erro ao salvar registro de nutrição.');
        }
        setIsSaving(false);
    };

    // Prepare chart data (chronological order)
    const chartData = [...logs].reverse().map(log => {
        const d = new Date(log.date);
        return {
            name: `${d.getDate()}/${d.getMonth() + 1}`,
            peso: log.weight
        };
    });

    return (
        <div className="flex-1 pb-24 overflow-y-auto bg-slate-50">
            {/* Header */}
            <header className="bg-emerald-600 text-white p-6 pt-10 rounded-b-[2rem] shadow-md">
                <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-3xl">nutrition</span>
                    <h1 className="text-2xl font-bold">Diário Nutricional</h1>
                </div>
                <p className="text-emerald-100 text-sm">Acompanhe seu peso e rotina diária.</p>
            </header>

            <main className="p-4 space-y-6 mt-2 relative z-10">
                {/* CTA / Form Toggle */}
                {!isFormOpen ? (
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="w-full bg-white border border-slate-200 shadow-sm text-emerald-600 font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95"
                    >
                        <span className="material-symbols-outlined">add_circle</span>
                        Novo Registro Hoje
                    </button>
                ) : (
                    <div className="bg-white p-5 rounded-3xl shadow-lg border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-slate-800">Novo Registro</h2>
                            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Data</label>
                                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Hora</label>
                                    <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500" required />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Peso (kg) *</label>
                                <input type="number" step="0.01" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Ex: 85.50" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-medium outline-none focus:border-emerald-500" required />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Água (copos)</label>
                                    <input type="number" value={waterCups} onChange={e => setWaterCups(e.target.value)} min="0" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Sono (horas)</label>
                                    <input type="number" step="0.5" value={sleepHours} onChange={e => setSleepHours(e.target.value)} min="0" max="24" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500" />
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100">
                                <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer">
                                    <span className="text-sm font-semibold text-slate-700">Seguiu a dieta hoje?</span>
                                    <input type="checkbox" checked={dietFollowed} onChange={e => setDietFollowed(e.target.checked)} className="w-5 h-5 accent-emerald-500 rounded" />
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isSaving ? 'Salvando...' : 'Salvar Registro'}
                                <span className="material-symbols-outlined text-sm">check</span>
                            </button>
                        </form>
                    </div>
                )}

                {/* Grafico de Evolução */}
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-500">trending_down</span>
                        Evolução do Peso
                    </h3>
                    
                    {loading ? (
                        <div className="animate-pulse h-48 bg-slate-100 rounded-xl w-full"></div>
                    ) : logs.length >= 2 ? (
                        <div className="h-56 -ml-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dx="-10" />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '8px 12px' }}
                                        labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                                    />
                                    <Line type="monotone" dataKey="peso" stroke="#059669" strokeWidth={3} dot={{ r: 4, fill: '#059669', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-32 flex flex-col items-center justify-center text-center px-4 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                            <span className="material-symbols-outlined text-slate-300 mb-1 text-3xl">show_chart</span>
                            <p className="text-sm text-slate-500">Adicione pelo menos 2 registros para ver o gráfico de evolução.</p>
                        </div>
                    )}
                </div>

                {/* Histórico Recente */}
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-500">history</span>
                        Últimos Registros
                    </h3>
                    
                    {loading ? (
                        <div className="space-y-3">
                            <div className="animate-pulse h-12 bg-slate-100 rounded-xl w-full"></div>
                            <div className="animate-pulse h-12 bg-slate-100 rounded-xl w-full"></div>
                        </div>
                    ) : logs.length > 0 ? (
                        <div className="space-y-3">
                            {logs.slice(0, 5).map(log => {
                                const logDate = new Date(log.date);
                                const isToday = logDate.toDateString() === new Date().toDateString();
                                const dateLabel = isToday ? 'Hoje' : `${logDate.getDate().toString().padStart(2, '0')}/${(logDate.getMonth() + 1).toString().padStart(2, '0')}`;
                                
                                return (
                                    <div key={log.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                <span className="material-symbols-outlined text-lg">scale</span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800 text-sm">{dateLabel} <span className="text-slate-400 font-normal text-xs ml-1">{log.time.slice(0, 5)}</span></p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {!log.diet_followed && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-100 text-red-700">Fora da dieta</span>}
                                                    {log.diet_followed && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Na dieta</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-emerald-600 text-lg">{log.weight}<span className="text-xs text-emerald-500/70 font-medium ml-0.5">kg</span></p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-4">Nenhum registro encontrado.</p>
                    )}
                </div>
            </main>
        </div>
    );
}
