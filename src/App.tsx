import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import Account from './pages/Account';
import DashboardCoach from './pages/DashboardCoach';
import NewSessionForm from './pages/NewSessionForm';
import EditSessionForm from './pages/EditSessionForm';
import PlayersList from './pages/PlayersList';
import NewPlayerForm from './pages/NewPlayerForm';
import EditPlayerForm from './pages/EditPlayerForm';
import PlayerProfile from './pages/PlayerProfile';
import SessionSummaries from './pages/SessionSummaries';
import MentalPrepForm from './pages/MentalPrepForm';
import { AdminDashboard } from './components/admin/AdminDashboard';
import MentalTools from "./pages/MentalTools";

const App = () => {
  const [showAuth, setShowAuth] = useState(false);
  const supabase = useSupabaseClient();
  const user = useUser();

  useEffect(() => {
    if (!user) {
      setShowAuth(true);
    } else {
      setShowAuth(false);
    }
  }, [user]);

  return (
    <Router>
      <Routes>
        <Route
          path="/auth"
          element={
            showAuth ? (
              <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    Sign In / Sign Up
                  </h1>
                  <Auth
                    supabaseClient={supabase}
                    appearance={{
                      theme: ThemeSupa,
                      variables: {
                        default: {
                          colors: {
                            brand: '#4f46e5',
                            brandAccent: '#a78bfa',
                          },
                        },
                      },
                    }}
                    providers={['google', 'github']}
                    redirectTo="http://localhost:5173/"
                  />
                </div>
              </div>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/"
          element={
            user ? (
              <DashboardCoach />
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/account"
          element={
            user ? (
              <Account key={user.id} />
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/new-session"
          element={
            user ? (
              <NewSessionForm />
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/edit-session"
          element={
            user ? (
              <EditSessionForm />
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/players-list"
          element={
            user ? (
              <PlayersList />
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/new-player"
          element={
            user ? (
              <NewPlayerForm />
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/edit-player"
          element={
            user ? (
              <EditPlayerForm />
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/player-profile/:playerId"
          element={
            user ? (
              <PlayerProfile />
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/session-summaries"
          element={
            user ? (
              <SessionSummaries />
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/mental-prep-form"
          element={
            user ? (
              <MentalPrepForm />
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            user ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        {
          path: "/mental-tools",
          element: <MentalTools />,
        },
      </Routes>
    </Router>
  );
};

export default App;
