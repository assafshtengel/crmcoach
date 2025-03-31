
import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
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
import { AuthGuard } from "./components/auth/AuthGuard";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <AuthGuard><CoachRedirect /></AuthGuard>,
  },
  {
    path: "/index",
    element: <AuthGuard><Index /></AuthGuard>,
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

// This component handles the redirect logic for coaches while ensuring players see App
function CoachRedirect() {
  const { isCoach, isLoading } = useCoachCheck();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  return isCoach ? <Navigate to="/index" replace /> : <App />;
}

// This hook checks if the authenticated user is a coach
function useCoachCheck() {
  const [isCoach, setIsCoach] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkIfCoach = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: coachData, error: coachError } = await supabase
            .from('coaches')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();
            
          setIsCoach(!coachError && !!coachData);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking coach status:", error);
        setIsLoading(false);
      }
    };
    
    checkIfCoach();
  }, []);
  
  return { isCoach, isLoading };
}

export default routes;
