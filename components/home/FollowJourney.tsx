import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Plane, Users, CalendarClock, Activity, Clapperboard, Mic, TrendingUp } from 'lucide-react';
import SectionHeading from './SectionHeading';

const items = [
    { icon: <Dumbbell className="h-5 w-5" />, label: 'Treinos' },
    { icon: <Plane className="h-5 w-5" />, label: 'Viagens' },
    { icon: <Users className="h-5 w-5" />, label: 'Kangueikos' },
    { icon: <CalendarClock className="h-5 w-5" />, label: 'Rotina' },
    { icon: <Activity className="h-5 w-5" />, label: 'Preparação física' },
    { icon: <Clapperboard className="h-5 w-5" />, label: 'Bastidores' },
    { icon: <Mic className="h-5 w-5" />, label: 'Entrevistas' },
    { icon: <TrendingUp className="h-5 w-5" />, label: 'Evolução' },
];

export default function FollowJourney() {
    return (
        <section className="bg-hf-navy px-6 py-14 sm:py-20 md:py-28">
            <div className="mx-auto max-w-6xl">
                <SectionHeading
                    title={<>Acompanhe uma jornada <span className="text-hf-gold">em tempo real</span></>}
                    lead="Você não vai encontrar apenas medalhas. Vai acompanhar tudo o que acontece entre uma competição e outra — e a evolução de um atleta que ainda está construindo o próprio caminho."
                />

                <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {items.map((it, i) => (
                        <motion.div
                            key={it.label}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                            className="group flex items-center gap-3 rounded-2xl border border-hf-line/70 bg-hf-surface px-4 py-4 transition-colors hover:border-hf-gold/25 hover:bg-hf-surface-2"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hf-gold/12 text-hf-gold transition-colors group-hover:bg-hf-gold group-hover:text-hf-navy">
                                {it.icon}
                            </div>
                            <span className="font-ui text-sm font-semibold text-hf-ice/90">{it.label}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
