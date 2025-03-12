
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from "./components/theme-provider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "sonner"
import DashboardCoach from './pages/DashboardCoach';
import PlayersList from './pages/PlayersList';
import Goals from './pages/Goals';
import PlayerProfileView from './pages/player/PlayerProfileView';
import MentalTools from './pages/MentalTools';
import { PlayersProvider } from './contexts/PlayersContext';
import PlayerFile from "@/pages/PlayerFile";
import ChatPage from './pages/ChatPage';
import EditPlayerForm from './pages/EditPlayerForm';
import AddPlayerForm from './pages/AddPlayerForm';

const Sessions = () => <div>Sessions Page</div>;
const SessionDetails = () => <div>Session Details Page</div>;
const CoachesList = () => <div>Coaches List Page</div>;
const MentalPrepForm = () => <div>Mental Prep Form Page</div>;
const TrainingVideos = () => <div>Training Videos Page</div>;
const PlayerDashboard = () => <div>Player Dashboard Page</div>;
const CoachProfile = () => <div>Coach Profile Page</div>;
const PlayerRegistration = () => <div>Player Registration Page</div>;
const RegistrationLinks = () => <div>Registration Links Page</div>;

const queryClient = new QueryClient();

const App = () => {
  const isPlayer = () => {
    const playerSession = localStorage.getItem('playerSession');
    return !!playerSession;
  };

  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <PlayersProvider>
            <Routes>
              <Route 
                path="/" 
                element={isPlayer() ? <Navigate to="/player-profile" /> : <DashboardCoach />} 
              />
              
              <Route path="/dashboard-coach" element={<DashboardCoach />} />
              <Route path="/players-list" element={<PlayersList />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/sessions/:sessionId" element={<SessionDetails />} />
              <Route path="/coaches-list" element={<CoachesList />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/mental-prep-form" element={<MentalPrepForm />} />
              <Route path="/mental-tools" element={<MentalTools />} />
              <Route path="/training-videos" element={<TrainingVideos />} />
              <Route path="/coach-profile" element={<CoachProfile />} />
              <Route path="/player-registration" element={<PlayerRegistration />} />
              <Route path="/registration-links" element={<RegistrationLinks />} />
              <Route path="/player-file/:playerId" element={<PlayerFile />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/edit-player/:playerId" element={<EditPlayerForm />} />
              <Route path="/add-player" element={<AddPlayerForm />} />
              {/* Add redirect from new-player to add-player */}
              <Route path="/new-player" element={<Navigate to="/add-player" />} />
              
              <Route path="/player-dashboard" element={<PlayerDashboard />} />
              <Route path="/player-profile" element={<PlayerProfileView />} />
              
              <Route path="/player/profile" element={<PlayerProfileView />} />
              <Route path="/player/daily-mental-state" element={<div>Daily Mental State Page</div>} />
              <Route path="/player/mental-state-history" element={<div>Mental State History Page</div>} />
              <Route path="/player/game-summary" element={<div>Game Summary Page</div>} />
              <Route path="/player/training-summary" element={<div>Training Summary Page</div>} />
              <Route path="/player/videos" element={<div>Player Videos Page</div>} />
              <Route path="/player/meetings" element={<div>Player Meetings Page</div>} />
              <Route path="/player/goals" element={<div>Player Goals Page</div>} />
              <Route path="/player/game-preparation" element={<div>Game Preparation Page</div>} />
              <Route path="/player/chat" element={<ChatPage />} />
            </Routes>
            <Toaster />
          </PlayersProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
