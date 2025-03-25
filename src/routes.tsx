
import { lazy } from 'react';
import { Route, Routes, Outlet, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { LandingPagePreview } from '@/components/landing-page/LandingPagePreview';

// Lazy-loaded pages
const Index = lazy(() => import('@/pages/Index').then(module => ({ default: module.default })));
const PlayerForm = lazy(() => import('@/pages/PlayerForm').then(module => ({ default: module.default })));
const NewIndex = lazy(() => import('@/pages/NewIndex').then(module => ({ default: module.default })));
const Next = lazy(() => import('@/pages/Next').then(module => ({ default: module.default })));
const PlayersList = lazy(() => import('@/pages/PlayersList').then(module => ({ default: module.default })));
const PlayerProfile = lazy(() => import('@/pages/PlayerProfile').then(module => ({ default: module.default })));
const PlayerStatistics = lazy(() => import('@/pages/PlayerStatistics').then(module => ({ default: module.default })));
const NotFound = lazy(() => import('@/pages/NotFound').then(module => ({ default: module.default })));
const AuthPage = lazy(() => import('@/pages/auth/AuthPage').then(module => ({ default: module.default })));
const DashboardCoach = lazy(() => import('@/pages/DashboardCoach').then(module => ({ default: module.default })));
const ProfileCoach = lazy(() => import('@/pages/ProfileCoach').then(module => ({ default: module.default })));
const Dashboard = lazy(() => import('@/pages/Dashboard').then(module => ({ default: module.default })));
const PublicRegistrationForm = lazy(() => import('@/pages/PublicRegistrationForm').then(module => ({ default: module.default })));
const PlayerEvaluation = lazy(() => import('@/pages/PlayerEvaluation').then(module => ({ default: module.default })));
const MentalLibrary = lazy(() => import('@/pages/MentalLibrary').then(module => ({ default: module.default })));
const LandingPages = lazy(() => import('@/pages/LandingPages').then(module => ({ default: module.default })));
const CoachLandingTemplate = lazy(() => import('@/pages/CoachLandingTemplate').then(module => ({ default: module.default })));
const Contract = lazy(() => import('@/pages/Contract').then(module => ({ default: module.default })));
const Goals = lazy(() => import('@/pages/Goals').then(module => ({ default: module.default })));
const QuestionnairesPage = lazy(() => import('@/pages/QuestionnairesPage').then(module => ({ default: module.default })));
const PlayerQuestionnaires = lazy(() => import('@/pages/player/PlayerQuestionnaires').then(module => ({ default: module.default })));
const PlayerQuestionnaireForm = lazy(() => import('@/pages/player/PlayerQuestionnaireForm').then(module => ({ default: module.default })));
const NewSessionForm = lazy(() => import('@/pages/NewSessionForm').then(module => ({ default: module.default })));
const PlayerProfileView = lazy(() => import('@/pages/player/PlayerProfileView').then(module => ({ default: module.default })));
const PlayerGameEvaluation = lazy(() => import('@/pages/player/PlayerGameEvaluation').then(module => ({ default: module.default })));
const SessionSummaries = lazy(() => import('@/pages/SessionSummaries').then(module => ({ default: module.default })));
const EditSessionForm = lazy(() => import('@/pages/EditSessionForm').then(module => ({ default: module.default })));
const AllMeetingSummaries = lazy(() => import('@/pages/AllMeetingSummaries').then(module => ({ default: module.default })));

export function AppRoutes() {
  return (
    <Routes>
      {/* Main layout with nested routes */}
      <Route element={<Layout />}>
        <Route path="/" element={<Index />} />
        <Route path="/new" element={<NewIndex />} />
        <Route path="/next" element={<Next />} />
        <Route path="/players" element={<PlayersList />} />
        <Route path="/player/:id" element={<PlayerProfile />} />
        <Route path="/player-statistics/:id" element={<PlayerStatistics />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard-coach" element={<DashboardCoach />} />
        <Route path="/profile-coach" element={<ProfileCoach />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/player-evaluation" element={<PlayerEvaluation />} />
        <Route path="/mental-library" element={<MentalLibrary />} />
        <Route path="/landing-pages" element={<LandingPages />} />
        <Route path="/coach-landing-template" element={<CoachLandingTemplate />} />
        <Route path="/contract" element={<Contract />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/player-form" element={<PlayerForm />} />
        <Route path="/questionnaires" element={<QuestionnairesPage />} />
        <Route path="/player/questionnaires" element={<PlayerQuestionnaires />} />
        <Route path="/player/questionnaire/:id" element={<PlayerQuestionnaireForm />} />
        <Route path="/new-session" element={<NewSessionForm />} />
        <Route path="/player/profile" element={<PlayerProfileView />} />
        <Route path="/player/game-evaluation/:id" element={<PlayerGameEvaluation />} />
        <Route path="/sessions-list" element={<SessionSummaries />} />
        <Route path="/edit-session" element={<EditSessionForm />} />
        <Route path="/all-meeting-summaries" element={<AllMeetingSummaries />} />
      </Route>
      
      {/* Register redirect route */}
      <Route path="/register" element={<Navigate to="/auth" replace />} />
      
      {/* Public registration form */}
      <Route path="/register/:linkId" element={<PublicRegistrationForm />} />
      
      {/* Landing page routes - these routes don't use the Layout component */}
      <Route path="/landing/preview/:id" element={<LandingPagePreview />} />
      <Route path="/landing/:id" element={<LandingPagePreview />} />
      
      {/* Fallback for 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
