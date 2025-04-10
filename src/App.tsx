import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Layout } from '@/components/layout/Layout';

import ToolManagement from '@/pages/ToolManagement';
import AutoVideoManagement from '@/pages/AutoVideoManagement';
import QuestionnairesPage from '@/pages/QuestionnairesPage';

import DashboardCoach from '@/pages/DashboardCoach';
import Index from '@/pages/Index';
import NewIndex from '@/pages/NewIndex';
import Dashboard from '@/pages/Dashboard';
import PlayerProfile from '@/pages/PlayerProfile';
import Huze from '@/pages/Huze';
import Contract from '@/pages/Contract';
import MentalCommitment from '@/pages/MentalCommitment';
import Admin from '@/pages/Admin';
import MentalTools from '@/pages/MentalTools';
import ShortTermGoals from '@/pages/ShortTermGoals';
import DailyChallenge from '@/pages/DailyChallenge';
import PlayerForm from '@/pages/PlayerForm';
import SessionsList from '@/pages/SessionsList';
import PlayersList from '@/pages/PlayersList';
import NewSessionForm from '@/pages/NewSessionForm';
import EditSessionForm from '@/pages/EditSessionForm';
import GoalDetailsQuestions from '@/pages/GoalDetailsQuestions';
import ProfileCoach from '@/pages/ProfileCoach';
import CoachSignUp from '@/pages/CoachSignUp';
import Reports from '@/pages/Reports';
import Contact from '@/pages/Contact';
import Next from '@/pages/Next';
import PlayerEvaluation from '@/pages/PlayerEvaluation';
import AnalyticsDashboard from '@/pages/AnalyticsDashboard';
import PlayerStatistics from '@/pages/PlayerStatistics';
import GamePreparation from '@/pages/GamePreparation';
import NotificationsDashboard from '@/pages/NotificationsDashboard';
import AuthPage from '@/pages/auth/AuthPage';
import PlayerAuth from '@/pages/PlayerAuth';
import ActionPlan from '@/pages/ActionPlan';
import SessionSummaries from '@/pages/SessionSummaries';
import NewPlayerForm from '@/pages/NewPlayerForm';
import EditPlayerForm from '@/pages/EditPlayerForm';
import RegistrationLinks from '@/pages/RegistrationLinks';
import PublicRegistrationForm from '@/pages/PublicRegistrationForm';
import AllMeetingSummaries from '@/pages/AllMeetingSummaries';
import Goals from '@/pages/Goals';
import PlayerProfileView from '@/pages/player/PlayerProfileView';
import PlayerProfileAlternative from '@/pages/player/PlayerProfileAlternative';
import NotFound from '@/pages/NotFound';
import MentalLibrary from '@/pages/MentalLibrary';
import PlayerGameEvaluationForm from '@/pages/player/PlayerGameEvaluationForm';
import PlayerQuestionnaires from '@/pages/player/PlayerQuestionnaires';
import PlayerQuestionnaireForm from '@/pages/player/PlayerQuestionnaireForm';

import "./App.css";
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

function App() {
  return (
    <Router>
      <QueryClientProvider client={new QueryClient()}>
        <ThemeProvider attribute="class">
          <Toaster />
          <Routes>
            {/* Auth pages and registration pages that don't use the layout */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/player-auth" element={<PlayerAuth />} />
            <Route path="/signup-coach" element={<CoachSignUp />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            <Route path="/register/:linkId" element={<PublicRegistrationForm />} />
            
            {/* All other routes use the Layout component */}
            <Route element={<Layout />}>
              <Route path="/" element={<AuthGuard coachOnly={true}><DashboardCoach /></AuthGuard>} />
              <Route path="/index" element={<AuthGuard coachOnly={true}><Index /></AuthGuard>} />
              <Route path="/new" element={<AuthGuard coachOnly={true}><NewIndex /></AuthGuard>} />
              <Route path="/dashboard" element={<AuthGuard coachOnly={true}><Dashboard /></AuthGuard>} />
              <Route path="/dashboard/player-profile/:playerId" element={<AuthGuard coachOnly={true}><PlayerProfile /></AuthGuard>} />
              <Route path="/huze" element={<AuthGuard coachOnly={true}><Huze /></AuthGuard>} />
              <Route path="/contract" element={<AuthGuard coachOnly={true}><Contract /></AuthGuard>} />
              <Route path="/mental-commitment" element={<AuthGuard coachOnly={true}><MentalCommitment /></AuthGuard>} />
              <Route path="/admin" element={<AuthGuard coachOnly={true}><Admin /></AuthGuard>} />
              <Route path="/mental-tools" element={<AuthGuard coachOnly={true}><MentalTools /></AuthGuard>} />
              <Route path="/short-term-goals" element={<AuthGuard coachOnly={true}><ShortTermGoals /></AuthGuard>} />
              <Route path="/daily-challenge" element={<AuthGuard coachOnly={true}><DailyChallenge /></AuthGuard>} />
              <Route path="/player-form" element={<AuthGuard coachOnly={true}><PlayerForm /></AuthGuard>} />
              <Route path="/sessions-list" element={<AuthGuard coachOnly={true}><SessionsList /></AuthGuard>} />
              <Route path="/players-list" element={<AuthGuard coachOnly={true}><PlayersList /></AuthGuard>} />
              <Route path="/new-session" element={<AuthGuard coachOnly={true}><NewSessionForm /></AuthGuard>} />
              <Route path="/edit-session" element={<AuthGuard coachOnly={true}><EditSessionForm /></AuthGuard>} />
              <Route path="/player-profile/:playerId" element={<AuthGuard coachOnly={true}><PlayerProfile /></AuthGuard>} />
              <Route path="/dashboard-coach" element={<AuthGuard coachOnly={true}><DashboardCoach /></AuthGuard>} />
              <Route path="/goal-details-questions" element={<AuthGuard coachOnly={true}><GoalDetailsQuestions /></AuthGuard>} />
              <Route path="/profile-coach" element={<AuthGuard coachOnly={true}><ProfileCoach /></AuthGuard>} />
              <Route path="/reports" element={<AuthGuard coachOnly={true}><Reports /></AuthGuard>} />
              <Route path="/contact" element={<AuthGuard coachOnly={true}><Contact /></AuthGuard>} />
              <Route path="/next" element={<AuthGuard coachOnly={true}><Next /></AuthGuard>} />
              <Route path="/player-evaluation" element={<AuthGuard coachOnly={true}><PlayerEvaluation /></AuthGuard>} />
              <Route path="/analytics" element={<AuthGuard coachOnly={true}><AnalyticsDashboard /></AuthGuard>} />
              <Route path="/player-statistics" element={<AuthGuard coachOnly={true}><PlayerStatistics /></AuthGuard>} />
              <Route path="/game-prep" element={<AuthGuard coachOnly={true}><GamePreparation /></AuthGuard>} />
              <Route path="/notifications" element={<AuthGuard coachOnly={true}><NotificationsDashboard /></AuthGuard>} />
              <Route path="/action-plan" element={<AuthGuard coachOnly={true}><ActionPlan /></AuthGuard>} />
              <Route path="/session-summaries" element={<AuthGuard coachOnly={true}><SessionSummaries /></AuthGuard>} />
              <Route path="/new-player" element={<AuthGuard coachOnly={true}><NewPlayerForm /></AuthGuard>} />
              <Route path="/edit-player" element={<AuthGuard coachOnly={true}><EditPlayerForm /></AuthGuard>} />
              <Route path="/edit-player/:playerId" element={<AuthGuard coachOnly={true}><EditPlayerForm /></AuthGuard>} />
              <Route path="/registration-links" element={<AuthGuard coachOnly={true}><RegistrationLinks /></AuthGuard>} />
              <Route path="/tool-management" element={<AuthGuard coachOnly={true}><ToolManagement /></AuthGuard>} />
              <Route path="/auto-video-management" element={<AuthGuard coachOnly={true}><AutoVideoManagement /></AuthGuard>} />
              <Route path="/all-meeting-summaries" element={<AuthGuard coachOnly={true}><AllMeetingSummaries /></AuthGuard>} />
              <Route path="/goals" element={<AuthGuard coachOnly={true}><Goals /></AuthGuard>} />
              <Route path="/mental-library" element={<AuthGuard coachOnly={true}><MentalLibrary /></AuthGuard>} />
              <Route path="/game-evaluation/:playerId" element={<AuthGuard coachOnly={true}><PlayerGameEvaluationForm /></AuthGuard>} />
              <Route path="/questionnaires" element={<AuthGuard coachOnly={true}><QuestionnairesPage /></AuthGuard>} />

              {/* Player-specific routes */}
              <Route path="/player/profile" element={<AuthGuard playerOnly={true}><PlayerProfileView /></AuthGuard>} />
              <Route path="/player/profile-alt" element={<AuthGuard playerOnly={true}><PlayerProfileAlternative /></AuthGuard>} />
              <Route path="/player/game-evaluation/:playerId" element={<AuthGuard playerOnly={true}><PlayerGameEvaluationForm /></AuthGuard>} />
              <Route path="/player/questionnaires" element={<AuthGuard playerOnly={true}><PlayerQuestionnaires /></AuthGuard>} />
              <Route path="/player/questionnaire/:id" element={<AuthGuard playerOnly={true}><PlayerQuestionnaireForm /></AuthGuard>} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </ThemeProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
