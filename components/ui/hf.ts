/**
 * Design system publico HF.
 *
 * Tokens de classe reutilizaveis para as paginas publicas (/, /numeros,
 * /apoiar, /conteudo, /blog, /produto, /parceria). Use estas constantes em vez
 * de recriar estilos a cada tela: o objetivo e manter botoes, cards, titulos e
 * espacamentos identicos em todo o site.
 *
 * Regras de marca aplicadas aqui:
 * - azul-marinho domina; branco gelo garante leitura; dourado e assinatura.
 * - Montserrat (font-brand) nos titulos; Inter (font-ui) em textos e interface.
 * - as faixas claras (branco gelo) sao o contraponto do marinho e usam os
 *   tokens com sufixo `OnLight`.
 */

/** Container padrao das secoes publicas. */
export const hfContainer = 'mx-auto w-full max-w-6xl';

/** Espacamento vertical/horizontal padrao de secao. */
export const hfSection = 'px-6 py-16 sm:py-20 md:py-24';

/** Secao mais compacta (faixas, tiras, rodapes de secao). */
export const hfSectionTight = 'px-6 py-12 sm:py-16';

/** Faixa clara em branco gelo. */
export const hfSectionLight = 'bg-hf-ice px-6 py-16 sm:py-20 md:py-24';

/* ---------------------------------- Texto --------------------------------- */

/** Chamada principal (hero). */
export const hfDisplay =
    'font-brand font-extrabold uppercase leading-[0.92] tracking-[-0.015em] text-hf-ice';

/** Titulo de secao. */
export const hfTitle =
    'font-brand text-[1.75rem] font-bold uppercase leading-[1.05] tracking-[-0.01em] text-hf-ice sm:text-[2.15rem] md:text-[2.5rem]';

/** Titulo de secao sobre faixa clara. */
export const hfTitleOnLight =
    'font-brand text-[1.75rem] font-bold uppercase leading-[1.05] tracking-[-0.01em] text-hf-navy sm:text-[2.15rem] md:text-[2.5rem]';

/** Titulo de bloco/card. */
export const hfSubtitle = 'font-brand text-lg font-bold uppercase tracking-[0.01em] text-hf-ice';

/** Overline dourado acima dos titulos. */
export const hfKicker =
    'font-ui text-[11px] font-semibold uppercase tracking-[0.22em] text-hf-gold';

/** Overline discreto sobre faixa clara. */
export const hfKickerOnLight =
    'font-ui text-[11px] font-semibold uppercase tracking-[0.22em] text-hf-navy/55';

/** Paragrafo de apoio logo abaixo do titulo. */
export const hfLead = 'font-ui text-base leading-relaxed text-hf-ice/65 sm:text-lg';

/** Paragrafo de apoio sobre faixa clara. */
export const hfLeadOnLight = 'font-ui text-base leading-relaxed text-hf-navy/65 sm:text-lg';

/** Corpo de texto padrao. */
export const hfBody = 'font-ui text-base leading-relaxed text-hf-ice/70';

/** Corpo de texto sobre faixa clara. */
export const hfBodyOnLight = 'font-ui text-base leading-relaxed text-hf-navy/70';

/** Texto auxiliar / legendas. */
export const hfMuted = 'font-ui text-[13px] leading-relaxed text-hf-ice/45';

/* --------------------------------- Botoes --------------------------------- */

const btnBase =
    'inline-flex items-center justify-center gap-2 rounded-full font-ui text-sm font-semibold uppercase tracking-[0.08em] transition-colors';

/** Acao principal (dourado). Use no maximo uma por dobra. */
export const hfBtnPrimary = `${btnBase} bg-hf-gold px-6 py-3.5 text-hf-navy hover:bg-hf-gold-dim`;

/** Acao secundaria sobre fundo escuro. */
export const hfBtnSecondary = `${btnBase} border border-hf-ice/25 bg-hf-ice/[0.06] px-6 py-3.5 text-hf-ice backdrop-blur-sm hover:border-hf-gold/50 hover:bg-hf-ice/10`;

/** Acao contornada em dourado (cabecalho). */
export const hfBtnOutlineGold = `${btnBase} border border-hf-gold/70 px-5 py-2.5 text-[12px] text-hf-gold hover:bg-hf-gold hover:text-hf-navy`;

/** Acao discreta, do tamanho de um chip. */
export const hfBtnGhost = `${btnBase} border border-hf-line bg-transparent px-5 py-2.5 text-[12px] text-hf-ice/80 hover:border-hf-gold/45 hover:text-hf-ice`;

/** Link textual com seta. */
export const hfLink =
    'inline-flex items-center gap-2 font-ui text-sm font-semibold text-hf-gold transition-colors hover:text-hf-gold-soft';

/** Link textual sublinhado sobre faixa clara. */
export const hfLinkOnLight =
    'inline-flex items-center gap-2 border-b border-hf-gold/60 pb-0.5 font-ui text-[13px] font-semibold uppercase tracking-[0.1em] text-hf-navy transition-colors hover:border-hf-gold hover:text-hf-gold-dim';

/* ------------------------------ Superficies ------------------------------- */

/** Card padrao (fundo elevado + borda discreta). */
export const hfCard = 'rounded-2xl border border-hf-line/70 bg-hf-surface';

/** Card interativo. */
export const hfCardHover =
    'rounded-2xl border border-hf-line/70 bg-hf-surface transition-all duration-300 hover:border-hf-gold/35 hover:bg-hf-surface-2';

/** Card sobre faixa clara. */
export const hfCardLight =
    'overflow-hidden rounded-xl border border-hf-navy/10 bg-white transition-all duration-300 hover:border-hf-gold/50 hover:shadow-[0_18px_40px_-28px_rgba(11,20,38,0.45)]';

/** Superficie de midia (imagens, capas). */
export const hfMedia = 'overflow-hidden rounded-2xl border border-hf-line/60 bg-hf-surface-2';

/** Selo/etiqueta pequena. */
export const hfTag =
    'inline-flex items-center gap-1.5 rounded-full border border-hf-line bg-hf-surface-2 px-2.5 py-1 font-ui text-[10px] font-semibold uppercase tracking-[0.12em] text-hf-ice/60';

/** Selo de destaque em dourado. */
export const hfTagGold =
    'inline-flex items-center gap-1.5 rounded-full bg-hf-gold px-2.5 py-1 font-ui text-[10px] font-semibold uppercase tracking-[0.12em] text-hf-navy';

/** Icone em moldura (listas de beneficios, passos). */
export const hfIconBox =
    'flex items-center justify-center rounded-xl border border-hf-gold/25 bg-hf-gold/10 text-hf-gold';

/* ------------------------------- Estados ---------------------------------- */

/** Bloco de estado vazio / indisponivel. */
export const hfEmpty =
    'rounded-2xl border border-dashed border-hf-line bg-hf-surface/40 px-6 py-10 text-center font-ui text-sm text-hf-ice/45';

/** Placeholder de carregamento. */
export const hfSkeleton = 'animate-pulse rounded-2xl bg-hf-surface-2';

/** Mensagem de erro inline. */
export const hfError =
    'rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 font-ui text-sm text-red-200';

/* -------------------------------- Animacao -------------------------------- */

/** Entrada padrao das secoes (framer-motion). */
export const hfFadeUp = {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.55 },
} as const;