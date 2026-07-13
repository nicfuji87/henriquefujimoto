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
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8 bg-gradient-to-t from-night via-night/95 to-transparent backdrop-blur-[2px]">
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-lime px-6 py-4 font-grotesk text-base font-semibold text-night shadow-[0_12px_40px_-8px_rgba(198,242,78,0.5)] transition-colors hover:bg-lime-dim"
      >
        <span>{config.cta_text || 'Apoiar o atleta'}</span>
        <MessageCircle className="w-5 h-5" />
      </motion.button>
    </div>
  );
};

export default StickyCTA;