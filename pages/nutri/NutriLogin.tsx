import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NutriLogin() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (login === 'Henrique' && password === 'Henrique09') {
            localStorage.setItem('nutri_auth', 'true');
            navigate('/nutri', { replace: true });
        } else {
            setError('Credenciais incorretas.');
            setShake(true);
            setTimeout(() => setShake(false), 600);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-5" style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #0f172a 100%)',
        }}>
            <style>{`
                @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: none; } }
                @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
                .animate-fade-up { animation: fadeUp 0.7s ease-out both; }
                .animate-shake { animation: shake 0.4s; }
                .nutri-glass { background: rgba(255,255,255,0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
                .nutri-input { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); }
                .nutri-input:focus { border-color: #34d399; box-shadow: 0 0 0 3px rgba(52,211,153,0.15); }
            `}</style>
            <div className={`w-full max-w-sm animate-fade-up ${shake ? 'animate-shake' : ''}`}>
                {/* Floating orb */}
                <div className="relative mx-auto mb-8 w-24 h-24">
                    <div className="absolute inset-0 rounded-full" style={{
                        background: 'radial-gradient(circle, rgba(52,211,153,0.3) 0%, transparent 70%)',
                        filter: 'blur(15px)',
                    }} />
                    <div className="relative w-24 h-24 rounded-full flex items-center justify-center" style={{
                        background: 'linear-gradient(135deg, #059669, #34d399)',
                        boxShadow: '0 0 40px rgba(52,211,153,0.3)',
                    }}>
                        <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Nutrição</h1>
                    <p className="text-emerald-400/60 mt-2 text-sm font-medium">Controle diário de saúde & performance</p>
                </div>

                <div className="nutri-glass rounded-3xl p-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center font-medium">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold mb-2 text-emerald-400/70 uppercase tracking-wider">Login</label>
                            <input
                                type="text"
                                className="nutri-input w-full p-3.5 rounded-xl text-white text-sm focus:outline-none transition-all placeholder:text-white/20"
                                placeholder="Digite seu login"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold mb-2 text-emerald-400/70 uppercase tracking-wider">Senha</label>
                            <input
                                type="password"
                                className="nutri-input w-full p-3.5 rounded-xl text-white text-sm focus:outline-none transition-all placeholder:text-white/20"
                                placeholder="Digite sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-2 font-bold py-3.5 rounded-xl text-white transition-all active:scale-95"
                            style={{
                                background: 'linear-gradient(135deg, #059669, #34d399)',
                                boxShadow: '0 8px 30px rgba(52,211,153,0.25)',
                            }}
                        >
                            Entrar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
