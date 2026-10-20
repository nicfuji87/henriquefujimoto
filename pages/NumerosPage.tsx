import React, { useEffect } from 'react';
import PublicHeader from '../components/PublicHeader';
import PageIntro from '../components/PageIntro';
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
        <main className="relative min-h-screen w-full overflow-x-hidden bg-hf-navy font-ui text-hf-ice">
            <PublicHeader />
            <PageIntro
                kicker="Números & métricas"
                title={<>Impacto e <span className="text-hf-gold">alcance</span></>}
                lead="Audiência do Instagram oficial, sincronizada automaticamente. Quando o período não tem medição suficiente, o indicador não aparece em vez de mostrar um número pela metade."
            />
            <div className="flex flex-col gap-10 pb-10">
                <ROIDashboard />
            </div>
            <Footer />
            <StickyCTA />
        </main>
    );
}