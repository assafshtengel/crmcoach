
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';
import { AuthGuard } from '@/components/auth/AuthGuard';
import DashboardCoach from '@/pages/DashboardCoach';
import PlayerProfile from '@/pages/PlayerProfile';
import SessionsList from '@/pages/SessionsList';
import AllMeetingSummaries from '@/pages/AllMeetingSummaries';
import PlayersList from '@/pages/PlayersList';
import PlayerAuth from '@/pages/PlayerAuth';
import CoachSignUp from '@/pages/CoachSignUp';
import AuthPage from '@/pages/auth/AuthPage';

function App() {
  const [coachName, setCoachName] = React.useState('');

  return (
    <main>
      <Toaster />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/player-auth" element={<PlayerAuth />} />
        <Route path="/signup-coach" element={<CoachSignUp />} />
        
        {/* Root dashboard route with AuthGuard */}
        <Route path="/" element={
          <AuthGuard>
            <DashboardCoach />
          </AuthGuard>
        } />
        
        {/* Players list route */}
        <Route path="/players-list" element={
          <AuthGuard>
            <PlayersList />
          </AuthGuard>
        } />
        
        {/* Player profile routes */}
        <Route path="/player/:playerId" element={
          <AuthGuard playerOnly={true}>
            <PlayerProfile />
          </AuthGuard>
        } />
        <Route path="/player/profile-view" element={
          <AuthGuard playerOnly={true}>
            <PlayerProfile />
          </AuthGuard>
        } />
        <Route path="/player-profile/:playerId" element={
          <AuthGuard>
            <PlayerProfile />
          </AuthGuard>
        } />
        
        {/* Sessions list route */}
        <Route path="/sessions-list" element={
          <AuthGuard>
            <SessionsList />
          </AuthGuard>
        } />
        
        {/* Session summaries route */}
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
