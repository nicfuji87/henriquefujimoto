import React, { useEffect } from 'react';
import PublicHeader from '../components/PublicHeader';
import PageIntro from '../components/PageIntro';
import WhySupport from '../components/WhySupport';
import HowToSupport from '../components/HowToSupport';
import TrustWall from '../components/TrustWall';
import AffiliateProducts from '../components/AffiliateProducts';
import Footer from '../components/Footer';
import StickyCTA from '../components/StickyCTA';
import { trackPageView } from '../lib/pageTracking';

export default function ApoiarPage() {
    useEffect(() => {
        trackPageView('/apoiar', 'Como Apoiar');
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="relative min-h-screen w-full overflow-x-hidden bg-hf-navy font-ui text-hf-ice">
            <PublicHeader />
            <PageIntro
                kicker="Apoie o atleta"
                title={<>Faça parte <span className="text-hf-gold">dessa jornada</span></>}
                lead="Toda carreira começa com pessoas que decidiram apoiar quando o sonho ainda estava no começo. Veja as formas de participar dessa caminhada."
            />
            <div>
                <WhySupport />
                <HowToSupport />
                <AffiliateProducts />
                <TrustWall />
            </div>
            <Footer />
            <StickyCTA />
        </main>
    );
}