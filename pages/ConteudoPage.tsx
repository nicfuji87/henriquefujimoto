import React, { useEffect } from 'react';
import SectionNav from '../components/SectionNav';
import TopContent from '../components/TopContent';
import Footer from '../components/Footer';
import StickyCTA from '../components/StickyCTA';
import { trackPageView } from '../lib/pageTracking';

export default function ConteudoPage() {
    useEffect(() => {
        trackPageView('/conteudo', 'Conteúdo');
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="relative min-h-screen w-full overflow-x-hidden bg-background">
            <SectionNav title="Conteúdo" subtitle="O melhor do Instagram do Henrique" />
            <div className="pt-4 pb-10 flex flex-col gap-10">
                <TopContent />
            </div>
            <Footer />
            <StickyCTA />
        </main>
    );
}
