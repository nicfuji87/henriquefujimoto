import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NumerosPage from './pages/NumerosPage';
import ApoiarPage from './pages/ApoiarPage';
import ConteudoPage from './pages/ConteudoPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import AdminPage from './pages/AdminPage';
import ProductPage from './pages/ProductPage';
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

// Gym Module
import GymLayout from './components/gym/GymLayout';
import GymLogin from './pages/gym/GymLogin';
import GymOnboarding from './pages/gym/GymOnboarding';
import GymRegister from './pages/gym/GymRegister';
import GymSchedule from './pages/gym/GymSchedule';
import GymCompetitions from './pages/gym/GymCompetitions';
import GymHome from './pages/gym/GymHome';
import GymCheckin from './pages/gym/GymCheckin';
import GymWorkout from './pages/gym/GymWorkout';
import GymWorkoutDone from './pages/gym/GymWorkoutDone';
import GymProfile from './pages/gym/GymProfile';
import GymHistory from './pages/gym/GymHistory';
import GymAnalytics from './pages/gym/GymAnalytics';
import GymCalendar from './pages/gym/GymCalendar';
import GymPhase from './pages/gym/GymPhase';
import GymGrip from './pages/gym/GymGrip';

// Nutri Module
import NutriLayout from './components/nutri/NutriLayout';
import NutriLogin from './pages/nutri/NutriLogin';
import NutriDashboard from './pages/nutri/NutriDashboard';
import NutriMeals from './pages/nutri/NutriMeals';
import NutriAnalytics from './pages/nutri/NutriAnalytics';

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
      <Route path="/produto/:slug" element={<ProductPage />} />

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

      {/* Psico Routes */}
      <Route path="/app/psico/login" element={<PsicoLogin />} />
      <Route path="/app/psico" element={<PsicoDashboard />} />

      {/* Gym Module Routes */}
      <Route element={<GymLayout />}>
        <Route path="/gym/login" element={<GymLogin />} />
        <Route path="/gym/onboarding" element={<GymOnboarding />} />
        <Route path="/gym/register" element={<GymRegister />} />
        <Route path="/gym/schedule" element={<GymSchedule />} />
        <Route path="/gym/competitions" element={<GymCompetitions />} />
        <Route path="/gym" element={<GymHome />} />
        <Route path="/gym/checkin" element={<GymCheckin />} />
        <Route path="/gym/workout" element={<GymWorkout />} />
        <Route path="/gym/workout-done" element={<GymWorkoutDone />} />
        <Route path="/gym/profile" element={<GymProfile />} />
        <Route path="/gym/history" element={<GymHistory />} />
        <Route path="/gym/analytics" element={<GymAnalytics />} />
        <Route path="/gym/calendar" element={<GymCalendar />} />
        <Route path="/gym/phase" element={<GymPhase />} />
        <Route path="/gym/grip" element={<GymGrip />} />
      </Route>

      {/* Nutri Module Routes */}
      <Route element={<NutriLayout />}>
        <Route path="/nutri/login" element={<NutriLogin />} />
        <Route path="/nutri" element={<NutriDashboard />} />
        <Route path="/nutri/meals" element={<NutriMeals />} />
        <Route path="/nutri/analytics" element={<NutriAnalytics />} />
      </Route>
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