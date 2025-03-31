
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
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Index from "./pages/Index";

// Component to check if user is a coach and redirect accordingly
const CoachRedirect = () => {
  const [loading, setLoading] = useState(true);
  const [isCoach, setIsCoach] = useState(false);
  
  useEffect(() => {
    const checkIfCoach = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check if the user is a coach
          const { data: coachData, error: coachError } = await supabase
            .from('coaches')
            .select('id')
            .eq('id', user.id)
            .single();
          
          setIsCoach(!coachError && coachData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking if user is coach:", error);
        setLoading(false);
      }
    };
    
    checkIfCoach();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  // If user is a coach, redirect to /index, otherwise render App
  return isCoach ? <Navigate to="/index" replace /> : <App />;
};

const routes = createBrowserRouter([
  {
    path: "/",
    element: <CoachRedirect />,
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
