import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Target, TrendingUp, DollarSign, MousePointerClick, RefreshCw, Calendar, ArrowUpRight } from 'lucide-react';

interface AdInsight {
    id: string;
    date: string;
    campaign_name: string;
    adset_name: string;
    ad_name: string;
    spend_brl: number;
    impressions: number;
    clicks: number;
    cpc_brl: number;
    ctr_percentage: number;
    checkouts: number;
    purchases: number;
    revenue_brl: number;
}

export default function AdsTab() {
    const [insights, setInsights] = useState<AdInsight[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('ads_daily_insights')
                .select('*')
                .order('date', { ascending: false })
                .limit(100);

            if (error) {
                console.error('Error fetching ads insights:', error);
                return;
            }

            setInsights(data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            // Trigger Edge Function directly from client
            const { data, error } = await supabase.functions.invoke('fetch-meta-ads', {
                body: { preset: 'today' } // Or yesterday, usually today if manual sync
            });

            if (error) {
                alert('Erro ao sincronizar dados com o Meta Ads: ' + error.message);
            } else {
                alert('Sincronização concluída com sucesso!');
                fetchInsights();
            }
        } catch (error: any) {
            alert('Erro de conexão ao sincronizar: ' + error.message);
        } finally {
            setSyncing(false);
        }
    };

    // Calculate totals
    const totalSpend = insights.reduce((acc, curr) => acc + Number(curr.spend_brl), 0);
    const totalCheckouts = insights.reduce((acc, curr) => acc + Number(curr.checkouts), 0);
    const totalClicks = insights.reduce((acc, curr) => acc + Number(curr.clicks), 0);
    const cpa = totalCheckouts > 0 ? totalSpend / totalCheckouts : 0;

    return (
        <div className="space-y-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-white flex items-center gap-2">
                        <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        Meta Ads
                    </h2>
                    <p className="text-sm text-zinc-400">Acompanhe Granularmente Conjuntos e Anúncios</p>
                </div>

                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-xl text-sm font-medium hover:bg-primary/20 transition-all disabled:opacity-50 w-full sm:w-auto justify-center"
                >
                    <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                    Sincronizar (Hoje)
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Metrics Cards */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center justify-between text-zinc-400 mb-2">
                        <span className="text-xs sm:text-sm font-medium">Total Gasto</span>
                        <DollarSign className="w-4 h-4 text-emerald-400 hidden sm:block" />
                    </div>
                    <div className="text-lg sm:text-2xl font-bold text-white">
                        R$ {totalSpend.toFixed(2)}
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center justify-between text-zinc-400 mb-2">
                        <span className="text-xs sm:text-sm font-medium">Checkouts</span>
                        <TrendingUp className="w-4 h-4 text-primary hidden sm:block" />
                    </div>
                    <div className="text-lg sm:text-2xl font-bold text-white">
                        {totalCheckouts}
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center justify-between text-zinc-400 mb-2">
                        <span className="text-xs sm:text-sm font-medium">CPA</span>
                        <Target className="w-4 h-4 text-zinc-400 hidden sm:block" />
                    </div>
                    <div className="text-lg sm:text-2xl font-bold text-white">
                        R$ {cpa.toFixed(2)}
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center justify-between text-zinc-400 mb-2">
                        <span className="text-xs sm:text-sm font-medium">Cliques</span>
                        <MousePointerClick className="w-4 h-4 text-blue-400 hidden sm:block" />
                    </div>
                    <div className="text-lg sm:text-2xl font-bold text-white">
                        {totalClicks}
                    </div>
                </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-3 sm:p-4 border-b border-zinc-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <h3 className="text-sm sm:text-base font-medium text-white">Dados Granulados (Por Dia/Conjunto)</h3>
                </div>

                <div className="overflow-x-auto -mx-0">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-zinc-900 text-zinc-400 text-sm">
                                <th className="px-4 py-3 font-medium">Data</th>
                                <th className="px-4 py-3 font-medium">Campanha</th>
                                <th className="px-4 py-3 font-medium">Conjunto (AdSet)</th>
                                <th className="px-4 py-3 font-medium">Gasto</th>
                                <th className="px-4 py-3 font-medium">Cliques / Impr.</th>
                                <th className="px-4 py-3 font-medium">CPC</th>
                                <th className="px-4 py-3 font-medium text-primary">Checkouts</th>
                                <th className="px-4 py-3 font-medium text-emerald-400">Compras</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-zinc-500">
                                        Carregando dados...
                                    </td>
                                </tr>
                            ) : insights.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-zinc-500">
                                        Nenhum dado encontrado. Pressione "Forçar Sincronização" para baixar os dados da Meta.
                                    </td>
                                </tr>
                            ) : (
                                insights.map((insight) => (
                                    <tr key={insight.id} className="border-t border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-4 py-3 text-zinc-300">
                                            {new Date(insight.date).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md text-xs">
                                                {insight.campaign_name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-zinc-200">
                                            {insight.adset_name}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-zinc-300">
                                            R$ {Number(insight.spend_brl).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-400">
                                            {insight.clicks} / {insight.impressions}
                                            <div className="text-xs text-zinc-500 mt-1">
                                                CTR: {Number(insight.ctr_percentage).toFixed(2)}%
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-zinc-300">
                                            R$ {Number(insight.cpc_brl).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 font-bold text-primary">
                                            {insight.checkouts}
                                        </td>
                                        <td className="px-4 py-3 font-bold text-emerald-400">
                                            {insight.purchases}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
