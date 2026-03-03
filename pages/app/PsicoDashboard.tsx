import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { appApi, AppTraining, AppGym } from '../../lib/api-app';
import {
    LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';

const COLORS = ['#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899', '#10b981', '#f97316'];

type DateFilter = 'mes_atual' | 'mes_anterior' | 'custom' | 'all';

export default function PsicoDashboard() {
    const navigate = useNavigate();
    const [trainings, setTrainings] = useState<AppTraining[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState<DateFilter>('all');
    const [modalityFilter, setModalityFilter] = useState<string>('Todos');
    const [activeTab, setActiveTab] = useState<'overview' | 'emotional' | 'physical' | 'mental' | 'registros'>('overview');
    const [gymFilter, setGymFilter] = useState<string>('Todas');
    const [gyms, setGyms] = useState<AppGym[]>([]);
    const [customDateStart, setCustomDateStart] = useState('');
    const [customDateEnd, setCustomDateEnd] = useState('');
    const dashRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const auth = localStorage.getItem('psico_auth');
        if (auth !== 'true') {
            navigate('/app/psico/login');
            return;
        }

        async function load() {
            try {
                const [data, gymsList] = await Promise.all([
                    appApi.getTrainings(100),
                    appApi.getGyms()
                ]);
                setTrainings(data);
                setGyms(gymsList);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [navigate]);

    const filteredTrainings = useMemo(() => {
        let data = [...trainings];

        // Date filter (use training_date if available)
        if (dateFilter !== 'all') {
            const now = new Date();
            let startDate: Date;
            let endDate: Date;

            if (dateFilter === 'mes_atual') {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            } else if (dateFilter === 'mes_anterior') {
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
            } else if (dateFilter === 'custom' && customDateStart && customDateEnd) {
                startDate = new Date(customDateStart + 'T00:00:00');
                endDate = new Date(customDateEnd + 'T23:59:59');
            } else {
                startDate = new Date(0);
                endDate = new Date();
            }

            data = data.filter(t => {
                const dateStr = t.training_date || (t.created_at ? t.created_at.slice(0, 10) : '');
                if (!dateStr) return false;
                const d = new Date(dateStr + 'T12:00:00');
                return d >= startDate && d <= endDate;
            });
        }

        // Modality filter
        if (modalityFilter !== 'Todos') {
            data = data.filter(t => t.modality === modalityFilter);
        }

        // Gym filter
        if (gymFilter !== 'Todas') {
            data = data.filter(t => t.gym_name === gymFilter);
        }

        return data.sort((a, b) => {
            const dateA = a.training_date || (a.created_at ? a.created_at.slice(0, 10) : '');
            const dateB = b.training_date || (b.created_at ? b.created_at.slice(0, 10) : '');
            return new Date(dateA + 'T12:00:00').getTime() - new Date(dateB + 'T12:00:00').getTime();
        });
    }, [trainings, dateFilter, modalityFilter, gymFilter, customDateStart, customDateEnd]);

    // === Computed Metrics ===
    const avgRating = filteredTrainings.length > 0
        ? (filteredTrainings.reduce((s, t) => s + (t.rating || 0), 0) / filteredTrainings.length).toFixed(1) : '0';
    const avgFocus = filteredTrainings.filter(t => t.focus_level != null).length > 0
        ? (filteredTrainings.filter(t => t.focus_level != null).reduce((s, t) => s + (t.focus_level || 0), 0) / filteredTrainings.filter(t => t.focus_level != null).length).toFixed(1) : '0';
    const avgFatigue = filteredTrainings.filter(t => t.fatigue_level != null).length > 0
        ? (filteredTrainings.filter(t => t.fatigue_level != null).reduce((s, t) => s + (t.fatigue_level || 0), 0) / filteredTrainings.filter(t => t.fatigue_level != null).length).toFixed(1) : '0';
    const avgEmotionIntensity = filteredTrainings.filter(t => t.emotion_intensity != null).length > 0
        ? (filteredTrainings.filter(t => t.emotion_intensity != null).reduce((s, t) => s + (t.emotion_intensity || 0), 0) / filteredTrainings.filter(t => t.emotion_intensity != null).length).toFixed(1) : '0';

    // Timeline data (use training_date)
    const timelineData = filteredTrainings.map(t => {
        const displayDate = t.training_date || (t.created_at ? t.created_at.slice(0, 10) : '');
        return {
            date: displayDate ? new Date(displayDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '',
            Nota: t.rating || 0,
            Foco: t.focus_level || 0,
            Cansaco: t.fatigue_level || 0,
            Energia: t.energy_level || 0,
            Dor: t.pain_level || 0,
            'Int. Emocional': t.emotion_intensity || 0
        };
    });

    // Emotion frequency
    const emotionFreq: Record<string, number> = {};
    filteredTrainings.forEach(t => {
        (t.emotions || []).forEach(e => {
            emotionFreq[e] = (emotionFreq[e] || 0) + 1;
        });
    });
    const emotionPieData = Object.entries(emotionFreq)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }));

    // Distraction frequency
    const distractionFreq: Record<string, number> = {};
    filteredTrainings.forEach(t => {
        (t.distractions || []).forEach(d => {
            distractionFreq[d] = (distractionFreq[d] || 0) + 1;
        });
    });
    const distractionData = Object.entries(distractionFreq)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }));

    // Pain area frequency
    const painFreq: Record<string, number> = {};
    filteredTrainings.forEach(t => {
        (t.pain_areas || []).forEach(p => {
            painFreq[p] = (painFreq[p] || 0) + 1;
        });
    });
    const painData = Object.entries(painFreq)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }));

    // Radar data for avg metrics
    const radarData = [
        { metric: 'Nota', value: parseFloat(avgRating) },
        { metric: 'Foco', value: parseFloat(avgFocus) },
        { metric: 'Energia', value: filteredTrainings.filter(t => t.energy_level != null).length > 0 ? +(filteredTrainings.filter(t => t.energy_level != null).reduce((s, t) => s + (t.energy_level || 0), 0) / filteredTrainings.filter(t => t.energy_level != null).length).toFixed(1) : 0 },
        { metric: 'Int. Emocional', value: parseFloat(avgEmotionIntensity) },
        { metric: 'Cansaço', value: parseFloat(avgFatigue) },
    ];

    // Training type distribution
    const typeFreq: Record<string, number> = {};
    filteredTrainings.forEach(t => {
        const type = t.training_type || 'Outro';
        typeFreq[type] = (typeFreq[type] || 0) + 1;
    });
    const typeData = Object.entries(typeFreq).map(([name, value]) => ({ name, value }));

    // Competition stats
    const competitions = filteredTrainings.filter(t => t.is_competition);
    const totalWins = competitions.reduce((s, t) => s + (t.competition_wins || 0), 0);
    const totalLosses = competitions.reduce((s, t) => s + (t.competition_losses || 0), 0);

    // Gym intensity data
    const gymStatsData = useMemo(() => {
        const gymMap: Record<string, { count: number; totalFatigue: number; totalRating: number; totalPain: number }> = {};
        filteredTrainings.forEach(t => {
            const gym = t.gym_name || 'Sem academia';
            if (!gymMap[gym]) gymMap[gym] = { count: 0, totalFatigue: 0, totalRating: 0, totalPain: 0 };
            gymMap[gym].count++;
            gymMap[gym].totalFatigue += t.fatigue_level || 0;
            gymMap[gym].totalRating += t.rating || 0;
            gymMap[gym].totalPain += t.pain_level || 0;
        });
        return Object.entries(gymMap).map(([name, stats]) => ({
            name,
            Cansaco: +(stats.totalFatigue / stats.count).toFixed(1),
            Nota: +(stats.totalRating / stats.count).toFixed(1),
            Dor: +(stats.totalPain / stats.count).toFixed(1),
            treinos: stats.count,
        }));
    }, [filteredTrainings]);

    // Export PDF
    const handleExportPDF = async () => {
        try {
            const jsPDFModule = await import('jspdf');
            const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
            const autoTableModule = await import('jspdf-autotable');
            const autoTable = autoTableModule.default || autoTableModule.applyPlugin;

            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();

            // If autoTable is a function (standalone usage), use it; otherwise it attached to prototype
            const runAutoTable = (options: any) => {
                if (typeof autoTable === 'function') {
                    autoTable(doc, options);
                } else if (typeof (doc as any).autoTable === 'function') {
                    (doc as any).autoTable(options);
                }
            };

            const getLastY = (): number => {
                return (doc as any).lastAutoTable?.finalY || (doc as any).previousAutoTable?.finalY || 80;
            };

            // Header
            doc.setFillColor(20, 184, 166);
            doc.rect(0, 0, pageWidth, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.text('Relatório Psicológico - Henrique Fujimoto', 14, 18);
            doc.setFontSize(10);
            const periodLabel = dateFilter === 'all' ? 'Todos' : dateFilter === 'mes_atual' ? 'Mês Atual' : dateFilter === 'mes_anterior' ? 'Mês Anterior' : `${customDateStart} a ${customDateEnd}`;
            doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} | Período: ${periodLabel}`, 14, 28);
            doc.text(`Total de registros: ${filteredTrainings.length}`, 14, 35);

            // Summary
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(14);
            doc.text('Resumo Geral', 14, 52);

            runAutoTable({
                startY: 56,
                head: [['Métrica', 'Valor Médio']],
                body: [
                    ['Nota Geral', `${avgRating}/10`],
                    ['Nível de Foco', `${avgFocus}/10`],
                    ['Cansaço', `${avgFatigue}/10`],
                    ['Intensidade Emocional', `${avgEmotionIntensity}/10`],
                    ['Total Treinos', `${filteredTrainings.filter(t => !t.is_competition).length}`],
                    ['Total Competições', `${competitions.length}`],
                    ['Vitórias', `${totalWins}`],
                    ['Derrotas', `${totalLosses}`],
                ],
                theme: 'striped',
                headStyles: { fillColor: [20, 184, 166] },
            });

            // Emotions
            let y = getLastY() + 12;
            doc.setFontSize(14);
            doc.text('Emoções Mais Frequentes', 14, y);

            runAutoTable({
                startY: y + 4,
                head: [['Emoção', 'Frequência']],
                body: emotionPieData.map(e => [e.name, e.value.toString()]),
                theme: 'striped',
                headStyles: { fillColor: [20, 184, 166] },
            });

            // Distractions
            y = getLastY() + 12;
            if (y > 250) { doc.addPage(); y = 20; }
            doc.setFontSize(14);
            doc.text('Distrações Identificadas', 14, y);

            runAutoTable({
                startY: y + 4,
                head: [['Distração', 'Frequência']],
                body: distractionData.map(d => [d.name, d.value.toString()]),
                theme: 'striped',
                headStyles: { fillColor: [20, 184, 166] },
            });

            // Pain Areas
            y = getLastY() + 12;
            if (y > 250) { doc.addPage(); y = 20; }
            doc.setFontSize(14);
            doc.text('Áreas de Dor Relatadas', 14, y);

            runAutoTable({
                startY: y + 4,
                head: [['Área', 'Frequência']],
                body: painData.map(p => [p.name, p.value.toString()]),
                theme: 'striped',
                headStyles: { fillColor: [20, 184, 166] },
            });

            // All trainings
            doc.addPage();
            doc.setFontSize(14);
            doc.text('Histórico Detalhado', 14, 20);

            runAutoTable({
                startY: 26,
                head: [['Data', 'Academia', 'Modalidade', 'Tipo', 'Nota', 'Foco', 'Cansaço', 'Dor', 'Emoções']],
                body: filteredTrainings.map(t => {
                    const displayDate = t.training_date || (t.created_at ? t.created_at.slice(0, 10) : '');
                    return [
                        displayDate ? new Date(displayDate + 'T12:00:00').toLocaleDateString('pt-BR') : '-',
                        t.gym_name || '-',
                        t.modality,
                        t.training_type || '-',
                        t.rating?.toString() || '-',
                        t.focus_level?.toString() || '-',
                        t.fatigue_level?.toString() || '-',
                        t.pain_level?.toString() || '-',
                        (t.emotions || []).join(', ') || '-'
                    ];
                }),
                theme: 'striped',
                headStyles: { fillColor: [20, 184, 166] },
                styles: { fontSize: 7 },
            });

            // Reflections
            doc.addPage();
            doc.setFontSize(14);
            doc.text('Reflexões e Aprendizados', 14, 20);

            runAutoTable({
                startY: 26,
                head: [['Data', 'Reflexão', 'Aprendizado', 'Contexto Emocional']],
                body: filteredTrainings.map(t => [
                    new Date(t.created_at || '').toLocaleDateString('pt-BR'),
                    t.reflection || '-',
                    t.learned_today || '-',
                    t.emotion_context || '-'
                ]),
                theme: 'striped',
                headStyles: { fillColor: [20, 184, 166] },
                styles: { fontSize: 8, cellWidth: 'wrap' },
                columnStyles: {
                    1: { cellWidth: 50 },
                    2: { cellWidth: 50 },
                    3: { cellWidth: 50 },
                }
            });

            doc.save(`relatorio-psico-henrique-${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (err) {
            console.error('Erro ao gerar PDF:', err);
            alert('Erro ao gerar o PDF. Verifique o console para detalhes.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('psico_auth');
        navigate('/app/psico/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-teal-500 text-5xl">progress_activity</span>
            </div>
        );
    }

    const StatCard = ({ icon, label, value, color, sub }: { icon: string; label: string; value: string; color: string; sub?: string }) => (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <span className="material-symbols-outlined text-white text-xl">{icon}</span>
                </div>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
    );

    const ChartCard = ({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) => (
        <div className={`bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden ${className}`}>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-500 text-lg">analytics</span>
                {title}
            </h3>
            {children}
        </div>
    );

    const tabs = [
        { id: 'overview' as const, label: 'Visão Geral', icon: 'dashboard' },
        { id: 'emotional' as const, label: 'Emocional', icon: 'mood' },
        { id: 'physical' as const, label: 'Físico', icon: 'fitness_center' },
        { id: 'mental' as const, label: 'Mental', icon: 'psychology' },
        { id: 'registros' as const, label: 'Registros', icon: 'format_list_bulleted' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans overflow-x-hidden" ref={dashRef}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet" />

            {/* Top Bar */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-xl">psychology</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Painel Psicológico</h1>
                                <p className="text-xs text-slate-500">Atleta: Henrique Fujimoto</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleExportPDF}
                                className="hidden sm:flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                            >
                                <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                                Exportar PDF
                            </button>
                            <button
                                onClick={handleExportPDF}
                                className="sm:hidden flex items-center justify-center w-10 h-10 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-semibold transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center w-10 h-10 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-500"
                            >
                                <span className="material-symbols-outlined text-xl">logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400 text-lg">calendar_today</span>
                            <span className="text-sm font-semibold text-slate-500">Período:</span>
                        </div>
                        {(['mes_atual', 'mes_anterior', 'custom', 'all'] as DateFilter[]).map(f => (
                            <button
                                key={f}
                                onClick={() => setDateFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${dateFilter === f
                                    ? 'bg-teal-500 text-white shadow-sm'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                {f === 'mes_atual' ? 'Mês Atual' : f === 'mes_anterior' ? 'Mês Anterior' : f === 'custom' ? 'Personalizado' : 'Tudo'}
                            </button>
                        ))}

                        {dateFilter === 'custom' && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={customDateStart}
                                    onChange={e => setCustomDateStart(e.target.value)}
                                    className="px-2 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                />
                                <span className="text-xs text-slate-400">até</span>
                                <input
                                    type="date"
                                    value={customDateEnd}
                                    onChange={e => setCustomDateEnd(e.target.value)}
                                    className="px-2 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                        )}

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400 text-lg">sports_martial_arts</span>
                        </div>
                        {['Todos', 'Judô', 'Jiu-Jitsu'].map(m => (
                            <button
                                key={m}
                                onClick={() => setModalityFilter(m)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${modalityFilter === m
                                    ? 'bg-teal-500 text-white shadow-sm'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                {m}
                            </button>
                        ))}
                        {gyms.length > 0 && (
                            <>
                                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400 text-lg">location_on</span>
                                </div>
                                <select
                                    value={gymFilter}
                                    onChange={e => setGymFilter(e.target.value)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-0 focus:ring-2 focus:ring-teal-500 cursor-pointer"
                                >
                                    <option value="Todas">Todas Academias</option>
                                    {gyms.map(g => (
                                        <option key={g.id} value={g.name}>{g.name}</option>
                                    ))}
                                </select>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="flex gap-0 overflow-x-auto psico-tabs-scroll">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap shrink-0 ${activeTab === tab.id
                                    ? 'border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-900/20'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-base sm:text-lg">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    {/* Scroll fade indicator */}
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-slate-800 to-transparent pointer-events-none sm:hidden" />
                </div>
            </div>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
                {filteredTrainings.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">search_off</span>
                        <p className="text-lg font-semibold">Nenhum registro encontrado para os filtros selecionados.</p>
                    </div>
                ) : (
                    <>
                        {/* Stat Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <StatCard icon="star" label="Nota Média" value={avgRating} color="bg-teal-500" sub={`de ${filteredTrainings.length} registros`} />
                            <StatCard icon="psychology" label="Foco Médio" value={avgFocus} color="bg-blue-500" sub="Concentração nas técnicas" />
                            <StatCard icon="battery_alert" label="Cansaço Médio" value={avgFatigue} color="bg-orange-500" sub="Nível de exaustão" />
                            <StatCard icon="mood" label="Int. Emocional" value={avgEmotionIntensity} color="bg-purple-500" sub="Intensidade média" />
                        </div>

                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <ChartCard title="Evolução Geral ao Longo do Tempo">
                                    <ResponsiveContainer width="100%" height={320}>
                                        <AreaChart data={timelineData}>
                                            <defs>
                                                <linearGradient id="colorNota" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorFoco" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                            <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                                            <Tooltip />
                                            <Legend />
                                            <Area type="monotone" dataKey="Nota" stroke="#14b8a6" fill="url(#colorNota)" strokeWidth={2} />
                                            <Area type="monotone" dataKey="Foco" stroke="#3b82f6" fill="url(#colorFoco)" strokeWidth={2} />
                                            <Line type="monotone" dataKey="Cansaco" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartCard>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <ChartCard title="Perfil do Atleta (Radar)">
                                        <ResponsiveContainer width="100%" height={280}>
                                            <RadarChart data={radarData}>
                                                <PolarGrid stroke="#e2e8f0" />
                                                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                                                <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                                                <Radar name="Média" dataKey="value" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.3} strokeWidth={2} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </ChartCard>

                                    <ChartCard title="Distribuição por Tipo de Treino">
                                        <ResponsiveContainer width="100%" height={240}>
                                            <PieChart>
                                                <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="value">
                                                    {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip formatter={(value: number, name: string) => [`${value}x`, name]} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2 justify-center">
                                            {typeData.map((entry, i) => (
                                                <div key={entry.name} className="flex items-center gap-1">
                                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{entry.name} ({entry.value})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </ChartCard>
                                </div>

                                {/* Gym Stats Chart */}
                                {gymStatsData.length > 1 && (
                                    <ChartCard title="Intensidade por Academia">
                                        <ResponsiveContainer width="100%" height={280}>
                                            <BarChart data={gymStatsData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                                                <Tooltip formatter={(value: number) => [`${value}/10`]} />
                                                <Bar dataKey="Cansaco" name="Cansaço" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="Nota" name="Nota" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="Dor" name="Dor" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                                <Legend />
                                            </BarChart>
                                        </ResponsiveContainer>
                                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
                                            {gymStatsData.map(g => (
                                                <span key={g.name} className="text-[11px] text-slate-500 dark:text-slate-400">
                                                    {g.name}: {g.treinos} treino{g.treinos > 1 ? 's' : ''}
                                                </span>
                                            ))}
                                        </div>
                                    </ChartCard>
                                )}

                                {competitions.length > 0 && (
                                    <ChartCard title="Competições">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                            <div className="text-center p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
                                                <p className="text-2xl font-bold text-teal-600">{competitions.length}</p>
                                                <p className="text-xs text-slate-500">Total</p>
                                            </div>
                                            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                                <p className="text-2xl font-bold text-green-600">{totalWins}</p>
                                                <p className="text-xs text-slate-500">Vitórias</p>
                                            </div>
                                            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                                <p className="text-2xl font-bold text-red-500">{totalLosses}</p>
                                                <p className="text-xs text-slate-500">Derrotas</p>
                                            </div>
                                            <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                                                <p className="text-2xl font-bold text-amber-500">{totalWins + totalLosses > 0 ? ((totalWins / (totalWins + totalLosses)) * 100).toFixed(0) : 0}%</p>
                                                <p className="text-xs text-slate-500">Aproveitamento</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 mt-4">
                                            {competitions.map(c => (
                                                <div key={c.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                                    <span className="material-symbols-outlined text-amber-500">emoji_events</span>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{c.competition_name}</p>
                                                        <p className="text-xs text-slate-500">{new Date(c.created_at || '').toLocaleDateString('pt-BR')} | {c.competition_result}</p>
                                                    </div>
                                                    <span className="text-sm font-bold text-teal-500">{c.rating}/10</span>
                                                </div>
                                            ))}
                                        </div>
                                    </ChartCard>
                                )}
                            </div>
                        )}

                        {/* EMOTIONAL TAB */}
                        {activeTab === 'emotional' && (
                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <ChartCard title="Emoções Mais Frequentes">
                                        <ResponsiveContainer width="100%" height={260}>
                                            <PieChart>
                                                <Pie data={emotionPieData} cx="50%" cy="45%" innerRadius={40} outerRadius={80} paddingAngle={3} dataKey="value">
                                                    {emotionPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip formatter={(value: number, name: string) => [`${value}x`, name]} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        {/* Custom legend below the chart */}
                                        <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2 justify-center">
                                            {emotionPieData.map((entry, i) => (
                                                <div key={entry.name} className="flex items-center gap-1">
                                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{entry.name} ({entry.value})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </ChartCard>

                                    <ChartCard title="Intensidade Emocional ao Longo do Tempo">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={timelineData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="Int. Emocional" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </ChartCard>
                                </div>

                                <ChartCard title="Reflexões Emocionais do Atleta">
                                    <div className="space-y-3 max-h-96 overflow-y-auto overflow-x-hidden">
                                        {filteredTrainings.filter(t => t.emotion_context).map(t => (
                                            <div key={t.id} className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border-l-4 border-purple-400 overflow-hidden">
                                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                                                    <span className="text-[11px] sm:text-xs font-bold text-slate-500">{new Date(t.created_at || '').toLocaleDateString('pt-BR')}</span>
                                                    <span className="text-[11px] sm:text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 sm:px-2 py-0.5 rounded font-bold">
                                                        Int: {t.emotion_intensity}/10
                                                    </span>
                                                    {(t.emotions || []).map(e => (
                                                        <span key={e} className="text-[11px] sm:text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-600 px-1.5 sm:px-2 py-0.5 rounded font-semibold">{e}</span>
                                                    ))}
                                                </div>
                                                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed break-words">"{t.emotion_context}"</p>
                                            </div>
                                        ))}
                                    </div>
                                </ChartCard>
                            </div>
                        )}

                        {/* PHYSICAL TAB */}
                        {activeTab === 'physical' && (
                            <div className="space-y-6">
                                <ChartCard title="Cansaço vs Energia vs Dor">
                                    <ResponsiveContainer width="100%" height={320}>
                                        <LineChart data={timelineData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                            <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="Cansaco" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} name="Cansaço" />
                                            <Line type="monotone" dataKey="Energia" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                                            <Line type="monotone" dataKey="Dor" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </ChartCard>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <ChartCard title="Áreas de Dor Mais Relatadas">
                                        <ResponsiveContainer width="100%" height={280}>
                                            <BarChart data={painData} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis type="number" tick={{ fontSize: 11 }} />
                                                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
                                                <Tooltip />
                                                <Bar dataKey="value" fill="#ef4444" radius={[0, 8, 8, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartCard>

                                    <ChartCard title="Correlação Nota × Cansaço">
                                        <p className="text-xs text-slate-500 mb-3">Pontos onde nota alta coincide com cansaço alto podem indicar resiliência ou excesso.</p>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {filteredTrainings.filter(t => t.fatigue_level != null).map(t => {
                                                const ratio = (t.rating || 0) / Math.max(t.fatigue_level || 1, 1);
                                                return (
                                                    <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                                        <span className="text-xs font-bold text-slate-500 w-12">{new Date(t.created_at || '').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                                                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${ratio > 1 ? 'bg-green-500' : ratio > 0.7 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(ratio * 50, 100)}%` }}></div>
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">N:{t.rating} C:{t.fatigue_level}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </ChartCard>
                                </div>
                            </div>
                        )}

                        {/* MENTAL TAB */}
                        {activeTab === 'mental' && (
                            <div className="space-y-6">
                                <ChartCard title="Foco Mental ao Longo do Tempo">
                                    <ResponsiveContainer width="100%" height={320}>
                                        <AreaChart data={timelineData}>
                                            <defs>
                                                <linearGradient id="colorFocoArea" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                            <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="Foco" stroke="#3b82f6" fill="url(#colorFocoArea)" strokeWidth={3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartCard>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <ChartCard title="Distrações Mais Comuns">
                                        <ResponsiveContainer width="100%" height={280}>
                                            <BarChart data={distractionData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                                <YAxis tick={{ fontSize: 11 }} />
                                                <Tooltip />
                                                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                                    {distractionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartCard>

                                    <ChartCard title="Reflexões Mentais do Atleta">
                                        <div className="space-y-3 max-h-72 overflow-y-auto overflow-x-hidden">
                                            {filteredTrainings.filter(t => t.mental_reflection).map(t => (
                                                <div key={t.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border-l-4 border-blue-400 overflow-hidden">
                                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                                                        <span className="text-[11px] sm:text-xs font-bold text-slate-500">{new Date(t.created_at || '').toLocaleDateString('pt-BR')}</span>
                                                        <span className="text-[11px] sm:text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-1.5 sm:px-2 py-0.5 rounded font-bold">Foco: {t.focus_level}/10</span>
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic break-words">"{t.mental_reflection}"</p>
                                                </div>
                                            ))}
                                        </div>
                                    </ChartCard>
                                </div>

                                <ChartCard title="Correlação Foco × Nota">
                                    <ResponsiveContainer width="100%" height={280}>
                                        <LineChart data={timelineData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                            <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="Nota" stroke="#14b8a6" strokeWidth={2} dot={{ r: 3 }} />
                                            <Line type="monotone" dataKey="Foco" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </div>
                        )}

                        {/* REGISTROS TAB */}
                        {activeTab === 'registros' && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                        {filteredTrainings.length} registro{filteredTrainings.length !== 1 ? 's' : ''} encontrado{filteredTrainings.length !== 1 ? 's' : ''}
                                    </h3>
                                </div>
                                {[...filteredTrainings].reverse().map(t => {
                                    const displayDate = t.training_date || (t.created_at ? t.created_at.slice(0, 10) : '');
                                    const dateStr = displayDate ? new Date(displayDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
                                    const getRatingColor = (r: number) => {
                                        if (r <= 3) return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
                                        if (r <= 5) return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
                                        if (r <= 7) return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
                                        return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
                                    };

                                    return (
                                        <div
                                            key={t.id}
                                            onClick={() => navigate(`/app/training/${t.id}`)}
                                            className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 shadow-sm hover:shadow-md hover:border-teal-400/50 transition-all cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-start gap-3 min-w-0">
                                                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${t.is_competition ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-teal-100 dark:bg-teal-900/30 text-teal-600'}`}>
                                                        <span className="material-symbols-outlined">
                                                            {t.is_competition ? 'emoji_events' : (t.modality === 'Jiu-Jitsu' ? 'sports_kabaddi' : 'sports_martial_arts')}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                                                            {t.is_competition ? t.competition_name || 'Competição' : `Treino de ${t.modality}`}
                                                        </h4>
                                                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{dateStr}</span>
                                                            <span className="text-[11px] text-slate-300">•</span>
                                                            <span className="text-[11px] font-medium text-slate-500">{t.training_type || 'Geral'}</span>
                                                            {t.gym_name && (
                                                                <>
                                                                    <span className="text-[11px] text-slate-300">•</span>
                                                                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                                                                        <span className="material-symbols-outlined text-[11px]">location_on</span>
                                                                        {t.gym_name}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {t.rating != null && (
                                                    <span className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold ${getRatingColor(t.rating)}`}>
                                                        {t.rating}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Quick metrics row */}
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {t.fatigue_level != null && (
                                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                                                        Cansaço: {t.fatigue_level}/10
                                                    </span>
                                                )}
                                                {t.energy_level != null && (
                                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                                        Energia: {t.energy_level}/10
                                                    </span>
                                                )}
                                                {t.focus_level != null && (
                                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                                                        Foco: {t.focus_level}/10
                                                    </span>
                                                )}
                                                {t.pain_level != null && t.pain_level > 0 && (
                                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                                                        Dor: {t.pain_level}/10
                                                    </span>
                                                )}
                                            </div>

                                            {/* Emotions */}
                                            {t.emotions && t.emotions.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mb-2">
                                                    {t.emotions.map(emo => (
                                                        <span key={emo} className="text-[10px] bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 font-semibold px-2 py-0.5 rounded-full">
                                                            {emo}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Reflection preview */}
                                            {(t.reflection || t.learned_today) && (
                                                <div className="mt-2 p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 italic">
                                                        "{t.reflection || t.learned_today}"
                                                    </p>
                                                </div>
                                            )}

                                            {/* Click hint */}
                                            <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 group-hover:text-teal-500 transition-colors">
                                                <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                                                Clique para ver detalhes completos
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </main>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .psico-tabs-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(148,163,184,0.3) transparent;
                }
                .psico-tabs-scroll::-webkit-scrollbar {
                    height: 3px;
                }
                .psico-tabs-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .psico-tabs-scroll::-webkit-scrollbar-thumb {
                    background-color: rgba(148,163,184,0.3);
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
}
