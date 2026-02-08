import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { getAggregatedMetrics } from '../lib/metrics';

const Hero: React.FC = () => {
  const { config, loading } = useSiteConfig();
  const [totalViews, setTotalViews] = useState<string>("73.4K"); // Fallback

  useEffect(() => {
    async function loadViews() {
      const data = await getAggregatedMetrics(30);
      if (data && data.total_reach > 0) {
        // Formatting
        const num = data.total_reach;
        let formatted = "";
        if (num >= 1000000) formatted = (num / 1000000).toFixed(1) + 'M';
        else if (num >= 1000) formatted = (num / 1000).toFixed(1) + 'K';
        else formatted = num.toString();

        setTotalViews(formatted);
      } else if (config.live_views) {
        // Keep config default if no data yet (day 0)
        setTotalViews(config.live_views);
      }
    }
    loadViews();
  }, [config.live_views]);

  return (
    <section className="relative h-[85vh] md:h-screen w-full overflow-hidden flex flex-col justify-end pb-12">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-black/40 z-0"></div>
        {!loading && (
          <>
            {/* Mobile Image - shown only on mobile */}
            {config.hero_image && (
              <img
                src={config.hero_image}
                alt={config.athlete_name}
                className="w-full h-full object-cover object-top md:hidden"
              />
            )}
            {/* Desktop Image - shown only on desktop */}
            {(config.hero_image_desktop || config.hero_image) && (
              <img
                src={config.hero_image_desktop || config.hero_image}
                alt={config.athlete_name}
                className="w-full h-full object-cover object-top hidden md:block"
              />
            )}
          </>
        )}
        {loading && (
          <div className="w-full h-full bg-gray-900 animate-pulse" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-20 px-6 md:px-12 lg:px-24 flex flex-col gap-4 md:max-w-3xl">
        {/* Live Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-black/60 backdrop-blur-md px-3 py-1.5 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Live: {totalViews} Views (30d)
          </span>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold uppercase leading-[0.9] tracking-tighter text-white drop-shadow-2xl">
            {config.athlete_name.split(' ').map((word, i) => (
              <React.Fragment key={i}>
                {word}
                {i < config.athlete_name.split(' ').length - 1 && <br className="md:hidden" />}
                {i < config.athlete_name.split(' ').length - 1 && <span className="hidden md:inline"> </span>}
              </React.Fragment>
            ))}
          </h1>
          <h2 className="mt-3 text-sm md:text-lg font-bold tracking-widest uppercase text-gray-300">
            {config.tagline}
          </h2>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;