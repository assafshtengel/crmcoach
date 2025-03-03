
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PlayersList from "./pages/PlayersList";
import PlayerAuthPage from "./pages/auth/PlayerAuthPage";
import { PlayerProfileGuard } from "./components/auth/PlayerProfileGuard";
import Dashboard from "./pages/Dashboard";
import PlayerEvaluation from "./pages/PlayerEvaluation";
import GamePreparation from "./pages/GamePreparation";
import MentalTools from "./pages/MentalTools";
import NewPlayerForm from "./pages/NewPlayerForm";
import PlayerProfile from "./pages/PlayerProfile";
import NotFound from "./pages/NotFound";
import DashboardCoach from "./pages/DashboardCoach";
import ProfileCoach from "./pages/ProfileCoach";
import SessionsList from "./pages/SessionsList";
import NewSessionForm from "./pages/NewSessionForm";
import EditSessionForm from "./pages/EditSessionForm";
import SessionSummaries from "./pages/SessionSummaries";
import ToolManagement from "./pages/ToolManagement";
import RegistrationLinks from "./pages/RegistrationLinks";
import Reports from "./pages/Reports";
import AllMeetingSummaries from "./pages/AllMeetingSummaries";

const App = () => {
  return (
    <RouterProvider
      router={
        createBrowserRouter([
          {
            path: "/",
            element: <Dashboard />,
          },
          // Player routes
          {
            path: "/players-list",
            element: <PlayersList />,
          },
          {
            path: "/player-auth",
            element: <PlayerAuthPage />,
          },
          {
            path: "/dashboard",
            element: <Dashboard />,
          },
          {
            path: "/player-evaluation",
            element: <PlayerEvaluation />,
          },
          {
            path: "/game-preparation",
            element: <GamePreparation />,
          },
          {
            path: "/mental-tools",
            element: <MentalTools />,
          },
          {
            path: "/new-player",
            element: <NewPlayerForm />,
          },
          {
            path: "/player-profile/:playerId",
            element: <PlayerProfile />,
          },
          {
            path: "/dashboard/player-profile/:playerId",
            element: (
              <PlayerProfileGuard>
                <Dashboard />
              </PlayerProfileGuard>
            ),
          },
          // Coach routes
          {
            path: "/coach-dashboard",
            element: <DashboardCoach />,
          },
          {
            path: "/coach-profile",
            element: <ProfileCoach />,
          },
          {
            path: "/sessions",
            element: <SessionsList />,
          },
          {
            path: "/new-session",
            element: <NewSessionForm />,
          },
          {
            path: "/edit-session/:sessionId",
            element: <EditSessionForm />,
          },
          {
            path: "/session-summaries",
            element: <SessionSummaries />,
          },
          {
            path: "/tool-management",
            element: <ToolManagement />,
          },
          {
            path: "/registration-links",
            element: <RegistrationLinks />,
          },
          {
            path: "/reports",
            element: <Reports />,
          },
          {
            path: "/meeting-summaries",
            element: <AllMeetingSummaries />,
          },
          {
            path: "*",
            element: <NotFound />,
          },
        ])
      }
    />
  );
};

export default App;
