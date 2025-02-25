
import { Routes, Route } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import DashboardCoach from './pages/DashboardCoach';
import SessionsList from './pages/SessionsList';
import SessionSummaries from './pages/SessionSummaries';
import PlayersList from './pages/PlayersList';
import ProfileCoach from './pages/ProfileCoach';
import NewSessionForm from './pages/NewSessionForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardCoach />} />
        <Route path="/sessions" element={<SessionsList />} />
        <Route path="/session-summaries" element={<SessionSummaries />} />
        <Route path="/players-list" element={<PlayersList />} />
        <Route path="/profile-coach" element={<ProfileCoach />} />
        <Route path="/new-session" element={<NewSessionForm />} />
      </Routes>
    </Router>
  );
}

export default App;
