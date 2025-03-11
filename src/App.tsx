import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from "sonner"
import DashboardCoach from './pages/DashboardCoach';
import PlayersList from './pages/PlayersList';
import Sessions from './pages/Sessions';
import SessionDetails from './pages/SessionDetails';
import CoachesList from './pages/CoachesList';
import Goals from './pages/Goals';
import MentalPrepForm from './pages/MentalPrepForm';
import PlayerProfileView from './pages/player/PlayerProfileView';
import MentalTools from './pages/MentalTools';
import TrainingVideos from './pages/TrainingVideos';
import PlayerDashboard from './pages/player/PlayerDashboard';
import { PlayersProvider } from './contexts/PlayersContext';
import CoachProfile from './pages/CoachProfile';
import PlayerRegistration from './pages/PlayerRegistration';
import RegistrationLinks from './pages/RegistrationLinks';
import PlayerFile from "@/pages/PlayerFile";

const queryClient = new QueryClient();

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <PlayersProvider>
            <Routes>
              <Route path="/" element={<PlayerDashboard />} />
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
            </Routes>
            <Toaster />
          </PlayersProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
