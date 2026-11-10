import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Copy, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { HFSymbol } from '../components/brand/HFLogo';
import Deck, { type DeckSlide } from '../components/presentation/Deck';
import { Slide, BigStat, PhotoRow, FigureCard } from '../components/presentation/Slide';
import CoverSlide from '../components/presentation/CoverSlide';
import ResultsSlide from '../components/presentation/ResultsSlide';
import CostsSlide, { type CostAsk, type CostItem } from '../components/presentation/CostsSlide';
import { type PresentationCompetition } from '../components/presentation/CompetitionsExplorer';
import CompetitionMap from '../components/presentation/CompetitionMap';
import ReachChart from '../components/presentation/ReachChart';
import BuildPicker from '../components/presentation/BuildPicker';
import PresenterLayer, {
    type Objection,
    type RulerStep,
} from '../components/presentation/PresenterLayer';
import QrCode from '../components/presentation/QrCode';

// ---- Tipos (subconjunto do projeto usado pela apresentacao) ---------------
interface AudienceMetric {
    value: string;
    label: string;
    sub?: string;
}
interface BuildItem {
    title: string;
    text: string;
}
interface PilotStep {
    label: string;
    text: string;
}
interface AcademicCard {
    title: string;
    text: string;
}
interface StudentStat {
    figure: string;
    label: string;
    text?: string;
}
interface SlideResults {
    title?: string;
    accent?: string;
    lead?: string;
    photo_url?: string;
}
interface SlideCosts {
    title?: string;
    accent?: string;
    lead?: string;
    items?: CostItem[];
    highlight?: string;
    ask?: CostAsk | null;
    photo_url?: string;
}
interface RoutineDay {
    day: string;
    blocks: { time: string; label: string }[];
}
interface Photo {
    url: string;
    caption?: string;
    section?: string;
}
interface PresenterNote {
    slide: string;
    text: string;
}

interface PresentationProject {
    slug: string;
    is_active: boolean;
    project_title: string;
    partner_name: string;
    partner_logo_url: string | null;
    hero_kicker: string;
    hero_subtitle: string;
    executive_summary: string;
    academic_title: string | null;
    academic_body: string | null;
    academic_cards: AcademicCard[] | null;
    routine_title: string | null;
    routine_body: string | null;
    routine_week: RoutineDay[] | null;
    results_title: string | null;
    why_now_title: string | null;
    why_now_body: string | null;
    why_marista_title: string | null;
    why_marista_body: string | null;
    comms_title: string | null;
    audience_note: string | null;
    audience_metrics: AudienceMetric[] | null;
    build_title: string | null;
    build_body: string | null;
    build_items: BuildItem[] | null;
    pilot_title: string | null;
    pilot_body: string | null;
    pilot_steps: PilotStep[] | null;
    scholarship_title: string | null;
    scholarship_anchor: string | null;
    scholarship_label: string | null;
    scholarship_body: string | null;
    limits_title: string | null;
    limits_body: string | null;
    limits_items: string[] | null;
    family_commitments: string[] | null;
    closing_title: string | null;
    closing_body: string | null;
    closing_image_url: string | null;
    presentation_label: string | null;
    cover_title: string | null;
    cover_title_accent: string | null;
    cover_body: string | null;
    student_title: string | null;
    student_body: string | null;
    student_watermark: string | null;
    student_note: string | null;
    student_backdrop_url: string | null;
    student_stats: StudentStat[] | null;
    slide_results: SlideResults | null;
    slide_costs: SlideCosts | null;
    closing_question: string | null;
    photos: Photo[] | null;
    contact_whatsapp: string | null;
    presenter_notes: PresenterNote[] | null;
    presenter_ruler: RulerStep[] | null;
    presenter_objections: Objection[] | null;
}

function arr<T>(v: T[] | null | undefined): T[] {
    return Array.isArray(v) ? v : [];
}

/** Quantas horas por semana a grade realmente soma, em vez de um numero solto. */
function weeklyTrainingHours(week: RoutineDay[], schoolWords: RegExp): number {
    let minutes = 0;
    for (const day of week) {
        for (const b of day.blocks || []) {
            if (schoolWords.test(b.label)) continue;
            const m = (b.time || '').match(/(\d{1,2}):(\d{2})\D+(\d{1,2}):(\d{2})/);
            if (!m) continue;
            const start = Number(m[1]) * 60 + Number(m[2]);
            const end = Number(m[3]) * 60 + Number(m[4]);
            if (end > start) minutes += end - start;
        }
    }
    return Math.round((minutes / 60) * 10) / 10;
}

export default function PresentationPage() {
    const { slug } = useParams<{ slug: string }>();
    const [params] = useSearchParams();
    const [project, setProject] = useState<PresentationProject | null>(null);
    const [competitions, setCompetitions] = useState<PresentationCompetition[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [presenterOn, setPresenterOn] = useState(params.get('modo') === 'privado');
    const [currentKey, setCurrentKey] = useState('capa');
    const [picked, setPicked] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);

    // ---- Dados ------------------------------------------------------------
    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!slug) {
                setNotFound(true);
                setLoading(false);
                return;
            }
            const [{ data: p }, { data: c }] = await Promise.all([
                supabase.from('partnership_projects').select('*').eq('slug', slug).maybeSingle(),
                supabase.from('competitions').select('*').order('date', { ascending: false }),
            ]);
            if (cancelled) return;
            if (!p || (p as PresentationProject).is_active === false) {
                setNotFound(true);
            } else {
                setProject(p as PresentationProject);
                setCompetitions((c as PresentationCompetition[]) || []);
            }
            setLoading(false);
        })();
        return () => {
            cancelled = true;
        };
    }, [slug]);

    // O que foi marcado na reuniao sobrevive a um recarregamento sem querer.
    useEffect(() => {
        if (!slug) return;
        try {
            const raw = localStorage.getItem(`hf-apresentacao-${slug}`);
            if (raw) setPicked(JSON.parse(raw));
        } catch {
            /* navegador sem storage: a selecao apenas nao persiste */
        }
    }, [slug]);

    const togglePicked = useCallback(
        (title: string) => {
            setPicked((prev) => {
                const next = prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title];
                try {
                    if (slug) localStorage.setItem(`hf-apresentacao-${slug}`, JSON.stringify(next));
                } catch {
                    /* idem */
                }
                return next;
            });
        },
        [slug],
    );

    // Apresentacao nao e material de busca, como a propria proposta.
    useEffect(() => {
        const prevTitle = document.title;
        document.title = project?.project_title
            ? `${project.project_title} · apresentação`
            : 'Apresentação';
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'robots');
        meta.setAttribute('content', 'noindex, nofollow');
        document.head.appendChild(meta);
        return () => {
            document.title = prevTitle;
            meta.remove();
        };
    }, [project?.project_title]);

    // ---- Derivados --------------------------------------------------------
    const stats = useMemo(() => {
        const cutoff = new Date();
        cutoff.setFullYear(cutoff.getFullYear() - 1);
        const last12 = competitions.filter((c) => new Date(c.date + 'T12:00:00') >= cutoff);
        const years = competitions
            .map((c) => Number((c.date || '').slice(0, 4)))
            .filter((y) => Number.isFinite(y) && y > 1900);
        return {
            total: competitions.length,
            podiums: competitions.filter((c) => !!c.medal_type).length,
            golds: competitions.filter((c) => c.medal_type === 'gold').length,
            firstYear: years.length ? Math.min(...years) : null,
            last12,
            last12Podiums: last12.filter((c) => !!c.medal_type).length,
            last12NoPodium: last12.filter((c) => !c.medal_type).length,
        };
    }, [competitions]);

    const p = project;
    const routineWeek = useMemo(
        () => arr<RoutineDay>(p?.routine_week).filter((d) => d.day && (d.blocks || []).length > 0),
        [p],
    );
    // Qual palavra do nome do parceiro procurar na grade de treinos. "Colegio
    // Marista de Brasilia" tem que casar com o bloco "Judo (Marista)", entao
    // descartamos as palavras genericas e preferimos a que aparece na semana.
    const partnerWord = useMemo(() => {
        const tokens = (p?.partner_name || '')
            .split(/[\s,·]+/)
            .map((w) => w.trim())
            .filter(
                (w) =>
                    w.length >= 4 &&
                    !/^(col[eé]gio|escola|instituto|centro|unidade|grupo)$/i.test(w),
            );
        const inWeek = tokens.find((w) =>
            routineWeek.some((d) => (d.blocks || []).some((b) => b.label.includes(w))),
        );
        return inWeek || tokens[0] || '';
    }, [p?.partner_name, routineWeek]);
    const trainingHours = useMemo(
        () => weeklyTrainingHours(routineWeek, /escola|aula|estudo|inglês|ingles|terapia/i),
        [routineWeek],
    );
    const partnerBlocks = useMemo(
        () =>
            partnerWord
                ? routineWeek.reduce(
                      (n, d) =>
                          n + (d.blocks || []).filter((b) => b.label.includes(partnerWord)).length,
                      0,
                  )
                : 0,
        [routineWeek, partnerWord],
    );

    const buildItems = useMemo(() => arr<BuildItem>(p?.build_items).filter((b) => b.title || b.text), [p]);
    const costItems = useMemo(
        () => arr<CostItem>(p?.slide_costs?.items).filter((i) => i && i.label && i.monthly > 0),
        [p],
    );
    const studentStats = useMemo(
        () => arr<StudentStat>(p?.student_stats).filter((st) => st.figure || st.label),
        [p],
    );
    const audienceMetrics = useMemo(
        () => arr<AudienceMetric>(p?.audience_metrics).filter((m) => m.value || m.label),
        [p],
    );
    const pilotSteps = useMemo(() => arr<PilotStep>(p?.pilot_steps).filter((s) => s.label || s.text), [p]);
    const photos = useMemo(() => arr<Photo>(p?.photos).filter((ph) => ph.url), [p]);
    const photoFor = useCallback(
        (section: string) => photos.find((ph) => ph.section === section),
        [photos],
    );
    const partnerPhotos = useMemo(
        () => photos.filter((ph) => ph.section === 'why_partner').slice(0, 2),
        [photos],
    );
    // Paineis de borda da capa e do fechamento. Retrato cai melhor numa faixa
    // alta, entao priorizamos as fotos de podio e a foto marcada como final.
    const resultPhotos = useMemo(() => photos.filter((ph) => ph.section === 'results'), [photos]);
    const coverPhotos = useMemo(() => {
        const partner = photos.filter((ph) => ph.section === 'why_partner');
        const pool = partner.length > 0 ? partner : resultPhotos.length > 0 ? resultPhotos : photos;
        return pool.slice(0, 2);
    }, [photos, resultPhotos]);
    const closingPhotos = useMemo(() => {
        const marked = (p?.closing_image_url && p.closing_image_url.trim())
            ? [{ url: p.closing_image_url.trim() }]
            : photoFor('closing')
              ? [photoFor('closing')!]
              : [];
        const extra = resultPhotos.filter((ph) => ph.url !== marked[0]?.url).slice(0, 1);
        return [...marked, ...extra];
    }, [p?.closing_image_url, photoFor, resultPhotos]);

    // Estados em que ele competiu representando a propria escola.
    const partnerStates = useMemo(() => {
        if (!partnerWord) return {};
        const out: Record<string, string> = {};
        const needle = partnerWord.toLowerCase();
        for (const c of competitions) {
            if (!(c.name || '').toLowerCase().includes(needle)) continue;
            const uf = (c.location || '').trim().slice(-2).toUpperCase();
            if (uf) out[uf] = `pelo ${partnerWord}`;
        }
        return out;
    }, [competitions, partnerWord]);

    const proposalUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/parceria/${slug}`;

    const summaryText = useMemo(() => {
        if (picked.length === 0) return '';
        return [
            `${p?.project_title || 'Projeto'} — o que conversamos`,
            '',
            ...picked.map((t) => `• ${t}`),
            '',
            `Proposta completa: ${proposalUrl}`,
        ].join('\n');
    }, [picked, p?.project_title, proposalUrl]);

    const copySummary = async () => {
        try {
            await navigator.clipboard.writeText(summaryText);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2200);
        } catch {
            /* sem clipboard: o texto continua visivel na tela */
        }
    };

    // ---- Telas ------------------------------------------------------------
    const slides = useMemo<DeckSlide[]>(() => {
        if (!p) return [];
        const list: DeckSlide[] = [];
        // Numero da tela calculado na hora de empilhar, para o kicker nunca
        // divergir da grade de navegacao quando uma secao fica vazia.
        const n = () => String(list.length + 1).padStart(2, '0');

        list.push({
            key: 'capa',
            label: 'Abertura',
            node: (
                <CoverSlide
                    kicker={p.hero_kicker || undefined}
                    title={p.cover_title || p.project_title}
                    titleAccent={p.cover_title_accent || undefined}
                    body={p.cover_body || p.hero_subtitle || undefined}
                    footer="henriquefujimoto.com.br"
                    photos={coverPhotos}
                />
            ),
        });

        if (p.student_body || studentStats.length > 0 || p.academic_body) {
            // Sem os campos proprios da tela, ela ainda se monta com o que a
            // proposta escrita ja tem.
            const cards = arr<AcademicCard>(p.academic_cards)
                .filter((c) => c.title || c.text)
                .slice(0, 3);
            const stats: StudentStat[] =
                studentStats.length > 0
                    ? studentStats
                    : cards.map((c) => ({ figure: c.title, label: '', text: c.text }));

            list.push({
                key: 'aluno',
                label: 'Aluno antes de atleta',
                node: (
                    <Slide
                        kicker={`${n()} / O ponto de partida`}
                        align="center"
                        titleSize="lg"
                        title={p.student_title || p.academic_title || 'Aluno antes de atleta'}
                        lead={
                            p.student_body ||
                            (p.academic_body || '').split('. ').slice(0, 2).join('. ').trim()
                        }
                        watermark={p.student_watermark || undefined}
                        backdrop={p.student_backdrop_url || undefined}
                    >
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {stats.slice(0, 3).map((st, i) => (
                                <React.Fragment key={`${st.figure}-${i}`}>
                                    <FigureCard figure={st.figure} label={st.label} text={st.text} />
                                </React.Fragment>
                            ))}
                        </div>
                        {p.student_note && (
                            <p className="mt-7 max-w-2xl border-l-2 border-hf-gold/50 pl-4 font-ui text-[13px] leading-relaxed text-hf-ice/55 sm:text-sm">
                                {p.student_note}
                            </p>
                        )}
                    </Slide>
                ),
            });
        }

        if (routineWeek.length > 0) {
            list.push({
                key: 'semana',
                label: 'A semana',
                node: (
                    <Slide kicker={n()} title={p.routine_title || 'A semana'}>
                        <div className="mb-6 flex flex-wrap gap-3">
                            <BigStat value={`${String(trainingHours).replace('.', ',')}h`} label="de treino por semana" accent />
                            {partnerBlocks > 0 && (
                                <BigStat
                                    value={partnerBlocks}
                                    label={`treinos por semana dentro do ${partnerWord}`}
                                />
                            )}
                        </div>
                        <div className="space-y-2.5">
                            {routineWeek.map((d, i) => (
                                <div
                                    key={i}
                                    className="rounded-2xl border border-hf-line/70 bg-hf-surface p-4 sm:flex sm:gap-5"
                                >
                                    <div className="mb-2.5 shrink-0 font-ui text-[13px] font-semibold uppercase tracking-wide text-hf-gold sm:mb-0 sm:w-24">
                                        {d.day}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {(d.blocks || []).map((b, j) => {
                                            const here = partnerWord && b.label.includes(partnerWord);
                                            return (
                                                <span
                                                    key={j}
                                                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${
                                                        here
                                                            ? 'border-hf-gold/60 bg-hf-gold/10'
                                                            : 'border-hf-line/70 bg-hf-navy'
                                                    }`}
                                                >
                                                    <span className="font-ui text-[11px] font-semibold tabular-nums text-hf-gold">
                                                        {b.time}
                                                    </span>
                                                    <span
                                                        className={`font-ui text-[13px] ${
                                                            here ? 'text-hf-ice' : 'text-hf-ice/70'
                                                        }`}
                                                    >
                                                        {b.label}
                                                    </span>
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Slide>
                ),
            });
        }

        if (competitions.length > 0) {
            const r = p.slide_results || {};
            list.push({
                key: 'trajetoria',
                label: 'A trajetória',
                node: (
                    <ResultsSlide
                        kicker={`${n()} / ${r.title && r.accent ? `${r.title} ${r.accent}` : p.results_title || 'A trajetória esportiva'}`}
                        title={r.title || p.results_title || 'A trajetória esportiva'}
                        accent={r.accent}
                        lead={r.lead || p.results_intro || undefined}
                        photoUrl={r.photo_url}
                        competitions={competitions}
                        total={stats.total}
                        firstYear={stats.firstYear}
                        last12={stats.last12.length}
                        last12Podiums={stats.last12Podiums}
                        last12NoPodium={stats.last12NoPodium}
                    />
                ),
            });

            list.push({
                key: 'mapa',
                label: 'Onde ele competiu',
                node: (
                    <Slide kicker={n()} title="Onde ele competiu">
                        <CompetitionMap
                            competitions={competitions}
                            highlight={partnerStates}
                            caption={
                                `${stats.total} competições desde ${stats.firstYear ?? 2023}, ` +
                                `${stats.last12.length} delas nos últimos 12 meses. ` +
                                'Cada estado fora do DF significa inscrição, estrada, hospedagem e aula reposta na volta.'
                            }
                        />
                    </Slide>
                ),
            });
        }

        if (costItems.length > 0) {
            const c = p.slide_costs || {};
            list.push({
                key: 'custos',
                label: 'Os custos do projeto',
                node: (
                    <CostsSlide
                        kicker={`${n()} / Os custos do projeto`}
                        title={c.title || 'Investimento para'}
                        accent={c.accent}
                        lead={c.lead}
                        items={costItems}
                        highlight={c.highlight}
                        ask={c.ask}
                        photoUrl={c.photo_url}
                    />
                ),
            });
        }

        if (p.why_now_body) {
            list.push({
                key: 'porque_agora',
                label: 'Por que agora',
                node: (
                    <Slide kicker={n()} title={p.why_now_title || 'Por que agora'} lead={p.why_now_body}>
                        <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-2">
                            {[12, 13, 14, 15, 16].map((age, i, all) => (
                                <React.Fragment key={age}>
                                    <span
                                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border font-brand text-xl font-bold ${
                                            age === 13
                                                ? 'border-hf-gold bg-hf-gold text-hf-navy'
                                                : 'border-hf-gold/35 bg-hf-gold/[0.07] text-hf-gold'
                                        }`}
                                    >
                                        {age}
                                    </span>
                                    {i < all.length - 1 && (
                                        <ArrowRight className="h-4 w-4 shrink-0 text-hf-ice/25" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                        <p className="mt-3 font-ui text-[12px] uppercase tracking-[0.14em] text-hf-gold">
                            Janela de maior desenvolvimento esportivo
                        </p>
                    </Slide>
                ),
            });
        }

        if (p.why_marista_body) {
            list.push({
                key: 'ja_juntos',
                label: `Já com o ${partnerWord}`,
                node: (
                    <Slide
                        kicker={n()}
                        title={p.why_marista_title || `Por que o ${partnerWord}`}
                        lead={p.why_marista_body}
                    >
                        <PhotoRow photos={partnerPhotos} />
                    </Slide>
                ),
            });
        }

        if (audienceMetrics.length > 0 || p.audience_note) {
            list.push({
                key: 'audiencia',
                label: 'A audiência',
                node: (
                    <Slide kicker={n()} title={p.comms_title || 'Uma trajetória que já é acompanhada'}>
                        <ReachChart />
                        {audienceMetrics.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                                {audienceMetrics.slice(0, 4).map((m, i) => (
                                    <React.Fragment key={`metric-${i}`}>
                                        <BigStat value={m.value} label={m.label} sub={m.sub} size="sm" />
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                        {/* A nota longa sobre o bloqueio fica na proposta escrita. Aqui
                            o proprio grafico mostra o buraco, e o roteiro explica. */}
                    </Slide>
                ),
            });
        }

        if (buildItems.length > 0) {
            list.push({
                key: 'construir',
                label: 'O que construir',
                node: (
                    <Slide
                        kicker={n()}
                        title={p.build_title || 'O que podemos construir juntos'}
                        lead={p.build_body || undefined}
                    >
                        <BuildPicker items={buildItems} selected={picked} onToggle={togglePicked} />
                        <p className="mt-4 font-ui text-[12px] text-hf-ice/40">
                            O que fizer sentido para o Marista, a gente marca aqui. O resumo fica
                            na última tela.
                        </p>
                    </Slide>
                ),
            });
        }

        if (pilotSteps.length > 0 || p.pilot_body) {
            list.push({
                key: 'piloto',
                label: 'O piloto',
                node: (
                    <Slide
                        kicker={n()}
                        title={p.pilot_title || 'Projeto-piloto de 12 meses'}
                        lead={p.pilot_body || undefined}
                    >
                        <div className="space-y-3">
                            {pilotSteps.map((s, i) => (
                                <div
                                    key={i}
                                    className="flex gap-4 rounded-2xl border border-hf-line/70 bg-hf-surface p-5"
                                >
                                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-hf-gold ring-4 ring-hf-gold/15" />
                                    <div>
                                        <p className="font-ui text-[12px] font-semibold uppercase tracking-[0.12em] text-hf-gold">
                                            {s.label}
                                        </p>
                                        <p className="mt-1 font-ui text-[15px] leading-relaxed text-hf-ice/75">
                                            {s.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Slide>
                ),
            });
        }

        if (p.scholarship_anchor || p.scholarship_body) {
            list.push({
                key: 'apoio',
                label: 'O apoio',
                node: (
                    <Slide kicker={n()} title={p.scholarship_title || 'O apoio'} align="center">
                        {p.scholarship_anchor && (
                            <div className="mt-4 flex flex-wrap items-baseline gap-x-4">
                                <span className="font-brand text-[3.2rem] font-bold leading-none tracking-tight text-hf-gold sm:text-[4.5rem]">
                                    {p.scholarship_anchor}
                                </span>
                                {p.scholarship_label && (
                                    <span className="font-ui text-lg text-hf-ice/60">
                                        {p.scholarship_label}
                                    </span>
                                )}
                            </div>
                        )}
                        {p.scholarship_body && (
                            <p className="mt-7 max-w-2xl font-ui text-[17px] leading-relaxed text-hf-ice/70 sm:text-xl">
                                {p.scholarship_body}
                            </p>
                        )}
                    </Slide>
                ),
            });
        }

        const limits = arr<string>(p.limits_items);
        const commitments = arr<string>(p.family_commitments).slice(0, 5);
        if (limits.length > 0 || commitments.length > 0) {
            list.push({
                key: 'limites',
                label: 'Limites',
                node: (
                    <Slide kicker={n()} title={p.limits_title || 'Limites e compromissos'}>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            {limits.length > 0 && (
                                <div>
                                    <p className="mb-3 font-ui text-[11px] font-semibold uppercase tracking-[0.18em] text-hf-gold">
                                        Limites
                                    </p>
                                    <ul className="space-y-2.5">
                                        {limits.map((l, i) => (
                                            <li
                                                key={i}
                                                className="font-ui text-[14px] leading-relaxed text-hf-ice/70"
                                            >
                                                {l}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {commitments.length > 0 && (
                                <div>
                                    <p className="mb-3 font-ui text-[11px] font-semibold uppercase tracking-[0.18em] text-hf-gold">
                                        A família assume
                                    </p>
                                    <ul className="space-y-2.5">
                                        {commitments.map((c, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-2.5 font-ui text-[14px] leading-relaxed text-hf-ice/70"
                                            >
                                                <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-hf-gold" />
                                                {c}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </Slide>
                ),
            });
        }

        list.push({
            key: 'fecho',
            label: 'Fechamento',
            node: (
                <Slide photos={closingPhotos}>
                    <p className="mb-5 flex items-center gap-3 font-ui text-[11px] font-semibold uppercase tracking-[0.22em] text-hf-gold">
                        <span className="h-px w-6 bg-hf-gold" />
                        O convite
                    </p>
                    <h2 className="font-brand text-[1.9rem] font-extrabold uppercase leading-[1.0] tracking-[-0.03em] text-hf-ice sm:text-[2.7rem]">
                        {p.closing_title || 'Vamos construir isso juntos'}
                    </h2>
                    {p.closing_body && (
                        <p className="mt-6 max-w-xl font-ui text-[15px] leading-relaxed text-hf-ice/60 sm:text-[17px]">
                            {p.closing_body}
                        </p>
                    )}

                    {/* A pergunta que fica no ar quando a tela parar aqui. Linha de
                        texto, nao botao: ninguem clica numa apresentacao. */}
                    {p.closing_question && (
                        <p className="mt-7 max-w-xl border-t border-hf-gold/30 pt-5 font-brand text-[17px] font-bold leading-snug text-hf-gold sm:text-[21px]">
                            {p.closing_question}
                        </p>
                    )}

                    <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
                        <div className="shrink-0">
                            <QrCode value={proposalUrl} size={132} />
                            <p className="mt-3 max-w-[132px] font-ui text-[11px] leading-relaxed text-hf-ice/40">
                                Aponte a câmera para abrir a proposta completa.
                            </p>
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.18em] text-hf-gold">
                                O que marcamos nesta conversa
                            </p>
                            {picked.length === 0 ? (
                                <p className="mt-3 font-ui text-[14px] leading-relaxed text-hf-ice/45">
                                    Nada marcado ainda.
                                </p>
                            ) : (
                                <>
                                    <ul className="mt-3 space-y-1.5">
                                        {picked.map((t) => (
                                            <li
                                                key={t}
                                                className="flex items-start gap-2 font-ui text-[14px] leading-relaxed text-hf-ice/80"
                                            >
                                                <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-hf-gold" />
                                                {t}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        type="button"
                                        onClick={copySummary}
                                        className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-hf-ice/25 px-5 font-ui text-[12px] font-semibold uppercase tracking-[0.1em] text-hf-ice transition-colors hover:border-hf-gold/50"
                                    >
                                        <Copy className="h-4 w-4" />
                                        {copied ? 'Copiado' : 'Copiar resumo'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </Slide>
            ),
        });

        return list;
    }, [
        p,
        competitions,
        stats,
        routineWeek,
        trainingHours,
        partnerBlocks,
        partnerWord,
        partnerPhotos,
        audienceMetrics,
        buildItems,
        studentStats,
        costItems,
        pilotSteps,
        picked,
        togglePicked,
        coverPhotos,
        closingPhotos,
        partnerStates,
        proposalUrl,
        copied,
    ]);

    // ---- Estados ----------------------------------------------------------
    if (loading) {
        return (
            <div className="flex h-[100dvh] items-center justify-center bg-hf-navy">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-hf-ice/15 border-t-hf-gold" />
            </div>
        );
    }

    if (notFound || !p) {
        return (
            <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 bg-hf-navy px-6 text-center">
                <p className="font-ui text-2xl font-semibold text-hf-ice">Apresentação não encontrada</p>
                <p className="font-ui text-sm text-hf-ice/45">
                    Confira o endereço da proposta. Ele termina com o nome do parceiro, como
                    /parceria/marista/apresentacao.
                </p>
                <Link
                    to="/"
                    className="mt-2 inline-flex items-center gap-2 font-ui text-sm font-semibold text-hf-gold"
                >
                    Ir para o início
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        );
    }

    const note = arr<PresenterNote>(p.presenter_notes).find((n) => n.slide === currentKey)?.text;

    return (
        <>
            <Deck
                slides={slides}
                brand={
                    <>
                        <HFSymbol className="h-7 w-auto text-hf-ice" title="Henrique Fujimoto" />
                        <span className="h-4 w-px bg-hf-line" />
                        <span className="truncate font-ui text-[10px] font-semibold uppercase tracking-[0.2em] text-hf-ice/55">
                            Henrique Fujimoto {p.partner_name ? `× ${partnerWord}` : ''}
                        </span>
                    </>
                }
                brandRight={p.presentation_label || 'Apresentação de parceria'}
                presenterOn={presenterOn}
                onTogglePresenter={() => setPresenterOn((v) => !v)}
                onSlideChange={(s) => setCurrentKey(s.key)}
                presenterLayer={
                    presenterOn ? (
                        <PresenterLayer
                            note={note}
                            ruler={arr<RulerStep>(p.presenter_ruler)}
                            objections={arr<Objection>(p.presenter_objections)}
                            onClose={() => setPresenterOn(false)}
                        />
                    ) : null
                }
            />

            {/* Saida discreta para a proposta completa, fora do fluxo das telas. */}
            <motion.a
                href={`/parceria/${slug}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-hf-line/70 bg-hf-navy/80 text-hf-ice/45 backdrop-blur transition-colors hover:text-hf-ice"
                aria-label="Abrir a proposta completa"
            >
                <ExternalLink className="h-4 w-4" />
            </motion.a>
        </>
    );
}
