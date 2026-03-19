import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

const useNutriAuth = () => localStorage.getItem('nutri_auth') === 'true';

export default function NutriLayout() {
    const isAuth = useNutriAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    const hideNavPaths = ['/nutri/login'];
    const showNav = isAuth && !hideNavPaths.some(p => location.pathname.startsWith(p));

    if (!isAuth && location.pathname !== '/nutri/login') {
        return <Navigate to="/nutri/login" replace />;
    }

    return (
        <div className="min-h-screen text-white font-sans antialiased" style={{
            background: 'linear-gradient(180deg, #0f172a 0%, #064e3b 100%)',
        }}>
            <style>{`
                .material-symbols-outlined { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
                .nutri-card { background: rgba(255,255,255,0.05); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); }
                .nutri-card-solid { background: rgba(15,23,42,0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.06); }
                .nutri-glow { box-shadow: 0 0 40px rgba(52,211,153,0.1); }
                .nutri-btn { background: linear-gradient(135deg, #059669, #34d399); box-shadow: 0 4px 20px rgba(52,211,153,0.2); }
                .nutri-btn:active { transform: scale(0.96); }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
                .animate-enter { animation: fadeIn 0.4s ease-out both; }
            `}</style>
            <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto overflow-x-hidden" style={{ boxShadow: '0 0 80px rgba(0,0,0,0.5)' }}>
                <Outlet />

                {showNav && (
                    <nav className="fixed bottom-0 w-full max-w-md px-3 pb-5 pt-2 z-50" style={{
                        background: 'linear-gradient(to top, rgba(15,23,42,0.98) 60%, transparent)',
                    }}>
                        <div className="flex justify-around items-center rounded-2xl p-2" style={{
                            background: 'rgba(255,255,255,0.06)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                        }}>
                            <NavItem icon="home" label="Início" active={location.pathname === '/nutri'} onClick={() => navigate('/nutri')} />
                            <NavItem icon="restaurant" label="Refeições" active={location.pathname === '/nutri/meals'} onClick={() => navigate('/nutri/meals')} />
                            <NavItem icon="analytics" label="Evolução" active={location.pathname === '/nutri/analytics'} onClick={() => navigate('/nutri/analytics')} />
                        </div>
                    </nav>
                )}
            </div>
        </div>
    );
}

function NavItem({ icon, label, active, onClick }: {
    icon: string; label: string; active: boolean; onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-all ${active ? 'text-emerald-400' : 'text-white/30 hover:text-white/60'}`}
            style={active ? { background: 'rgba(52,211,153,0.1)' } : {}}
        >
            <span className="material-symbols-outlined text-[22px]">{icon}</span>
            <span className="text-[10px] font-bold tracking-wider">{label}</span>
        </button>
    );
}
