import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const slides = [
    {
        icon: 'fitness_center',
        title: 'Treinos complementares inteligentes',
        subtitle: 'para atletas de combate',
        description: 'Receba sessões curtas e personalizadas que melhoram seu desempenho sem atrapalhar seu treino técnico.',
    },
    {
        icon: 'monitoring',
        title: 'O app entende sua rotina',
        subtitle: 'sua carga e suas competições',
        description: 'Periodização em blocos, controle de carga e ajuste diário por prontidão. Tudo adaptado à sua realidade.',
    },
    {
        icon: 'shield',
        title: 'Performance + Prevenção',
        subtitle: 'seu copiloto esportivo',
        description: 'Treinos que fazem sentido para o seu momento. Mais força, menos lesão, melhor preparação competitiva.',
    },
];

export default function GymOnboarding() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            navigate('/gym/register', { replace: true });
        }
    };

    const handleSkip = () => {
        navigate('/gym/register', { replace: true });
    };

    const slide = slides[currentSlide];

    return (
        <div className="bg-gym-bg min-h-screen flex flex-col font-app-display text-gym-text">
            {/* Skip button */}
            <div className="flex justify-end p-4">
                <button onClick={handleSkip} className="text-sm text-gym-muted hover:text-white transition-colors">
                    Pular
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                {/* Icon */}
                <div className="w-24 h-24 bg-gradient-to-br from-gym-primary/20 to-gym-primary/5 rounded-3xl flex items-center justify-center mb-8 border border-gym-primary/20">
                    <span className="material-symbols-outlined text-6xl text-gym-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {slide.icon}
                    </span>
                </div>

                {/* Text */}
                <h1 className="text-2xl font-bold text-white leading-tight mb-1">
                    {slide.title}
                </h1>
                <h2 className="text-lg font-semibold text-gym-primary mb-4">
                    {slide.subtitle}
                </h2>
                <p className="text-gym-muted text-sm leading-relaxed max-w-xs">
                    {slide.description}
                </p>
            </div>

            {/* Bottom */}
            <div className="px-8 pb-10">
                {/* Dots */}
                <div className="flex justify-center gap-2 mb-6">
                    {slides.map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-gym-primary' : 'w-2 bg-gym-surface-light'}`}
                        />
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-gym-primary to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-gym-primary/30 transition-all active:scale-95"
                >
                    {currentSlide < slides.length - 1 ? 'Próximo' : 'Começar'}
                </button>
            </div>
        </div>
    );
}
