import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GymLogin() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (login === 'Henrique' && password === 'Henrique09') {
            localStorage.setItem('gym_auth', 'true');
            navigate('/gym', { replace: true });
        } else {
            setError('Credenciais incorretas.');
        }
    };

    return (
        <div className="bg-gym-bg font-app-display text-gym-text min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo / Branding */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-gym-primary to-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-gym-primary/30">
                        <span className="material-symbols-outlined text-5xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>fitness_center</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Combat Prep</h1>
                    <p className="text-gym-muted mt-2 text-sm">Preparação física inteligente para atletas de combate</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {error && (
                        <div className="bg-gym-danger/10 border border-gym-danger/30 text-gym-danger p-3 rounded-xl text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gym-muted">Login</label>
                        <input
                            type="text"
                            className="w-full p-4 rounded-xl border border-gym-surface-light bg-gym-surface text-white focus:outline-none focus:ring-2 focus:ring-gym-primary placeholder:text-gym-muted/60"
                            placeholder="Digite seu login"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gym-muted">Senha</label>
                        <input
                            type="password"
                            className="w-full p-4 rounded-xl border border-gym-surface-light bg-gym-surface text-white focus:outline-none focus:ring-2 focus:ring-gym-primary placeholder:text-gym-muted/60"
                            placeholder="Digite sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-gym-primary to-blue-500 hover:from-gym-primary-dark hover:to-gym-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-gym-primary/30 transition-all active:scale-95"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
}
