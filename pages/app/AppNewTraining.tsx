import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrainingWizard } from '../../components/app/AppLayout';

export default function AppNewTraining() {
    const navigate = useNavigate();
    const { updateTraining } = useTrainingWizard();

    const [modality, setModality] = useState('Judô');
    const [trainingType, setTrainingType] = useState('Técnica');

    const handleContinue = () => {
        updateTraining({ modality, training_type: trainingType });
        navigate('/app/training-reflection');
    };

    return (
        <div className="bg-app-bg-light dark:bg-app-bg-dark font-app-display antialiased text-slate-900 dark:text-slate-100 min-h-screen flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center p-4 pb-2 justify-between relative z-10 bg-app-bg-light/95 dark:bg-app-bg-dark/95 backdrop-blur-sm">
                <button onClick={() => navigate('/app')} aria-label="Voltar" className="flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-900 dark:text-slate-100" style={{ fontSize: '24px' }}>arrow_back</span>
                </button>
                <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Novo Treino</h2>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-4 pb-24">
                <h3 className="tracking-tight text-2xl font-bold leading-tight text-left pb-4 pt-4">Escolha a Modalidade</h3>

                {/* Modality Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {/* Judo Card */}
                    <label className="group relative flex flex-col gap-3 cursor-pointer">
                        <input checked={modality === 'Judô'} onChange={() => setModality('Judô')} className="peer sr-only" name="modality" type="radio" value="judo" />
                        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-sm transition-all duration-300 ring-2 ring-transparent peer-checked:ring-app-primary peer-checked:ring-offset-2 peer-checked:ring-offset-app-bg-light dark:peer-checked:ring-offset-app-bg-dark peer-checked:shadow-lg">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDkyg3TqIQcf3-2glRGgjsD72QhAjMGVhiMlfStmd2WbYJ3GyfU_n2hecDXFx7_ebLn81Wued9cIXKxCkPxdWB1RPdA7cp418piE3x-1RaHibQ9dtTukHccrC07UysrE8U16S_OXOlPOnuH0fFka7ikHFvsEeXGSUZ9EL96w-My1bkTTOlpIjE7bp0UKSg3VxYyN8ad998GPPzG8bfUOQ0ucfXBpPhOoUTjuSprL7PURFdsNuhuF24bp6HZhfsAjb9Bohye8tkVzf_E")' }}
                            ></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-5 w-full">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-white text-2xl font-bold leading-normal mb-1">Judô</p>
                                        <p className="text-blue-100 text-sm font-medium leading-normal opacity-90">O Caminho Suave</p>
                                    </div>
                                    <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 peer-checked:opacity-100 transition-opacity bg-white/20 p-1 rounded-full">check_circle</span>
                                </div>
                            </div>
                        </div>
                    </label>

                    {/* Jiu-Jitsu Card */}
                    <label className="group relative flex flex-col gap-3 cursor-pointer">
                        <input checked={modality === 'Jiu-Jitsu'} onChange={() => setModality('Jiu-Jitsu')} className="peer sr-only" name="modality" type="radio" value="jiujitsu" />
                        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-sm transition-all duration-300 ring-2 ring-transparent peer-checked:ring-purple-500 peer-checked:ring-offset-2 peer-checked:ring-offset-app-bg-light dark:peer-checked:ring-offset-app-bg-dark peer-checked:shadow-lg">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCdJ3Kbtx9-RAAR8V9kLXecLbXsazw_dkr1OH-mvLIOoQk8HT-HWDCK9_LcB-0fJlpF44b_4ufFerq9a2Bm7L2Xl_fZKai_vfyJl-kkWLWLhlarC-M3z2-PsucBnIGfLc04jymK-i_ehG9yuUCXVphI3hSP4Ue1wz-IxJXAWxq9_E9AzqiSmqwp2QLo8mMqGaIBFMV7GRmqM62n8ufleiOUmg6uG__3mWmUaYsmSITXjSReN7q2MtiHkEfBgq_EkmSJn3hj4REl8xdQ")' }}
                            ></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/40 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-5 w-full">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-white text-2xl font-bold leading-normal mb-1">Jiu-Jitsu</p>
                                        <p className="text-purple-100 text-sm font-medium leading-normal opacity-90">Arte Suave</p>
                                    </div>
                                    <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 peer-checked:opacity-100 transition-opacity bg-white/20 p-1 rounded-full">check_circle</span>
                                </div>
                            </div>
                        </div>
                    </label>
                </div>

                <h3 className="tracking-tight text-xl font-bold leading-tight text-left pb-4 pt-2">Tipo de Treino</h3>

                {/* Training Type Chips */}
                <div className="flex flex-wrap gap-3">
                    <label className="cursor-pointer">
                        <input checked={trainingType === 'Técnica'} onChange={() => setTrainingType('Técnica')} className="peer sr-only" name="type" type="radio" value="Técnica" />
                        <div className="flex h-10 items-center justify-center gap-x-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2 transition-all peer-checked:bg-app-primary peer-checked:text-white peer-checked:border-app-primary hover:bg-slate-50 dark:hover:bg-slate-700">
                            <span className="material-symbols-outlined text-[18px]">school</span>
                            <p className="text-sm font-medium">Técnica</p>
                        </div>
                    </label>
                    <label className="cursor-pointer">
                        <input checked={trainingType === 'Randori'} onChange={() => setTrainingType('Randori')} className="peer sr-only" name="type" type="radio" value="Randori" />
                        <div className="flex h-10 items-center justify-center gap-x-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2 transition-all peer-checked:bg-app-primary peer-checked:text-white peer-checked:border-app-primary hover:bg-slate-50 dark:hover:bg-slate-700">
                            <span className="material-symbols-outlined text-[18px]">sports_martial_arts</span>
                            <p className="text-sm font-medium">Randori / Rolo</p>
                        </div>
                    </label>
                    <label className="cursor-pointer">
                        <input checked={trainingType === 'Físico'} onChange={() => setTrainingType('Físico')} className="peer sr-only" name="type" type="radio" value="Físico" />
                        <div className="flex h-10 items-center justify-center gap-x-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2 transition-all peer-checked:bg-app-primary peer-checked:text-white peer-checked:border-app-primary hover:bg-slate-50 dark:hover:bg-slate-700">
                            <span className="material-symbols-outlined text-[18px]">fitness_center</span>
                            <p className="text-sm font-medium">Físico</p>
                        </div>
                    </label>
                    <label className="cursor-pointer">
                        <input checked={trainingType === 'Misto'} onChange={() => setTrainingType('Misto')} className="peer sr-only" name="type" type="radio" value="Misto" />
                        <div className="flex h-10 items-center justify-center gap-x-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2 transition-all peer-checked:bg-app-primary peer-checked:text-white peer-checked:border-app-primary hover:bg-slate-50 dark:hover:bg-slate-700">
                            <span className="material-symbols-outlined text-[18px]">layers</span>
                            <p className="text-sm font-medium">Misto</p>
                        </div>
                    </label>
                </div>
            </main>

            {/* Bottom Action */}
            <div className="fixed bottom-0 left-0 w-full p-4 bg-app-bg-light dark:bg-app-bg-dark border-t border-slate-200 dark:border-slate-800">
                <button onClick={handleContinue} className="w-full h-12 bg-app-primary hover:bg-app-primary-dark text-white font-bold rounded-xl text-base flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-app-primary/30">
                    Continuar
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
            </div>
        </div>
    );
}
