
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PlayersProvider } from "./contexts/PlayersContext";
import AuthPage from "./pages/auth/AuthPage";
import { AuthGuard } from "./components/auth/AuthGuard";
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
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";

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
            
            {/* דף התחברות */}
            <Route path="/auth" element={<AuthPage />} />

            {/* דף הבית - דשבורד המאמן */}
            <Route path="/" element={
              <AuthGuard>
                <DashboardCoach />
              </AuthGuard>
            } />

            {/* ניתוב מחדש מדשבורד שחקן לדף הבית */}
            <Route path="/dashboard-player" element={
              <AuthGuard>
                <Navigate to="/" replace />
              </AuthGuard>
            } />

            {/* נתיבים מוגנים */}
            <Route path="/profile-coach" element={
              <AuthGuard>
                <ProfileCoach />
              </AuthGuard>
            } />
            <Route path="/players-list" element={
              <AuthGuard>
                <PlayersList />
              </AuthGuard>
            } />
            <Route path="/new-player" element={
              <AuthGuard>
                <NewPlayerForm />
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
            <Route path="/analytics" element={
              <AuthGuard>
                <AnalyticsDashboard />
              </AuthGuard>
            } />
            
            {/* דף קשר - נגיש ללא התחברות */}
            <Route path="/contact" element={<Contact />} />
            
            {/* דף 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </PlayersProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
