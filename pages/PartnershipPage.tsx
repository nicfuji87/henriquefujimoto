import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Download, Mail, MessageCircle, MapPin, Instagram, Youtube, Newspaper, Globe } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '../lib/supabase';
import { getMediaKitMetrics, type MediaKitMetrics } from '../lib/metrics';
import { formatCompact } from '../components/home/utils';

// ---- Types ---------------------------------------------------------------
interface CostItem {
    label: string;
    amount: number;
    period: 'mensal' | 'anual';
}
interface Counterpart {
    category: string;
    items: string[];
}
interface Institutional {
    title: string;
    text: string;
}
interface TimelineItem {
    year: string;
    label: string;
}
interface CustomSection {
    title: string;
    body: string;
}
interface AcademicCard {
    title: string;
    text: string;
}
interface RoutineNode {
    time: string;
    label: string;
}
interface RoutineDay {
    day: string;
    blocks: { time: string; label: string }[];
}
interface Photo {
    url: string;
    caption?: string;
    section?: string; // 'potential' | 'why_partner' | 'results' | 'closing' | 'gallery'
}
interface Goal {
    horizon: string;
    text: string;
}
interface Competition {
    id: string;
    name: string;
    date: string;
    location: string;
    category: string;
    weight_class: string;
    placement: string;
    medal_type: string | null;
}

interface Channel {
    name: string;
    detail: string;
}

interface PartnershipProject {
    slug: string;
    is_active: boolean;
    project_title: string;
    partner_name: string;
    partner_logo_url: string | null;
    hero_kicker: string;
    hero_title: string;
    hero_subtitle: string;
    intro: string;
    // Executive summary + federation credibility
    executive_summary: string;
    executive_highlights?: string[] | null;
    executive_objective?: string | null;
    federation_info: string;
    // Results
    results_title: string;
    results_intro: string;
    show_competitions: boolean;
    // Potential + goals
    why_now_title: string;
    why_now_body: string;
    goals_title: string;
    goals: Goal[] | null;
    // Why the Marista school
    why_marista_title?: string | null;
    why_marista_body?: string | null;
    // How the athlete represents the school
    representation_title: string;
    representation_body: string;
    counterparts: Counterpart[] | null;
    // Academic / discipline / routine
    academic_title: string;
    academic_body: string;
    academic_cards?: AcademicCard[] | null;
    discipline_title: string;
    discipline_body: string;
    routine_title: string;
    routine_body: string;
    routine_timeline?: RoutineNode[] | null;
    routine_week?: RoutineDay[] | null;
    // Image return + communication
    comms_title: string;
    comms_body: string;
    show_metrics: boolean;
    channels_note: string;
    channels: Channel[] | null;
    // Photos
    photos: Photo[] | null;
    // Investment + scholarship
    costs: CostItem[] | null;
    costs_note: string;
    scholarship_label: string;
    scholarship_monthly: number;
    scholarship_body: string;
    ask_body: string;
    // Deliverables — what the school receives over a school year
    deliverables_title?: string | null;
    deliverables?: string[] | null;
    // Institutional
    institutional: Institutional[] | null;
    // Family
    family_letter: string;
    family_letter_signature: string;
    family_commitments: string[] | null;
    // Timeline
    timeline: TimelineItem[] | null;
    timeline_note: string;
    // Custom + closing + contact
    custom_sections: CustomSection[] | null;
    contact_name: string;
    contact_whatsapp: string;
    contact_email: string;
    closing_title: string;
    closing_body: string;
    closing_image_url?: string | null;
}

// ---- Helpers -------------------------------------------------------------
const fmtBRL = (n: number) =>
    new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0,
    }).format(Number.isFinite(n) ? n : 0);

const ATHLETE = 'Henrique Fujimoto · Judoca Sub-15';

const medalEmoji = (type: string | null) =>
    type === 'gold' ? '🥇' : type === 'silver' ? '🥈' : type === 'bronze' ? '🥉' : '🏅';

const channelIcon = (name: string) => {
    const n = (name || '').toLowerCase();
    if (n.includes('insta')) return Instagram;
    if (n.includes('you')) return Youtube;
    if (n.includes('blog')) return Newspaper;
    return Globe;
};

const reveal = {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.6 },
} as const;

// Section wrapper — single readable document column
function Section({
    children,
    className = '',
    id,
}: {
    children: React.ReactNode;
    className?: string;
    id?: string;
}) {
    return (
        <section id={id} className={`bg-night px-6 py-14 sm:py-20 md:py-28 ${className}`}>
            <div className="mx-auto max-w-4xl">{children}</div>
        </section>
    );
}

function Kicker({ children }: { children: React.ReactNode }) {
    return (
        <p className="mb-3 font-grotesk text-[12px] font-semibold uppercase tracking-[0.16em] text-lime">
            {children}
        </p>
    );
}

function Heading({ children }: { children: React.ReactNode }) {
    return (
        <motion.h2
            {...reveal}
            className="font-grotesk text-[1.6rem] font-semibold leading-[1.15] tracking-tight text-white sm:text-[2rem] sm:leading-[1.08] md:text-[2.75rem]"
        >
            {children}
        </motion.h2>
    );
}

// Body paragraph shared by the text sections (academic / discipline / routine / representation)
function Body({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <motion.p
            {...reveal}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`mt-6 whitespace-pre-line font-grotesk text-base leading-relaxed text-white/70 sm:text-lg ${className}`}
        >
            {children}
        </motion.p>
    );
}

// Competition row — mirrors components/home/AchievementsSection.tsx
function CompRow({ comp }: { comp: Competition }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-coal px-4 py-3 transition-colors hover:border-white/15">
            <span className="shrink-0 text-xl">{medalEmoji(comp.medal_type)}</span>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-grotesk text-sm font-semibold text-white">{comp.name}</span>
                    {comp.category && (
                        <span className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-grotesk text-[10px] text-white/50">
                            {comp.category}
                        </span>
                    )}
                    {comp.weight_class && (
                        <span className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-grotesk text-[10px] text-white/50">
                            {comp.weight_class}
                        </span>
                    )}
                </div>
                <div className="mt-0.5 flex items-center gap-3 font-grotesk text-[11px] text-white/40">
                    <span>{new Date(comp.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                    {comp.location && (
                        <span className="flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5" />
                            {comp.location}
                        </span>
                    )}
                </div>
            </div>
            <span
                className={`shrink-0 font-grotesk text-sm font-semibold ${
                    comp.medal_type === 'gold' ? 'text-lime' : 'text-white/80'
                }`}
            >
                {comp.placement}
            </span>
        </div>
    );
}

// Contextual photo strip — renders a small grid of captioned photos inside a section
function PhotoStrip({ items }: { items: Photo[] }) {
    if (!items.length) return null;
    return (
        <div className={`mt-8 grid grid-cols-1 gap-4 ${items.length > 1 ? 'sm:grid-cols-2' : ''}`}>
            {items.map((ph, i) => (
                <motion.figure
                    key={`${ph.url}-${i}`}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
                >
                    <img
                        src={ph.url}
                        alt={ph.caption || 'Henrique Fujimoto'}
                        loading="lazy"
                        className="w-full rounded-3xl border border-white/[0.07] object-cover"
                    />
                    {ph.caption && (
                        <figcaption className="mt-2.5 font-grotesk text-[13px] leading-relaxed text-white/45">
                            {ph.caption}
                        </figcaption>
                    )}
                </motion.figure>
            ))}
        </div>
    );
}

export default function PartnershipPage() {
    const { slug } = useParams<{ slug: string }>();
    const [project, setProject] = useState<PartnershipProject | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [metrics, setMetrics] = useState<MediaKitMetrics | null>(null);
    const [competitions, setCompetitions] = useState<Competition[]>([]);

    // Fetch the project row
    useEffect(() => {
        let cancelled = false;
        window.scrollTo(0, 0);
        (async () => {
            if (!slug) {
                setNotFound(true);
                setLoading(false);
                return;
            }
            setLoading(true);
            const { data, error } = await supabase
                .from('partnership_projects')
                .select('*')
                .eq('slug', slug)
                .maybeSingle();

            if (cancelled) return;
            if (error || !data || data.is_active === false) {
                setNotFound(true);
                setProject(null);
            } else {
                setProject(data as PartnershipProject);
                setNotFound(false);
            }
            setLoading(false);
        })();
        return () => {
            cancelled = true;
        };
    }, [slug]);

    // Live metrics (only when enabled)
    useEffect(() => {
        if (!project?.show_metrics) return;
        let cancelled = false;
        getMediaKitMetrics().then((m) => {
            if (!cancelled) setMetrics(m);
        });
        return () => {
            cancelled = true;
        };
    }, [project?.show_metrics]);

    // Competitions — the #1 argument (only when enabled)
    useEffect(() => {
        if (!project?.show_competitions) return;
        let cancelled = false;
        (async () => {
            const { data } = await supabase
                .from('competitions')
                .select('*')
                .order('date', { ascending: false });
            if (!cancelled) setCompetitions((data as Competition[]) || []);
        })();
        return () => {
            cancelled = true;
        };
    }, [project?.show_competitions]);

    // Hidden / SEO — title + noindex (cleaned up on unmount so the rest of the SPA stays indexable)
    useEffect(() => {
        document.title = project?.project_title || 'Proposta de parceria';
        let robots = document.head.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
        const created = !robots;
        if (!robots) {
            robots = document.createElement('meta');
            robots.setAttribute('name', 'robots');
            document.head.appendChild(robots);
        }
        const previous = robots.getAttribute('content');
        robots.setAttribute('content', 'noindex, nofollow');
        return () => {
            if (!robots) return;
            if (created) robots.remove();
            else if (previous !== null) robots.setAttribute('content', previous);
        };
    }, [project?.project_title]);

    // Derived financials
    const costs = useMemo<CostItem[]>(
        () => (Array.isArray(project?.costs) ? (project!.costs as CostItem[]) : []),
        [project],
    );
    const annualInvestment = useMemo(
        () => costs.reduce((sum, c) => sum + (c.amount || 0) * (c.period === 'mensal' ? 12 : 1), 0),
        [costs],
    );
    const monthlyTotal = useMemo(
        () => costs.filter((c) => c.period === 'mensal').reduce((s, c) => s + (c.amount || 0), 0),
        [costs],
    );
    const scholarshipAnnual = (project?.scholarship_monthly || 0) * 12;
    const pct = annualInvestment > 0 ? Math.round((scholarshipAnnual / annualInvestment) * 100) : 0;

    // Derived competition stats
    const compStats = useMemo(() => {
        const golds = competitions.filter((c) => c.medal_type === 'gold').length;
        const silvers = competitions.filter((c) => c.medal_type === 'silver').length;
        const bronzes = competitions.filter((c) => c.medal_type === 'bronze').length;
        return { golds, silvers, bronzes, podiums: golds + silvers + bronzes };
    }, [competitions]);

    // ---- PDF export ------------------------------------------------------
    function handleDownloadPdf() {
        if (!project) return;
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const margin = 48;
        const contentW = pageW - margin * 2;
        let y = margin;

        const ensure = (needed: number) => {
            if (y + needed > pageH - margin) {
                doc.addPage();
                y = margin;
            }
        };
        const heading = (text: string, size = 14) => {
            if (!text) return;
            ensure(size + 20);
            y += 8;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(size);
            doc.setTextColor(18, 20, 23);
            doc.text(text, margin, y);
            y += size + 6;
        };
        const paragraph = (text: string, size = 10.5, color: [number, number, number] = [55, 55, 60]) => {
            if (!text) return;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(size);
            doc.setTextColor(...color);
            const lineH = size * 1.42;
            for (const rawLine of String(text).split('\n')) {
                const wrapped = doc.splitTextToSize(rawLine || ' ', contentW);
                for (const line of wrapped) {
                    ensure(lineH);
                    doc.text(line, margin, y);
                    y += lineH;
                }
            }
            y += 6;
        };

        const goals = Array.isArray(project.goals) ? project.goals : [];
        const familyCommitments = Array.isArray(project.family_commitments)
            ? project.family_commitments
            : [];
        const execHighlights = Array.isArray(project.executive_highlights)
            ? project.executive_highlights.filter((h) => typeof h === 'string' && h.trim() !== '')
            : [];
        const academicCardsPdf = Array.isArray(project.academic_cards)
            ? project.academic_cards.filter((c) => c && (c.title || c.text))
            : [];
        const routineTimelinePdf = Array.isArray(project.routine_timeline)
            ? project.routine_timeline.filter((r) => r && (r.time || r.label))
            : [];
        const routineWeekPdf = Array.isArray(project.routine_week)
            ? project.routine_week.filter((d) => d && d.day && Array.isArray(d.blocks) && d.blocks.length > 0)
            : [];
        const deliverablesPdf = Array.isArray(project.deliverables)
            ? project.deliverables.filter((d) => typeof d === 'string' && d.trim() !== '')
            : [];

        // Title block
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(18, 20, 23);
        for (const line of doc.splitTextToSize(project.project_title || 'Proposta de parceria', contentW)) {
            ensure(26);
            doc.text(line, margin, y);
            y += 24;
        }
        y += 2;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(120, 120, 125);
        if (project.partner_name) {
            doc.text(`Proposta para ${project.partner_name}`, margin, y);
            y += 16;
        }
        doc.text('Henrique Fujimoto — Judoca Sub-15', margin, y);
        y += 10;

        // Executive summary
        if (project.executive_summary || execHighlights.length > 0 || project.executive_objective) {
            heading('Resumo executivo');
            paragraph(project.executive_summary);
            if (execHighlights.length > 0) {
                paragraph('Nos últimos 12 meses:', 10.5, [18, 20, 23]);
                for (const h of execHighlights) paragraph(`•  ${h}`, 10);
            }
            if (project.executive_objective) {
                paragraph('Objetivo', 11, [18, 20, 23]);
                paragraph(project.executive_objective);
            }
        }

        // Thesis
        paragraph(project.intro);

        // Results (the lead argument)
        if (project.results_intro || project.federation_info || competitions.length > 0) {
            heading(project.results_title || 'Resultados que comprovam a trajetória');
            paragraph(project.results_intro);
            paragraph(project.federation_info);
            if (competitions.length > 0) {
                paragraph(
                    `${competitions.length} competições, ${compStats.podiums} pódios ` +
                        `(${compStats.golds} ouros, ${compStats.silvers} pratas, ${compStats.bronzes} bronzes).`,
                    10.5,
                    [18, 20, 23],
                );
            }
        }

        // Potential + goals
        if (project.why_now_body || goals.length > 0) {
            heading(project.why_now_title || 'Potencial e metas');
            paragraph(project.why_now_body);
            if (goals.length > 0) {
                if (project.goals_title) paragraph(project.goals_title, 11, [18, 20, 23]);
                for (const g of goals) paragraph(`${g.horizon} — ${g.text}`, 10);
            }
        }

        // Why the Marista school
        if (project.why_marista_body) {
            heading(project.why_marista_title || 'Por que o Marista?');
            paragraph(project.why_marista_body);
        }

        // How the athlete represents the school
        if (project.representation_body || (Array.isArray(project.counterparts) && project.counterparts.length > 0)) {
            heading(project.representation_title || 'Como o Henrique representa a escola');
            paragraph(project.representation_body);
            if (Array.isArray(project.counterparts)) {
                for (const c of project.counterparts) {
                    if (c.category) paragraph(c.category, 11, [18, 20, 23]);
                    for (const item of c.items || []) paragraph(`•  ${item}`, 10);
                }
            }
        }

        // Academic
        if (project.academic_body || academicCardsPdf.length > 0) {
            heading(project.academic_title || 'Vida acadêmica');
            paragraph(project.academic_body);
            for (const c of academicCardsPdf) {
                const line = c.title && c.text ? `${c.title}: ${c.text}` : c.title || c.text || '';
                paragraph(line, 10);
            }
        }
        // Discipline
        if (project.discipline_body) {
            heading(project.discipline_title || 'Disciplina e comportamento');
            paragraph(project.discipline_body);
        }
        // Routine
        if (project.routine_body || routineWeekPdf.length > 0 || routineTimelinePdf.length > 0) {
            heading(project.routine_title || 'Rotina de treinamento');
            paragraph(project.routine_body);
            if (routineWeekPdf.length > 0) {
                for (const d of routineWeekPdf) {
                    paragraph(`${d.day}: ${d.blocks.map((b) => `${b.time} ${b.label}`).join('  ·  ')}`, 10);
                }
            } else {
                for (const r of routineTimelinePdf) paragraph(`${r.time} — ${r.label}`, 10);
            }
        }

        // Image return + communication
        if (project.comms_body || project.show_metrics) {
            heading(project.comms_title || 'Retorno de imagem e comunicação');
            paragraph(project.comms_body);
            if (project.show_metrics && metrics) {
                paragraph(
                    `Alcance por ano: ${metrics.annualReach.toLocaleString('pt-BR')} (media de ${metrics.monthlyAvgReach.toLocaleString('pt-BR')}/mes)  ·  ` +
                        `Interacoes por ano: ${metrics.annualInteractions.toLocaleString('pt-BR')} (media de ${metrics.monthlyAvgInteractions.toLocaleString('pt-BR')}/mes)  ·  ` +
                        `Seguidores hoje: ${metrics.totalFollowers.toLocaleString('pt-BR')} (crescendo ~${metrics.monthlyFollowerGain.toLocaleString('pt-BR')}/mes, projecao de ${metrics.projectedFollowers12mo.toLocaleString('pt-BR')} em 12 meses)` +
                        (metrics.isFullYear ? '' : `  ·  Alcance/interacoes: projecao anual com base na media real dos ultimos ${Math.round(metrics.monthsOfData)} meses`),
                    9.5,
                    [90, 90, 95],
                );
            }
            const channelsPdf = Array.isArray(project.channels) ? project.channels.filter((c) => c && c.name) : [];
            if (project.channels_note || channelsPdf.length > 0) {
                if (project.channels_note) paragraph(project.channels_note, 9.5, [90, 90, 95]);
                for (const c of channelsPdf) paragraph(`${c.name}: ${c.detail || ''}`, 9.5);
            }
        }

        // Costs table
        if (costs.length > 0) {
            heading('Investimento');
            const body: any[] = costs.map((c) => [
                c.label,
                c.period === 'mensal' ? 'Mensal' : 'Anual',
                fmtBRL(c.amount || 0),
                fmtBRL((c.amount || 0) * (c.period === 'mensal' ? 12 : 1)),
            ]);
            body.push([
                { content: 'Investimento anual', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
                { content: fmtBRL(annualInvestment), styles: { fontStyle: 'bold' } },
            ]);
            autoTable(doc, {
                startY: y,
                head: [['Item', 'Período', 'Valor', 'Valor anual']],
                body,
                margin: { left: margin, right: margin },
                styles: { fontSize: 9, cellPadding: 5, textColor: [45, 45, 50] },
                headStyles: { fillColor: [18, 20, 23], textColor: [255, 255, 255], fontStyle: 'bold' },
                theme: 'grid',
            });
            y = (doc as any).lastAutoTable.finalY + 14;
            if (project.costs_note) paragraph(project.costs_note, 9, [120, 120, 125]);
        }

        // Scholarship
        heading('A proposta de bolsa');
        if (project.scholarship_label) {
            paragraph(
                `${project.scholarship_label}: ${fmtBRL(project.scholarship_monthly || 0)}/mês  ` +
                    `(${fmtBRL(scholarshipAnnual)}/ano)`,
                10.5,
                [18, 20, 23],
            );
        }
        if (annualInvestment > 0) {
            paragraph(
                `A bolsa representa ${pct}% do investimento anual total do projeto.`,
                10.5,
                [18, 20, 23],
            );
        }
        paragraph(project.scholarship_body);
        paragraph(project.ask_body);

        // Deliverables — what the school receives over a school year
        if (deliverablesPdf.length > 0) {
            heading(project.deliverables_title || 'O que o Marista receberá durante um ano letivo');
            paragraph('Entregas concretas ao longo do ano letivo:', 10);
            for (const d of deliverablesPdf) paragraph(`•  ${d}`, 10);
        }

        // Institutional
        if (Array.isArray(project.institutional) && project.institutional.length > 0) {
            heading('Institucional');
            for (const it of project.institutional) {
                if (it.title) paragraph(it.title, 11, [18, 20, 23]);
                paragraph(it.text, 10);
            }
        }

        // Family letter + commitments
        if (project.family_letter || familyCommitments.length > 0) {
            heading('Compromisso da família');
            paragraph(project.family_letter);
            if (project.family_letter_signature) paragraph(project.family_letter_signature, 10.5, [18, 20, 23]);
            for (const item of familyCommitments) paragraph(`•  ${item}`, 10);
        }

        // Timeline
        if (Array.isArray(project.timeline) && project.timeline.length > 0) {
            heading('Linha do tempo');
            for (const t of project.timeline) paragraph(`${t.year} — ${t.label}`, 10);
            if (project.timeline_note) paragraph(project.timeline_note, 9, [120, 120, 125]);
        }

        // Custom sections
        if (Array.isArray(project.custom_sections)) {
            for (const s of project.custom_sections) {
                if (!s?.title && !s?.body) continue;
                heading(s.title || '');
                paragraph(s.body || '');
            }
        }

        // Closing
        if (project.closing_body || project.closing_title) {
            heading(project.closing_title || 'Vamos juntos');
            paragraph(project.closing_body);
        }

        // Contact
        heading('Contato');
        if (project.contact_name) paragraph(project.contact_name, 10.5, [18, 20, 23]);
        const waNumber = (project.contact_whatsapp || '').match(/wa\.me\/(\d+)/)?.[1];
        if (waNumber) paragraph(`WhatsApp: +${waNumber}`, 10);
        if (project.contact_email) paragraph(`E-mail: ${project.contact_email}`, 10);

        doc.save(`proposta-${project.slug || 'parceria'}.pdf`);
    }

    // ---- States ----------------------------------------------------------
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-night">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-lime" />
            </div>
        );
    }

    if (notFound || !project) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-night px-6 text-center">
                <p className="font-grotesk text-2xl font-semibold text-white">Projeto não encontrado</p>
                <p className="mt-3 font-grotesk text-sm text-white/45">
                    Este link de proposta não está disponível.
                </p>
            </div>
        );
    }

    const p = project;
    const counterparts = Array.isArray(p.counterparts) ? p.counterparts : [];
    const institutional = Array.isArray(p.institutional) ? p.institutional : [];
    const timeline = Array.isArray(p.timeline) ? p.timeline : [];
    const customSections = Array.isArray(p.custom_sections) ? p.custom_sections : [];
    const photos = Array.isArray(p.photos) ? p.photos.filter((ph) => ph && ph.url) : [];
    const closingImage =
        (p.closing_image_url && p.closing_image_url.trim()) ||
        photos.find((ph) => ph.section === 'closing')?.url ||
        '';
    const photosFor = (sec: string) =>
        photos.filter((ph) => (ph.section || 'gallery') === sec && ph.url !== closingImage);
    const goals = Array.isArray(p.goals) ? p.goals.filter((g) => g && g.text) : [];
    const familyCommitments = Array.isArray(p.family_commitments)
        ? p.family_commitments.filter((c) => typeof c === 'string' && c.trim() !== '')
        : [];
    const executiveHighlights = Array.isArray(p.executive_highlights)
        ? p.executive_highlights.filter((h) => typeof h === 'string' && h.trim() !== '')
        : [];
    const academicCards = Array.isArray(p.academic_cards)
        ? p.academic_cards.filter((c) => c && (c.title || c.text))
        : [];
    const routineTimeline = Array.isArray(p.routine_timeline)
        ? p.routine_timeline.filter((r) => r && (r.time || r.label))
        : [];
    const routineWeek = Array.isArray(p.routine_week)
        ? p.routine_week.filter((d) => d && d.day && Array.isArray(d.blocks) && d.blocks.length > 0)
        : [];
    const deliverables = Array.isArray(p.deliverables)
        ? p.deliverables.filter((d) => typeof d === 'string' && d.trim() !== '')
        : [];

    const showCompetitions = p.show_competitions && competitions.length > 0;
    const recentComps = competitions.slice(0, 8);
    const compSummary = [
        { label: 'Competições', value: competitions.length, accent: false },
        { label: 'Pódios', value: compStats.podiums, accent: true },
        { label: 'Ouros', value: compStats.golds, accent: false },
        { label: 'Pratas', value: compStats.silvers, accent: false },
        { label: 'Bronzes', value: compStats.bronzes, accent: false },
    ];

    const hasResults = showCompetitions || !!p.results_intro || !!p.federation_info;
    const hasPotential = !!p.why_now_body || goals.length > 0;
    const hasRepresentation = !!p.representation_body || counterparts.length > 0;
    const hasFamily = !!p.family_letter || familyCommitments.length > 0;

    const metricTiles = [
        {
            value: metrics?.annualReach ?? 0,
            label: 'pessoas alcançadas por ano',
            sub: metrics ? `≈ ${formatCompact(metrics.monthlyAvgReach)} por mês` : '',
            accent: true,
        },
        {
            value: metrics?.annualInteractions ?? 0,
            label: 'interações por ano',
            sub: metrics ? `≈ ${formatCompact(metrics.monthlyAvgInteractions)} por mês` : '',
            accent: false,
        },
        {
            value: metrics?.totalFollowers ?? 0,
            label: 'seguidores hoje',
            sub: metrics && metrics.monthlyFollowerGain > 0
                ? `+≈ ${formatCompact(metrics.monthlyFollowerGain)}/mês · ~${formatCompact(metrics.projectedFollowers12mo)} em 12 meses`
                : 'público qualificado de judô',
            accent: false,
        },
    ];

    const channels = Array.isArray(p.channels) ? p.channels.filter((c) => c && c.name) : [];

    return (
        <div className="min-h-screen bg-night">
            {/* ---- 1. Hero ---- */}
            <section className="relative overflow-hidden bg-night px-6 pt-16 pb-14 sm:pt-24 sm:pb-20 md:pt-32 md:pb-28">
                <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-lime/[0.07] blur-[130px]" />
                <div className="relative mx-auto max-w-4xl">
                    <motion.div
                        {...reveal}
                        transition={{ duration: 0.5 }}
                        className="flex flex-wrap items-center gap-x-5 gap-y-3"
                    >
                        {p.partner_logo_url && (
                            <img
                                src={p.partner_logo_url}
                                alt={p.partner_name || 'Parceiro'}
                                className="h-16 w-auto max-w-[280px] object-contain sm:h-20"
                            />
                        )}
                        <span className="font-grotesk text-sm font-medium text-white/55">{ATHLETE}</span>
                    </motion.div>

                    {p.hero_kicker && (
                        <motion.div {...reveal} transition={{ duration: 0.5, delay: 0.05 }} className="mt-7 sm:mt-10">
                            <Kicker>{p.hero_kicker}</Kicker>
                        </motion.div>
                    )}

                    <motion.h1
                        {...reveal}
                        transition={{ duration: 0.7, delay: 0.08 }}
                        className="mt-1 font-grotesk text-[1.9rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-[3.25rem] sm:leading-[1.05] md:text-[4rem]"
                    >
                        {p.hero_title}
                    </motion.h1>

                    {p.hero_subtitle && (
                        <motion.p
                            {...reveal}
                            transition={{ duration: 0.6, delay: 0.16 }}
                            className="mt-5 max-w-2xl font-grotesk text-base leading-relaxed text-white/60 sm:text-lg md:text-xl"
                        >
                            {p.hero_subtitle}
                        </motion.p>
                    )}
                </div>
            </section>

            {/* ---- 2. Executive summary ---- */}
            {(p.executive_summary || executiveHighlights.length > 0 || p.executive_objective) && (
                <Section className="py-16 md:py-20">
                    <Kicker>Resumo executivo</Kicker>
                    {p.executive_summary && (
                        <motion.p
                            {...reveal}
                            transition={{ duration: 0.7 }}
                            className="max-w-3xl whitespace-pre-line font-grotesk text-xl leading-relaxed text-white/85 sm:text-2xl"
                        >
                            {p.executive_summary}
                        </motion.p>
                    )}

                    {executiveHighlights.length > 0 && (
                        <div className="mt-10">
                            <p className="mb-4 font-grotesk text-[12px] font-semibold uppercase tracking-[0.16em] text-lime">
                                Nos últimos 12 meses
                            </p>
                            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {executiveHighlights.map((h, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, y: 14 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: '-50px' }}
                                        transition={{ duration: 0.45, delay: (i % 2) * 0.06 }}
                                        className="flex items-start gap-2.5 rounded-2xl border border-white/[0.07] bg-coal px-5 py-4 transition-colors hover:border-lime/25"
                                    >
                                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
                                        <span className="font-grotesk text-sm leading-relaxed text-white/70">{h}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {p.executive_objective && (
                        <motion.div
                            {...reveal}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="mt-10 border-l-2 border-lime/60 pl-4"
                        >
                            <p className="mb-1.5 font-grotesk text-[12px] font-semibold uppercase tracking-[0.16em] text-lime">
                                Objetivo
                            </p>
                            <p className="whitespace-pre-line font-grotesk text-base leading-relaxed text-white/80 sm:text-lg">
                                {p.executive_objective}
                            </p>
                        </motion.div>
                    )}
                </Section>
            )}

            {/* ---- 3. Thesis / intro ---- */}
            {p.intro && (
                <Section className="py-16 md:py-20">
                    <motion.p
                        {...reveal}
                        transition={{ duration: 0.7 }}
                        className="max-w-3xl whitespace-pre-line font-grotesk text-xl leading-relaxed text-white/80 sm:text-2xl"
                    >
                        {p.intro}
                    </motion.p>
                </Section>
            )}

            {/* ---- 4. Sporting results — the lead argument ---- */}
            {hasResults && (
                <Section>
                    <Heading>
                        {p.results_title || (
                            <>
                                Resultados que{' '}
                                <span className="font-editorial font-normal italic text-lime">
                                    comprovam a trajetória
                                </span>
                            </>
                        )}
                    </Heading>

                    {p.results_intro && <Body>{p.results_intro}</Body>}

                    {p.federation_info && (
                        <motion.p
                            {...reveal}
                            transition={{ duration: 0.6, delay: 0.14 }}
                            className="mt-5 whitespace-pre-line font-grotesk text-[13px] leading-relaxed text-white/45"
                        >
                            {p.federation_info}
                        </motion.p>
                    )}

                    {showCompetitions && (
                        <>
                            <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-5">
                                {compSummary.map((s, i) => (
                                    <motion.div
                                        key={s.label}
                                        initial={{ opacity: 0, y: 14 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: i * 0.06 }}
                                        className="rounded-2xl border border-white/[0.07] bg-coal p-4 text-center"
                                    >
                                        <div
                                            className={`font-grotesk text-3xl font-semibold ${
                                                s.accent ? 'text-lime' : 'text-white'
                                            }`}
                                        >
                                            {s.value}
                                        </div>
                                        <div className="mt-1.5 font-grotesk text-[11px] font-medium text-white/45">
                                            {s.label}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-8 space-y-2">
                                <h3 className="mb-3 font-grotesk text-[12px] font-semibold uppercase tracking-[0.12em] text-white/40">
                                    Mais recentes
                                </h3>
                                {recentComps.map((c: Competition) => (
                                    <React.Fragment key={c.id}>
                                        <CompRow comp={c} />
                                    </React.Fragment>
                                ))}
                            </div>
                        </>
                    )}
                    <PhotoStrip items={photosFor('results')} />
                </Section>
            )}

            {/* ---- 5. Potential + goals ---- */}
            {hasPotential && (
                <Section>
                    <Heading>{p.why_now_title || 'Potencial e metas'}</Heading>
                    {p.why_now_body && <Body>{p.why_now_body}</Body>}

                    {/* Age-window graphic — fixed 12 → 16 development window */}
                    <motion.div
                        {...reveal}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="mt-10 rounded-3xl border border-white/[0.07] bg-coal p-6 transition-colors hover:border-lime/25 sm:p-8"
                    >
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:justify-center sm:overflow-visible">
                            {[12, 13, 14, 15, 16].map((age, i, arr) => (
                                <React.Fragment key={age}>
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-lime/40 bg-lime/[0.08] font-grotesk text-lg font-semibold text-lime sm:h-14 sm:w-14 sm:text-xl">
                                        {age}
                                    </span>
                                    {i < arr.length - 1 && (
                                        <ArrowRight className="h-4 w-4 shrink-0 text-white/30" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="mt-5 flex items-center justify-center rounded-full border border-lime/25 bg-lime/[0.06] px-4 py-2 text-center">
                            <span className="font-grotesk text-[11px] font-semibold uppercase tracking-[0.12em] text-lime sm:text-[13px]">
                                Janela de maior desenvolvimento esportivo
                            </span>
                        </div>
                    </motion.div>

                    {goals.length > 0 && (
                        <div className="mt-10">
                            {p.goals_title && (
                                <h3 className="mb-5 font-grotesk text-lg font-semibold text-white">
                                    {p.goals_title}
                                </h3>
                            )}
                            <div className="space-y-3">
                                {goals.map((g, i) => (
                                    <motion.div
                                        key={`${g.horizon}-${i}`}
                                        initial={{ opacity: 0, y: 16 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: '-50px' }}
                                        transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
                                        className="flex flex-col gap-1.5 rounded-3xl border border-white/[0.07] bg-coal p-6 transition-colors hover:border-lime/25 hover:bg-coal-2 sm:flex-row sm:items-baseline sm:gap-6"
                                    >
                                        {g.horizon && (
                                            <span className="shrink-0 font-grotesk text-sm font-semibold text-lime sm:w-44">
                                                {g.horizon}
                                            </span>
                                        )}
                                        <span className="whitespace-pre-line font-grotesk text-base leading-relaxed text-white/70">
                                            {g.text}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                    <PhotoStrip items={photosFor('potential')} />
                </Section>
            )}

            {/* ---- Why the Marista school ---- */}
            {(p.why_marista_body || photosFor('why_partner').length > 0) && (
                <Section>
                    <Heading>{p.why_marista_title || 'Por que o Marista?'}</Heading>
                    {p.why_marista_body && <Body>{p.why_marista_body}</Body>}
                    <PhotoStrip items={photosFor('why_partner')} />
                </Section>
            )}

            {/* ---- 6. How the athlete represents the school ---- */}
            {hasRepresentation && (
                <Section>
                    <Heading>{p.representation_title || 'Como o Henrique representa a escola'}</Heading>
                    {p.representation_body && <Body>{p.representation_body}</Body>}

                    {counterparts.length > 0 && (
                        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {counterparts.map((c, i) => (
                                <motion.div
                                    key={`${c.category}-${i}`}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-50px' }}
                                    transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
                                    className="rounded-3xl border border-white/[0.07] bg-coal p-6 transition-colors hover:border-lime/25 hover:bg-coal-2"
                                >
                                    <h3 className="font-grotesk text-lg font-semibold text-white">{c.category}</h3>
                                    <ul className="mt-4 space-y-2.5">
                                        {(c.items || []).map((item, j) => (
                                            <li key={j} className="flex items-start gap-2.5">
                                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
                                                <span className="font-grotesk text-sm leading-relaxed text-white/70">
                                                    {item}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </Section>
            )}

            {/* ---- 7. Academic life ---- */}
            {(p.academic_body || academicCards.length > 0) && (
                <Section>
                    <Heading>{p.academic_title || 'Vida acadêmica'}</Heading>
                    {p.academic_body && <Body>{p.academic_body}</Body>}

                    {academicCards.length > 0 && (
                        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {academicCards.map((c, i) => (
                                <motion.div
                                    key={`${c.title}-${i}`}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-50px' }}
                                    transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
                                    className="rounded-3xl border border-white/[0.07] bg-coal p-6 transition-colors hover:border-lime/25 hover:bg-coal-2"
                                >
                                    {c.title && (
                                        <h3 className="font-grotesk text-lg font-semibold text-white">{c.title}</h3>
                                    )}
                                    {c.text && (
                                        <p className="mt-2 whitespace-pre-line font-grotesk text-sm leading-relaxed text-white/60">
                                            {c.text}
                                        </p>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </Section>
            )}

            {/* ---- 8. Discipline + behaviour ---- */}
            {p.discipline_body && (
                <Section>
                    <Heading>{p.discipline_title || 'Disciplina e comportamento'}</Heading>
                    <Body>{p.discipline_body}</Body>
                </Section>
            )}

            {/* ---- 9. Training routine ---- */}
            {(p.routine_body || routineWeek.length > 0 || routineTimeline.length > 0) && (
                <Section>
                    <Heading>{p.routine_title || 'Rotina de treinamento'}</Heading>
                    {p.routine_body && <Body>{p.routine_body}</Body>}

                    {routineWeek.length > 0 ? (
                        <div className="mt-10 space-y-3">
                            {routineWeek.map((d, i) => (
                                <motion.div
                                    key={`${d.day}-${i}`}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-50px' }}
                                    transition={{ duration: 0.5, delay: i * 0.06 }}
                                    className="rounded-2xl border border-white/[0.07] bg-coal p-5 transition-colors hover:border-lime/25 sm:flex sm:gap-6"
                                >
                                    <div className="mb-3 shrink-0 font-grotesk text-sm font-semibold uppercase tracking-wide text-lime sm:mb-0 sm:w-24">
                                        {d.day}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {d.blocks.map((b, j) => (
                                            <span key={j} className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-night px-3 py-1.5">
                                                <span className="font-grotesk text-[11px] font-semibold text-lime">{b.time}</span>
                                                <span className="font-grotesk text-[13px] text-white/75">{b.label}</span>
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : routineTimeline.length > 0 ? (
                        <motion.div {...reveal} transition={{ duration: 0.6, delay: 0.1 }} className="mt-10">
                            {routineTimeline.map((r, i) => (
                                <div key={`${r.time}-${i}`} className="relative flex gap-5 pb-6 last:pb-0">
                                    {i < routineTimeline.length - 1 && (
                                        <span className="absolute left-[5px] top-4 h-full w-px border-l border-white/10" />
                                    )}
                                    <span className="relative mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-lime ring-4 ring-lime/15" />
                                    <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4">
                                        <span className="w-16 shrink-0 font-grotesk text-sm font-semibold text-lime">
                                            {r.time}
                                        </span>
                                        <span className="font-grotesk text-base leading-relaxed text-white/80">
                                            {r.label}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : null}
                </Section>
            )}

            {/* ---- 10. Image return + communication (metric tiles moved here) ---- */}
            {(p.comms_body || p.show_metrics || p.channels_note || channels.length > 0) && (
                <Section>
                    <Heading>{p.comms_title || 'Retorno de imagem e comunicação'}</Heading>
                    {p.comms_body && <Body>{p.comms_body}</Body>}

                    {p.show_metrics && (
                        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {metricTiles.map((t, i) => (
                                <motion.div
                                    key={t.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.08 }}
                                    className="rounded-3xl border border-white/[0.07] bg-coal p-6 transition-colors hover:border-lime/25 hover:bg-coal-2"
                                >
                                    <div
                                        className={`font-grotesk text-4xl font-semibold tracking-tight sm:text-5xl ${
                                            t.accent ? 'text-lime' : 'text-white'
                                        }`}
                                    >
                                        {formatCompact(t.value)}
                                    </div>
                                    <div className="mt-2 font-grotesk text-sm font-medium text-white/60">
                                        {t.label}
                                    </div>
                                    {t.sub && (
                                        <div className="mt-1 font-grotesk text-[12px] text-white/40">{t.sub}</div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                    {p.show_metrics && (
                        <p className="mt-5 font-grotesk text-[13px] text-white/40">
                            {metrics && !metrics.isFullYear
                                ? `Projeção anual com base na média real dos últimos ${Math.round(metrics.monthsOfData)} meses — dados do Instagram, atualizados automaticamente.`
                                : 'Dados reais do Instagram, atualizados automaticamente.'}
                        </p>
                    )}

                    {(p.channels_note || channels.length > 0) && (
                        <motion.div
                            {...reveal}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="mt-8 rounded-3xl border border-white/[0.07] bg-coal p-6 sm:p-7"
                        >
                            <p className="font-grotesk text-[11px] font-semibold uppercase tracking-[0.16em] text-lime">
                                Presença em múltiplos canais
                            </p>
                            {p.channels_note && (
                                <p className="mt-3 max-w-2xl whitespace-pre-line font-grotesk text-sm leading-relaxed text-white/70 sm:text-base">
                                    {p.channels_note}
                                </p>
                            )}
                            {channels.length > 0 && (
                                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    {channels.map((c, i) => {
                                        const Icon = channelIcon(c.name);
                                        return (
                                            <div key={`${c.name}-${i}`} className="rounded-2xl border border-white/[0.07] bg-night/40 p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime/12 text-lime">
                                                        <Icon className="h-4 w-4" />
                                                    </span>
                                                    <span className="font-grotesk text-sm font-semibold text-white">{c.name}</span>
                                                </div>
                                                {c.detail && (
                                                    <p className="mt-2 font-grotesk text-[13px] leading-relaxed text-white/55">{c.detail}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}
                </Section>
            )}

            {/* ---- 11. Photos (untagged gallery — contextual photos are rendered inside their sections) ---- */}
            {photosFor('gallery').length > 0 && (
                <Section>
                    <Heading>
                        O Henrique <span className="font-editorial font-normal italic text-lime">em ação</span>
                    </Heading>
                    <PhotoStrip items={photosFor('gallery')} />
                </Section>
            )}

            {/* ---- 12. Investment + scholarship ---- */}
            {costs.length > 0 && (
                <Section>
                    <Heading>
                        O que o projeto <span className="font-editorial font-normal italic text-lime">custa</span>
                    </Heading>

                    <motion.div
                        {...reveal}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="mt-10 overflow-hidden rounded-3xl border border-white/[0.07] bg-coal"
                    >
                        {costs.map((c, i) => (
                            <div
                                key={`${c.label}-${i}`}
                                className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-4 sm:px-6"
                            >
                                <div className="min-w-0">
                                    <div className="truncate font-grotesk text-base font-medium text-white">
                                        {c.label}
                                    </div>
                                    <div className="mt-0.5 font-grotesk text-[11px] font-medium uppercase tracking-wide text-white/40">
                                        {c.period === 'mensal' ? 'Mensal' : 'Anual'}
                                    </div>
                                </div>
                                <div className="shrink-0 text-right">
                                    <div className="font-grotesk text-base font-semibold text-white">
                                        {fmtBRL(c.amount || 0)}
                                        <span className="font-normal text-white/40">
                                            {c.period === 'mensal' ? '/mês' : '/ano'}
                                        </span>
                                    </div>
                                    {c.period === 'mensal' && (
                                        <div className="font-grotesk text-[11px] text-white/40">
                                            {fmtBRL((c.amount || 0) * 12)}/ano
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className="flex items-center justify-between gap-4 bg-lime/[0.06] px-5 py-5 sm:px-6">
                            <div>
                                <div className="font-grotesk text-base font-semibold text-white">
                                    Investimento anual
                                </div>
                                {monthlyTotal > 0 && (
                                    <div className="mt-0.5 font-grotesk text-[11px] text-white/45">
                                        Custo mensal recorrente: {fmtBRL(monthlyTotal)}
                                    </div>
                                )}
                            </div>
                            <div className="font-grotesk text-2xl font-semibold text-lime sm:text-3xl">
                                {fmtBRL(annualInvestment)}
                            </div>
                        </div>
                    </motion.div>

                    {p.costs_note && (
                        <p className="mt-4 font-grotesk text-[13px] leading-relaxed text-white/40">{p.costs_note}</p>
                    )}
                </Section>
            )}

            {/* ---- Scholarship impact ---- */}
            <Section>
                <Heading>
                    O impacto de uma <span className="font-editorial font-normal italic text-lime">bolsa</span>
                </Heading>

                <motion.div
                    {...reveal}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mt-10 rounded-3xl border border-lime/25 bg-coal p-8 md:p-10"
                >
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <span className="font-grotesk text-6xl font-semibold leading-none tracking-tight text-lime sm:text-7xl">
                            {pct}%
                        </span>
                        <span className="font-grotesk text-lg text-white/60">do investimento anual</span>
                    </div>

                    {p.scholarship_label && (
                        <p className="mt-6 font-grotesk text-base text-white/80">
                            <span className="font-semibold text-white">{p.scholarship_label}:</span>{' '}
                            {fmtBRL(p.scholarship_monthly || 0)}/mês
                            <span className="text-white/45"> · {fmtBRL(scholarshipAnnual)}/ano</span>
                        </p>
                    )}

                    {p.scholarship_body && (
                        <p className="mt-4 whitespace-pre-line font-grotesk text-base leading-relaxed text-white/70">
                            {p.scholarship_body}
                        </p>
                    )}

                    {p.ask_body && (
                        <div className="mt-6 rounded-2xl border border-white/[0.07] bg-night/60 p-5 sm:p-6">
                            <p className="whitespace-pre-line font-grotesk text-base leading-relaxed text-white/85">
                                {p.ask_body}
                            </p>
                        </div>
                    )}
                </motion.div>
            </Section>

            {/* ---- What the school receives over a school year ---- */}
            {deliverables.length > 0 && (
                <Section>
                    <Heading>
                        {p.deliverables_title || 'O que o Marista receberá durante um ano letivo'}
                    </Heading>
                    <motion.p
                        {...reveal}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="mt-6 font-grotesk text-base leading-relaxed text-white/60 sm:text-lg"
                    >
                        Entregas concretas ao longo do ano letivo:
                    </motion.p>
                    <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {deliverables.map((d, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 14 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ duration: 0.45, delay: (i % 2) * 0.06 }}
                                className="flex items-start gap-2.5 rounded-2xl border border-white/[0.07] bg-coal px-5 py-4 transition-colors hover:border-lime/25"
                            >
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
                                <span className="font-grotesk text-sm leading-relaxed text-white/80">{d}</span>
                            </motion.div>
                        ))}
                    </div>
                </Section>
            )}

            {/* ---- 13. Institutional value ---- */}
            {institutional.length > 0 && (
                <Section>
                    <Heading>Contexto institucional</Heading>
                    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {institutional.map((it, i) => (
                            <motion.div
                                key={`${it.title}-${i}`}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
                                className="rounded-3xl border border-white/[0.07] bg-coal p-6"
                            >
                                <h3 className="font-grotesk text-lg font-semibold text-white">{it.title}</h3>
                                <p className="mt-2 whitespace-pre-line font-grotesk text-sm leading-relaxed text-white/60">
                                    {it.text}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </Section>
            )}

            {/* ---- 14. Family commitment ---- */}
            {hasFamily && (
                <Section>
                    <Heading>Compromisso da família</Heading>
                    {p.family_letter && (
                        <motion.div
                            {...reveal}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="mt-10 rounded-3xl border border-white/[0.07] bg-coal p-8 md:p-12"
                        >
                            <p className="whitespace-pre-line font-editorial text-lg italic leading-relaxed text-white/85 sm:text-xl">
                                {p.family_letter}
                            </p>
                            {p.family_letter_signature && (
                                <p className="mt-8 font-editorial text-lg italic text-white">
                                    {p.family_letter_signature}
                                </p>
                            )}
                        </motion.div>
                    )}

                    {familyCommitments.length > 0 && (
                        <motion.ul
                            {...reveal}
                            transition={{ duration: 0.6, delay: 0.15 }}
                            className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
                        >
                            {familyCommitments.map((item, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-2.5 rounded-2xl border border-white/[0.07] bg-coal px-5 py-4"
                                >
                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
                                    <span className="font-grotesk text-sm leading-relaxed text-white/70">{item}</span>
                                </li>
                            ))}
                        </motion.ul>
                    )}
                </Section>
            )}

            {/* ---- 15. Timeline ---- */}
            {timeline.length > 0 && (
                <Section>
                    <Heading>A jornada até 2030</Heading>
                    <motion.div
                        {...reveal}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="mt-10"
                    >
                        {timeline.map((t, i) => (
                            <div key={`${t.year}-${i}`} className="relative flex gap-5 pb-8 last:pb-0">
                                {i < timeline.length - 1 && (
                                    <span className="absolute left-[7px] top-5 h-full w-px bg-white/10" />
                                )}
                                <span className="relative mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full bg-lime ring-4 ring-lime/15" />
                                <div className="min-w-0">
                                    <div className="font-grotesk text-lg font-semibold text-lime">{t.year}</div>
                                    <div className="mt-0.5 font-grotesk text-base leading-relaxed text-white/70">
                                        {t.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                    {p.timeline_note && (
                        <p className="mt-2 font-grotesk text-[13px] leading-relaxed text-white/40">{p.timeline_note}</p>
                    )}
                </Section>
            )}

            {/* ---- 16. Custom sections ---- */}
            {customSections.map((s, i) =>
                s?.title || s?.body ? (
                    <React.Fragment key={`custom-${i}`}>
                        <Section>
                            {s.title && <Heading>{s.title}</Heading>}
                            {s.body && (
                                <motion.p
                                    {...reveal}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                    className="mt-6 whitespace-pre-line font-grotesk text-base leading-relaxed text-white/70 sm:text-lg"
                                >
                                    {s.body}
                                </motion.p>
                            )}
                        </Section>
                    </React.Fragment>
                ) : null,
            )}

            {/* ---- 17. Closing + contact + PDF ---- */}
            <section className="relative overflow-hidden bg-night px-6 py-24 md:py-32">
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/[0.08] blur-[130px]" />
                <div className="relative mx-auto max-w-3xl text-center">
                    {p.partner_logo_url && (
                        <motion.img
                            {...reveal}
                            transition={{ duration: 0.5 }}
                            src={p.partner_logo_url}
                            alt={p.partner_name || 'Parceiro'}
                            className="mx-auto mb-8 h-12 w-auto max-w-[200px] object-contain"
                        />
                    )}

                    {closingImage && (
                        <motion.img
                            {...reveal}
                            transition={{ duration: 0.5, delay: 0.05 }}
                            src={closingImage}
                            alt={p.closing_title || 'Henrique Fujimoto'}
                            loading="lazy"
                            className="mx-auto mb-10 max-h-[420px] w-full rounded-3xl border border-white/[0.07] object-cover"
                        />
                    )}

                    <motion.h2
                        {...reveal}
                        transition={{ duration: 0.6 }}
                        className="font-grotesk text-[1.6rem] font-semibold leading-[1.15] tracking-tight text-white sm:text-[2rem] sm:leading-[1.08] md:text-[2.75rem]"
                    >
                        {p.closing_title || 'Vamos construir isso juntos'}
                    </motion.h2>

                    {p.closing_body && (
                        <motion.p
                            {...reveal}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="mx-auto mt-5 max-w-2xl whitespace-pre-line font-grotesk text-base leading-relaxed text-white/60 sm:text-lg"
                        >
                            {p.closing_body}
                        </motion.p>
                    )}

                    <motion.div
                        {...reveal}
                        transition={{ duration: 0.6, delay: 0.18 }}
                        className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap"
                    >
                        {p.contact_whatsapp && (
                            <a
                                href={p.contact_whatsapp}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2.5 rounded-full bg-lime px-6 py-3.5 font-grotesk text-sm font-semibold text-night transition-colors hover:bg-lime-dim"
                            >
                                <MessageCircle className="h-4.5 w-4.5" />
                                Conversar no WhatsApp
                            </a>
                        )}
                        {p.contact_email && (
                            <a
                                href={`mailto:${p.contact_email}`}
                                className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 font-grotesk text-sm font-semibold text-white transition-all hover:border-lime/40 hover:bg-white/10"
                            >
                                <Mail className="h-4.5 w-4.5" />
                                Enviar e-mail
                            </a>
                        )}
                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 font-grotesk text-sm font-semibold text-white transition-all hover:border-lime/40 hover:bg-white/10"
                        >
                            <Download className="h-4.5 w-4.5" />
                            Baixar proposta em PDF
                        </button>
                    </motion.div>

                    <p className="mt-8 font-grotesk text-sm text-white/45">
                        {p.contact_name ? `${p.contact_name} · ` : ''}
                        {ATHLETE}
                    </p>
                </div>
            </section>
        </div>
    );
}
