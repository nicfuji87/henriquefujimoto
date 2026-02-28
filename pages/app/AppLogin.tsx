import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AppLogin() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (login === 'Henrique' && password === 'Henrique09') {
            localStorage.setItem('app_auth', 'true');
            // Redirect to home dashboard
            navigate('/app', { replace: true });
        } else {
            setError('Credenciais incorretas.');
        }
    };

    return (
        <div className="bg-app-bg-light dark:bg-app-bg-dark font-app-display text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-4xl text-app-primary">lock</span>
                    </div>
                    <h1 className="text-2xl font-bold">Diário do Atleta</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Faça login para continuar</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold mb-2">Login</label>
                        <input
                            type="text"
                            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-app-primary text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                            placeholder="Digite seu login"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Senha</label>
                        <input
                            type="password"
                            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-app-primary text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                            placeholder="Digite sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-app-primary hover:bg-app-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-app-primary/30 transition-transform active:scale-95"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
}
