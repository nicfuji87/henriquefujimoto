import React from 'react';
import { motion } from 'framer-motion';

interface Panel {
    title: React.ReactNode;
    text: string;
    photo: string | null;
    alt: string;
}

interface BeyondTatameProps {
    /** Fotos reais vindas dos marcos do atleta (podem faltar). */
    photos?: (string | null)[];
}

export default function BeyondTatame({ photos = [] }: BeyondTatameProps) {
    const panels: Panel[] = [
        {
            title: (
                <>
                    Fujimoto não é um
                    <br className="hidden sm:block" /> nome novo no judô.
                    <br className="hidden sm:block" /> <span className="text-hf-gold">Henrique é.</span>
                </>
            ),
            text: 'Carrega um sobrenome que já abriu caminhos, mas escolhe construir o seu próprio. Mesma raiz. Outro percurso. Mais perguntas. Mais vontade.',
            photo: photos[0] || null,
            alt: 'Henrique Fujimoto de costas, com o nome no kimono',
        },
        {
            title: (
                <>
                    Aqui não tem
                    <br className="hidden sm:block" /> trailer. <span className="text-hf-gold">Tem treino.</span>
                </>
            ),
            text: 'É repetição. Detalhe. Correção. Disciplina. Dias bons e dias difíceis. O processo não aparece todo, mas é ele que constrói o que vem depois.',
            photo: photos[1] || null,
            alt: 'Treino de judô',
        },
    ];

    return (
        <section className="grid grid-cols-1 border-y border-hf-line/60 md:grid-cols-2">
            {panels.map((p, i) => (
                <motion.article
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-70px' }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className={`relative isolate flex min-h-[300px] flex-col justify-center overflow-hidden bg-hf-navy px-6 py-14 sm:px-10 sm:py-16 md:min-h-[360px] ${
                        i === 0 ? 'md:border-r md:border-hf-line/60' : ''
                    }`}
                >
                    {p.photo && (
                        <>
                            <img
                                src={p.photo}
                                alt={p.alt}
                                loading="lazy"
                                className="absolute inset-0 -z-10 h-full w-full object-cover object-center opacity-45 grayscale"
                            />
                            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-hf-navy via-hf-navy/85 to-hf-navy/35" />
                        </>
                    )}

                    <div className="max-w-md">
                        <span className="hf-rule mb-6 block" />
                        <h2 className="font-brand text-[1.4rem] font-bold uppercase leading-[1.12] tracking-[-0.01em] text-hf-ice sm:text-[1.75rem]">
                            {p.title}
                        </h2>
                        <p className="mt-5 font-ui text-[15px] leading-relaxed text-hf-ice/70">{p.text}</p>
                    </div>
                </motion.article>
            ))}
        </section>
    );
}