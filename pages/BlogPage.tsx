import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, Eye, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, Post } from '../lib/supabase';

const categoryLabels = {
    tournament: { label: 'Torneio', color: 'bg-amber-500/20 text-amber-400' },
    training: { label: 'Treino', color: 'bg-blue-500/20 text-blue-400' },
    tips: { label: 'Dicas', color: 'bg-emerald-500/20 text-emerald-400' },
    news: { label: 'Notícias', color: 'bg-purple-500/20 text-purple-400' },
};

// Mock data for development (will be replaced by Supabase data)
const mockPosts: Post[] = [
    {
        id: '1',
        title: 'Conquista no Campeonato Brasileiro de Judô 2024',
        slug: 'conquista-campeonato-brasileiro-2024',
        excerpt: 'Uma jornada incrível até a medalha de ouro no campeonato mais disputado do país.',
        content: '',
        cover_image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&h=400&fit=crop',
        category: 'tournament',
        published: true,
        created_at: '2024-12-15T10:00:00Z',
        updated_at: '2024-12-15T10:00:00Z',
    },
    {
        id: '2',
        title: '5 Técnicas Essenciais de Uchi-Mata para Iniciantes',
        slug: '5-tecnicas-uchi-mata-iniciantes',
        excerpt: 'Aprenda os fundamentos de uma das técnicas mais eficazes do judô passo a passo.',
        content: '',
        cover_image: 'https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=800&h=400&fit=crop',
        category: 'tips',
        published: true,
        created_at: '2024-12-10T14:30:00Z',
        updated_at: '2024-12-10T14:30:00Z',
    },
    {
        id: '3',
        title: 'Rotina de Treinamento: Como me Preparo para Competições',
        slug: 'rotina-treinamento-competicoes',
        excerpt: 'Um olhar dentro da minha preparação física e mental antes de grandes campeonatos.',
        content: '',
        cover_image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=400&fit=crop',
        category: 'training',
        published: true,
        created_at: '2024-12-05T09:00:00Z',
        updated_at: '2024-12-05T09:00:00Z',
    },
    {
        id: '4',
        title: 'Novo Patrocínio: Parceria com a Nike Brasil',
        slug: 'novo-patrocinio-nike-brasil',
        excerpt: 'Animado em anunciar essa nova parceria que vai impulsionar ainda mais minha carreira.',
        content: '',
        cover_image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=400&fit=crop',
        category: 'news',
        published: true,
        created_at: '2024-12-01T16:00:00Z',
        updated_at: '2024-12-01T16:00:00Z',
    },
];

function PostCard({ post, index }: { post: Post; index: number }) {
    const category = categoryLabels[post.category];
    const date = new Date(post.created_at).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    return (
        <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group relative overflow-hidden rounded-2xl bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 hover:border-primary/30 transition-all duration-300"
        >
            <Link to={`/blog/${post.slug}`} className="block">
                {/* Cover Image */}
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />

                    {/* Category Badge */}
                    <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${category.color}`}>
                        {category.label}
                    </span>
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                    </h3>
                    <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
                        {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>Ler mais</span>
                            <ChevronRight className="w-3 h-3" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.article>
    );
}

export default function BlogPage() {
    const [posts, setPosts] = useState<Post[]>(mockPosts);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch posts from Supabase (when configured)
    useEffect(() => {
        async function fetchPosts() {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('published', true)
                    .order('created_at', { ascending: false });

                if (data && data.length > 0) {
                    setPosts(data);
                }
                // If no data or error, keep using mock data
            } catch (err) {
                console.log('Using mock data');
            } finally {
                setLoading(false);
            }
        }

        fetchPosts();
    }, []);

    const filteredPosts = selectedCategory
        ? posts.filter((post) => post.category === selectedCategory)
        : posts;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-zinc-800/50">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Voltar</span>
                    </Link>

                    <h1 className="font-display text-xl font-bold text-white">
                        BLOG
                    </h1>

                    <div className="w-20" /> {/* Spacer for centering */}
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative py-16 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-display text-4xl md:text-5xl font-bold text-white mb-4"
                    >
                        Notícias & <span className="text-primary">Atualizações</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-zinc-400 text-lg max-w-2xl mx-auto"
                    >
                        Acompanhe minha jornada no judô, resultados de torneios, dicas de treino e muito mais.
                    </motion.p>
                </div>
            </section>

            {/* Category Filter */}
            <section className="px-4 pb-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap justify-center gap-2">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === null
                                    ? 'bg-primary text-black'
                                    : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50'
                                }`}
                        >
                            Todos
                        </button>
                        {Object.entries(categoryLabels).map(([key, { label }]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedCategory(key)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === key
                                        ? 'bg-primary text-black'
                                        : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Posts Grid */}
            <section className="px-4 pb-20">
                <div className="max-w-6xl mx-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredPosts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPosts.map((post, index) => (
                                <PostCard key={post.id} post={post} index={index} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-zinc-500">Nenhum post encontrado nesta categoria.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
