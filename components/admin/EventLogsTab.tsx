import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    Calendar,
    Filter,
    MousePointerClick,
    TrendingUp,
    Zap,
    RefreshCw,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface EventLog {
    id: string;
    tracking_event_id: string | null;
    event_name: string;
    source_type: 'product' | 'card';
    source_id: string | null;
    source_label: string | null;
    triggered_at: string;
    referrer: string | null;
    user_agent: string | null;
}

type PresetPeriod = '7' | '30' | '60' | '90' | 'custom';

function getDateRange(preset: PresetPeriod, customFrom?: string, customTo?: string): { from: string; to: string } {
    const now = new Date();
    const to = now.toISOString();

    if (preset === 'custom' && customFrom && customTo) {
        return { from: new Date(customFrom).toISOString(), to: new Date(customTo + 'T23:59:59').toISOString() };
    }

    const days = parseInt(preset) || 30;
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
    return { from, to };
}

export default function EventLogsTab() {
    const [logs, setLogs] = useState<EventLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<PresetPeriod>('30');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [filterEvent, setFilterEvent] = useState('');
    const [filterSource, setFilterSource] = useState<'' | 'product' | 'card'>('');

    useEffect(() => {
        fetchLogs();
    }, [period, customFrom, customTo]);

    async function fetchLogs() {
        setLoading(true);
        try {
            const { from, to } = getDateRange(period, customFrom, customTo);
            let query = supabase
                .from('tracking_event_logs')
                .select('*')
                .gte('triggered_at', from)
                .lte('triggered_at', to)
                .order('triggered_at', { ascending: false })
                .limit(1000);

            const { data, error } = await query;
            if (error) throw error;
            setLogs(data || []);
        } catch (err) {
            console.error('Error fetching event logs:', err);
        } finally {
            setLoading(false);
        }
    }

    // Filtered logs
    const filteredLogs = useMemo(() => {
        let result = logs;
        if (filterEvent) {
            result = result.filter(l => l.event_name.toLowerCase().includes(filterEvent.toLowerCase()));
        }
        if (filterSource) {
            result = result.filter(l => l.source_type === filterSource);
        }
        return result;
    }, [logs, filterEvent, filterSource]);

    // Stats
    const stats = useMemo(() => {
        const total = filteredLogs.length;
        const products = filteredLogs.filter(l => l.source_type === 'product').length;
        const cards = filteredLogs.filter(l => l.source_type === 'card').length;
        const uniqueEvents = new Set(filteredLogs.map(l => l.event_name)).size;

        // Events by name
        const byEvent: Record<string, { count: number; products: number; cards: number }> = {};
        filteredLogs.forEach(l => {
            if (!byEvent[l.event_name]) byEvent[l.event_name] = { count: 0, products: 0, cards: 0 };
            byEvent[l.event_name].count++;
            if (l.source_type === 'product') byEvent[l.event_name].products++;
            if (l.source_type === 'card') byEvent[l.event_name].cards++;
        });
        const topEvents = Object.entries(byEvent)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.count - a.count);

        // Events by day for chart
        const byDay: Record<string, number> = {};
        filteredLogs.forEach(l => {
            const day = l.triggered_at.split('T')[0];
            byDay[day] = (byDay[day] || 0) + 1;
        });
        const dailyData = Object.entries(byDay)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // Top sources
        const bySource: Record<string, { label: string; type: string; count: number }> = {};
        filteredLogs.forEach(l => {
            const key = `${l.source_type}:${l.source_id || 'unknown'}`;
            if (!bySource[key]) bySource[key] = { label: l.source_label || l.source_id || 'Desconhecido', type: l.source_type, count: 0 };
            bySource[key].count++;
        });
        const topSources = Object.values(bySource).sort((a, b) => b.count - a.count).slice(0, 10);

        // Hourly distribution
        const byHour: number[] = new Array(24).fill(0);
        filteredLogs.forEach(l => {
            const hour = new Date(l.triggered_at).getHours();
            byHour[hour]++;
        });

        return { total, products, cards, uniqueEvents, topEvents, dailyData, topSources, byHour };
    }, [filteredLogs]);

    const periodLabels: Record<PresetPeriod, string> = {
        '7': '7 dias',
        '30': '30 dias',
        '60': '60 dias',
        '90': '90 dias',
        'custom': 'Personalizado',
    };

    // Chart dimensions
    const chartW = 700;
    const chartH = 140;
    const pad = { top: 20, right: 15, bottom: 30, left: 45 };
    const innerW = chartW - pad.left - pad.right;
    const innerH = chartH - pad.top - pad.bottom;

    let chartPath = '';
    let chartArea = '';
    let chartDots: { x: number; y: number; count: number; date: string }[] = [];
    if (stats.dailyData.length > 1) {
        const maxVal = Math.max(...stats.dailyData.map(d => d.count), 1);
        chartDots = stats.dailyData.map((d, i) => ({
            x: pad.left + (i / (stats.dailyData.length - 1)) * innerW,
            y: pad.top + innerH - (d.count / maxVal) * innerH,
            count: d.count,
            date: d.date,
        }));
        chartPath = chartDots.map((d, i) => `${i === 0 ? 'M' : 'L'} ${d.x} ${d.y}`).join(' ');
        chartArea = chartPath + ` L ${chartDots[chartDots.length - 1].x} ${pad.top + innerH} L ${chartDots[0].x} ${pad.top + innerH} Z`;
    }

    // Hourly chart
    const maxHourVal = Math.max(...stats.byHour, 1);

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-purple-400" />
                        Eventos Trackeados
                    </h2>
                    <p className="text-sm text-zinc-400 mt-1">
                        Analise todos os eventos disparados no site
                    </p>
                </div>
                <button
                    onClick={fetchLogs}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-300 hover:text-white hover:border-zinc-600 transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                </button>
            </div>

            {/* Period Filters */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Período:</span>
                    {(['7', '30', '60', '90', 'custom'] as PresetPeriod[]).map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:text-white hover:border-zinc-600'
                                }`}
                        >
                            {periodLabels[p]}
                        </button>
                    ))}
                </div>

                {/* Custom date inputs */}
                {period === 'custom' && (
                    <div className="flex flex-wrap items-center gap-3 mt-3 pl-6">
                        <div>
                            <label className="block text-[10px] text-zinc-500 mb-1">De</label>
                            <input
                                type="date"
                                value={customFrom}
                                onChange={e => setCustomFrom(e.target.value)}
                                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-zinc-500 mb-1">Até</label>
                            <input
                                type="date"
                                value={customTo}
                                onChange={e => setCustomTo(e.target.value)}
                                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>
                )}

                {/* Extra filters */}
                <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-zinc-800/50">
                    <Filter className="w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        value={filterEvent}
                        onChange={e => setFilterEvent(e.target.value)}
                        placeholder="Filtrar por nome do evento..."
                        className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 w-64"
                    />
                    <select
                        value={filterSource}
                        onChange={e => setFilterSource(e.target.value as any)}
                        className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500/50"
                    >
                        <option value="">Todos os tipos</option>
                        <option value="product">Produtos</option>
                        <option value="card">Cards</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-4 h-4 text-purple-400" />
                                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Eventos</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.total}</p>
                            <p className="text-xs text-zinc-500 mt-1">nos últimos {periodLabels[period]}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                            className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <MousePointerClick className="w-4 h-4 text-blue-400" />
                                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Produtos</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.products}</p>
                            <p className="text-xs text-zinc-500 mt-1">cliques em produtos</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <ArrowUpRight className="w-4 h-4 text-green-400" />
                                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Cards</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.cards}</p>
                            <p className="text-xs text-zinc-500 mt-1">cliques em cards</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                            className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-amber-400" />
                                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Eventos Únicos</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.uniqueEvents}</p>
                            <p className="text-xs text-zinc-500 mt-1">tipos diferentes</p>
                        </motion.div>
                    </div>

                    {/* Daily Chart */}
                    {stats.dailyData.length > 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6"
                        >
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-purple-400" />
                                Eventos por Dia
                            </h3>
                            <div className="w-full overflow-x-auto">
                                <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                                    <defs>
                                        <linearGradient id="eventAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    {/* Grid */}
                                    {[0, 0.25, 0.5, 0.75, 1].map(pct => (
                                        <line key={pct}
                                            x1={pad.left} y1={pad.top + innerH * (1 - pct)}
                                            x2={pad.left + innerW} y2={pad.top + innerH * (1 - pct)}
                                            stroke="#27272a" strokeWidth="0.5"
                                        />
                                    ))}
                                    <path d={chartArea} fill="url(#eventAreaGrad)" />
                                    <path d={chartPath} fill="none" stroke="#a855f7" strokeWidth="2" strokeLinejoin="round" />
                                    {chartDots.map((d, i) => (
                                        <g key={i}>
                                            <circle cx={d.x} cy={d.y} r="3" fill="#a855f7" stroke="#09090b" strokeWidth="1.5" />
                                            {(i === 0 || i === chartDots.length - 1 || i % Math.max(1, Math.floor(chartDots.length / 8)) === 0) && (
                                                <>
                                                    <text x={d.x} y={d.y - 10} textAnchor="middle" fill="#a1a1aa" fontSize="9" fontWeight="bold">
                                                        {d.count}
                                                    </text>
                                                    <text x={d.x} y={pad.top + innerH + 16} textAnchor="middle" fill="#71717a" fontSize="7">
                                                        {new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                                    </text>
                                                </>
                                            )}
                                        </g>
                                    ))}
                                </svg>
                            </div>
                        </motion.div>
                    )}

                    {/* Two columns: Top Events + Hourly Distribution */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Events Table */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                            className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6"
                        >
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-400" />
                                Top Eventos
                            </h3>
                            {stats.topEvents.length === 0 ? (
                                <p className="text-sm text-zinc-500">Nenhum evento registrado neste período.</p>
                            ) : (
                                <div className="space-y-3">
                                    {stats.topEvents.slice(0, 10).map((ev, i) => {
                                        const pct = (ev.count / stats.total) * 100;
                                        return (
                                            <div key={ev.name} className="group">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                                            i === 1 ? 'bg-zinc-400/20 text-zinc-300' :
                                                                i === 2 ? 'bg-amber-700/20 text-amber-600' :
                                                                    'bg-zinc-800 text-zinc-500'
                                                            }`}>{i + 1}</span>
                                                        <span className="text-sm font-medium text-white truncate max-w-[200px]" title={ev.name}>{ev.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs text-blue-400" title="Produtos">🛒 {ev.products}</span>
                                                        <span className="text-xs text-green-400" title="Cards">🃏 {ev.cards}</span>
                                                        <span className="text-sm font-bold text-purple-400">{ev.count}</span>
                                                    </div>
                                                </div>
                                                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-purple-500 to-violet-400 rounded-full transition-all"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>

                        {/* Hourly Distribution */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6"
                        >
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-cyan-400" />
                                Distribuição por Horário
                            </h3>
                            <div className="flex items-end gap-[3px] h-28">
                                {stats.byHour.map((count, hour) => (
                                    <div key={hour} className="flex-1 flex flex-col items-center gap-1 group" title={`${hour}h: ${count} eventos`}>
                                        <div
                                            className="w-full rounded-t bg-gradient-to-t from-cyan-600 to-cyan-400 transition-all group-hover:from-cyan-500 group-hover:to-cyan-300 relative"
                                            style={{ height: `${Math.max(2, (count / maxHourVal) * 100)}%` }}
                                        >
                                            {count > 0 && (
                                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] text-cyan-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {count}
                                                </span>
                                            )}
                                        </div>
                                        {hour % 3 === 0 && (
                                            <span className="text-[8px] text-zinc-600">{hour}h</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Top Sources */}
                    {stats.topSources.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                            className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6"
                        >
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <MousePointerClick className="w-5 h-5 text-blue-400" />
                                Top Origens (Produtos / Cards)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {stats.topSources.map((s, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-zinc-800/30 rounded-xl p-3 hover:bg-zinc-800/50 transition-colors">
                                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                            i === 1 ? 'bg-zinc-400/20 text-zinc-300' :
                                                i === 2 ? 'bg-amber-700/20 text-amber-600' :
                                                    'bg-zinc-800 text-zinc-500'
                                            }`}>{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{s.label}</p>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${s.type === 'product' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                                                {s.type === 'product' ? 'Produto' : 'Card'}
                                            </span>
                                        </div>
                                        <span className="text-lg font-bold text-white">{s.count}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Recent Events Timeline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6"
                    >
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-zinc-400" />
                            Últimos Eventos
                            <span className="text-xs font-normal text-zinc-500 ml-2">({filteredLogs.length} total)</span>
                        </h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                            {filteredLogs.slice(0, 50).map(log => (
                                <div key={log.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-800/20 hover:bg-zinc-800/40 transition-colors">
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.source_type === 'product' ? 'bg-blue-400' : 'bg-green-400'}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white truncate">{log.event_name}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${log.source_type === 'product' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                                                {log.source_type === 'product' ? 'Produto' : 'Card'}
                                            </span>
                                        </div>
                                        {log.source_label && (
                                            <p className="text-xs text-zinc-500 truncate">{log.source_label}</p>
                                        )}
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-xs text-zinc-400">
                                            {new Date(log.triggered_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                        </p>
                                        <p className="text-[10px] text-zinc-600">
                                            {new Date(log.triggered_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {filteredLogs.length === 0 && (
                                <div className="text-center py-10">
                                    <BarChart3 className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                                    <p className="text-sm text-zinc-500">Nenhum evento encontrado neste período.</p>
                                    <p className="text-xs text-zinc-600 mt-1">Os eventos aparecem aqui quando usuários interagem com produtos e cards.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
}
