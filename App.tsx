import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NumerosPage from './pages/NumerosPage';
import ApoiarPage from './pages/ApoiarPage';
import ConteudoPage from './pages/ConteudoPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import AdminPage from './pages/AdminPage';
import { useTracking } from './hooks/useTracking';

function AppRoutes() {
  // Centralized tracking hook inside Router context
  useTracking();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/numeros" element={<NumerosPage />} />
      <Route path="/apoiar" element={<ApoiarPage />} />
      <Route path="/conteudo" element={<ConteudoPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}