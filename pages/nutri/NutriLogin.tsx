import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NutriLogin() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (login === 'Henrique' && password === 'Henrique09') {
            localStorage.setItem('nutri_auth', 'true');
            navigate('/nutri', { replace: true });
        } else {
            setError('Credenciais incorretas.');
        }
    };

    return (
        <div className="bg-slate-50 font-sans text-slate-800 min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
                <div className="text-center mb-10 mt-4">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                        <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>nutrition</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Nutrição</h1>
                    <p className="text-slate-500 mt-2 text-sm">Controle diário e métricas de saúde</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-600">Login</label>
                        <input
                            type="text"
                            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
                            placeholder="Digite seu login"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-600">Senha</label>
                        <input
                            type="password"
                            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
                            placeholder="Digite sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
}
