import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideosTab } from "@/components/player/VideosTab";
import { useScreenSize } from "@/hooks/use-screen-size";
import { Bell, User, LogOut, Calendar, Target, FileText, Video, CheckSquare, PencilLine, Clock, ArrowRight, ExternalLink, ChevronRight, ClipboardCheck, ClipboardList } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AnimatePresence, motion } from "framer-motion";
import type { Json } from "@/integrations/supabase/types";
import { useIsMobile } from "@/hooks/use-mobile";
interface PlayerData {
  id: string;
  full_name: string;
  email: string;
  sport_field?: string;
  club?: string;
  year_group?: string;
  profile_image?: string;
  coach_id?: string;
}
interface Notification {
  id: string;
  title: string;
  type: "video" | "message";
  read: boolean;
  contentId: string;
  created_at: string;
}
interface Goal {
  id: string;
  title: string;
  term: "short" | "long";
  status: "active" | "completed";
}
interface PlayerGoals {
  id: string;
  player_id: string;
  short_term_goals: Goal[];
  long_term_goals: Goal[];
  created_at?: string;
  updated_at?: string;
}
interface SessionSummary {
  id: string;
  achieved_goals: string[];
  additional_notes?: string;
  coach_id: string;
  created_at: string;
  future_goals: string[];
  next_session_focus?: string;
  player_id: string;
  progress_rating: number;
  summary_text?: string;
  tools_used: string[];
  session?: {
    id: string;
    session_date: string;
    session_time: string;
  };
}
const PlayerProfileView = () => {
  const navigate = useNavigate();
  const {
    isMobile
  } = useScreenSize();
  const isMobileScreen = useIsMobile(); // Using the more reliable mobile hook for consistent detection
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [sessionSummaries, setSessionSummaries] = useState<SessionSummary[]>([]);
  const [shortTermGoals, setShortTermGoals] = useState<Goal[]>([]);
  const [longTermGoals, setLongTermGoals] = useState<Goal[]>([]);
  const [playerGoalsId, setPlayerGoalsId] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editedGoalText, setEditedGoalText] = useState("");
  const [savingGoals, setSavingGoals] = useState(false);
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loadingQuestionnaires, setLoadingQuestionnaires] = useState(false);
  const fetchPlayerQuestionnaires = async (playerId: string) => {
    try {
      setLoadingQuestionnaires(true);
      const {
        data,
        error
      } = await supabase.from('assigned_questionnaires').select(`
          *,
          coach:coach_id(full_name)
        `).eq('player_id', playerId).eq('status', 'pending');
      if (error) {
        console.error("Error fetching questionnaires:", error);
        throw error;
      }
      const questionnairesWithTitles = data?.map(q => {
        return {
          ...q,
          questionnaire_title: `שאלון ${q.questionnaire_id}`
        };
      }) || [];
      setQuestionnaires(questionnairesWithTitles);
    } catch (error) {
      console.error("Error in fetchPlayerQuestionnaires:", error);
    } finally {
      setLoadingQuestionnaires(false);
    }
  };
  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        setLoading(true);
        const playerSession = localStorage.getItem("playerSession");
        if (!playerSession) {
          toast.error("לא נמצאה התחברות תקפה");
          navigate("/player-auth");
          return;
        }
        const sessionData = JSON.parse(playerSession);
        const {
          data,
          error
        } = await supabase.from("players").select("*").eq("id", sessionData.id).single();
        if (error) {
          throw error;
        }
        setPlayer(data);
        await fetchPlayerQuestionnaires(data.id);
        await loadPlayerGoals(data.id);
        const {
          data: videosData,
          error: videosError
        } = await supabase.from("videos").select("*").eq("coach_id", data.coach_id).order("created_at", {
          ascending: false
        }).limit(5);
        if (videosError) {
          console.error("Error fetching videos:", videosError);
        } else if (videosData) {
          const videoNotifications: Notification[] = videosData.map(video => ({
            id: video.id,
            title: video.title,
            type: "video",
            read: false,
            contentId: video.id,
            created_at: video.created_at
          }));
          setNotifications(videoNotifications);
        }
        if (data.coach_id) {
          console.log("coach_id", data.coach_id);
          console.log("player_id", data.id);
          const {
            data: sessionsData,
            error: sessionsError
          } = await supabase.from("sessions").select("*").eq("player_id", data.id).eq("coach_id", data.coach_id).gte("session_date", new Date().toISOString().split('T')[0]).order("session_date", {
            ascending: true
          }).limit(20);
          if (!sessionsError && sessionsData) {
            setUpcomingSessions(sessionsData);
          }
          const {
            data: summariesData,
            error: summariesError
          } = await supabase.from("session_summaries").select(`
              *,
              session:sessions (
                id,
                session_date,
                session_time
              )
            `).eq("player_id", data.id).order("created_at", {
            ascending: false
          });
          console.log("summariesData", summariesData);
          if (!summariesError && summariesData) {
            const uniqueSummaries = new Map();
            summariesData.forEach(summary => {
              if (summary.session && summary.session.id && !uniqueSummaries.has(summary.session.id)) {
                uniqueSummaries.set(summary.session.id, summary);
              }
            });
            setSessionSummaries(Array.from(uniqueSummaries.values()));
          } else if (summariesError) {
            console.error("Error fetching session summaries:", summariesError);
            toast.error("שגיאה בטעינת סיכומי המפגשים");
          }
        }
      } catch (error: any) {
        console.error("Error loading player data:", error);
        toast.error("שגיאה בטעינת פרטי השחקן");
        navigate("/player-auth");
      } finally {
        setLoading(false);
      }
    };
    loadPlayerData();
  }, [navigate]);
  const loadPlayerGoals = async (playerId: string) => {
    try {
      const {
        data,
        error
      } = await supabase.from("player_goals").select("*").eq("player_id", playerId).maybeSingle();
      if (error) {
        console.error("Error fetching player goals:", error);
        return;
      }
      if (data) {
        setShortTermGoals(data.short_term_goals as unknown as Goal[]);
        setLongTermGoals(data.long_term_goals as unknown as Goal[]);
        setPlayerGoalsId(data.id);
      } else {
        const defaultShortTermGoals: Goal[] = [{
          id: "1",
          title: "לשפר דיוק בבעיטות חופשיות",
          term: "short",
          status: "active"
        }, {
          id: "2",
          title: "לעבוד על אסרטיביות בהגנה",
          term: "short",
          status: "active"
        }, {
          id: "3",
          title: "להגביר יכולות קבלת החלטות תחת לחץ",
          term: "short",
          status: "active"
        }];
        const defaultLongTermGoals: Goal[] = [{
          id: "4",
          title: "להיות שחקן הרכב קבוע בקבוצה",
          term: "long",
          status: "active"
        }, {
          id: "5",
          title: "לשפר מדדים גופניים כלליים ב-15%",
          term: "long",
          status: "active"
        }, {
          id: "6",
          title: "להפוך למנהיג בקבוצה",
          term: "long",
          status: "active"
        }];
        setShortTermGoals(defaultShortTermGoals);
        setLongTermGoals(defaultLongTermGoals);
        await saveGoalsToDatabase(playerId, defaultShortTermGoals, defaultLongTermGoals);
      }
    } catch (error) {
      console.error("Error in loadPlayerGoals:", error);
    }
  };
  const saveGoalsToDatabase = async (playerId: string, shortGoals: Goal[], longGoals: Goal[]) => {
    try {
      setSavingGoals(true);
      if (playerGoalsId) {
        const {
          error
        } = await supabase.from("player_goals").update({
          short_term_goals: shortGoals as unknown as Json,
          long_term_goals: longGoals as unknown as Json,
          updated_at: new Date().toISOString()
        }).eq("id", playerGoalsId);
        if (error) throw error;
      } else {
        const {
          data,
          error
        } = await supabase.from("player_goals").insert({
          player_id: playerId,
          short_term_goals: shortGoals as unknown as Json,
          long_term_goals: longGoals as unknown as Json
        }).select("id").single();
        if (error) throw error;
        if (data) setPlayerGoalsId(data.id);
      }
      toast.success("המטרות נשמרו בהצלחה");
    } catch (error) {
      console.error("Error saving goals to database:", error);
      toast.error("שגיאה בשמירת המטרות");
    } finally {
      setSavingGoals(false);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("playerSession");
    toast.success("התנתקת בהצלחה");
    navigate("/player-auth");
  };
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prevNotifications => prevNotifications.map(notification => notification.id === notificationId ? {
      ...notification,
      read: true
    } : notification));
  };
  const unreadCount = notifications.filter(n => !n.read).length;
  const handleEditGoal = (goalId: string, currentTitle: string) => {
    setEditingGoal(goalId);
    setEditedGoalText(currentTitle);
  };
  const handleSaveGoal = async (goalId: string, term: "short" | "long") => {
    if (!player) return;
    let updatedShortTermGoals = [...shortTermGoals];
    let updatedLongTermGoals = [...longTermGoals];
    if (term === "short") {
      updatedShortTermGoals = shortTermGoals.map(goal => goal.id === goalId ? {
        ...goal,
        title: editedGoalText
      } : goal);
      setShortTermGoals(updatedShortTermGoals);
    } else {
      updatedLongTermGoals = longTermGoals.map(goal => goal.id === goalId ? {
        ...goal,
        title: editedGoalText
      } : goal);
      setLongTermGoals(updatedLongTermGoals);
    }
    setEditingGoal(null);
    await saveGoalsToDatabase(player.id, updatedShortTermGoals, updatedLongTermGoals);
    toast.success("המטרה עודכנה בהצלחה");
  };
  const handleToggleGoalStatus = async (goalId: string, term: "short" | "long") => {
    if (!player) return;
    let updatedShortTermGoals = [...shortTermGoals];
    let updatedLongTermGoals = [...longTermGoals];
    if (term === "short") {
      updatedShortTermGoals = shortTermGoals.map(goal => goal.id === goalId ? {
        ...goal,
        status: goal.status === "active" ? "completed" : "active"
      } : goal);
      setShortTermGoals(updatedShortTermGoals);
    } else {
      updatedLongTermGoals = longTermGoals.map(goal => goal.id === goalId ? {
        ...goal,
        status: goal.status === "active" ? "completed" : "active"
      } : goal);
      setLongTermGoals(updatedLongTermGoals);
    }
    await saveGoalsToDatabase(player.id, updatedShortTermGoals, updatedLongTermGoals);
    toast.success("סטטוס המטרה עודכן בהצלחה");
  };
  const handleAnswerQuestionnaire = (questionnaireId: string) => {
    navigate(`/player/questionnaire/${questionnaireId}`);
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F2FCE2] to-[#E5DEFF]">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>;
  }
  if (!player) {
    return <div className="page-container">
        <div className="content-container">
          <Card className="shadow-lg">
            <CardContent className="p-8 text-center">
              <p className="text-red-500 mb-4 font-medium">לא נמצאו פרטי שחקן. אנא התחבר מחדש.</p>
              <Button onClick={() => navigate("/player-auth")} className="bg-primary hover:bg-primary/90 transition-all">
                חזרה לדף ההתחברות
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>;
  }
  const profileImageUrl = player.profile_image || 'https://api.dicebear.com/7.x/bottts/svg?seed=user123';
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };
  const renderTabs = () => <TabsList className={`tabs-list w-full rounded-xl grid ${isMobileScreen ? 'grid-cols-4 gap-1 p-1' : 'grid-cols-8 gap-0'} text-xs font-medium`}>
      <TabsTrigger value="profile" className="tab-trigger">
        <User className={`${isMobileScreen ? 'h-4 w-4' : 'h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2'}`} />
        {!isMobileScreen && <span className="hidden sm:inline">פרופיל</span>}
      </TabsTrigger>
      <TabsTrigger value="videos" className="tab-trigger relative">
        <Video className={`${isMobileScreen ? 'h-4 w-4' : 'h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2'}`} />
        {!isMobileScreen && <span className="hidden sm:inline">סרטונים</span>}
        {unreadCount > 0 && <Badge variant="default" className={`absolute ${isMobileScreen ? '-top-1 -right-1' : 'ml-1 md:ml-2'} bg-red-500 h-4 min-w-4 md:h-5 md:min-w-5 flex items-center justify-center text-[10px] md:text-xs`}>
            {unreadCount}
          </Badge>}
      </TabsTrigger>
      <TabsTrigger value="sessions" className="tab-trigger">
        <Calendar className={`${isMobileScreen ? 'h-4 w-4' : 'h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2'}`} />
        {!isMobileScreen && <span className="hidden sm:inline">מפגשים</span>}
      </TabsTrigger>
      <TabsTrigger value="summaries" className="tab-trigger">
        <FileText className={`${isMobileScreen ? 'h-4 w-4' : 'h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2'}`} />
        {!isMobileScreen && <span className="hidden sm:inline">סיכומים</span>}
      </TabsTrigger>
    </TabsList>;
  const renderMobileMoreMenu = () => {
    if (!isMobileScreen) return null;
    return <div className="grid grid-cols-4 gap-3 mt-4">
        <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer bg-white/90 hover:bg-white" onClick={() => setActiveTab('questionnaires')}>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs font-medium text-gray-800">שאלונים</p>
          </CardContent>
        </Card>
        
        <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer bg-white/90 hover:bg-white" onClick={() => setActiveTab('belief-breaking')}>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
              <ExternalLink className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs font-medium text-gray-800">שחרור אמונות</p>
          </CardContent>
        </Card>
        
        <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer bg-white/90 hover:bg-white" onClick={() => setActiveTab('goals')}>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs font-medium text-gray-800">מטרות</p>
          </CardContent>
        </Card>
        
        <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer bg-white/90 hover:bg-white" onClick={() => setActiveTab('evaluation')}>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
              <ClipboardCheck className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs font-medium text-gray-800">איבחון</p>
          </CardContent>
        </Card>
      </div>;
  };
  const cardAnimationProps = {
    initial: {
      opacity: 0,
      y: 20
    },
    animate: {
      opacity: 1,
      y: 0
    },
    exit: {
      opacity: 0,
      y: -20
    },
    transition: {
      duration: 0.3
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-[#F2FCE2] to-[#E5DEFF]">
      <header className="w-full bg-primary text-white py-3 shadow-lg sticky top-0 z-10 backdrop-blur-sm bg-opacity-95">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-lg md:text-2xl font-bold">פרופיל שחקן</h1>
          <div className="flex items-center gap-2">
            <Popover open={showNotifications} onOpenChange={setShowNotifications}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10 transition-colors">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] bg-red-500 shadow-sm" variant="default">
                      {unreadCount}
                    </Badge>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">התראות</h3>
                  {notifications.length === 0 ? <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                      <p>אין התראות חדשות</p>
                    </div> : <ScrollArea className="max-h-[300px] overflow-y-auto">
                      <div className="space-y-2">
                        {notifications.map(notification => <div key={notification.id} className={`p-3 border rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'} cursor-pointer hover:shadow-sm transition-all`} onClick={() => {
                      if (notification.type === 'video') {
                        markNotificationAsRead(notification.id);
                        setActiveTab('videos');
                        setShowNotifications(false);
                      }
                    }}>
                            <div className="flex justify-between items-start">
                              <div className="flex gap-3 items-start">
                                <div className="bg-primary/10 p-2 rounded-full text-primary">
                                  <Video className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="font-medium">{notification.title}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {notification.type === 'video' ? 'סרטון חדש' : 'הודעה חדשה'}
                                  </p>
                                </div>
                              </div>
                              {!notification.read && <Badge variant="default" className="text-xs bg-primary shadow-sm">חדש</Badge>}
                            </div>
                          </div>)}
                      </div>
                    </ScrollArea>}
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-white/10 transition-colors">
              <LogOut className="h-4 w-4 mr-2" />
              {!isMobile && "התנתק"}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <motion.div className="mb-6 overflow-hidden shadow-lg rounded-xl" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
          <div className="relative h-24 md:h-32 bg-gradient-to-r from-primary to-[#7E69AB] rounded-t-xl"></div>
          <div className="bg-white rounded-b-xl p-0">
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 relative -mt-12">
              <div className="w-24 h-24 relative rounded-full overflow-hidden flex-shrink-0 border-4 border-white bg-white shadow-lg">
                
              </div>
              <div className="text-center md:text-right flex-1 mt-6 md:mt-12">
                <h2 className="text-2xl font-bold text-gray-900">{player.full_name}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                  {player.sport_field && <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 shadow-sm">
                      {player.sport_field}
                    </Badge>}
                  {player.club && <Badge variant="outline" className="bg-gray-100 text-gray-800 shadow-sm">
                      {player.club}
                    </Badge>}
                  {player.year_group && <Badge variant="outline" className="bg-gray-100 text-gray-800 shadow-sm">
                      {player.year_group}
                    </Badge>}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 player-tabs modern-tabs">
          {renderTabs()}
          {isMobileScreen && renderMobileMoreMenu()}
          
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -10
          }} transition={{
            duration: 0.2
          }}>
              <TabsContent value="profile" className="space-y-4 mt-4">
                <Card className="overflow-hidden shadow-md">
                  <CardHeader className="bg-gradient-to-r from-[#F2FCE2]/50 to-[#E5DEFF]/50 pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="h-5 w-5 text-primary" />
                      פרטים אישיים
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">שם מלא</p>
                        <p className="font-medium">{player.full_name}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">כתובת אימייל</p>
                        <p dir="ltr" className="font-mono text-sm">{player.email}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">ענף ספורט</p>
                        <p className="font-medium">{player.sport_field || "-"}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">מועדון</p>
                          <p className="font-medium">{player.club || "-"}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">שכבת גיל</p>
                          <p className="font-medium">{player.year_group || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="videos">
                <VideosTab coachId={player?.coach_id || ''} playerId={player?.id} onWatchVideo={videoId => {
                const notificationIndex = notifications.findIndex(n => n.id === videoId && !n.read);
                if (notificationIndex !== -1) {
                  markNotificationAsRead(videoId);
                }
              }} />
              </TabsContent>
              
              <TabsContent value="sessions">
                <Card className="shadow-md">
                  <CardHeader className="bg-gradient-to-r from-[#F2FCE2]/50 to-[#E5DEFF]/50 pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                      מפגשים מתוכננים
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {upcomingSessions.length > 0 ? <div className="space-y-4">
                        {upcomingSessions.map(session => <motion.div key={session.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-all bg-white" {...cardAnimationProps}>
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                              <div className="flex gap-4 items-start">
                                <div className="bg-primary/10 p-3 rounded-full text-primary flex-shrink-0">
                                  <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="font-semibold text-lg">{formatDate(session.session_date)}</p>
                                  <p className="text-gray-500">{session.session_time}</p>
                                  {session.location && <p className="text-gray-700 mt-1">מיקום: {session.location}</p>}
                                </div>
                              </div>
                              <Badge variant="outline" className="status-badge active self-start md:self-center shadow-sm">
                                מתוכנן
                              </Badge>
                            </div>
                            {session.notes && <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                                <p className="text-sm text-gray-600">{session.notes}</p>
                              </div>}
                          </motion.div>)}
                      </div> : <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">אין מפגשים מתוכננים כרגע</p>
                      </div>}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="summaries">
                <Card className="shadow-md">
                  <CardHeader className="bg-gradient-to-r from-[#F2FCE2]/50 to-[#E5DEFF]/50 pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-primary" />
                      סיכומי מפגשים
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {sessionSummaries.length > 0 ? <div className="space-y-4">
                        {sessionSummaries.map(summary => <motion.div key={summary.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-all bg-white" {...cardAnimationProps}>
                            <div className="flex flex-col md:flex-row justify-between gap-4 mb-3">
                              <div className="flex gap-4 items-start w-full">
                                <div className="bg-primary/10 p-3 rounded-full text-primary flex-shrink-0">
                                  <FileText className="h-5 w-5" />
                                </div>
                                <div className="w-full">
                                  <div className="flex items-center justify-between gap-2">
                                    <div>
                                      <p className="font-semibold text-lg">
                                        {summary.session?.session_date ? formatDate(summary.session.session_date) : formatDate(summary.created_at)}
                                      </p>
                                      {summary.session?.session_time && <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                          {summary.session.session_time}
                                        </Badge>}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, index) => <div key={index} className={`h-5 w-5 ${index < summary.progress_rating ? 'text-yellow-400' : 'text-gray-200'}`}>
                                          ★
                                        </div>)}
                                    </div>
                                  </div>
                                  
                                  {summary.summary_text && <div className="mt-4">
                                      <p className="text-sm font-medium text-gray-600">סיכום המפגש:</p>
                                      <p className="text-sm text-gray-800 whitespace-pre-wrap mt-1">{summary.summary_text}</p>
                                    </div>}

                                  {summary.achieved_goals && summary.achieved_goals.length > 0 && <div className="mt-4">
                                      <p className="text-sm font-medium text-gray-600">מטרות שהושגו:</p>
                                      <p className="text-sm text-gray-800 whitespace-pre-wrap mt-1 text-center"> {summary?.achieved_goals[0]}</p>
                                    </div>}

                                  {summary.tools_used && summary.tools_used.length > 0 && <div className="mt-4">
                                      <p className="text-sm font-medium text-gray-600">כלים שהיו בשימוש:</p>
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        {summary.tools_used.map((tool, index) => <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            {tool}
                                          </Badge>)}
                                      </div>
                                    </div>}

                                  {summary.additional_notes && <div className="mt-4">
                                      <p className="text-sm font-medium text-gray-600">הערות נוספות:</p>
                                      <p className="text-sm text-gray-800 whitespace-pre-wrap mt-1">{summary.additional_notes}</p>
                                    </div>}

                                  {summary.next_session_focus && <div className="mt-4">
                                      <p className="text-sm font-medium text-gray-600">מיקוד למפגש הבא:</p>
                                      <p className="text-sm text-gray-800 whitespace-pre-wrap mt-1">{summary.next_session_focus}</p>
                                    </div>}

                                  <p className="text-xs text-gray-500 mt-4">
                                    נוצר בתאריך: {formatDate(summary.created_at)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>)}
                      </div> : <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">אין סיכומי מפגשים זמינים כרגע</p>
                      </div>}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="questionnaires">
                <Card className="shadow-md">
                  <CardHeader className="bg-gradient-to-r from-[#F2FCE2]/50 to-[#E5DEFF]/50 pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ClipboardList className="h-5 w-5 text-primary" />
                      שאלונים לביצוע
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {loadingQuestionnaires ? <div className="flex justify-center p-8">
                        <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full"></div>
                      </div> : questionnaires.length > 0 ? <div className="space-y-4">
                        {questionnaires.map(questionnaire => <motion.div key={questionnaire.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-all bg-white" {...cardAnimationProps}>
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                              <div className="flex gap-4 items-start">
                                <div className="bg-primary/10 p-3 rounded-full text-primary flex-shrink-0">
                                  <ClipboardList className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="font-semibold text-lg">{questionnaire.questionnaire_title}</p>
                                  <p className="text-gray-500">נשלח ע"י: {questionnaire.coach?.full_name || "המאמן שלך"}</p>
                                  <p className="text-gray-500 text-sm mt-1">
                                    תאריך: {formatDate(questionnaire.created_at)}
                                  </p>
                                </div>
                              </div>
                              <Button variant="outline" className="self-start md:self-center bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 hover:text-primary" onClick={() => handleAnswerQuestionnaire(questionnaire.id)}>
                                מלא שאלון
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </Button>
                            </div>
                          </motion.div>)}
                      </div> : <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">אין שאלונים לביצוע כרגע</p>
                      </div>}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="goals">
                <Card className="shadow-md">
                  <CardHeader className="bg-gradient-to-r from-[#F2FCE2]/50 to-[#E5DEFF]/50 pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="h-5 w-5 text-primary" />
                      המטרות שלי
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                          <Badge className="bg-blue-500">
                            <Clock className="h-3 w-3 mr-1" />
                            מטרות לטווח קצר
                          </Badge>
                        </h3>
                        <div className="space-y-3">
                          {shortTermGoals.map(goal => <div key={goal.id} className={`p-4 rounded-lg border ${goal.status === 'completed' ? 'bg-green-50 border-green-100' : 'bg-white border-gray-200'}`}>
                              {editingGoal === goal.id ? <div className="flex flex-col gap-2">
                                  <Textarea value={editedGoalText} onChange={e => setEditedGoalText(e.target.value)} className="min-h-[80px]" />
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setEditingGoal(null)}>
                                      ביטול
                                    </Button>
                                    <Button size="sm" onClick={() => handleSaveGoal(goal.id, 'short')} disabled={savingGoals}>
                                      {savingGoals ? 'שומר...' : 'שמור'}
                                    </Button>
                                  </div>
                                </div> : <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3">
                                    <Button variant="ghost" size="icon" className={`rounded-full h-6 w-6 ${goal.status === 'completed' ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`} onClick={() => handleToggleGoalStatus(goal.id, 'short')}>
                                      <CheckSquare className="h-4 w-4" />
                                    </Button>
                                    <p className={`flex-1 text-gray-800 ${goal.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                                      {goal.title}
                                    </p>
                                  </div>
                                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 h-7 w-7" onClick={() => handleEditGoal(goal.id, goal.title)}>
                                    <PencilLine className="h-4 w-4" />
                                  </Button>
                                </div>}
                            </div>)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                          <Badge className="bg-purple-500">
                            <Target className="h-3 w-3 mr-1" />
                            מטרות לטווח ארוך
                          </Badge>
                        </h3>
                        <div className="space-y-3">
                          {longTermGoals.map(goal => <div key={goal.id} className={`p-4 rounded-lg border ${goal.status === 'completed' ? 'bg-green-50 border-green-100' : 'bg-white border-gray-200'}`}>
                              {editingGoal === goal.id ? <div className="flex flex-col gap-2">
                                  <Textarea value={editedGoalText} onChange={e => setEditedGoalText(e.target.value)} className="min-h-[80px]" />
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setEditingGoal(null)}>
                                      ביטול
                                    </Button>
                                    <Button size="sm" onClick={() => handleSaveGoal(goal.id, 'long')} disabled={savingGoals}>
                                      {savingGoals ? 'שומר...' : 'שמור'}
                                    </Button>
                                  </div>
                                </div> : <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3">
                                    <Button variant="ghost" size="icon" className={`rounded-full h-6 w-6 ${goal.status === 'completed' ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`} onClick={() => handleToggleGoalStatus(goal.id, 'long')}>
                                      <CheckSquare className="h-4 w-4" />
                                    </Button>
                                    <p className={`flex-1 text-gray-800 ${goal.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                                      {goal.title}
                                    </p>
                                  </div>
                                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 h-7 w-7" onClick={() => handleEditGoal(goal.id, goal.title)}>
                                    <PencilLine className="h-4 w-4" />
                                  </Button>
                                </div>}
                            </div>)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>;
};
export default PlayerProfileView;