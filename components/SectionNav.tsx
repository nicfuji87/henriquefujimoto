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
            className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5"
        >
            <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                    </Link>
                    <div>
                        <h1 className="text-sm font-bold text-white leading-none">{title}</h1>
                        {subtitle && (
                            <p className="text-[10px] text-gray-500 mt-0.5">{subtitle}</p>
                        )}
                    </div>
                </div>
                <Link
                    to="/"
                    className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 hover:text-primary uppercase tracking-widest transition-colors"
                >
                    <Home className="w-3 h-3" />
                    Hub
                </Link>
            </div>
        </motion.div>
    );
};

export default SectionNav;
