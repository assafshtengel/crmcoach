import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';
import Auth from '@/pages/Auth';
import PlayerAuth from '@/pages/PlayerAuth';
import SignupCoach from '@/pages/SignupCoach';
import Register from '@/pages/Register';
import RegisterSuccess from '@/pages/RegisterSuccess';
import DashboardCoach from '@/pages/DashboardCoach';
import PlayersList from '@/pages/PlayersList';
import NewPlayer from '@/pages/NewPlayer';
import EditPlayer from '@/pages/EditPlayer';
import PlayerProfile from '@/pages/PlayerProfile';
import SessionsList from '@/pages/SessionsList';
import NewSession from '@/pages/NewSession';
import EditSession from '@/pages/EditSession';
import TrainingSummaries from '@/pages/TrainingSummaries';
import PlayerGameSummaries from '@/pages/PlayerGameSummaries';
import PlayerMentalStates from '@/pages/PlayerMentalStates';
import PublicRegistration from '@/pages/PublicRegistration';
import PublicRegistrationSuccess from '@/pages/PublicRegistrationSuccess';
import { AuthGuard } from '@/components/auth/AuthGuard';
import AllMeetingSummaries from '@/pages/AllMeetingSummaries';

function App() {
  const [coachName, setCoachName] = React.useState('');

  return (
    <main>
      <Toaster />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/player-auth" element={<PlayerAuth />} />
        <Route path="/signup-coach" element={<SignupCoach />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/:token" element={<Register />} />
        <Route path="/register-success" element={<RegisterSuccess />} />
        <Route path="/register/success" element={<PublicRegistrationSuccess />} />
        <Route path="/" element={
          <AuthGuard>
            <DashboardCoach setCoachName={setCoachName} />
          </AuthGuard>
        } />
        <Route path="/players-list" element={
          <AuthGuard>
            <PlayersList />
          </AuthGuard>
        } />
        <Route path="/new-player" element={
          <AuthGuard>
            <NewPlayer />
          </AuthGuard>
        } />
        <Route path="/edit-player/:playerId" element={
          <AuthGuard>
            <EditPlayer />
          </AuthGuard>
        } />
        <Route path="/player/:playerId" element={<AuthGuard playerOnly={true}><PlayerProfile /></AuthGuard>} />
        <Route path="/player/profile-view" element={<AuthGuard playerOnly={true}><PlayerProfile /></AuthGuard>} />
        <Route path="/player-profile/:playerId" element={
          <AuthGuard>
            <PlayerProfile />
          </AuthGuard>
        } />
        <Route path="/sessions-list" element={
          <AuthGuard>
            <SessionsList />
          </AuthGuard>
        } />
        <Route path="/new-session" element={
          <AuthGuard>
            <NewSession />
          </AuthGuard>
        } />
        <Route path="/edit-session" element={
          <AuthGuard>
            <EditSession />
          </AuthGuard>
        } />
        <Route path="/training-summaries/:playerId" element={
          <AuthGuard>
            <TrainingSummaries />
          </AuthGuard>
        } />
        <Route path="/player-game-summaries/:playerId" element={
          <AuthGuard>
            <PlayerGameSummaries />
          </AuthGuard>
        } />
        <Route path="/player-mental-states/:playerId" element={
          <AuthGuard>
            <PlayerMentalStates />
          </AuthGuard>
        } />
        <Route path="/public-registration/:coachId" element={<PublicRegistration />} />
        <Route 
          path="/session-summaries" 
          element={
            <AuthGuard>
              <AllMeetingSummaries />
            </AuthGuard>
          } 
        />
      </Routes>
    </main>
  );
}

export default App;
