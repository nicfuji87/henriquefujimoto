import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, MapPin, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Competition {
    id: string;
    name: string;
    date: string;
    location: string;
    category: string;
    weight_class: string;
    placement: string;
    medal_type: string | null;
    notes: string;
}

const medalEmoji = (type: string | null) => {
    if (type === 'gold') return '🥇';
    if (type === 'silver') return '🥈';
    if (type === 'bronze') return '🥉';
    return '🏅';
};

export default function CompetitionsSection() {
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const { data } = await supabase
                    .from('competitions')
                    .select('*')
                    .order('date', { ascending: false });
                setCompetitions(data || []);
            } catch (err) {
                console.error('Error loading competitions:', err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading || competitions.length === 0) return null;

    // Group by year
    const compsByYear = competitions.reduce((acc, comp) => {
        const year = new Date(comp.date + 'T12:00:00').getFullYear().toString();
        if (!acc[year]) acc[year] = [];
        acc[year].push(comp);
        return acc;
    }, {} as Record<string, Competition[]>);
    const sortedYears = Object.keys(compsByYear).sort((a, b) => Number(b) - Number(a));

    return (
        <section className="py-10 px-4">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
                        <Trophy className="w-3 h-3" />
                        Competições
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white">Histórico Competitivo</h3>
                </motion.div>

                {/* Summary Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-4 gap-3 mb-8"
                >
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
                        <div className="text-xl font-black text-white">{competitions.length}</div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Competições</div>
                    </div>
                    <div className="bg-white/[0.03] border border-yellow-500/10 rounded-xl p-3 text-center">
                        <div className="text-xl font-black text-yellow-400">{competitions.filter(c => c.medal_type === 'gold').length}</div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Ouros</div>
                    </div>
                    <div className="bg-white/[0.03] border border-gray-400/10 rounded-xl p-3 text-center">
                        <div className="text-xl font-black text-gray-300">{competitions.filter(c => c.medal_type === 'silver').length}</div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Pratas</div>
                    </div>
                    <div className="bg-white/[0.03] border border-amber-700/10 rounded-xl p-3 text-center">
                        <div className="text-xl font-black text-amber-600">{competitions.filter(c => c.medal_type === 'bronze').length}</div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Bronzes</div>
                    </div>
                </motion.div>

                {/* Competitions by Year */}
                <div className="space-y-6">
                    {sortedYears.map((year, yearIdx) => (
                        <motion.div
                            key={year}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: yearIdx * 0.05 }}
                        >
                            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                {year}
                            </h4>
                            <div className="space-y-2">
                                {compsByYear[year].map((comp) => (
                                    <div
                                        key={comp.id}
                                        className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 hover:border-white/10 transition-colors"
                                    >
                                        <span className="text-xl flex-shrink-0">{medalEmoji(comp.medal_type)}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-white font-semibold text-sm">{comp.name}</span>
                                                {comp.category && (
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-white/[0.05] border border-white/[0.08] rounded text-gray-400">{comp.category}</span>
                                                )}
                                                {comp.weight_class && (
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-white/[0.05] border border-white/[0.08] rounded text-gray-400">{comp.weight_class}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-0.5 text-[11px] text-gray-500">
                                                <span>{new Date(comp.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                                                {comp.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-2.5 h-2.5" />
                                                        {comp.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <span className={`text-sm font-bold ${comp.medal_type === 'gold' ? 'text-yellow-400' : comp.medal_type === 'silver' ? 'text-gray-300' : comp.medal_type === 'bronze' ? 'text-amber-600' : 'text-white'}`}>
                                                {comp.placement}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
