import React from 'react';
import Hero from '../components/Hero';
import ROIDashboard from '../components/ROIDashboard';
import TrustWall from '../components/TrustWall';
import TopContent from '../components/TopContent';
import WhySupport from '../components/WhySupport';
import HowToSupport from '../components/HowToSupport';
import StickyCTA from '../components/StickyCTA';
import LatestPosts from '../components/LatestPosts';

import Footer from '../components/Footer';

export default function HomePage() {

    return (
        <main className="relative min-h-screen w-full overflow-x-hidden">
            <Hero />
            <div className="relative z-10 -mt-8 flex flex-col gap-10">
                <ROIDashboard />
                <WhySupport />
                <HowToSupport />
                <TrustWall />
                <TopContent />
                <LatestPosts />
            </div>
            <Footer />
            <StickyCTA />
        </main>
    );
}
