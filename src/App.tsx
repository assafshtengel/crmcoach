import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import PlayersList from './pages/PlayersList';
import NotFound from './pages/NotFound';
import AuthPage from './pages/auth/AuthPage';
import { Toaster } from './components/ui/toaster';
import { AuthGuard } from './components/auth/AuthGuard';
import PlayerAuthPage from './pages/auth/PlayerAuthPage';
import PlayerDashboard from './pages/PlayerDashboard';
import { PlayerGuard } from './components/auth/PlayerGuard';
import GamePreparationPage from './pages/GamePreparationPage';
import MentalToolsPage from './pages/MentalToolsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/player-auth" element={<PlayerAuthPage />} />
        
        {/* מוגן ע"י AuthGuard - רק למאמנים */}
        <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
        <Route path="/players-list" element={<AuthGuard><PlayersList /></AuthGuard>} />
        
        {/* מוגן ע"י PlayerGuard - רק לשחקנים */}
        <Route path="/player-dashboard" element={<PlayerGuard><PlayerDashboard /></PlayerGuard>} />
        
        <Route path="/game-preparation" element={<GamePreparationPage />} />
        <Route path="/mental-tools" element={<MentalToolsPage />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
