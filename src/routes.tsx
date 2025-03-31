
import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import App from "./App";
import PlayerAuth from "./pages/PlayerAuth";
import PlayerEvaluation from "./pages/PlayerEvaluation";
import NewPlayerForm from "./pages/NewPlayerForm";
import EditPlayerForm from "./pages/EditPlayerForm";
import NotificationsDashboard from "./pages/NotificationsDashboard";
import PlayerForm from "./pages/PlayerForm";
import PlayerStatistics from "./pages/PlayerStatistics";
import PlayerProfileView from "./pages/player/PlayerProfileView";
import PlayerQuestionnaireForm from "./pages/player/PlayerQuestionnaireForm";
import PlayerGameEvaluation from "./pages/player/PlayerGameEvaluation";
import PlayerProfileAlternative from "./pages/player/PlayerProfileAlternative";
import Index from "./pages/Index";
import DashboardCoach from "./pages/DashboardCoach";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard-coach" replace />,
  },
  {
    path: "/dashboard-coach",
    element: <DashboardCoach />,
  },
  {
    path: "/index",
    element: <Index />,
  },
  {
    path: "/player-auth",
    element: <PlayerAuth />,
  },
  {
    path: "/new-player",
    element: <NewPlayerForm />,
  },
  {
    path: "/edit-player/:id",
    element: <EditPlayerForm />,
  },
  {
    path: "/notifications",
    element: <NotificationsDashboard />,
  },
  {
    path: "/player-form",
    element: <PlayerForm />,
  },
  {
    path: "/player-statistics",
    element: <PlayerStatistics />,
  },
  {
    path: "/player-evaluation",
    element: <PlayerEvaluation />,
  },
  
  // Player routes
  {
    path: "/player/profile",
    element: <PlayerProfileView />,
  },
  {
    path: "/player/profile-alt",
    element: <PlayerProfileAlternative />,
  },
  {
    path: "/player/questionnaire/:questionnaireId",
    element: <PlayerQuestionnaireForm />,
  },
  {
    path: "/player/game-evaluation",
    element: <PlayerGameEvaluation />,
  },
]);

export default routes;
