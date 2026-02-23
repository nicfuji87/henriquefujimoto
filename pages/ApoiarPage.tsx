import React, { useEffect } from 'react';
import SectionNav from '../components/SectionNav';
import WhySupport from '../components/WhySupport';
import HowToSupport from '../components/HowToSupport';
import TrustWall from '../components/TrustWall';
import Footer from '../components/Footer';
import StickyCTA from '../components/StickyCTA';
import { trackPageView } from '../lib/pageTracking';

export default function ApoiarPage() {
    useEffect(() => {
        trackPageView('/apoiar', 'Como Apoiar');
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="relative min-h-screen w-full overflow-x-hidden bg-background">
            <SectionNav title="Apoie o Henrique" subtitle="Faça parte dessa jornada" />
            <div className="pt-4 pb-10 flex flex-col gap-10">
                <WhySupport />
                <HowToSupport />
                <TrustWall />
            </div>
            <Footer />
            <StickyCTA />
        </main>
    );
}
