import {
  createBrowserRouter,
} from "react-router-dom";
import App from "./App";
import PlayerAuth from "./pages/PlayerAuth";
import CoachAuth from "./pages/CoachAuth";
import NewPlayerForm from "./pages/NewPlayerForm";
import EditPlayerForm from "./pages/EditPlayerForm";
import PlayersDashboard from "./pages/PlayersDashboard";
import SessionsDashboard from "./pages/SessionsDashboard";
import NewSessionForm from "./pages/NewSessionForm";
import EditSessionForm from "./pages/EditSessionForm";
import CoachesDashboard from "./pages/CoachesDashboard";
import NewCoachForm from "./pages/NewCoachForm";
import EditCoachForm from "./pages/EditCoachForm";
import SettingsDashboard from "./pages/SettingsDashboard";
import NotificationsDashboard from "./pages/NotificationsDashboard";
import SessionSummaryForm from "./pages/SessionSummaryForm";
import SessionSummariesDashboard from "./pages/SessionSummariesDashboard";
import VideosDashboard from "./pages/VideosDashboard";
import NewVideoForm from "./pages/NewVideoForm";
import EditVideoForm from "./pages/EditVideoForm";
import PlayerProfileView from "./pages/player/PlayerProfileView";
import PlayerQuestionnaireForm from "./pages/player/PlayerQuestionnaireForm";
import PlayerGameEvaluation from "./pages/player/PlayerGameEvaluation";
import QuestionnairesDashboard from "./pages/QuestionnairesDashboard";
import NewQuestionnaireForm from "./pages/NewQuestionnaireForm";
import EditQuestionnaireForm from "./pages/EditQuestionnaireForm";
import AssignedQuestionnairesDashboard from "./pages/AssignedQuestionnairesDashboard";
import AssignQuestionnaireForm from "./pages/AssignQuestionnaireForm";
import PlayerProfileAlternative from "./pages/player/PlayerProfileAlternative";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/coach-auth",
    element: <CoachAuth />,
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
    path: "/players",
    element: <PlayersDashboard />,
  },
  {
    path: "/sessions",
    element: <SessionsDashboard />,
  },
  {
    path: "/new-session",
    element: <NewSessionForm />,
  },
  {
    path: "/edit-session/:id",
    element: <EditSessionForm />,
  },
  {
    path: "/coaches",
    element: <CoachesDashboard />,
  },
  {
    path: "/new-coach",
    element: <NewCoachForm />,
  },
  {
    path: "/edit-coach/:id",
    element: <EditCoachForm />,
  },
  {
    path: "/settings",
    element: <SettingsDashboard />,
  },
  {
    path: "/notifications",
    element: <NotificationsDashboard />,
  },
  {
    path: "/session-summary/:session_id",
    element: <SessionSummaryForm />,
  },
  {
    path: "/session-summaries",
    element: <SessionSummariesDashboard />,
  },
  {
    path: "/videos",
    element: <VideosDashboard />,
  },
  {
    path: "/new-video",
    element: <NewVideoForm />,
  },
  {
    path: "/edit-video/:id",
    element: <EditVideoForm />,
  },
  
  // Player routes
  {
    path: "/player-auth",
    element: <PlayerAuth />,
  },
  {
    path: "/player/profile",
    element: <PlayerProfileView />,
  },
  {
    path: "/player/profile-alt",
    element: <PlayerProfileAlternative />,  // Add the new alternative profile route
  },
  {
    path: "/player/questionnaire/:questionnaireId",
    element: <PlayerQuestionnaireForm />,
  },
  {
    path: "/player/game-evaluation",
    element: <PlayerGameEvaluation />,
  },
  {
    path: "/questionnaires",
    element: <QuestionnairesDashboard />,
  },
  {
    path: "/new-questionnaire",
    element: <NewQuestionnaireForm />,
  },
  {
    path: "/edit-questionnaire/:id",
    element: <EditQuestionnaireForm />,
  },
  {
    path: "/assigned-questionnaires",
    element: <AssignedQuestionnairesDashboard />,
  },
  {
    path: "/assign-questionnaire",
    element: <AssignQuestionnaireForm />,
  },
]);

export default routes;
