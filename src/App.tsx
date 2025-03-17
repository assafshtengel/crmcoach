
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from "./components/theme-provider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "sonner"
import DashboardCoach from './pages/DashboardCoach';
import Index from './pages/Index';
import PlayersList from './pages/PlayersList';
import Goals from './pages/Goals';
import PlayerProfileView from './pages/player/PlayerProfileView';
import MentalTools from './pages/MentalTools';
import { PlayersProvider } from './contexts/PlayersContext';
import PlayerFile from "@/pages/PlayerFile";

// Create placeholder components for missing modules
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
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <PlayersProvider>
            <Routes>
              {/* Redirect root path to dashboard-coach */}
              <Route path="/" element={<Navigate to="/dashboard-coach" replace />} />
              <Route path="/dashboard-coach" element={<DashboardCoach />} />
              <Route path="/players-list" element={<PlayersList />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/sessions/:sessionId" element={<SessionDetails />} />
              <Route path="/coaches-list" element={<CoachesList />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/mental-prep-form" element={<MentalPrepForm />} />
              <Route path="/player-profile" element={<PlayerProfileView />} />
              <Route path="/mental-tools" element={<MentalTools />} />
              <Route path="/training-videos" element={<TrainingVideos />} />
              <Route path="/coach-profile" element={<CoachProfile />} />
              <Route path="/player-registration" element={<PlayerRegistration />} />
              <Route path="/registration-links" element={<RegistrationLinks />} />
              <Route path="/player-file/:playerId" element={<PlayerFile />} />
              <Route path="/index" element={<Index />} />
            </Routes>
            <Toaster />
          </PlayersProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
