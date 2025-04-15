
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/lib/supabase';
import { SessionExpirationCheck } from '@/components/auth/SessionExpirationCheck';
import { useToast } from '@/hooks/use-toast';

// Page imports
import ToolManagement from '@/pages/ToolManagement';
import AutoVideoManagement from '@/pages/AutoVideoManagement';
import QuestionnairesPage from '@/pages/QuestionnairesPage';
import AuthPage from '@/pages/auth/AuthPage';
import PlayerAuth from '@/pages/PlayerAuth';
import CoachSignUp from '@/pages/CoachSignUp';
import DashboardCoach from '@/pages/DashboardCoach';

// Create a placeholder component for pages that are referenced but don't yet exist
const PlaceholderPage = ({ pageName }: { pageName: string }) => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Page Under Construction</h1>
        <p className="text-gray-500">The {pageName} page is still being developed.</p>
      </div>
    </div>
  );
};

// Define placeholder components for all referenced but not yet implemented pages
const ResetPasswordPage = () => <PlaceholderPage pageName="Reset Password" />;
const PublicRegistrationForm = () => <PlaceholderPage pageName="Public Registration" />;
const Index = () => <PlaceholderPage pageName="Index" />;
const NewIndex = () => <PlaceholderPage pageName="New Index" />;
const Dashboard = () => <PlaceholderPage pageName="Dashboard" />;
const PlayerProfile = () => <PlaceholderPage pageName="Player Profile" />;
const Huze = () => <PlaceholderPage pageName="Huze" />;
const Contract = () => <PlaceholderPage pageName="Contract" />;
const MentalCommitment = () => <PlaceholderPage pageName="Mental Commitment" />;
const Admin = () => <PlaceholderPage pageName="Admin" />;
const MentalTools = () => <PlaceholderPage pageName="Mental Tools" />;
const ShortTermGoals = () => <PlaceholderPage pageName="Short Term Goals" />;
const DailyChallenge = () => <PlaceholderPage pageName="Daily Challenge" />;
const PlayerForm = () => <PlaceholderPage pageName="Player Form" />;
const SessionsList = () => <PlaceholderPage pageName="Sessions List" />;
const PlayersList = () => <PlaceholderPage pageName="Players List" />;
const NewSessionForm = () => <PlaceholderPage pageName="New Session Form" />;
const EditSessionForm = () => <PlaceholderPage pageName="Edit Session Form" />;
const GoalDetailsQuestions = () => <PlaceholderPage pageName="Goal Details Questions" />;
const ProfileCoach = () => <PlaceholderPage pageName="Profile Coach" />;
const Reports = () => <PlaceholderPage pageName="Reports" />;
const Contact = () => <PlaceholderPage pageName="Contact" />;
const Next = () => <PlaceholderPage pageName="Next" />;
const PlayerEvaluation = () => <PlaceholderPage pageName="Player Evaluation" />;
const AnalyticsDashboard = () => <PlaceholderPage pageName="Analytics Dashboard" />;
const PlayerStatistics = () => <PlaceholderPage pageName="Player Statistics" />;
const GamePreparation = () => <PlaceholderPage pageName="Game Preparation" />;
const NotificationsDashboard = () => <PlaceholderPage pageName="Notifications Dashboard" />;
const ActionPlan = () => <PlaceholderPage pageName="Action Plan" />;
const SessionSummaries = () => <PlaceholderPage pageName="Session Summaries" />;
const NewPlayerForm = () => <PlaceholderPage pageName="New Player Form" />;
const EditPlayerForm = () => <PlaceholderPage pageName="Edit Player Form" />;
const RegistrationLinks = () => <PlaceholderPage pageName="Registration Links" />;
const AllMeetingSummaries = () => <PlaceholderPage pageName="All Meeting Summaries" />;
const Goals = () => <PlaceholderPage pageName="Goals" />;
const MentalLibrary = () => <PlaceholderPage pageName="Mental Library" />;
const PlayerGameEvaluationForm = () => <PlaceholderPage pageName="Player Game Evaluation Form" />;
const PlayerProfileView = () => <PlaceholderPage pageName="Player Profile View" />;
const PlayerProfileAlternative = () => <PlaceholderPage pageName="Player Profile Alternative" />;
const PlayerDashboard = () => <PlaceholderPage pageName="Player Dashboard" />;
const PlayerQuestionnaires = () => <PlaceholderPage pageName="Player Questionnaires" />;
const PlayerQuestionnaireForm = () => <PlaceholderPage pageName="Player Questionnaire Form" />;
const PlayerNotifications = () => <PlaceholderPage pageName="Player Notifications" />;
const PlayerVideos = () => <PlaceholderPage pageName="Player Videos" />;
const NotFound = () => <PlaceholderPage pageName="Not Found" />;

const AuthStateListener = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let handleLogout: ((msg?: string) => Promise<void>) | null = null;

    if (typeof window !== 'undefined' && (window as any).playerLogout) {
      handleLogout = (window as any).playerLogout;
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === "SIGNED_OUT") {
        console.log("משתמש התנתק");
        
        if (!redirectedRef.current) {
          toast({
            title: "התנתקות מהמערכת",
            description: "התנתקת בהצלחה מהמערכת",
          });
        }
        
        navigate("/player-auth");
      }

      if (event === "SIGNED_IN") {
        console.log("משתמש נכנס:", session?.user);
        // Do NOT automatically navigate on SIGNED_IN events
        // This prevents potential redirect loops
        // The normal route handling will take care of navigation
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  return null;
};

function App() {
  return (
    <Router>
      <QueryClientProvider client={new QueryClient()}>
        <ThemeProvider attribute="class">
          <Toaster />
          <AuthStateListener />
          <SessionExpirationCheck />
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/player-auth" element={<PlayerAuth />} />
            <Route path="/signup-coach" element={<CoachSignUp />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            <Route path="/register/:linkId" element={<PublicRegistrationForm />} />
            
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

              <Route path="/player/profile" element={<AuthGuard playerOnly={true}><PlayerProfileView /></AuthGuard>} />
              <Route path="/player/profile-alt" element={<AuthGuard playerOnly={true}><PlayerProfileAlternative /></AuthGuard>} />
              <Route path="/player/dashboard" element={<AuthGuard playerOnly={true}><PlayerDashboard /></AuthGuard>} />
              <Route path="/player/game-evaluation/:playerId" element={<AuthGuard playerOnly={true}><PlayerGameEvaluationForm /></AuthGuard>} />
              <Route path="/player/questionnaires" element={<AuthGuard playerOnly={true}><PlayerQuestionnaires /></AuthGuard>} />
              <Route path="/player/questionnaire/:id" element={<AuthGuard playerOnly={true}><PlayerQuestionnaireForm /></AuthGuard>} />
              <Route path="/player/notifications" element={<AuthGuard playerOnly={true}><PlayerNotifications /></AuthGuard>} />
              <Route path="/player/videos" element={<AuthGuard playerOnly={true}><PlayerVideos /></AuthGuard>} />
              
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </ThemeProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
