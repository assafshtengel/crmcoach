
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
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

// קומפוננטה שמטפלת בניתוב השחקן
const PlayerRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // הצגת הודעת פופ-אפ
    toast({
      title: "טעינת עמוד המאמן שלך...",
      duration: 2000,
    });
    
    // ניתוב לעמוד index לאחר השהייה קצרה
    const timer = setTimeout(() => {
      navigate('/index');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  // מציג מסך ריק בזמן ההמתנה
  return <div className="min-h-screen bg-gradient-to-br from-sage-50 to-white py-8 px-4 md:px-8"></div>;
};

const routes = createBrowserRouter([
  {
    path: "/",
    element: <PlayerRedirect />,
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
  {
    path: "/index",
    element: <Index />,
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
