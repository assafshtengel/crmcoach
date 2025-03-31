
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
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
import { supabase } from "./lib/supabase";

// Coach redirect component - checks if user is a coach and redirects to /index if so
const CoachRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkCoachStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check if the user is a coach (exists in the coaches table)
          const { data: coachData, error: coachError } = await supabase
            .from('coaches')
            .select('id')
            .eq('id', user.id)
            .single();
          
          // If the user is a coach, redirect to the index page
          if (!coachError && coachData) {
            // Only redirect if we're not already on /index
            if (location.pathname === '/') {
              navigate('/index');
            }
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking coach status:", error);
        setLoading(false);
      }
    };
    
    checkCoachStatus();
  }, [navigate, location.pathname]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>;
  }

  return <Outlet />;
};

const routes = createBrowserRouter([
  {
    path: "/",
    element: <CoachRedirect />,
    children: [
      {
        path: "",
        element: <App />,
      }
    ]
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
