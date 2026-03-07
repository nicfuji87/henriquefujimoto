import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gymApi, calculateATRPhase } from '../../lib/api-gym';
import type { GymWorkout as GymWorkoutType, GymScheduleEntry, GymCompetition } from '../../lib/api-gym';

type ViewMode = 'month' | 'week';

export default function GymCalendar() {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [workouts, setWorkouts] = useState<GymWorkoutType[]>([]);
    const [schedule, setSchedule] = useState<GymScheduleEntry[]>([]);
    const [competitions, setCompetitions] = useState<GymCompetition[]>([]);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [showAddModal, setShowAddModal] = useState(false);
    const [addType, setAddType] = useState<'schedule' | 'competition'>('schedule');
    const [editSchedule, setEditSchedule] = useState<Partial<GymScheduleEntry>>({});
    const [editComp, setEditComp] = useState<Partial<GymCompetition>>({ importance: 'B' });

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        try {
            const [w, s, c] = await Promise.all([
                gymApi.getAllWorkouts(),
                gymApi.getSchedule(),
                gymApi.getCompetitions(),
            ]);
            setWorkouts(w);
            setSchedule(s);
            setCompetitions(c);
        } finally { setLoading(false); }
    };

    // Calendar helpers
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const todayStr = new Date().toISOString().slice(0, 10);

    const getDateStr = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const nextComp = competitions.find(c => new Date(c.date + 'T12:00:00') >= new Date()) || null;
    const daysToComp = nextComp ? Math.ceil((new Date(nextComp.date + 'T12:00:00').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

    // Get events for a day
    const getEventsForDay = (dateStr: string) => {
        const d = new Date(dateStr + 'T12:00:00');
        const dayOfWeek = d.getDay();
        const techSessions = schedule.filter(s => s.day_of_week === dayOfWeek);
        const dayWorkouts = workouts.filter(w => w.date === dateStr);
        const dayComps = competitions.filter(c => c.date === dateStr);
        return { techSessions, dayWorkouts, dayComps };
    };

    // Phase for month visualization
    const getPhaseForDate = (dateStr: string) => {
        return calculateATRPhase(nextComp?.date || null);
    };

    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const changeMonth = (delta: number) => {
        setCurrentDate(new Date(year, month + delta, 1));
        setSelectedDay(null);
    };

    const handleSaveSchedule = async () => {
        try { await gymApi.saveScheduleEntry(editSchedule); await loadAll(); setShowAddModal(false); } catch { alert('Erro'); }
    };
    const handleSaveComp = async () => {
        try { await gymApi.saveCompetition(editComp); await loadAll(); setShowAddModal(false); } catch { alert('Erro'); }
    };

    // Week view
    const getWeekDates = () => {
        const d = new Date(currentDate);
        const day = d.getDay();
        d.setDate(d.getDate() - day);
        return Array.from({ length: 7 }, (_, i) => {
            const wd = new Date(d);
            wd.setDate(d.getDate() + i);
            return wd;
        });
    };

    const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : null;

    const phaseColors: Record<string, string> = {
        accumulation: 'bg-blue-500/5',
        transmutation: 'bg-purple-500/5',
        realization: 'bg-red-500/5',
    };

    return (
        <div className="min-h-screen flex flex-col pb-24">
            {/* Header */}
            <div className="p-4 pb-2 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Calendário</h1>
                    <p className="text-xs text-gym-muted mt-1">Treinos, competições e fases</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setViewMode(viewMode === 'month' ? 'week' : 'month')}
                        className="px-3 py-1.5 bg-gym-surface rounded-lg text-xs text-gym-muted font-bold">
                        {viewMode === 'month' ? 'Semana' : 'Mês'}
                    </button>
                    <button onClick={() => { setShowAddModal(true); setAddType('schedule'); }}
                        className="w-8 h-8 bg-gym-primary rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-lg">add</span>
                    </button>
                </div>
            </div>

            {/* Month Navigation */}
            <div className="px-4 flex items-center justify-between mb-3">
                <button onClick={() => changeMonth(-1)} className="w-8 h-8 rounded-full bg-gym-surface flex items-center justify-center">
                    <span className="material-symbols-outlined text-gym-muted text-sm">chevron_left</span>
                </button>
                <span className="text-sm font-bold text-white">{monthNames[month]} {year}</span>
                <button onClick={() => changeMonth(1)} className="w-8 h-8 rounded-full bg-gym-surface flex items-center justify-center">
                    <span className="material-symbols-outlined text-gym-muted text-sm">chevron_right</span>
                </button>
            </div>

            {/* Legend */}
            <div className="px-4 flex flex-wrap gap-3 mb-3">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400" /><span className="text-[10px] text-gym-muted">Técnico</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gym-accent" /><span className="text-[10px] text-gym-muted">Complementar ✓</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gym-warning" /><span className="text-[10px] text-gym-muted">Pendente</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gym-danger" /><span className="text-[10px] text-gym-muted">Competição</span></div>
            </div>

            {/* Calendar Grid */}
            {loading ? (
                <div className="px-4"><div className="bg-gym-surface h-64 rounded-xl animate-pulse" /></div>
            ) : viewMode === 'month' ? (
                <div className="px-4">
                    <div className={`rounded-xl border border-gym-surface-light overflow-hidden ${phaseColors[getPhaseForDate(todayStr)] || ''}`}>
                        {/* Day Headers */}
                        <div className="grid grid-cols-7">
                            {dayNames.map(d => <div key={d} className="text-center py-2 text-[10px] font-bold text-gym-muted">{d}</div>)}
                        </div>
                        {/* Days */}
                        <div className="grid grid-cols-7 gap-px bg-gym-surface-light/20">
                            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} className="min-h-[3rem] bg-gym-bg/50" />)}
                            {Array.from({ length: daysInMonth }, (_, i) => {
                                const day = i + 1;
                                const dateStr = getDateStr(day);
                                const events = getEventsForDay(dateStr);
                                const isToday = dateStr === todayStr;
                                const isSelected = dateStr === selectedDay;
                                return (
                                    <button key={day} onClick={() => setSelectedDay(dateStr === selectedDay ? null : dateStr)}
                                        className={`min-h-[3rem] p-1 flex flex-col items-center relative transition-all
                                            ${isToday ? 'bg-gym-primary/10' : 'bg-gym-bg/80'}
                                            ${isSelected ? 'ring-2 ring-gym-primary ring-inset' : ''}`}>
                                        <span className={`text-xs ${isToday ? 'font-bold text-gym-primary' : 'text-gym-text'}`}>{day}</span>
                                        <div className="flex gap-0.5 mt-1">
                                            {events.techSessions.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                                            {events.dayWorkouts.some(w => w.status === 'completed') && <div className="w-1.5 h-1.5 rounded-full bg-gym-accent" />}
                                            {events.dayWorkouts.some(w => w.status === 'pending') && <div className="w-1.5 h-1.5 rounded-full bg-gym-warning" />}
                                            {events.dayComps.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-gym-danger" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                /* Week view */
                <div className="px-4">
                    <div className="flex gap-2">
                        {getWeekDates().map(d => {
                            const dateStr = d.toISOString().slice(0, 10);
                            const events = getEventsForDay(dateStr);
                            const isToday = dateStr === todayStr;
                            const isSelected = dateStr === selectedDay;
                            return (
                                <button key={dateStr} onClick={() => setSelectedDay(dateStr === selectedDay ? null : dateStr)}
                                    className={`flex-1 p-2 rounded-xl text-center transition-all ${isSelected ? 'bg-gym-primary text-white' : isToday ? 'bg-gym-primary/20' : 'bg-gym-surface'}`}>
                                    <span className="text-[10px] text-gym-muted block">{dayNames[d.getDay()]}</span>
                                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gym-text'}`}>{d.getDate()}</span>
                                    <div className="flex justify-center gap-0.5 mt-1">
                                        {events.techSessions.length > 0 && <div className="w-1 h-1 rounded-full bg-blue-400" />}
                                        {events.dayWorkouts.length > 0 && <div className="w-1 h-1 rounded-full bg-gym-accent" />}
                                        {events.dayComps.length > 0 && <div className="w-1 h-1 rounded-full bg-gym-danger" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Selected Day Detail */}
            {selectedDay && selectedEvents && (
                <div className="px-4 mt-4 space-y-2">
                    <p className="text-xs font-bold text-gym-muted uppercase">
                        {new Date(selectedDay + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                    </p>

                    {selectedEvents.techSessions.map((s, i) => (
                        <div key={i} className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-center gap-3">
                            <div className="w-2 h-full min-h-[2rem] bg-blue-400 rounded-full" />
                            <div>
                                <p className="text-sm font-bold text-white">{s.modality}</p>
                                <p className="text-xs text-gym-muted">{s.start_time?.slice(0, 5)} — {s.end_time?.slice(0, 5)}</p>
                            </div>
                        </div>
                    ))}

                    {selectedEvents.dayWorkouts.map(w => (
                        <div key={w.id} className={`rounded-xl p-3 flex items-center gap-3 border ${w.status === 'completed' ? 'bg-gym-accent/10 border-gym-accent/20' : 'bg-gym-warning/10 border-gym-warning/20'}`}>
                            <span className={`material-symbols-outlined ${w.status === 'completed' ? 'text-gym-accent' : 'text-gym-warning'}`}>
                                {w.status === 'completed' ? 'check_circle' : 'pending'}
                            </span>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-white">{w.workout_name || 'Treino'}</p>
                                <p className="text-xs text-gym-muted">{w.duration_minutes}min · {w.session_type || ''} {w.rpe ? `· RPE ${w.rpe}` : ''}</p>
                            </div>
                        </div>
                    ))}

                    {selectedEvents.dayComps.map(c => (
                        <div key={c.id} className="bg-gym-danger/10 border border-gym-danger/20 rounded-xl p-3 flex items-center gap-3">
                            <span className="material-symbols-outlined text-gym-danger">emoji_events</span>
                            <div>
                                <p className="text-sm font-bold text-white">{c.name}</p>
                                <p className="text-xs text-gym-muted">{c.location} · {c.importance}</p>
                            </div>
                        </div>
                    ))}

                    {selectedEvents.techSessions.length === 0 && selectedEvents.dayWorkouts.length === 0 && selectedEvents.dayComps.length === 0 && (
                        <div className="text-center py-6">
                            <span className="material-symbols-outlined text-3xl text-gym-muted/30 block mb-2">event_available</span>
                            <p className="text-xs text-gym-muted">Dia de descanso</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center" onClick={() => setShowAddModal(false)}>
                    <div className="bg-gym-surface w-full max-w-md rounded-t-2xl p-6 pb-8 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        {/* Tab */}
                        <div className="flex gap-2 mb-2">
                            <button onClick={() => setAddType('schedule')} className={`flex-1 py-2 rounded-xl text-xs font-bold ${addType === 'schedule' ? 'bg-gym-primary text-white' : 'bg-gym-surface-light text-gym-muted'}`}>Treino Semanal</button>
                            <button onClick={() => setAddType('competition')} className={`flex-1 py-2 rounded-xl text-xs font-bold ${addType === 'competition' ? 'bg-gym-primary text-white' : 'bg-gym-surface-light text-gym-muted'}`}>Competição</button>
                        </div>
                        {addType === 'schedule' ? (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-gym-muted mb-2">Dia</label>
                                    <select value={editSchedule.day_of_week ?? ''} onChange={e => setEditSchedule(s => ({ ...s, day_of_week: Number(e.target.value) }))} className="gym-input">
                                        {dayNames.map((n, i) => <option key={i} value={i}>{n}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gym-muted mb-2">Modalidade</label>
                                    <input value={editSchedule.modality || ''} onChange={e => setEditSchedule(s => ({ ...s, modality: e.target.value }))} placeholder="Judô, Jiu-jitsu..." className="gym-input" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gym-muted mb-2">Início</label>
                                        <input type="time" value={editSchedule.start_time || ''} onChange={e => setEditSchedule(s => ({ ...s, start_time: e.target.value }))} className="gym-input" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gym-muted mb-2">Fim</label>
                                        <input type="time" value={editSchedule.end_time || ''} onChange={e => setEditSchedule(s => ({ ...s, end_time: e.target.value }))} className="gym-input" />
                                    </div>
                                </div>
                                <button onClick={handleSaveSchedule} disabled={!editSchedule.modality}
                                    className="w-full bg-gradient-to-r from-gym-primary to-blue-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl">Salvar</button>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-gym-muted mb-2">Nome</label>
                                    <input value={editComp.name || ''} onChange={e => setEditComp(c => ({ ...c, name: e.target.value }))} placeholder="Campeonato..." className="gym-input" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gym-muted mb-2">Data</label>
                                    <input type="date" value={editComp.date || ''} onChange={e => setEditComp(c => ({ ...c, date: e.target.value }))} className="gym-input" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gym-muted mb-2">Local</label>
                                    <input value={editComp.location || ''} onChange={e => setEditComp(c => ({ ...c, location: e.target.value }))} placeholder="São Paulo..." className="gym-input" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gym-muted mb-2">Importância</label>
                                    <div className="flex gap-2">
                                        {(['A', 'B', 'C'] as const).map(imp => (
                                            <button key={imp} onClick={() => setEditComp(c => ({ ...c, importance: imp }))}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold ${editComp.importance === imp ? 'bg-gym-primary text-white' : 'bg-gym-surface-light text-gym-muted'}`}>{imp}</button>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={handleSaveComp} disabled={!editComp.name || !editComp.date}
                                    className="w-full bg-gradient-to-r from-gym-primary to-blue-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl">Salvar</button>
                            </>
                        )}
                    </div>
                </div>
            )}
            <style>{`
                .gym-input { width:100%;padding:0.75rem 1rem;border-radius:0.75rem;border:1px solid #243447;background:#1a2634;color:#e2e8f0;font-size:0.875rem;outline:none; }
                .gym-input:focus { border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59,130,246,0.2); }
            `}</style>
        </div>
    );
}
