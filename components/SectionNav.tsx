import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';

interface SectionNavProps {
    title: string;
    subtitle?: string;
}

const SectionNav: React.FC<SectionNavProps> = ({ title, subtitle }) => {
    const location = useLocation();
    const isHome = location.pathname === '/';

    if (isHome) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-50 bg-hf-navy/80 backdrop-blur-xl border-b border-hf-line/70"
        >
            <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-hf-ice/55 hover:text-hf-ice transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full bg-hf-ice/5 flex items-center justify-center group-hover:bg-hf-gold/15 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                    </Link>
                    <div>
                        <h1 className="font-brand text-sm font-semibold text-hf-ice leading-none">{title}</h1>
                        {subtitle && (
                            <p className="font-ui text-[10px] text-hf-ice/55 mt-0.5">{subtitle}</p>
                        )}
                    </div>
                </div>
                <Link
                    to="/"
                    className="flex items-center gap-1.5 font-ui text-[10px] font-semibold text-hf-ice/55 hover:text-hf-gold uppercase tracking-widest transition-colors"
                >
                    <Home className="w-3 h-3" />
                    Hub
                </Link>
            </div>
        </motion.div>
    );
};

export default SectionNav;
