import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { escolaLogin } from '../../lib/escola-auth';

const PROFILES = [
    { key: 'familia', name: 'Família', desc: 'Pais e responsáveis', icon: 'diversity_1' },
    { key: 'andrea', name: 'Profª Andréa', desc: 'Professora particular', icon: 'school' },
    { key: 'henrique', name: 'Henrique', desc: 'Aluno', icon: 'sports_martial_arts' },
];

export default function EscolaLogin() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        if (escolaLogin(profile, password)) {
            navigate('/escola', { replace: true });
        } else {
            setError('Senha incorreta.');
            setPassword('');
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    };

    const selected = PROFILES.find(p => p.key === profile);

    return (
        <div className="min-h-screen flex items-center justify-center px-5 py-10">
            <style>{`
                @keyframes escolaShake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-7px)} 40%,80%{transform:translateX(7px)} }
                .escola-shake { animation: escolaShake .4s; }
            `}</style>

            <div className={`w-full max-w-md escola-enter ${shake ? 'escola-shake' : ''}`}>
                <div className="text-center mb-8">
                    <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-4"
                        style={{ background: 'var(--ink)', color: 'var(--marker)', boxShadow: '4px 4px 0 var(--marker)' }}>
                        <span className="material-symbols-outlined text-[32px]">school</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Estudos do Henrique</h1>
                    <p className="escola-serif italic text-[17px] mt-1" style={{ color: 'var(--ink-soft)' }}>
                        acompanhamento pedagógico
                    </p>
                </div>

                {!profile ? (
                    <div className="space-y-3">
                        <p className="escola-label text-center mb-4">Quem está entrando?</p>
                        {PROFILES.map(p => (
                            <button
                                key={p.key}
                                onClick={() => { setProfile(p.key); setError(''); }}
                                className="escola-card w-full flex items-center gap-3.5 p-4 text-left"
                            >
                                <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ background: 'var(--marker)' }}>
                                    <span className="material-symbols-outlined text-[22px]">{p.icon}</span>
                                </span>
                                <span className="flex-1">
                                    <span className="block font-extrabold text-[16px]">{p.name}</span>
                                    <span className="block text-[13px]" style={{ color: 'var(--ink-soft)' }}>{p.desc}</span>
                                </span>
                                <span className="material-symbols-outlined" style={{ color: 'var(--ink-soft)' }}>chevron_right</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="escola-card p-6">
                        <button
                            type="button"
                            onClick={() => { setProfile(null); setPassword(''); setError(''); }}
                            className="flex items-center gap-1 text-[13px] font-bold mb-5"
                            style={{ color: 'var(--ink-soft)' }}
                        >
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                            trocar de perfil
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <span className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--marker)' }}>
                                <span className="material-symbols-outlined text-[24px]">{selected?.icon}</span>
                            </span>
                            <div>
                                <p className="font-extrabold text-[17px] leading-tight">{selected?.name}</p>
                                <p className="text-[13px]" style={{ color: 'var(--ink-soft)' }}>{selected?.desc}</p>
                            </div>
                        </div>

                        <label className="escola-label block mb-2">Senha</label>
                        <input
                            type="password"
                            className="escola-input"
                            value={password}
                            onChange={e => { setPassword(e.target.value); setError(''); }}
                            placeholder="••••••••"
                            autoFocus
                            autoComplete="current-password"
                        />

                        {error && (
                            <p className="mt-3 text-[13px] font-bold flex items-center gap-1.5" style={{ color: '#b91c1c' }}>
                                <span className="material-symbols-outlined text-[18px]">error</span>
                                {error}
                            </p>
                        )}

                        <button type="submit" disabled={!password} className="escola-btn w-full py-3.5 mt-5">
                            Entrar
                        </button>
                    </form>
                )}

                <p className="text-center text-[12px] mt-6" style={{ color: 'var(--ink-soft)' }}>
                    Área privada · dados de acompanhamento escolar
                </p>
            </div>
        </div>
    );
}
