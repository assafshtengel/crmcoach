import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PlayersList from "./pages/PlayersList";
import PlayerAuthPage from "./pages/auth/PlayerAuthPage";
import { PlayerProfileGuard } from "./components/auth/PlayerProfileGuard";
import Dashboard from "./pages/Dashboard"; // Assuming you have a Dashboard component

const App = () => {
  return (
    <RouterProvider
      router={
        createBrowserRouter([
          {
            path: "/",
            element: <PlayersList />,
          },
          {
            path: "/player-auth",
            element: <PlayerAuthPage />,
          },
          {
            path: "/dashboard/player-profile/:playerId",
            element: (
              <PlayerProfileGuard>
                <Dashboard />
              </PlayerProfileGuard>
            ),
          },
        ])
      }
    />
  );
};

export default App;
