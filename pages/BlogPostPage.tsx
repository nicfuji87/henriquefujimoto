import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User, Tag, Share2 } from 'lucide-react';
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
    created_at: string;
    published_at: string | null;
}

// Simple Markdown renderer (no external deps needed)
function renderMarkdown(md: string): string {
    let html = md
        // Headers
        .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold text-white mt-8 mb-3">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-white mt-10 mb-4">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-white mt-10 mb-4">$1</h1>')
        // Bold & Italic
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em class="text-zinc-300">$1</em>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
        // Images
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-xl my-6 w-full" loading="lazy" />')
        // Unordered lists
        .replace(/^- (.+)$/gm, '<li class="ml-4 text-zinc-300 leading-relaxed">$1</li>')
        // Ordered lists
        .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-zinc-300 leading-relaxed list-decimal">$1</li>')
        // Blockquotes
        .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary pl-4 py-2 my-4 text-zinc-300 italic bg-zinc-800/30 rounded-r-lg">$1</blockquote>')
        // Horizontal rules
        .replace(/^---$/gm, '<hr class="border-zinc-700 my-8" />')
        // Line breaks -> paragraphs
        .replace(/\n\n/g, '</p><p class="text-zinc-300 leading-relaxed mb-4">')
        .replace(/\n/g, '<br />');

    // Wrap in paragraph
    html = '<p class="text-zinc-300 leading-relaxed mb-4">' + html + '</p>';

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
    'judô': { label: '🥋 Judô', color: 'bg-amber-500/20 text-amber-400' },
    'treino': { label: '💪 Treino', color: 'bg-blue-500/20 text-blue-400' },
    'competição': { label: '🏆 Competição', color: 'bg-yellow-500/20 text-yellow-400' },
    'nutrição': { label: '🥗 Nutrição', color: 'bg-green-500/20 text-green-400' },
    'vida-de-atleta': { label: '🌟 Vida de Atleta', color: 'bg-purple-500/20 text-purple-400' },
    'notícias': { label: '📰 Notícias', color: 'bg-indigo-500/20 text-indigo-400' },
    'geral': { label: '📝 Geral', color: 'bg-zinc-500/20 text-zinc-400' },
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
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!post) return null;

    const catStyle = CATEGORY_STYLES[post.category] || CATEGORY_STYLES['geral'];
    const date = new Date(post.published_at || post.created_at).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-zinc-800/50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link
                        to="/blog"
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Blog</span>
                    </Link>

                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-3 py-1.5 text-zinc-400 hover:text-white border border-zinc-700 rounded-lg hover:border-zinc-600 transition-colors text-sm"
                    >
                        <Share2 className="w-4 h-4" />
                        Compartilhar
                    </button>
                </div>
            </header>

            {/* Hero / Cover */}
            {post.og_image && (
                <div className="relative h-64 md:h-96 overflow-hidden">
                    <img
                        src={post.og_image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
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
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${catStyle.color}`}>
                        {catStyle.label}
                    </span>

                    <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p className="text-lg text-zinc-400 leading-relaxed">
                            {post.excerpt}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 pt-2 border-t border-zinc-800">
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
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
                />

                {/* Keywords */}
                {post.keywords && post.keywords.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-10 pt-6 border-t border-zinc-800"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Tag className="w-4 h-4 text-zinc-500" />
                            <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Tags</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {post.keywords.map(kw => (
                                <span key={kw} className="px-3 py-1 bg-zinc-800/50 text-zinc-400 rounded-full text-xs">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Share CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-10 p-6 bg-gradient-to-r from-primary/10 to-violet-600/10 border border-primary/20 rounded-2xl text-center"
                >
                    <p className="text-white font-semibold mb-2">Gostou desse conteúdo?</p>
                    <p className="text-zinc-400 text-sm mb-4">Compartilhe com seus amigos e ajude a divulgar o judô brasileiro!</p>
                    <button
                        onClick={handleShare}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-black rounded-xl font-medium hover:bg-primary/90 transition-colors"
                    >
                        <Share2 className="w-4 h-4" />
                        Compartilhar
                    </button>
                </motion.div>
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="max-w-4xl mx-auto px-4 pb-20">
                    <h3 className="text-xl font-bold text-white mb-6">Posts Relacionados</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {relatedPosts.map((rp) => (
                            <Link
                                key={rp.id}
                                to={`/blog/${rp.slug}`}
                                className="group bg-zinc-900/60 border border-zinc-800/50 rounded-xl overflow-hidden hover:border-primary/30 transition-all"
                            >
                                {rp.og_image && (
                                    <div className="h-32 overflow-hidden">
                                        <img src={rp.og_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                    </div>
                                )}
                                <div className="p-4">
                                    <h4 className="text-sm font-semibold text-white group-hover:text-primary transition-colors line-clamp-2">{rp.title}</h4>
                                    <p className="text-xs text-zinc-500 mt-2">{rp.reading_time} min leitura</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
