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

// Diário do Atleta App
import AppLayout from './components/app/AppLayout';
import AppLogin from './pages/app/AppLogin';
import AppHome from './pages/app/AppHome';
import AppNewTraining from './pages/app/AppNewTraining';
import AppTrainingReflection from './pages/app/AppTrainingReflection';
import AppPhysicalEvaluation from './pages/app/AppPhysicalEvaluation';
import AppMentalFocus from './pages/app/AppMentalFocus';
import AppEmotionalCheckin from './pages/app/AppEmotionalCheckin';
import AppDailyEvolution from './pages/app/AppDailyEvolution';
import AppHistory from './pages/app/AppHistory';
import AppCompetitionDetails from './pages/app/AppCompetitionDetails';
import AppCompetitionReflection from './pages/app/AppCompetitionReflection';
import AppTrainingDetails from './pages/app/AppTrainingDetails';
import PsicoLogin from './pages/app/PsicoLogin';
import PsicoDashboard from './pages/app/PsicoDashboard';

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

      {/* Diário do Atleta App Routes */}
      <Route element={<AppLayout />}>
        <Route path="/app/login" element={<AppLogin />} />
        <Route path="/app" element={<AppHome />} />
        <Route path="/app/new-training" element={<AppNewTraining />} />
        <Route path="/app/training-reflection" element={<AppTrainingReflection />} />
        <Route path="/app/physical-evaluation" element={<AppPhysicalEvaluation />} />
        <Route path="/app/mental-focus" element={<AppMentalFocus />} />
        <Route path="/app/emotional-checkin" element={<AppEmotionalCheckin />} />
        <Route path="/app/daily-evolution" element={<AppDailyEvolution />} />
        <Route path="/app/history" element={<AppHistory />} />
        <Route path="/app/competition-details" element={<AppCompetitionDetails />} />
        <Route path="/app/competition-reflection" element={<AppCompetitionReflection />} />
        <Route path="/app/training/:id" element={<AppTrainingDetails />} />
      </Route>

      {/* Psico Routes (outside AppLayout - no wizard context needed) */}
      <Route path="/app/psico/login" element={<PsicoLogin />} />
      <Route path="/app/psico" element={<PsicoDashboard />} />
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