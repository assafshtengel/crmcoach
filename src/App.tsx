import { Routes, Route } from 'react-router-dom';
import DashboardCoach from './pages/DashboardCoach';
import SessionsList from './pages/SessionsList';
import SessionSummaries from './pages/SessionSummaries';
import NewSession from './pages/NewSession';
import EditSession from './pages/EditSession';
import NewPlayer from './pages/NewPlayer';
import PlayersList from './pages/PlayersList';
import ProfileCoach from './pages/ProfileCoach';
import Auth from './pages/Auth';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardCoach />} />
      <Route path="/sessions" element={<SessionsList />} />
      <Route path="/session-summaries" element={<SessionSummaries />} />
      <Route path="/new-session" element={<NewSession />} />
      <Route path="/edit-session" element={<EditSession />} />
      <Route path="/new-player" element={<NewPlayer />} />
      <Route path="/players-list" element={<PlayersList />} />
      <Route path="/profile-coach" element={<ProfileCoach />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/analytics" element={<Analytics />} />
    </Routes>
  );
}

export default App;
