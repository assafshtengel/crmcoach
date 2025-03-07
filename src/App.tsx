import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PlayersList from './pages/PlayersList';
import NewPlayerForm from './pages/NewPlayerForm';
import PlayerProfile from './pages/PlayerProfile';
import EditPlayerForm from './pages/EditPlayerForm';
import SessionsList from './pages/SessionsList';
import NewSessionForm from './pages/NewSessionForm';
import EditSessionForm from './pages/EditSessionForm';
import SessionDetails from './pages/SessionDetails';
import SessionSummaryForm from './pages/SessionSummaryForm';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import { supabase } from './integrations/supabase/client';
import { Toaster } from './components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import PlayerAuth from './pages/player/PlayerAuth';
import PlayerProfileView from './pages/player/PlayerProfileView';
import GamePreparation from './pages/GamePreparation';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(data.session);
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route
          path="/auth"
          element={session ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={session ? <Navigate to="/dashboard" /> : <Register />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Player routes */}
        <Route path="/player/profile" element={<PlayerProfileView />} />
        <Route path="/player/auth" element={<PlayerAuth />} />
        <Route path="/player-auth" element={<PlayerAuth />} />
        <Route path="/game-preparation" element={<GamePreparation />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={session ? <Navigate to="/dashboard" /> : <Navigate to="/auth" />}
        />
        <Route
          path="/dashboard"
          element={session ? <Dashboard /> : <Navigate to="/auth" />}
        />
        <Route
          path="/players-list"
          element={session ? <PlayersList /> : <Navigate to="/auth" />}
        />
        <Route
          path="/new-player"
          element={session ? <NewPlayerForm /> : <Navigate to="/auth" />}
        />
        <Route
          path="/player-profile/:playerId"
          element={session ? <PlayerProfile /> : <Navigate to="/auth" />}
        />
        <Route
          path="/edit-player/:playerId"
          element={session ? <EditPlayerForm /> : <Navigate to="/auth" />}
        />
        <Route
          path="/sessions-list"
          element={session ? <SessionsList /> : <Navigate to="/auth" />}
        />
        <Route
          path="/new-session"
          element={session ? <NewSessionForm /> : <Navigate to="/auth" />}
        />
        <Route
          path="/edit-session/:sessionId"
          element={session ? <EditSessionForm /> : <Navigate to="/auth" />}
        />
        <Route
          path="/session-details/:sessionId"
          element={session ? <SessionDetails /> : <Navigate to="/auth" />}
        />
        <Route
          path="/session-summary/:sessionId"
          element={session ? <SessionSummaryForm /> : <Navigate to="/auth" />}
        />

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      <SonnerToaster position="top-center" expand={true} richColors closeButton />
    </Router>
  );
}

export default App;
