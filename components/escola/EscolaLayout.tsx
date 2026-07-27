import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { canViewLessons, escolaLogout, getEscolaName, getEscolaRole, isEscolaAuth, ROLE_LABEL } from '../../lib/escola-auth';

export default function EscolaLayout() {
    const isAuth = isEscolaAuth();
    const role = getEscolaRole();
    const name = getEscolaName();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    const isLogin = location.pathname === '/escola/login';

    if (!isAuth && !isLogin) return <Navigate to="/escola/login" replace />;
    if (isAuth && isLogin) return <Navigate to="/escola" replace />;

    const handleLogout = () => {
        escolaLogout();
        navigate('/escola/login', { replace: true });
    };

    const nav = [
        { path: '/escola', icon: 'home', label: 'Início' },
        { path: '/escola/tarefas', icon: 'checklist', label: 'Tarefas' },
        { path: '/escola/provas', icon: 'event_note', label: 'Provas' },
        { path: '/escola/notas', icon: 'trending_up', label: 'Notas' },
        ...(canViewLessons(role) ? [{ path: '/escola/diario', icon: 'auto_stories', label: 'Diário' }] : []),
    ];

    return (
        <div className="min-h-screen font-sans antialiased escola-root">
            <style>{`
                .escola-root {
                    --paper: #fbf7ef;
                    --paper-2: #ffffff;
                    --ink: #17140f;
                    --ink-soft: #6b6459;
                    --line: #e6ddcd;
                    --pen: #2b4eff;
                    --marker: #ffd84d;
                    background: var(--paper);
                    color: var(--ink);
                    font-family: 'Hanken Grotesk', system-ui, sans-serif;
                }
                .escola-root .material-symbols-outlined { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
                .escola-serif { font-family: 'Fraunces', Georgia, serif; }
                /* folha de caderno pautada */
                .escola-ruled {
                    background-image: repeating-linear-gradient(to bottom, transparent 0 31px, var(--line) 31px 32px);
                }
                .escola-card {
                    background: var(--paper-2);
                    border: 1.5px solid var(--ink);
                    border-radius: 18px;
                    box-shadow: 3px 3px 0 var(--ink);
                }
                .escola-card-soft {
                    background: var(--paper-2);
                    border: 1px solid var(--line);
                    border-radius: 16px;
                }
                .escola-mark {
                    background: linear-gradient(to bottom, transparent 55%, var(--marker) 55%);
                    padding: 0 2px;
                }
                .escola-btn {
                    background: var(--ink);
                    color: var(--paper);
                    border-radius: 999px;
                    font-weight: 800;
                    transition: transform .12s ease;
                }
                .escola-btn:active { transform: scale(0.97); }
                .escola-btn:disabled { opacity: .4; }
                .escola-input {
                    background: var(--paper-2);
                    border: 1.5px solid var(--line);
                    border-radius: 12px;
                    padding: 10px 12px;
                    width: 100%;
                    color: var(--ink);
                    font-size: 15px;
                    outline: none;
                }
                .escola-input:focus { border-color: var(--pen); box-shadow: 0 0 0 3px rgba(43,78,255,.12); }
                .escola-label { font-size: 12px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: var(--ink-soft); }
                @keyframes escolaIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
                .escola-enter { animation: escolaIn .35s ease-out both; }
                @media (prefers-reduced-motion: reduce) {
                    .escola-enter, .escola-btn { animation: none; transition: none; }
                }
            `}</style>

            <div className="mx-auto w-full max-w-2xl min-h-screen flex flex-col">
                {!isLogin && (
                    <header className="sticky top-0 z-40 px-4 pt-4 pb-3" style={{ background: 'var(--paper)', borderBottom: '1px solid var(--line)' }}>
                        <div className="flex items-center justify-between gap-3">
                            <button onClick={() => navigate('/escola')} className="flex items-center gap-2.5 text-left">
                                <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--ink)', color: 'var(--marker)' }}>
                                    <span className="material-symbols-outlined text-[20px]">school</span>
                                </span>
                                <span>
                                    <span className="block text-[15px] font-extrabold leading-tight">Estudos do Henrique</span>
                                    <span className="block text-[11px] font-semibold" style={{ color: 'var(--ink-soft)' }}>
                                        {name || (role ? ROLE_LABEL[role] : '')}
                                    </span>
                                </span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ border: '1px solid var(--line)', color: 'var(--ink-soft)' }}
                                title="Sair"
                            >
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                            </button>
                        </div>
                    </header>
                )}

                <main className={`flex-1 ${isLogin ? '' : 'px-4 pt-5 pb-28'}`}>
                    <Outlet />
                </main>

                {!isLogin && (
                    <nav className="fixed bottom-0 w-full max-w-2xl px-3 pb-4 pt-2 z-50"
                        style={{ background: 'linear-gradient(to top, var(--paper) 65%, transparent)' }}>
                        <div className="flex justify-around items-center rounded-2xl p-1.5"
                            style={{ background: 'var(--ink)', boxShadow: '0 8px 30px rgba(0,0,0,.18)' }}>
                            {nav.map(item => (
                                <NavItem
                                    key={item.path}
                                    icon={item.icon}
                                    label={item.label}
                                    active={location.pathname === item.path}
                                    onClick={() => { navigate(item.path); }}
                                />
                            ))}
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
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-all"
            style={active
                ? { background: 'var(--marker)', color: '#17140f' }
                : { color: 'rgba(251,247,239,.45)' }}
        >
            <span className="material-symbols-outlined text-[21px]">{icon}</span>
            <span className="text-[10px] font-extrabold tracking-wide">{label}</span>
        </button>
    );
}
