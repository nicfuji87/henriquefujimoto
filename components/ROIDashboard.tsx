import React, { useEffect, useState } from 'react';
import { TrendingUp, Zap, ArrowUpRight, ArrowDownRight, Users, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAggregatedMetrics, AggregatedMetrics } from '../lib/metrics';
import AudienceCharts from './AudienceCharts';
import BrazilMap from './BrazilMap';

const ROIDashboard: React.FC = () => {
  const [period, setPeriod] = useState<30 | 60 | 90>(30);
  const [stats, setStats] = useState<AggregatedMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getAggregatedMetrics(period);
        setStats(data);
      } catch (e) {
        console.error("Failed to load aggregated metrics", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [period]);

  // Animation vars
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const formatNumber = (num: number) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const GrowthBadge = ({ value }: { value: number }) => {
    if (!value && value !== 0) return null;
    const isPositive = value >= 0;
    return (
      <div className={`mt-2 flex items-center gap-1.5 rounded-full w-fit px-2 py-0.5 border ${isPositive
        ? 'bg-primary/10 text-primary border-primary/20'
        : 'bg-red-500/10 text-red-500 border-red-500/20'
        }`}>
        {isPositive ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
        <span className="text-xs font-bold">{Math.abs(value).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <section className="px-4">
      {/* Header + Filter Tabs */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold uppercase tracking-tight text-white">Impacto e Alcance</h3>
          <Activity className="text-primary w-5 h-5 animate-pulse" />
        </div>

        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 w-fit">
          {[30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setPeriod(d as any)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${period === d
                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              {d}D
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-64 flex items-center justify-center"
          >
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-4"
          >
            {/* 1. Total Reach */}
            <motion.div variants={item} className="col-span-2 md:col-span-1 group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl hover:bg-white/10 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp size={40} />
              </div>
              <div className="flex flex-col gap-1 relative z-10">
                <p className="text-sm font-medium text-gray-400">Alcance Acumulado</p>
                <p className="font-sans text-4xl font-bold text-white tracking-tight">
                  {formatNumber(stats?.total_reach || 0)}
                </p>
                <GrowthBadge value={stats?.reach_growth || 0} />
              </div>
            </motion.div>

            {/* 2. Impressions */}
            <motion.div variants={item} className="col-span-1 md:col-span-1 group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl hover:bg-white/10 transition-colors">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-gray-400">Impressões</p>
                <p className="font-sans text-3xl font-bold text-white tracking-tight">
                  {formatNumber(stats?.total_impressions || 0)}
                </p>
                <GrowthBadge value={stats?.impressions_growth || 0} />
              </div>
            </motion.div>


            {/* 3. Interactions */}
            <motion.div variants={item} className="col-span-1 group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl hover:bg-white/10 transition-colors">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-gray-400">Interações</p>
                <p className="font-sans text-3xl font-bold text-white tracking-tight">
                  {formatNumber(stats?.total_interactions || 0)}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-primary">
                  <Zap size={14} className="fill-primary" />
                  <span className="text-xs font-medium text-gray-300">
                    {stats?.interactions_growth !== 0 ? `${stats?.interactions_growth.toFixed(0)}%` : '-'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* 4. Followers Gained */}
            <motion.div variants={item} className="col-span-1 group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl hover:bg-white/10 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users size={32} />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-gray-400">Novos Seguidores</p>
                <p className="font-sans text-3xl font-bold text-white tracking-tight">
                  +{formatNumber(stats?.followers_gained || 0)}
                </p>
                <div className="mt-2 text-xs font-medium text-gray-500">
                  Neste período
                </div>
              </div>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Audience Charts Section */}
      {!loading && stats && (
        <AudienceCharts
          cityData={stats.audience_city}
          genderAgeData={stats.audience_gender_age}
        />
      )}

      {/* Brazil Map Section */}
      {!loading && stats && Object.keys(stats.audience_city).length > 0 && (
        <div className="mt-6">
          <BrazilMap cityData={stats.audience_city} />
        </div>
      )}

    </section>
  );
};

export default ROIDashboard;