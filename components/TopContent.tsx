import React, { useEffect, useState } from 'react';
import { Eye, Play, Heart, MessageCircle } from 'lucide-react';
import { getTopContent, TopContentItem } from '../lib/content';

const ContentCard: React.FC<TopContentItem> = ({
    media_type,
    media_url,
    thumbnail_url,
    caption,
    like_count,
    comments_count,
    permalink
}) => {
    // Determine display type
    const typeLabel = media_type === 'VIDEO' ? 'Reels' : (media_type === 'CAROUSEL_ALBUM' ? 'Post' : 'Foto');

    // Format numbers
    const formatNum = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n;

    // Truncate caption for title
    const title = caption ? caption.split('\n')[0].substring(0, 50) + (caption.length > 50 ? '...' : '') : 'Sem legenda';

    // Use thumbnail_url if available (video), else media_url
    const bgImage = thumbnail_url || media_url;

    return (
        <a
            href={permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="snap-center shrink-0 w-[240px] h-[380px] relative rounded-2xl overflow-hidden group border border-white/[0.07] bg-coal block transition-all hover:border-lime/25"
        >
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                style={{ backgroundImage: `url('${bgImage}')` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/95"></div>

            {/* Top Right Stats */}
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md border border-white/15 px-2 py-1 rounded-full flex items-center gap-3">
                <div className="flex items-center gap-1">
                    <Heart size={12} className="text-white fill-white" />
                    <span className="font-grotesk text-xs font-semibold text-white">{formatNum(like_count)}</span>
                </div>
                {comments_count > 0 && (
                    <div className="flex items-center gap-1">
                        <MessageCircle size={12} className="text-white fill-white" />
                        <span className="font-grotesk text-xs font-semibold text-white">{formatNum(comments_count)}</span>
                    </div>
                )}
            </div>

            <div className="absolute bottom-4 left-4 right-4">
                <p className="mb-2 font-grotesk font-semibold leading-tight line-clamp-2 text-sm text-white drop-shadow-md">{title}</p>
                <p className="flex items-center gap-1 font-grotesk text-[10px] font-semibold uppercase tracking-wide text-lime">
                    {media_type === 'VIDEO' && <Play size={10} fill="currentColor" />}
                    {typeLabel}
                </p>
            </div>

            {/* Hover Icon */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[1px]">
                <div className="w-12 h-12 rounded-full bg-lime text-night flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                    <Play size={20} className="fill-night ml-1" />
                </div>
            </div>
        </a>
    );
};

const TopContent: React.FC = () => {
    const [content, setContent] = useState<TopContentItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getTopContent();
                setContent(data);
            } catch (e) {
                console.error("Failed to load top content", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <section className="py-8 pl-6 h-[400px] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-lime border-t-transparent rounded-full animate-spin"></div>
            </section>
        );
    }

    if (content.length === 0) return null;

    return (
        <section className="py-8 pl-6">
            <div className="mb-5 pr-6 flex items-center justify-between">
                <h3 className="font-grotesk text-xl font-semibold tracking-tight text-white">Conteúdo em alta</h3>
                <a
                    href="https://instagram.com/henriquefujimoto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-grotesk text-xs font-semibold text-lime cursor-pointer hover:text-lime-dim tracking-wide"
                >
                    Ver no Instagram
                </a>
            </div>

            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pr-6 pb-4 no-scrollbar">
                {content.map((item) => (
                    <ContentCard key={item.id} {...item} />
                ))}
            </div>
        </section>
    );
};

export default TopContent;
