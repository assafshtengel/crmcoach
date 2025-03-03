
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

const App = () => {
  return (
    <RouterProvider
      router={
        createBrowserRouter([
          {
            path: "/",
            element: <Dashboard />,
          },
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
