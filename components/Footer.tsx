import React from 'react';
import { Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-black text-center py-12 pb-32 border-t border-white/5">
            <div className="flex flex-col items-center gap-8">
                {/* Social Links */}
                <div className="flex items-center gap-6">
                    <a
                        href="https://instagram.com/henriquefujimoto"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center gap-1"
                    >
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-pink-600 transition-colors">
                            <Instagram className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase group-hover:text-white transition-colors">Instagram</span>
                    </a>

                    <a
                        href="https://www.youtube.com/@henriquefujimotojudo"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center gap-1"
                    >
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                            <Youtube className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase group-hover:text-white transition-colors">Youtube</span>
                    </a>
                </div>

                {/* Infuse Credit */}
                <div className="flex flex-col items-center gap-3 mt-4 opacity-50 hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Desenvolvido por</span>
                    <img
                        src="https://pxremkvxoybqxfmxdyfc.supabase.co/storage/v1/object/public/site-images/partners/partner-1769994228346.png"
                        alt="Infuse Comunicação"
                        className="h-10 w-auto grayscale hover:grayscale-0 transition-all duration-300"
                    />
                </div>

                {/* Copyright */}
                <p className="text-[10px] text-gray-700 font-medium tracking-wide">
                    © {new Date().getFullYear()} HENRIQUE FUJIMOTO
                </p>
            </div>
        </footer>
    );
};

export default Footer;
