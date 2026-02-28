import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppTraining, appApi } from '../../lib/api-app';

// Mock Auth logic
const useAuth = () => {
    return localStorage.getItem('app_auth') === 'true';
};

// Wizard Context
interface TrainingWizardContextType {
    training: Partial<AppTraining>;
    updateTraining: (data: Partial<AppTraining>) => void;
    saveTraining: () => Promise<void>;
    resetTraining: () => void;
    isSaving: boolean;
}

const TrainingWizardContext = createContext<TrainingWizardContextType | null>(null);

export const useTrainingWizard = () => {
    const context = useContext(TrainingWizardContext);
    if (!context) throw new Error('useTrainingWizard must be used within AppLayout');
    return context;
};

export default function AppLayout() {
    const isAuth = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Wizard state
    const [training, setTraining] = useState<Partial<AppTraining>>({});
    const [isSaving, setIsSaving] = useState(false);

    const updateTraining = (data: Partial<AppTraining>) => {
        setTraining(prev => ({ ...prev, ...data }));
    };

    const saveTraining = async () => {
        setIsSaving(true);
        try {
            await appApi.saveTraining(training);
            // Success, reset and go to home
            setTraining({});
            navigate('/app', { replace: true });
        } catch (err) {
            console.error('Error saving training:', err);
            alert('Houve um erro ao salvar o treino.');
        } finally {
            setIsSaving(false);
        }
    };

    const resetTraining = () => setTraining({});

    // Redirect if not authenticated
    if (!isAuth && location.pathname !== '/app/login') {
        return <Navigate to="/app/login" state={{ from: location }} replace />;
    }

    // Hide bottom nav in some wizard steps
    const hideNavPaths = [
        '/app/new-training',
        '/app/training-reflection',
        '/app/physical-evaluation',
        '/app/mental-focus',
        '/app/emotional-checkin',
        '/app/daily-evolution'
    ];

    const showNav = !hideNavPaths.includes(location.pathname) && isAuth;

    return (
        <TrainingWizardContext.Provider value={{ training, updateTraining, saveTraining, resetTraining, isSaving }}>
            <div className="bg-app-bg-light dark:bg-app-bg-dark min-h-screen text-slate-900 dark:text-slate-100 font-app-display antialiased">
                <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-white dark:bg-slate-900 shadow-2xl overflow-x-hidden">
                    <Outlet />

                    {/* Global Bottom Navigation for App */}
                    {showNav && (
                        <nav className="fixed bottom-0 w-full max-w-md bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 pb-6 pt-2 z-50">
                            <div className="flex justify-between items-center relative">
                                <a onClick={() => navigate('/app')} className={`flex flex-1 flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${location.pathname === '/app' ? 'text-app-primary' : 'text-slate-400 hover:text-app-primary'}`}>
                                    <span className={`material-symbols-outlined ${location.pathname === '/app' ? 'fill-current' : ''}`}>home</span>
                                    <span className="text-[10px] font-medium tracking-wide">Início</span>
                                </a>

                                <a onClick={() => navigate('/app/history')} className={`flex flex-1 flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${location.pathname === '/app/history' ? 'text-app-primary' : 'text-slate-400 hover:text-app-primary'}`}>
                                    <span className={`material-symbols-outlined ${location.pathname === '/app/history' ? 'fill-current' : ''}`}>history</span>
                                    <span className="text-[10px] font-medium tracking-wide">Diário</span>
                                </a>

                                {/* FAB (Floating Action Button) */}
                                <div className="relative -top-5 flex flex-1 justify-center z-10">
                                    <button onClick={() => navigate('/app/new-training')} className="flex h-14 w-14 items-center justify-center rounded-full bg-app-primary text-white shadow-lg shadow-blue-500/40 hover:scale-105 transition-transform active:scale-95">
                                        <span className="material-symbols-outlined text-3xl">add</span>
                                    </button>
                                </div>

                                <a className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 hover:text-app-primary transition-colors opacity-50 cursor-not-allowed">
                                    <span className="material-symbols-outlined">bar_chart</span>
                                    <span className="text-[10px] font-medium tracking-wide">Estat.</span>
                                </a>
                                <a className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 hover:text-app-primary transition-colors opacity-50 cursor-not-allowed">
                                    <span className="material-symbols-outlined">person</span>
                                    <span className="text-[10px] font-medium tracking-wide">Perfil</span>
                                </a>
                            </div>
                        </nav>
                    )}
                </div>
            </div>
        </TrainingWizardContext.Provider>
    );
}
