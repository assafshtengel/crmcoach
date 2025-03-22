import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PlayerAuth from "./pages/PlayerAuth";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import ActionPlan from "./pages/ActionPlan";
import MentalPrepFormPage from "./pages/MentalPrepFormPage";
import AdminDashboard from "./pages/AdminDashboard";
import QuestionnairesPage from "./pages/QuestionnairesPage";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = localStorage.getItem("sb-session");

  if (!isLoggedIn) {
    return <Navigate to="/auth" />;
  }

  return children;
};

const PlayerAuthGuard = ({ children }: { children: React.ReactNode }) => {
  const playerSession = localStorage.getItem("playerSession");

  if (!playerSession) {
    return <Navigate to="/player/auth" />;
  }

  return children;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthGuard>
        <Index />
      </AuthGuard>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <AuthGuard>
        <Dashboard />
      </AuthGuard>
    ),
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/player/auth",
    element: <PlayerAuth />,
  },
  {
    path: "/action-plan",
    element: (
      <PlayerAuthGuard>
        <ActionPlan />
      </PlayerAuthGuard>
    ),
  },
  {
    path: "/mental-prep",
    element: (
      <PlayerAuthGuard>
        <MentalPrepFormPage />
      </PlayerAuthGuard>
    ),
  },
  {
    path: "/player/profile",
    element: (
      <PlayerAuthGuard>
        <Index />
      </PlayerAuthGuard>
    ),
  },
  {
    path: "/admin/dashboard",
    element: (
      <AuthGuard>
        <AdminDashboard />
      </AuthGuard>
    ),
  },
  {
    path: '/questionnaires',
    element: (
      <AuthGuard>
        <QuestionnairesPage />
      </AuthGuard>
    ),
  },
]);

export const Routes = () => {
  return <RouterProvider router={router} />;
};
