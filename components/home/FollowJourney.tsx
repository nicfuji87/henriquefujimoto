import React from 'react';
import { motion } from 'framer-motion';
import { Activity, CalendarClock, Clapperboard, Dumbbell, Mic, Plane, TrendingUp, Users } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { hfCardHover, hfIconBox } from '../ui/hf';

/** O que realmente muda, e que raramente aparece no placar. */
const signs = [
    'Uma pegada melhor.',
    'Um golpe que enfim sai no randori.',
    'Levar ippon, levantar e entrar de novo na sequência.',
    'Reconhecer o erro e voltar no treino seguinte disposto a corrigir.',
];

/** O que o visitante acompanha por aqui. */
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
        <section className="bg-hf-navy px-6 py-16 sm:py-20 md:py-24">
            <div className="mx-auto max-w-7xl">
                <SectionHeading
                    kicker="Evolução"
                    title={<>O que realmente importa não aparece <span className="text-hf-gold">apenas no placar.</span></>}
                    lead="Nos últimos doze meses foram 22 competições. Catorze terminaram em pódio. As outras ensinaram mais sobre o que precisa mudar no treino do que qualquer medalha ensinaria."
                />

                <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:gap-14">
                    <div className="space-y-3 border-l-2 border-hf-gold/50 pl-5">
                        {signs.map((line, i) => (
                            <motion.p
                                key={line}
                                initial={{ opacity: 0, x: -8 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{ duration: 0.4, delay: i * 0.08 }}
                                className="font-ui text-lg font-medium text-hf-ice/85 sm:text-xl"
                            >
                                {line}
                            </motion.p>
                        ))}
                        <p className="pt-4 font-ui text-sm uppercase tracking-[0.18em] text-hf-gold">
                            Um treino de cada vez.
                        </p>
                    </div>

                    <div>
                        <h3 className="mb-5 font-ui text-[11px] font-semibold uppercase tracking-[0.2em] text-hf-ice/45">
                            O que você acompanha por aqui
                        </h3>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {items.map((it, i) => (
                                <motion.div
                                    key={it.label}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-40px' }}
                                    transition={{ duration: 0.4, delay: i * 0.05 }}
                                    className={`${hfCardHover} group flex items-center gap-3 px-4 py-4`}
                                >
                                    <div className={`${hfIconBox} h-9 w-9 shrink-0 transition-colors group-hover:bg-hf-gold group-hover:text-hf-navy`}>
                                        {it.icon}
                                    </div>
                                    <span className="font-ui text-[13px] font-semibold text-hf-ice/90">{it.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}