
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

function App() {
  const [coachName, setCoachName] = React.useState('');

  return (
    <main>
      <Toaster />
      <Routes>
        <Route path="/" element={
          <AuthGuard>
            <DashboardCoach />
          </AuthGuard>
        } />
        <Route path="/players-list" element={
          <AuthGuard>
            <PlayersList />
          </AuthGuard>
        } />
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
        <Route path="/sessions-list" element={
          <AuthGuard>
            <SessionsList />
          </AuthGuard>
        } />
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
