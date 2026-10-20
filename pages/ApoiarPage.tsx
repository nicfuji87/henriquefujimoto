import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle } from 'lucide-react';
import PublicHeader from '../components/PublicHeader';
import WhySupport from '../components/WhySupport';
import HowToSupport from '../components/HowToSupport';
import TrustWall from '../components/TrustWall';
import AffiliateProducts from '../components/AffiliateProducts';
import Footer from '../components/Footer';
import StickyCTA from '../components/StickyCTA';
import WordRail from '../components/home/WordRail';
import { buildWaLink } from '../components/home/utils';
import { hfBtnPrimary, hfBtnSecondary, hfKicker, hfLead } from '../components/ui/hf';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { supabase } from '../lib/supabase';
import { trackPageView } from '../lib/pageTracking';
import { ageFromBirth } from '../components/home/utils';

export default function ApoiarPage() {
    const { config } = useSiteConfig();
    const [age, setAge] = useState<number | null>(null);
    const [category, setCategory] = useState<string | null>(null);
    const [competitions, setCompetitions] = useState<number | null>(null);
    const [firstYear, setFirstYear] = useState<string | null>(null);

    useEffect(() => {
        trackPageView('/apoiar', 'Como Apoiar');
        window.scrollTo(0, 0);

        // O texto institucional abaixo e montado a partir dos registros reais:
        // nada de numeros escritos a mao que envelhecem sozinhos.
        async function load() {
            const [profileRes, compsRes] = await Promise.all([
                supabase.from('athlete_profile').select('birth_date, category').limit(1).maybeSingle(),
                supabase.from('competitions').select('date').order('date', { ascending: true }),
            ]);

            setAge(ageFromBirth(profileRes.data?.birth_date));
            setCategory(profileRes.data?.category ?? null);

            const rows = compsRes.data || [];
            setCompetitions(rows.length || null);
            setFirstYear(rows.length ? new Date(rows[0].date + 'T12:00:00').getFullYear().toString() : null);
        }

        load();
    }, []);

    const wa = buildWaLink(
        config.cta_link,
        'Olá! Vim pelo site do Henrique e gostaria de falar sobre apoio ao projeto. Podemos conversar?'
    );
    const heroPhoto = config.hero_image_desktop || config.hero_image || null;

    return (
        <main className="relative min-h-screen w-full overflow-x-hidden bg-hf-navy font-ui text-hf-ice">
            <PublicHeader />

            {/* Hero */}
            <section className="relative isolate overflow-hidden border-b border-hf-line/60 px-6 pb-14 pt-28 sm:pb-16 sm:pt-32">
                {heroPhoto && (
                    <>
                        <img
                            src={heroPhoto}
                            alt=""
                            className="absolute inset-0 -z-10 h-full w-full object-cover object-center opacity-35 grayscale"
                        />
                        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-hf-navy via-hf-navy/90 to-hf-navy/40" />
                    </>
                )}

                <div className="mx-auto flex w-full max-w-7xl items-end justify-between gap-10">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl"
                    >
                        <span className="hf-rule mb-5 block" />
                        <p className={hfKicker}>Parcerias / Apoio / Um projeto em andamento</p>
                        <h1 className="mt-4 font-brand text-[2.25rem] font-extrabold uppercase leading-[0.95] tracking-[-0.015em] text-hf-ice sm:text-[3.25rem] lg:text-[4rem]">
                            O apoio acontece
                            <br />
                            antes do <span className="text-hf-gold">ippon.</span>
                        </h1>
                        <p className="mt-5 font-brand text-lg font-semibold text-hf-ice/90 sm:text-xl">
                            Um projeto de formação esportiva com calendário, custo e resultado registrado.
                        </p>
                        <p className={`mt-5 max-w-xl ${hfLead}`}>
                            Henrique tem 13 anos e compete no Sub-15. O que já existe é calendário, rotina de
                            treino e resultado registrado. O que falta é estrutura para sustentar isso nos
                            próximos anos.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                            <a href="#como-apoiar" className={hfBtnPrimary}>
                                Conheça o projeto
                                <ArrowRight className="h-4 w-4" />
                            </a>
                            <a href={wa} target="_blank" rel="noopener noreferrer" className={hfBtnSecondary}>
                                <MessageCircle className="h-4 w-4" />
                                Falar com os responsáveis
                            </a>
                        </div>
                    </motion.div>

                    <WordRail
                        words={['Patrocínio', 'Parcerias', 'Competições', 'Valores', 'Contato']}
                        className="pb-2"
                    />
                </div>
            </section>

            <HowToSupport />

            <WhySupport />

            {/* Sobre o projeto — numeros vindos do banco */}
            <section className="border-b border-hf-line/60 bg-hf-navy px-6 py-16 sm:py-20">
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[0.85fr_2fr] lg:gap-14">
                    <div>
                        <span className="hf-rule mb-5 block" />
                        <p className={hfKicker}>Sobre o projeto</p>
                    </div>
                    <div className="max-w-2xl space-y-4">
                        <p className="font-ui text-base leading-relaxed text-hf-ice/75">
                            Henrique Fujimoto{age ? ` tem ${age} anos,` : ''} treina em Brasília
                            {category ? ` e compete no ${category}` : ''}. É a terceira geração da família no judô.
                        </p>
                        {competitions && firstYear && (
                            <p className="font-ui text-base leading-relaxed text-hf-ice/75">
                                São {competitions} competições registradas desde {firstYear}: etapas do ranking do
                                Distrito Federal, circuitos escolares e torneios em outros cinco estados. Todas
                                estão publicadas neste site com data, categoria e resultado, inclusive as que não
                                terminaram em pódio.
                            </p>
                        )}
                        <p className="font-ui text-base leading-relaxed text-hf-ice/75">
                            As conversas institucionais são conduzidas pelos responsáveis pelo atleta.
                        </p>
                    </div>
                </div>
            </section>

            <AffiliateProducts />

            <TrustWall />

            {/* Fechamento */}
            <section className="relative isolate overflow-hidden border-t border-hf-line/60 bg-hf-navy px-6 py-16 sm:py-20 md:py-24">
                {heroPhoto && (
                    <>
                        <img
                            src={heroPhoto}
                            alt=""
                            loading="lazy"
                            className="absolute inset-0 -z-10 h-full w-full object-cover object-center opacity-25 grayscale"
                        />
                        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-hf-navy via-hf-navy/85 to-hf-navy/50" />
                    </>
                )}
                <div className="mx-auto flex w-full max-w-7xl items-end justify-between gap-10">
                    <div className="max-w-2xl">
                        <h2 className="font-brand text-[1.75rem] font-extrabold uppercase leading-[1] tracking-[-0.015em] text-hf-ice sm:text-[2.5rem]">
                            Não sabemos qual será
                            <br />a próxima medalha.
                        </h2>
                        <p className="mt-4 max-w-md font-ui text-[15px] leading-relaxed text-hf-ice/70">
                            Mas o calendário já está em andamento, e dá para entrar nele agora.
                        </p>
                        <a href={wa} target="_blank" rel="noopener noreferrer" className={`mt-7 ${hfBtnPrimary}`}>
                            <MessageCircle className="h-4 w-4" />
                            Apoiar essa jornada
                        </a>
                    </div>
                    <WordRail words={['Mesmo', 'tatame', 'novas', 'histórias']} className="pb-2" />
                </div>
            </section>

            <Footer />
            <StickyCTA />
        </main>
    );
}