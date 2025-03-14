
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import PlayersList from "./pages/PlayersList";
import NewPlayerForm from "./pages/NewPlayerForm";
import PlayerAuth from "./pages/PlayerAuth";
import PlayerProfile from "./pages/PlayerProfile";
import EditPlayerForm from "./pages/EditPlayerForm";
import PlayerProfileView from "./pages/player/PlayerProfileView";
import DailyMentalState from "./pages/player/DailyMentalState";
import MentalStateHistory from "./pages/player/MentalStateHistory";
import PlayerGameSummary from "./pages/player/PlayerGameSummary";
import DashboardCoach from "./pages/DashboardCoach";
import Messages from "./pages/Messages";
import ChatPage from "./pages/ChatPage";
import GroupMessageDetail from "./pages/GroupMessageDetail";
import PlayerMessages from "./pages/player/PlayerMessages";
import AuthPage from "./pages/auth/AuthPage";
import { AuthGuard } from "./components/auth/AuthGuard";
import { Toaster } from "./components/ui/toaster";
import GameSummaries from "./pages/GameSummaries";
import NewGameSummary from "./pages/NewGameSummary";
import EditGameSummary from "./pages/EditGameSummary";
import EvaluationForm from "./pages/EvaluationForm";
import EvaluationsList from "./pages/EvaluationsList";
import EvaluationDetails from "./pages/EvaluationDetails";
import TrainingVideos from "./pages/TrainingVideos";
import TrainingGoals from "./pages/TrainingGoals";
import Meetings from "./pages/Meetings";
import GamePreparation from "./pages/GamePreparation";
import TrainingSummaries from "./pages/TrainingSummaries";
import NewTrainingSummary from "./pages/NewTrainingSummary";
import EditTrainingSummary from "./pages/EditTrainingSummary";
import CoachSignUp from "./pages/CoachSignUp";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
      }
    );
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard-coach" replace />} />
        <Route path="/index" element={<Index />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/signup-coach" element={<CoachSignUp />} />
        <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
        <Route path="/dashboard-coach" element={<AuthGuard><DashboardCoach /></AuthGuard>} />
        <Route path="/players-list" element={<AuthGuard><PlayersList /></AuthGuard>} />
        <Route path="/new-player" element={<AuthGuard><NewPlayerForm /></AuthGuard>} />
        <Route path="/player/:playerId" element={<AuthGuard><PlayerProfile /></AuthGuard>} />
        <Route path="/edit-player/:playerId" element={<AuthGuard><EditPlayerForm /></AuthGuard>} />
        <Route path="/player-auth" element={<PlayerAuth />} />
        <Route path="/player" element={<PlayerProfileView />} />
        <Route path="/player/daily-mental-state" element={<DailyMentalState />} />
        <Route path="/player/mental-state-history" element={<MentalStateHistory />} />
        <Route path="/player/game-summary" element={<PlayerGameSummary />} />
        <Route path="/game-summary/:playerId" element={<AuthGuard><GameSummaries /></AuthGuard>} />
        <Route path="/new-game-summary/:playerId" element={<AuthGuard><NewGameSummary /></AuthGuard>} />
        <Route path="/edit-game-summary/:gameSummaryId" element={<AuthGuard><EditGameSummary /></AuthGuard>} />
        <Route path="/evaluation-form/:playerId" element={<AuthGuard><EvaluationForm /></AuthGuard>} />
        <Route path="/evaluations-list/:playerId" element={<AuthGuard><EvaluationsList /></AuthGuard>} />
        <Route path="/evaluation-details/:evaluationId" element={<AuthGuard><EvaluationDetails /></AuthGuard>} />
        <Route path="/training-videos" element={<TrainingVideos />} />
        <Route path="/training-goals" element={<TrainingGoals />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/game-preparation" element={<GamePreparation />} />
        <Route path="/training-summaries/:playerId" element={<AuthGuard><TrainingSummaries /></AuthGuard>} />
        <Route path="/new-training-summary/:playerId" element={<AuthGuard><NewTrainingSummary /></AuthGuard>} />
        <Route path="/edit-training-summary/:trainingSummaryId" element={<AuthGuard><EditTrainingSummary /></AuthGuard>} />
        
        {/* Messaging routes */}
        <Route path="/messages" element={<AuthGuard><Messages /></AuthGuard>} />
        <Route path="/chat/:playerId" element={<AuthGuard><ChatPage /></AuthGuard>} />
        <Route path="/group-message/:messageId" element={<AuthGuard><GroupMessageDetail /></AuthGuard>} />
        <Route path="/player/messages" element={<PlayerMessages />} />
        
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
