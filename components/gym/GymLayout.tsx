import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

const useGymAuth = () => localStorage.getItem('gym_auth') === 'true';

export default function GymLayout() {
    const isAuth = useGymAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    // Pages that hide the bottom nav (full-screen flows)
    const hideNavPaths = [
        '/gym/login',
        '/gym/onboarding',
        '/gym/register',
        '/gym/checkin',
        '/gym/workout',
        '/gym/workout-done',
    ];

    const showNav = isAuth && !hideNavPaths.some(p => location.pathname.startsWith(p));

    // Redirect to login if not authenticated
    if (!isAuth && location.pathname !== '/gym/login') {
        return <Navigate to="/gym/login" replace />;
    }

    return (
        <div className="bg-gym-bg min-h-screen text-gym-text font-app-display antialiased">
            <style>{`
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
                .gym-no-scrollbar::-webkit-scrollbar { display: none; }
                .gym-no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-gym-bg shadow-2xl overflow-x-hidden">
                <Outlet />

                {/* Bottom Navigation */}
                {showNav && (
                    <nav className="fixed bottom-0 w-full max-w-md bg-gym-surface border-t border-gym-surface-light px-4 pb-6 pt-2 z-50">
                        <div className="flex justify-between items-center">
                            <NavItem
                                icon="today"
                                label="Hoje"
                                active={location.pathname === '/gym'}
                                onClick={() => navigate('/gym')}
                            />
                            <NavItem
                                icon="calendar_month"
                                label="Agenda"
                                active={location.pathname === '/gym/schedule'}
                                onClick={() => navigate('/gym/schedule')}
                            />
                            <NavItem
                                icon="emoji_events"
                                label="Compet."
                                active={location.pathname === '/gym/competitions'}
                                onClick={() => navigate('/gym/competitions')}
                            />
                            <NavItem
                                icon="person"
                                label="Perfil"
                                active={location.pathname === '/gym/profile'}
                                onClick={() => navigate('/gym/profile')}
                            />
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
            className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${active ? 'text-gym-primary' : 'text-gym-muted hover:text-gym-primary'}`}
        >
            <span className="material-symbols-outlined text-[22px]">{icon}</span>
            <span className="text-[10px] font-medium tracking-wide">{label}</span>
        </button>
    );
}
