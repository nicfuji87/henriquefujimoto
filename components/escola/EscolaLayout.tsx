import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    canViewAnamnese, canViewLessons, escolaLogout, getEscolaName, getEscolaRole,
    isEscolaAuth, ROLE_LABEL,
} from '../../lib/escola-auth';

export default function EscolaLayout() {
    const isAuth = isEscolaAuth();
    const role = getEscolaRole();
    const name = getEscolaName();
    const location = useLocation();
    const navigate = useNavigate();
    const [showMore, setShowMore] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        setShowMore(false);
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
        { path: '/escola/biblioteca', icon: 'folder_copy', label: 'Materiais' },
        { path: '/escola/provas', icon: 'event_note', label: 'Provas' },
        { path: '/escola/notas', icon: 'trending_up', label: 'Notas' },
    ];

    /** O que não coube na barra de baixo entra no menu "Mais".
     *  A agenda da semana sai da barra porque o dia de hoje já abre na tela inicial. */
    const moreItems = [
        { path: '/escola/rotina', icon: 'calendar_view_week', label: 'Agenda da semana' },
        ...(canViewLessons(role) ? [{ path: '/escola/diario', icon: 'auto_stories', label: 'Diário de aula' }] : []),
        ...(canViewAnamnese(role) ? [{ path: '/escola/anamnese', icon: 'description', label: 'Ficha do aluno' }] : []),
    ];

    return (
        <div className="min-h-screen font-sans antialiased escola-root">
            <style>{`
                /* Identidade "Tatame": preto premium + acento lime, igual ao site público. */
                .escola-root {
                    --bg: #0a0b0d;
                    --surface: #141619;
                    --surface-2: #1b1e22;
                    --line: #282c31;
                    --fg: #ffffff;
                    --fg-soft: rgba(255,255,255,.55);
                    --accent: #c6f24e;
                    --accent-dim: #a9d92f;
                    --accent-ink: #0a0b0d;
                    --ok: #c6f24e;
                    --warn: #fbbf24;
                    --danger: #f87171;
                    background: var(--bg);
                    color: var(--fg);
                    font-family: 'Hanken Grotesk', system-ui, sans-serif;
                }
                .escola-root .material-symbols-outlined { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
                .escola-serif { font-family: 'Fraunces', Georgia, serif; }
                .escola-card {
                    background: var(--surface);
                    border: 1px solid rgba(255,255,255,.07);
                    border-radius: 24px;
                }
                .escola-card-soft {
                    background: var(--surface);
                    border: 1px solid rgba(255,255,255,.07);
                    border-radius: 20px;
                    transition: border-color .2s ease;
                }
                .escola-card-soft:hover { border-color: rgba(255,255,255,.15); }
                /* Destaque editorial: itálico serifado em lime, como nos títulos do site. */
                .escola-mark {
                    font-family: 'Fraunces', Georgia, serif;
                    font-style: italic;
                    font-weight: 400;
                    color: var(--accent);
                }
                .escola-btn {
                    background: var(--accent);
                    color: var(--accent-ink);
                    border-radius: 999px;
                    font-weight: 600;
                    transition: background .2s ease, transform .12s ease;
                }
                .escola-btn:hover { background: var(--accent-dim); }
                .escola-btn:active { transform: scale(0.97); }
                .escola-btn:disabled { opacity: .35; }
                .escola-input {
                    background: var(--surface-2);
                    border: 1px solid var(--line);
                    border-radius: 14px;
                    padding: 11px 13px;
                    width: 100%;
                    color: var(--fg);
                    font-size: 15px;
                    outline: none;
                }
                .escola-input::placeholder { color: rgba(255,255,255,.3); }
                .escola-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(198,242,78,.14); }
                /* O seletor de data do Chrome vem preto sobre preto no dark. */
                .escola-input::-webkit-calendar-picker-indicator { filter: invert(1) opacity(.6); }
                .escola-input option { background: var(--surface-2); color: var(--fg); }
                .escola-label { font-size: 11px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: var(--fg-soft); }
                @keyframes escolaIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
                .escola-enter { animation: escolaIn .35s ease-out both; }
                @media (prefers-reduced-motion: reduce) {
                    .escola-enter, .escola-btn { animation: none; transition: none; }
                }
            `}</style>

            <div className="mx-auto w-full max-w-2xl min-h-screen flex flex-col">
                {!isLogin && (
                    <header className="sticky top-0 z-40 px-4 pt-4 pb-3"
                        style={{ background: 'rgba(10,11,13,.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line)' }}>
                        <div className="flex items-center justify-between gap-3">
                            <button onClick={() => { navigate('/escola'); }} className="flex items-center gap-2.5 text-left">
                                <span className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>
                                    <span className="material-symbols-outlined text-[20px]">school</span>
                                </span>
                                <span>
                                    <span className="block text-[15px] font-semibold leading-tight">Estudos do Henrique</span>
                                    <span className="block text-[11px] font-semibold" style={{ color: 'var(--fg-soft)' }}>
                                        {name || (role ? ROLE_LABEL[role] : '')}
                                    </span>
                                </span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ border: '1px solid var(--line)', color: 'var(--fg-soft)' }}
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
                        style={{ background: 'linear-gradient(to top, var(--bg) 65%, transparent)' }}>
                        <div className="flex justify-around items-center rounded-2xl p-1.5"
                            style={{
                                background: 'rgba(20,22,25,.92)',
                                backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(255,255,255,.08)',
                            }}>
                            {nav.map(item => (
                                <NavItem
                                    key={item.path}
                                    icon={item.icon}
                                    label={item.label}
                                    active={location.pathname === item.path}
                                    onClick={() => { navigate(item.path); }}
                                />
                            ))}
                            <NavItem
                                icon="more_horiz"
                                label="Mais"
                                active={moreItems.some(m => m.path === location.pathname)}
                                onClick={() => setShowMore(true)}
                            />
                        </div>
                    </nav>
                )}

                {showMore && (
                    <div className="fixed inset-0 z-[70] flex items-end justify-center p-4"
                        style={{ background: 'rgba(10,11,13,.75)', backdropFilter: 'blur(4px)' }}
                        onClick={() => setShowMore(false)}>
                        <div className="escola-card w-full max-w-md p-3 mb-2 escola-enter" onClick={e => e.stopPropagation()}>
                            {moreItems.map(item => (
                                <button key={item.path}
                                    onClick={() => { setShowMore(false); navigate(item.path); }}
                                    className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left"
                                    style={location.pathname === item.path ? { background: 'rgba(198,242,78,.10)' } : {}}>
                                    <span className="material-symbols-outlined text-[21px]"
                                        style={{ color: location.pathname === item.path ? 'var(--accent)' : 'var(--fg-soft)' }}>
                                        {item.icon}
                                    </span>
                                    <span className="text-[15px] font-semibold">{item.label}</span>
                                </button>
                            ))}
                            <button onClick={handleLogout}
                                className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left"
                                style={{ color: 'var(--danger)' }}>
                                <span className="material-symbols-outlined text-[21px]">logout</span>
                                <span className="text-[15px] font-semibold">Sair</span>
                            </button>
                        </div>
                    </div>
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
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 px-0.5 rounded-xl transition-all"
            style={active
                ? { background: 'var(--accent)', color: 'var(--accent-ink)' }
                : { color: 'rgba(255,255,255,.4)' }}
        >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
            <span className="text-[9px] font-semibold tracking-wide">{label}</span>
        </button>
    );
}
