import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  display_order: number;
  is_active: boolean;
};

const TrustWall: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  async function fetchPartners() {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPartners(data || []);
    } catch (err) {
      console.error('Error fetching partners:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || partners.length === 0) {
    return null;
  }

  // Generate initials from name for fallback logo
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <section className="py-10 bg-black/20 border-y border-white/5">
      <div className="px-6 mb-5">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Parceiros de Confiança</h3>
      </div>

      {/* Marquee Container */}
      <div className="w-full overflow-hidden relative group">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>

        <motion.div
          className="flex gap-12 px-6 items-center w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        >
          {/* Items duplicated for seamless loop */}
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              {partners.map((partner) => {
                const content = partner.logo_url ? (
                  /* If has logo, show only the logo (larger size) */
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    className="h-20 w-auto max-w-[180px] object-contain"
                  />
                ) : (
                  /* If no logo, show initial circle + name */
                  <>
                    <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-black font-black text-xl">
                      {getInitials(partner.name)}
                    </div>
                    <span className="text-xl font-bold text-white tracking-tighter">{partner.name}</span>
                  </>
                );

                const wrapperClass = "flex items-center gap-2 shrink-0 select-none grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100 cursor-pointer";

                return partner.website_url ? (
                  <a
                    key={`${partner.id}-${i}`}
                    href={partner.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={wrapperClass}
                  >
                    {content}
                  </a>
                ) : (
                  <div
                    key={`${partner.id}-${i}`}
                    className={wrapperClass}
                  >
                    {content}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustWall;