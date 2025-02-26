
import { Routes, Route, Navigate } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import DashboardCoach from './pages/DashboardCoach';
import SessionsList from './pages/SessionsList';
import SessionSummaries from './pages/SessionSummaries';
import PlayersList from './pages/PlayersList';
import ProfileCoach from './pages/ProfileCoach';
import NewSessionForm from './pages/NewSessionForm';
import NewPlayerForm from './pages/NewPlayerForm';
import PlayerProfile from './pages/PlayerProfile';
import EditPlayerForm from './pages/EditPlayerForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardCoach />} />
        <Route path="/index" element={<Navigate to="/" replace />} />
        <Route path="/sessions" element={<SessionsList />} />
        <Route path="/session-summaries" element={<SessionSummaries />} />
        <Route path="/players-list" element={<PlayersList />} />
        <Route path="/profile-coach" element={<ProfileCoach />} />
        <Route path="/new-session" element={<NewSessionForm />} />
        <Route path="/new-player" element={<NewPlayerForm />} />
        <Route path="/player-profile/:playerId" element={<PlayerProfile />} />
        <Route path="/edit-player" element={<EditPlayerForm />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
