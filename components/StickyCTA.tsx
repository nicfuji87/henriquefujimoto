import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { analytics } from '../lib/analytics';

const StickyCTA: React.FC = () => {
  const { config } = useSiteConfig();

  const handleClick = () => {
    analytics.trackCTA('sticky_footer', config.cta_text || 'Apoiar Atleta');
    if (config.cta_link) {
      window.open(config.cta_link, '_blank');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-[2px]">
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="w-full relative overflow-hidden group bg-primary text-black font-black tracking-wide text-lg py-4 rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] border border-white/20"
      >
        <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
        <span className="relative flex items-center justify-center gap-2">
          <span>{config.cta_text?.toUpperCase() || 'APOIAR O ATLETA'}</span>
          <MessageCircle className="w-6 h-6 fill-black" />
        </span>
      </motion.button>
    </div>
  );
};

export default StickyCTA;