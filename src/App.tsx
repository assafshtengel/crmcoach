
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PlayersProvider } from "./contexts/PlayersContext";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/auth/AuthPage";
import Dashboard from "./pages/Dashboard";
import { AuthGuard } from "./components/auth/AuthGuard";
import PlayerEvaluationPage from "./pages/PlayerEvaluation";
import Huze from "./pages/Huze";
import PlayerForm from "./pages/PlayerForm";
import MentalCommitment from "./pages/MentalCommitment";
import Contract from "./pages/Contract";
import ShortTermGoals from "./pages/ShortTermGoals";
import GoalDetailsQuestions from "./pages/GoalDetailsQuestions";
import ActionPlan from "./pages/ActionPlan";
import DailyChallenge from "./pages/DailyChallenge";
import NewIndex from "./pages/NewIndex";
import Next from "./pages/Next";
import Contact from "./pages/Contact";
import MentalTools from "./pages/MentalTools";
import GamePreparation from "./pages/GamePreparation";
import DashboardCoach from "./pages/DashboardCoach";
import NewPlayerForm from "./pages/NewPlayerForm";
import PlayersList from "./pages/PlayersList";
import NewSessionForm from "./pages/NewSessionForm";
import SessionsList from "./pages/SessionsList";
import EditPlayerForm from "./pages/EditPlayerForm";
import EditSessionForm from "./pages/EditSessionForm";
import ProfileCoach from "./pages/ProfileCoach";
import NotificationsDashboard from "./pages/NotificationsDashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PlayersProvider>
        <BrowserRouter>
          <Routes>
            {/* דף הרשמת מאמן - נגיש ללא התחברות */}
            <Route path="/coach-signup" element={<ProfileCoach />} />
            
            {/* דף הבית - דשבורד המאמן */}
            <Route path="/" element={
              <AuthGuard>
                <DashboardCoach />
              </AuthGuard>
            } />

            {/* שאר הנתיבים */}
            <Route path="/profile-coach" element={
              <AuthGuard>
                <ProfileCoach />
              </AuthGuard>
            } />
            <Route path="/edit-session" element={
              <AuthGuard>
                <EditSessionForm />
              </AuthGuard>
            } />
            <Route path="/notifications" element={
              <AuthGuard>
                <NotificationsDashboard />
              </AuthGuard>
            } />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/players-list" element={
              <AuthGuard>
                <PlayersList />
              </AuthGuard>
            } />
            <Route path="/new-session" element={
              <AuthGuard>
                <NewSessionForm />
              </AuthGuard>
            } />
            <Route path="/sessions-list" element={
              <AuthGuard>
                <SessionsList />
              </AuthGuard>
            } />
            <Route path="/edit-player" element={
              <AuthGuard>
                <EditPlayerForm />
              </AuthGuard>
            } />
            <Route 
              path="/form" 
              element={
                <AuthGuard>
                  <Index />
                </AuthGuard>
              } 
            />
            <Route 
              path="/new-form" 
              element={
                <AuthGuard>
                  <NewIndex />
                </AuthGuard>
              } 
            />
            <Route 
              path="/dashboard-player" 
              element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AuthGuard>
                  <Admin />
                </AuthGuard>
              } 
            />
            <Route 
              path="/player-evaluation" 
              element={
                <AuthGuard>
                  <PlayerEvaluationPage />
                </AuthGuard>
              } 
            />
            <Route 
              path="/huze" 
              element={
                <AuthGuard>
                  <Huze />
                </AuthGuard>
              } 
            />
            <Route 
              path="/player-form" 
              element={
                <AuthGuard>
                  <PlayerForm />
                </AuthGuard>
              } 
            />
            <Route 
              path="/new-player" 
              element={
                <AuthGuard>
                  <NewPlayerForm />
                </AuthGuard>
              } 
            />
            <Route 
              path="/mental-commitment" 
              element={
                <AuthGuard>
                  <MentalCommitment />
                </AuthGuard>
              } 
            />
            <Route 
              path="/contract" 
              element={
                <AuthGuard>
                  <Contract />
                </AuthGuard>
              } 
            />
            <Route 
              path="/short-term-goals" 
              element={
                <AuthGuard>
                  <ShortTermGoals />
                </AuthGuard>
              } 
            />
            <Route 
              path="/goal-details/:categoryId" 
              element={
                <AuthGuard>
                  <GoalDetailsQuestions />
                </AuthGuard>
              } 
            />
            <Route 
              path="/action-plan" 
              element={
                <AuthGuard>
                  <ActionPlan />
                </AuthGuard>
              } 
            />
            <Route 
              path="/daily-challenge" 
              element={
                <AuthGuard>
                  <DailyChallenge />
                </AuthGuard>
              } 
            />
            <Route 
              path="/next" 
              element={
                <AuthGuard>
                  <Next />
                </AuthGuard>
              } 
            />
            <Route 
              path="/mental-tools" 
              element={
                <AuthGuard>
                  <MentalTools />
                </AuthGuard>
              } 
            />
            <Route 
              path="/game-preparation" 
              element={
                <AuthGuard>
                  <GamePreparation />
                </AuthGuard>
              } 
            />
            <Route path="/contact" element={<Contact />} />
            <Route path="/analytics" element={
              <AuthGuard>
                <AnalyticsDashboard />
              </AuthGuard>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </PlayersProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
