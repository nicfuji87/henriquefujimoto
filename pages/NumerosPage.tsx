import React, { useEffect } from 'react';
import SectionNav from '../components/SectionNav';
import ROIDashboard from '../components/ROIDashboard';
import Footer from '../components/Footer';
import StickyCTA from '../components/StickyCTA';
import { trackPageView } from '../lib/pageTracking';

export default function NumerosPage() {
    useEffect(() => {
        trackPageView('/numeros', 'Números & Métricas');
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="relative min-h-screen w-full overflow-x-hidden bg-background">
            <SectionNav title="Números & Métricas" subtitle="Impacto e alcance do Henrique" />
            <div className="pt-4 pb-10 flex flex-col gap-10">
                <ROIDashboard />
            </div>
            <Footer />
            <StickyCTA />
        </main>
    );
}
