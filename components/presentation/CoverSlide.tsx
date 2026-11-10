import React from 'react';
import { motion } from 'framer-motion';
import { PhotoRow } from './Slide';

export interface CoverPhoto {
    url: string;
    caption?: string;
}

/**
 * Capa da apresentacao.
 *
 * Duas colunas: a chamada a esquerda e um painel de fotos colado na borda
 * direita, com corte na diagonal. A diagonal existe para a foto entrar no
 * marinho em vez de ficar como um retangulo colado por cima dele, e o fio
 * dourado entre as duas imagens repete a assinatura da marca.
 *
 * Abaixo de lg nao ha largura para o painel, entao as fotos descem para o
 * fluxo e nada se perde.
 */
export default function CoverSlide({
    kicker,
    title,
    titleAccent,
    body,
    footer,
    photos,
}: {
    kicker?: string;
    title: string;
    titleAccent?: string;
    body?: string;
    footer?: string;
    photos: CoverPhoto[];
}) {
    const items = photos.filter((p) => p && p.url).slice(0, 2);
    const split = items.length > 1;

    return (
        <section className="relative flex min-h-full w-full">
            <div className="flex min-w-0 flex-1 flex-col justify-center px-7 pb-14 pt-24 sm:px-12 sm:pt-28 lg:max-w-[61%] lg:pr-8">
                {kicker && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mb-5 flex items-center gap-3 font-ui text-[11px] font-semibold uppercase tracking-[0.22em] text-hf-gold sm:text-[12px]"
                    >
                        <span className="h-px w-6 bg-hf-gold" />
                        {kicker}
                    </motion.p>
                )}

                <motion.h1
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 }}
                    className="font-brand text-[1.95rem] font-extrabold uppercase leading-[0.96] tracking-[-0.035em] [text-wrap:balance] sm:text-[2.5rem] lg:text-[2.9rem]"
                >
                    <span className="block text-hf-ice">{title}</span>
                    {titleAccent && <span className="mt-1 block text-hf-gold">{titleAccent}</span>}
                </motion.h1>

                {body && (
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.14 }}
                        className="mt-6 max-w-lg font-ui text-[15px] leading-relaxed text-hf-ice/70 sm:text-[17px]"
                    >
                        {body}
                    </motion.p>
                )}

                {footer && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="mt-8 font-ui text-[11px] uppercase tracking-[0.24em] text-hf-ice/35 sm:mt-10"
                    >
                        {footer}
                    </motion.p>
                )}

                {items.length > 0 && (
                    <div className="mt-9 lg:hidden">
                        <PhotoRow photos={items} />
                    </div>
                )}
            </div>

            {/* Painel diagonal. Fora de lg nao ha espaco, entao ele nao entra. */}
            {items.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7 }}
                    className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] lg:block"
                    style={{ clipPath: 'polygon(9% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
                >
                    {/* Cada foto ocupa a propria faixa antes de ser recortada. Se as
                        duas cobrissem o painel inteiro, uma imagem deitada ficaria
                        espremida numa caixa em pe e perderia as laterais. */}
                    <div className="relative h-full w-full">
                        {/* A faixa de cima comeca abaixo da marca fixa: colada no
                            topo da tela, a foto encostava as cabecas na borda. */}
                        <div
                            className="absolute inset-x-0 overflow-hidden"
                            style={
                                split
                                    ? {
                                          top: '10%',
                                          height: '42%',
                                          clipPath: 'polygon(0% 0%, 100% 0%, 100% 76.2%, 0% 95.2%)',
                                      }
                                    : { top: 0, height: '100%' }
                            }
                        >
                            <img
                                src={items[0].url}
                                alt={items[0].caption || ''}
                                className="h-full w-full object-cover object-[50%_45%]"
                            />
                        </div>

                        {split && (
                            <>
                                <div
                                    className="absolute inset-x-0 overflow-hidden"
                                    style={{
                                        top: '42%',
                                        height: '58%',
                                        clipPath: 'polygon(0% 15%, 100% 1.2%, 100% 100%, 0% 100%)',
                                    }}
                                >
                                    <img
                                        src={items[1].url}
                                        alt={items[1].caption || ''}
                                        className="h-full w-full object-cover object-[50%_42%]"
                                    />
                                </div>
                                {/* Fio dourado na emenda das duas imagens. */}
                                <span
                                    className="absolute inset-0 bg-hf-gold"
                                    style={{
                                        clipPath:
                                            'polygon(0% 50%, 100% 42%, 100% 42.7%, 0% 50.7%)',
                                    }}
                                />
                            </>
                        )}

                        {/* Veu: a foto e ambiente, a chamada e o que precisa ser lido. */}
                        <span className="absolute inset-0 bg-hf-navy/35" />
                        <span className="absolute inset-0 bg-gradient-to-r from-hf-navy via-hf-navy/40 to-transparent" />
                        <span className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-hf-navy/80 to-transparent" />
                        <span className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-hf-navy/60 to-transparent" />
                    </div>
                </motion.div>
            )}
        </section>
    );
}
