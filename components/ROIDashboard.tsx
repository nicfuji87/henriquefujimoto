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
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.', ',') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.', ',') + 'K';
    return num.toString();
  };

  const GrowthBadge = ({ value }: { value: number }) => {
    if (!value && value !== 0) return null;
    const isPositive = value >= 0;
    return (
      <div className={`mt-2 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 font-grotesk text-[11px] font-semibold ${isPositive
        ? 'bg-lime/15 text-lime'
        : 'bg-white/10 text-white/50'
        }`}>
        {isPositive ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
        <span>{isPositive ? '+' : '-'}{Math.abs(value).toFixed(1).replace('.', ',')}%</span>
      </div>
    );
  };

  return (
    <section className="px-4">
      {/* Header + Filter Tabs */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-2.5">
          <h3 className="font-grotesk text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
            Impacto e <span className="font-editorial font-normal italic text-lime">alcance</span>
          </h3>
          <Activity className="h-5 w-5 animate-pulse text-lime" />
        </div>

        <div className="flex w-fit rounded-full border border-white/[0.07] bg-coal p-1">
          {[30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setPeriod(d as any)}
              className={`rounded-full px-4 py-1.5 font-grotesk text-xs font-semibold transition-all ${period === d
                ? 'bg-lime text-night'
                : 'text-white/60 hover:text-white'
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
            <div className="w-8 h-8 border-2 border-lime border-t-transparent rounded-full animate-spin"></div>
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
            <motion.div variants={item} className="col-span-2 md:col-span-1 group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-coal p-6 transition-all hover:border-lime/25">
              <div className="absolute top-0 right-0 p-4 text-lime opacity-[0.12] group-hover:opacity-20 transition-opacity">
                <TrendingUp size={40} />
              </div>
              <div className="flex flex-col gap-1 relative z-10">
                <p className="font-grotesk text-[13px] font-medium text-white/50">Alcance acumulado</p>
                <p className="font-grotesk text-4xl font-semibold tracking-tight text-lime sm:text-[2.75rem]">
                  {formatNumber(stats?.total_reach || 0)}
                </p>
                <GrowthBadge value={stats?.reach_growth || 0} />
              </div>
            </motion.div>

            {/* 2. Rolling 28d Reach (Impressões / Alcance 28d) */}
            <motion.div variants={item} className="col-span-1 md:col-span-1 group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-coal p-6 transition-all hover:border-white/15">
              <div className="flex flex-col gap-1">
                <p className="font-grotesk text-[13px] font-medium text-white/50">Alcance 28d</p>
                <p className="font-grotesk text-3xl font-semibold tracking-tight text-white">
                  {formatNumber(stats?.total_impressions || 0)}
                </p>
                <GrowthBadge value={stats?.impressions_growth || 0} />
              </div>
            </motion.div>


            {/* 3. Interactions */}
            <motion.div variants={item} className="col-span-1 group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-coal p-6 transition-all hover:border-white/15">
              <div className="flex flex-col gap-1">
                <p className="font-grotesk text-[13px] font-medium text-white/50">Interações</p>
                <p className="font-grotesk text-3xl font-semibold tracking-tight text-white">
                  {formatNumber(stats?.total_interactions || 0)}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-lime">
                  <Zap size={14} className="fill-lime" />
                  <span className="font-grotesk text-xs font-medium text-white/60">
                    {stats?.interactions_growth !== 0 ? `${stats?.interactions_growth.toFixed(0)}%` : '-'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* 4. Followers Gained */}
            <motion.div variants={item} className="col-span-1 group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-coal p-6 transition-all hover:border-white/15">
              <div className="absolute top-0 right-0 p-4 text-white opacity-[0.08] group-hover:opacity-[0.16] transition-opacity">
                <Users size={32} />
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-grotesk text-[13px] font-medium text-white/50">Novos seguidores</p>
                <p className="font-grotesk text-3xl font-semibold tracking-tight text-white">
                  +{formatNumber(stats?.followers_gained || 0)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="font-grotesk text-xs font-medium text-white/45">Neste período</span>
                  {stats?.total_followers ? (
                    <span className="inline-flex items-center rounded-full bg-lime/15 px-2 py-0.5 font-grotesk text-xs font-semibold text-lime">
                      Total: {formatNumber(stats.total_followers)}
                    </span>
                  ) : null}
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