import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Instagram } from 'lucide-react';
import { getAggregatedMetrics, type AggregatedMetrics } from '../../lib/metrics';
import { ageFromBirth, formatCompact } from '../home/utils';
import { supabase } from '../../lib/supabase';

/**
 * End-of-post block introducing the athlete, for readers who land on a blog post
 * (e.g. from search/social) and never see the home page. Shows a few live numbers
 * and links back to the full story.
 */
export default function AboutHenrique() {
    const [metrics, setMetrics] = useState<AggregatedMetrics | null>(null);
    const [age, setAge] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;
        getAggregatedMetrics(30).then((m) => { if (!cancelled) setMetrics(m); });
        supabase
            .from('athlete_profile')
            .select('birth_date')
            .limit(1)
            .maybeSingle()
            .then(({ data }) => { if (!cancelled && data?.birth_date) setAge(ageFromBirth(data.birth_date)); });
        return () => { cancelled = true; };
    }, []);

    const stats = [
        { value: metrics?.total_reach ?? 0, label: 'pessoas alcançadas · 30 dias', accent: true },
        { value: metrics?.total_followers ?? 0, label: 'seguidores' },
        { value: metrics?.total_interactions ?? 0, label: 'interações · 30 dias' },
    ];
    const hasStats = !!metrics && metrics.total_reach > 0;

    return (
        <section className="mx-auto max-w-4xl px-4 pb-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-2xl border border-hf-gold/20 bg-gradient-to-br from-hf-gold/[0.06] to-hf-surface p-6 sm:p-8"
            >
                <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.16em] text-hf-gold">
                    Conheça o atleta
                </p>
                <h3 className="mt-3 font-brand text-[1.6rem] font-semibold leading-[1.15] tracking-tight text-hf-ice sm:text-3xl">
                    Um pouco sobre o <span className="text-hf-gold">Henrique</span>
                </h3>
                <p className="mt-4 max-w-2xl font-ui text-sm leading-relaxed text-hf-ice/70 sm:text-base">
                    {age ? `${age} anos, ` : ''}judoca da categoria Sub-15, de Brasília. Neto e sobrinho-neto de
                    campeões, o Henrique carrega a tradição da família Fujimoto rumo às maiores competições — e
                    você pode acompanhar essa jornada desde o começo.
                </p>

                {hasStats && (
                    <div className="mt-6 grid grid-cols-3 gap-3">
                        {stats.map((s) => (
                            <div key={s.label} className="rounded-2xl border border-hf-line/70 bg-hf-navy/40 p-4">
                                <div className={`font-ui text-xl font-semibold tracking-tight sm:text-2xl ${s.accent ? 'text-hf-gold' : 'text-hf-ice'}`}>
                                    {formatCompact(s.value)}
                                </div>
                                <div className="mt-1 font-ui text-[11px] leading-snug text-hf-ice/45">{s.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-7 flex flex-wrap items-center gap-3">
                    <Link
                        to="/"
                        className="group inline-flex items-center gap-2 rounded-full bg-hf-gold px-6 py-3.5 font-ui text-sm font-semibold text-hf-navy transition-all hover:bg-hf-gold-dim"
                    >
                        Conhecer a história
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <a
                        href="https://instagram.com/henriquefujimoto"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-hf-ice/15 bg-hf-ice/5 px-6 py-3.5 font-ui text-sm font-semibold text-hf-ice transition-all hover:border-hf-gold/40 hover:bg-hf-ice/10"
                    >
                        <Instagram className="h-4 w-4" />
                        Acompanhar no Instagram
                    </a>
                </div>
            </motion.div>
        </section>
    );
}
