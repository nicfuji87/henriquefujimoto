import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User, Tag, Share2, ExternalLink, Package, Handshake, Coffee } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    meta_title: string | null;
    meta_description: string | null;
    keywords: string[];
    og_image: string | null;
    category: string;
    status: string;
    reading_time: number;
    author: string;
    cta_type: 'none' | 'affiliate' | 'sponsor' | 'support';
    cta_label: string | null;
    cta_link: string | null;
    created_at: string;
    published_at: string | null;
}

// Simple Markdown renderer (no external deps needed)
function renderMarkdown(md: string): string {
    let html = md
        // Headers
        .replace(/^### (.+)$/gm, '<h3 class="font-grotesk text-xl font-semibold text-white mt-8 mb-3">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 class="font-grotesk text-2xl font-semibold text-white mt-10 mb-4">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 class="font-grotesk text-3xl font-semibold text-white mt-10 mb-4">$1</h1>')
        // Bold & Italic
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em class="text-white/80">$1</em>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-lime hover:text-lime-dim underline" target="_blank" rel="noopener noreferrer">$1</a>')
        // Images
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-2xl my-6 w-full border border-white/[0.07]" loading="lazy" />')
        // Unordered lists
        .replace(/^- (.+)$/gm, '<li class="ml-4 text-white/70 leading-relaxed">$1</li>')
        // Ordered lists
        .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-white/70 leading-relaxed list-decimal">$1</li>')
        // Blockquotes
        .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-lime/60 pl-4 py-2 my-4 font-editorial italic text-white/80">$1</blockquote>')
        // Horizontal rules
        .replace(/^---$/gm, '<hr class="border-white/10 my-8" />')
        // Line breaks -> paragraphs
        .replace(/\n{3,}/g, '\n\n') // Collapse multiple empty lines
        .replace(/\n\n/g, '</p><p class="text-white/70 leading-relaxed mb-4">');
    // Removed the single \n -> <br /> replacement to avoid extra spacing and behave like standard markdown

    // Wrap in paragraph
    html = '<p class="text-white/70 leading-relaxed mb-4">' + html + '</p>';

    // Wrap consecutive <li> in <ul>
    html = html.replace(/(<li[^>]*>.*?<\/li>\s*)+/g, (match) => {
        if (match.includes('list-decimal')) {
            return '<ol class="list-decimal space-y-2 my-4 pl-4">' + match + '</ol>';
        }
        return '<ul class="list-disc space-y-2 my-4 pl-4">' + match + '</ul>';
    });

    return html;
}

const CATEGORY_STYLES: Record<string, { label: string; color: string }> = {
    'judô': { label: '🥋 Judô', color: 'bg-lime/10 text-lime' },
    'treino': { label: '💪 Treino', color: 'bg-lime/10 text-lime' },
    'competição': { label: '🏆 Competição', color: 'bg-lime/10 text-lime' },
    'nutrição': { label: '🥗 Nutrição', color: 'bg-lime/10 text-lime' },
    'vida-de-atleta': { label: '🌟 Vida de atleta', color: 'bg-lime/10 text-lime' },
    'notícias': { label: '📰 Notícias', color: 'bg-lime/10 text-lime' },
    'geral': { label: '📝 Geral', color: 'bg-lime/10 text-lime' },
};

export default function BlogPostPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) fetchPost(slug);
    }, [slug]);

    async function fetchPost(slug: string) {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('slug', slug)
                .eq('status', 'published')
                .single();

            if (error || !data) {
                navigate('/blog');
                return;
            }

            setPost(data);

            // Set SEO meta tags
            document.title = data.meta_title || data.title + ' — Henrique Fujimoto';
            setMetaTag('description', data.meta_description || data.excerpt || '');
            setMetaTag('keywords', (data.keywords || []).join(', '));
            setOGTag('og:title', data.meta_title || data.title);
            setOGTag('og:description', data.meta_description || data.excerpt || '');
            setOGTag('og:type', 'article');
            setOGTag('og:url', `https://henriquefujimoto.com.br/blog/${data.slug}`);
            if (data.og_image) setOGTag('og:image', data.og_image);
            setOGTag('article:published_time', data.published_at || data.created_at);
            setOGTag('article:author', data.author);

            // Add JSON-LD structured data
            addJsonLd(data);

            // Fetch related posts
            const { data: related } = await supabase
                .from('blog_posts')
                .select('id, title, slug, excerpt, og_image, category, reading_time, published_at, created_at')
                .eq('status', 'published')
                .neq('id', data.id)
                .eq('category', data.category)
                .order('published_at', { ascending: false })
                .limit(3);

            if (related) setRelatedPosts(related as any);
        } catch (err) {
            console.error('Error fetching post:', err);
            navigate('/blog');
        } finally {
            setLoading(false);
        }
    }

    function setMetaTag(name: string, content: string) {
        let el = document.querySelector(`meta[name="${name}"]`);
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute('name', name);
            document.head.appendChild(el);
        }
        el.setAttribute('content', content);
    }

    function setOGTag(property: string, content: string) {
        let el = document.querySelector(`meta[property="${property}"]`);
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute('property', property);
            document.head.appendChild(el);
        }
        el.setAttribute('content', content);
    }

    function addJsonLd(post: BlogPost) {
        // Remove existing
        const existing = document.querySelector('#blog-jsonld');
        if (existing) existing.remove();

        const script = document.createElement('script');
        script.id = 'blog-jsonld';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "description": post.meta_description || post.excerpt,
            "image": post.og_image || '',
            "author": {
                "@type": "Person",
                "name": post.author,
                "url": "https://henriquefujimoto.com.br"
            },
            "publisher": {
                "@type": "Person",
                "name": "Henrique Fujimoto",
                "url": "https://henriquefujimoto.com.br"
            },
            "datePublished": post.published_at || post.created_at,
            "dateModified": post.published_at || post.created_at,
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `https://henriquefujimoto.com.br/blog/${post.slug}`
            },
            "keywords": (post.keywords || []).join(', '),
            "wordCount": post.content.split(/\s+/).length,
            "articleSection": post.category,
        });
        document.head.appendChild(script);
    }

    function handleShare() {
        if (navigator.share) {
            navigator.share({
                title: post?.title,
                text: post?.excerpt || '',
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copiado!');
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-night flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime"></div>
            </div>
        );
    }

    if (!post) return null;

    const catStyle = CATEGORY_STYLES[post.category.toLowerCase()] || CATEGORY_STYLES['geral'];
    const date = new Date(post.published_at || post.created_at).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="min-h-screen bg-night font-grotesk">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-night/80 border-b border-white/[0.07]">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link
                        to="/blog"
                        className="flex items-center gap-2 text-white/60 hover:text-lime transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        <span className="text-sm font-medium">Blog</span>
                    </Link>

                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10 transition-colors text-sm font-medium"
                    >
                        <Share2 className="w-4 h-4" />
                        Compartilhar
                    </button>
                </div>
            </header>

            {/* Hero / Cover */}
            {post.og_image && (
                <div className="max-w-4xl mx-auto px-4 mt-6">
                    <div className="relative w-full aspect-video overflow-hidden rounded-3xl border border-white/[0.07] bg-coal-2">
                        <img
                            src={post.og_image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            )}

            {/* Article */}
            <article className="max-w-3xl mx-auto px-4 py-10">
                {/* Meta info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 mb-8"
                >
                    <span className={`inline-block px-3 py-1 rounded-full font-grotesk text-[11px] font-semibold uppercase tracking-[0.08em] ${catStyle.color}`}>
                        {catStyle.label}
                    </span>

                    <h1 className="font-grotesk text-[1.9rem] md:text-4xl lg:text-5xl font-semibold text-white leading-[1.15] md:leading-[1.08] tracking-tight">
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p className="text-lg text-white/60 leading-relaxed">
                            {post.excerpt}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-white/45 pt-2 border-t border-white/[0.07]">
                        <div className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>{post.reading_time} min de leitura</span>
                        </div>
                    </div>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="prose prose-invert max-w-none font-grotesk"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
                />

                {/* Keywords */}
                {post.keywords && post.keywords.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-10 pt-6 border-t border-white/[0.07]"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Tag className="w-4 h-4 text-white/45" />
                            <span className="text-xs text-white/45 uppercase tracking-[0.1em] font-semibold">Tags</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {post.keywords.map(kw => (
                                <span key={kw} className="px-3 py-1 border border-white/[0.07] bg-white/5 text-white/60 rounded-full text-xs">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Monetization CTA */}
                {post.cta_type !== 'none' && post.cta_link && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.45 }}
                        className="mt-12 rounded-3xl border border-white/[0.07] bg-coal overflow-hidden"
                    >
                        <div className="p-6 flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-2xl bg-lime/10 flex items-center justify-center mb-4">
                                {post.cta_type === 'affiliate' && <Package className="w-7 h-7 text-lime" />}
                                {post.cta_type === 'sponsor' && <Handshake className="w-7 h-7 text-lime" />}
                                {post.cta_type === 'support' && <Coffee className="w-7 h-7 text-lime" />}
                            </div>

                            <h3 className="font-grotesk text-xl font-semibold text-white mb-2 tracking-tight">
                                {post.cta_type === 'affiliate' && 'Recomendação do Henrique'}
                                {post.cta_type === 'sponsor' && 'Parceiro oficial'}
                                {post.cta_type === 'support' && 'Apoie a jornada'}
                            </h3>

                            <p className="text-white/70 text-sm max-w-sm mb-6">
                                {post.cta_type === 'affiliate' && 'Equipamentos e produtos que eu uso e confio para alcançar o alto rendimento.'}
                                {post.cta_type === 'sponsor' && 'Esta marca acredita no judô brasileiro e apoia minha evolução como atleta.'}
                                {post.cta_type === 'support' && 'Sua contribuição ajuda a custear inscrições, viagens e equipamentos para as próximas competições.'}
                            </p>

                            <a
                                href={post.cta_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3.5 text-sm font-semibold text-night hover:bg-lime-dim transition-colors"
                            >
                                {post.cta_label || 'Ver mais'}
                                <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </a>
                        </div>
                    </motion.div>
                )}

                {/* Share CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-10 p-6 rounded-3xl border border-white/[0.07] bg-coal text-center"
                >
                    <p className="text-white font-semibold mb-2">Gostou desse conteúdo?</p>
                    <p className="text-white/70 text-sm mb-4">Compartilhe com seus amigos e ajude a divulgar o judô brasileiro!</p>
                    <button
                        onClick={handleShare}
                        className="inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3.5 text-sm font-semibold text-night hover:bg-lime-dim transition-colors"
                    >
                        <Share2 className="w-4 h-4" />
                        Compartilhar
                    </button>
                </motion.div>
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="max-w-4xl mx-auto px-4 pb-20">
                    <h3 className="font-grotesk text-xl font-semibold text-white mb-6 tracking-tight">Posts relacionados</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {relatedPosts.map((rp) => (
                            <Link
                                key={rp.id}
                                to={`/blog/${rp.slug}`}
                                className="group rounded-3xl border border-white/[0.07] bg-coal overflow-hidden hover:border-lime/25 transition-colors"
                            >
                                {rp.og_image && (
                                    <div className="h-32 overflow-hidden bg-coal-2">
                                        <img src={rp.og_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                    </div>
                                )}
                                <div className="p-4">
                                    <h4 className="font-grotesk text-sm font-semibold text-white group-hover:text-lime transition-colors line-clamp-2">{rp.title}</h4>
                                    <p className="text-xs text-white/45 mt-2">{rp.reading_time} min leitura</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
