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
        <div className="bg-slate-50 min-h-screen text-slate-900 font-sans antialiased">
            <style>{`
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
            `}</style>
            <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-white shadow-2xl overflow-x-hidden">
                <Outlet />

                {showNav && (
                    <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-slate-200 px-2 pb-6 pt-2 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div className="flex justify-around items-center">
                            <NavItem
                                icon="home"
                                label="Início"
                                active={location.pathname === '/nutri'}
                                onClick={() => navigate('/nutri')}
                            />
                            {/* Can add more tabs here in the future if needed */}
                        </div>
                    </nav>
                )}
            </div>
        </div>
    );
}

function NavItem({ icon, label, active, onClick }: {
    icon: string;
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${active ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-500'}`}
        >
            <span className="material-symbols-outlined text-[24px]">{icon}</span>
            <span className="text-xs font-medium tracking-wide">{label}</span>
        </button>
    );
}
