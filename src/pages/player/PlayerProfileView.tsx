
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideosTab } from "@/components/player/VideosTab";
import { Bell, User, LogOut, Calendar, Target, FileText, Video, CheckSquare, PencilLine, Clock, ArrowRight } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

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
  description?: string;
  term: "short" | "long";
  status: "active" | "completed";
}

const PlayerProfileView = () => {
  const navigate = useNavigate();
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [sessionSummaries, setSessionSummaries] = useState([]);
  const [shortTermGoals, setShortTermGoals] = useState<Goal[]>([
    { id: "1", title: "לשפר דיוק בבעיטות חופשיות", term: "short", status: "active" },
    { id: "2", title: "לעבוד על אסרטיביות בהגנה", term: "short", status: "active" },
    { id: "3", title: "להגביר יכולות קבלת החלטות תחת לחץ", term: "short", status: "active" }
  ]);
  const [longTermGoals, setLongTermGoals] = useState<Goal[]>([
    { id: "4", title: "להיות שחקן הרכב קבוע בקבוצה", term: "long", status: "active" },
    { id: "5", title: "לשפר מדדים גופניים כלליים ב-15%", term: "long", status: "active" },
    { id: "6", title: "להפוך למנהיג בקבוצה", term: "long", status: "active" }
  ]);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editedGoalText, setEditedGoalText] = useState("");

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
        
        const { data, error } = await supabase
          .from("players")
          .select("*")
          .eq("id", sessionData.id)
          .single();

        if (error) {
          throw error;
        }

        setPlayer(data);
        
        // Load videos and create notifications
        const { data: videosData, error: videosError } = await supabase
          .from("videos")
          .select("*")
          .eq("coach_id", data.coach_id)
          .order("created_at", { ascending: false })
          .limit(5);
          
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

        // Load upcoming sessions
        if (data.coach_id) {
          const { data: sessionsData, error: sessionsError } = await supabase
            .from("sessions")
            .select("*")
            .eq("player_id", data.id)
            .eq("coach_id", data.coach_id)
            .gte("session_date", new Date().toISOString().split('T')[0])
            .order("session_date", { ascending: true })
            .limit(5);

          if (!sessionsError && sessionsData) {
            setUpcomingSessions(sessionsData);
          }

          // Load session summaries - Fix to prevent duplicates by adding unique session_id filter
          const { data: summariesData, error: summariesError } = await supabase
            .from("session_summaries")
            .select(`
              *,
              session:sessions (
                id,
                session_date,
                session_time
              )
            `)
            .eq("coach_id", data.coach_id)
            .order("created_at", { ascending: false })
            .limit(5);

          if (!summariesError && summariesData) {
            // Make sure each session only appears once by using a Map with session_id as key
            const uniqueSummaries = new Map();
            
            summariesData.forEach(summary => {
              if (summary.session && summary.session.id && !uniqueSummaries.has(summary.session.id)) {
                uniqueSummaries.set(summary.session.id, summary);
              }
            });
            
            setSessionSummaries(Array.from(uniqueSummaries.values()));
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

  const handleLogout = () => {
    localStorage.removeItem("playerSession");
    toast.success("התנתקת בהצלחה");
    navigate("/player-auth");
  };
  
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleEditGoal = (goalId: string, currentTitle: string) => {
    setEditingGoal(goalId);
    setEditedGoalText(currentTitle);
  };

  const handleSaveGoal = (goalId: string, term: "short" | "long") => {
    if (term === "short") {
      setShortTermGoals(prev => 
        prev.map(goal => goal.id === goalId ? { ...goal, title: editedGoalText } : goal)
      );
    } else {
      setLongTermGoals(prev => 
        prev.map(goal => goal.id === goalId ? { ...goal, title: editedGoalText } : goal)
      );
    }
    setEditingGoal(null);
    toast.success("המטרה עודכנה בהצלחה");
  };

  const handleToggleGoalStatus = (goalId: string, term: "short" | "long") => {
    if (term === "short") {
      setShortTermGoals(prev => 
        prev.map(goal => goal.id === goalId 
          ? { ...goal, status: goal.status === "active" ? "completed" : "active" } 
          : goal
        )
      );
    } else {
      setLongTermGoals(prev => 
        prev.map(goal => goal.id === goalId 
          ? { ...goal, status: goal.status === "active" ? "completed" : "active" } 
          : goal
        )
      );
    }
    toast.success("סטטוס המטרה עודכן בהצלחה");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-page">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="page-container">
        <div className="content-container">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-500 mb-4">לא נמצאו פרטי שחקן. אנא התחבר מחדש.</p>
              <Button onClick={() => navigate("/player-auth")}>
                חזרה לדף ההתחברות
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const profileImageUrl = player.profile_image || 'https://via.placeholder.com/150';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };

  return (
    <div className="page-container">
      <header className="w-full bg-primary text-white py-5 shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">פרופיל שחקן</h1>
          <div className="flex items-center gap-3">
            <Popover open={showNotifications} onOpenChange={setShowNotifications}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-white hover:bg-primary-light/20">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] bg-red-500" variant="default">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">התראות</h3>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                      <p>אין התראות חדשות</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`p-3 border rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'} cursor-pointer hover:shadow-sm transition-all`}
                          onClick={() => {
                            if (notification.type === 'video') {
                              markNotificationAsRead(notification.id);
                              setActiveTab('videos');
                              setShowNotifications(false);
                            }
                          }}
                        >
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
                            {!notification.read && (
                              <Badge variant="default" className="text-xs bg-primary">חדש</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-primary-light/20">
              <LogOut className="h-4 w-4 mr-2" />
              התנתק
            </Button>
          </div>
        </div>
      </header>

      <div className="content-container">
        <Card className="mb-6 overflow-hidden shadow-card">
          <div className="relative h-24 bg-gradient-to-r from-primary to-primary-light"></div>
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 relative -mt-12">
              <div className="w-24 h-24 relative rounded-full overflow-hidden flex-shrink-0 border-4 border-white bg-white shadow-md">
                <img
                  src={profileImageUrl}
                  alt={player.full_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/150?text=' + encodeURIComponent(player.full_name[0] || 'U');
                  }}
                />
              </div>
              <div className="text-center md:text-right flex-1 mt-6 md:mt-12">
                <h2 className="text-2xl font-bold text-gray-900">{player.full_name}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                  {player.sport_field && (
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                      {player.sport_field}
                    </Badge>
                  )}
                  {player.club && (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                      {player.club}
                    </Badge>
                  )}
                  {player.year_group && (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                      {player.year_group}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 player-tabs modern-tabs">
          <TabsList className="tabs-list w-full rounded-xl">
            <TabsTrigger value="profile" className="tab-trigger">
              <User className="h-4 w-4 mr-2" />
              פרופיל
            </TabsTrigger>
            <TabsTrigger value="videos" className="tab-trigger">
              <Video className="h-4 w-4 mr-2" />
              סרטונים
              {unreadCount > 0 && (
                <Badge variant="default" className="ml-2 bg-red-500 h-5 min-w-5 flex items-center justify-center">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sessions" className="tab-trigger">
              <Calendar className="h-4 w-4 mr-2" />
              מפגשים
            </TabsTrigger>
            <TabsTrigger value="summaries" className="tab-trigger">
              <FileText className="h-4 w-4 mr-2" />
              סיכומים
            </TabsTrigger>
            <TabsTrigger value="goals" className="tab-trigger">
              <Target className="h-4 w-4 mr-2" />
              מטרות
            </TabsTrigger>
            <TabsTrigger value="game-prep" className="tab-trigger">
              <CheckSquare className="h-4 w-4 mr-2" />
              הכנה למשחק
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  פרטים אישיים
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="data-label">שם מלא</p>
                  <p className="data-value">{player.full_name}</p>
                </div>
                <div>
                  <p className="data-label">כתובת אימייל</p>
                  <p dir="ltr" className="font-mono text-sm data-value">{player.email}</p>
                </div>
                <div>
                  <p className="data-label">ענף ספורט</p>
                  <p className="data-value">{player.sport_field || "-"}</p>
                </div>
                <div>
                  <p className="data-label">מועדון</p>
                  <p className="data-value">{player.club || "-"}</p>
                </div>
                <div>
                  <p className="data-label">שכבת גיל</p>
                  <p className="data-value">{player.year_group || "-"}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="videos">
            <VideosTab 
              coachId={player?.coach_id || ''} 
              playerId={player?.id}
              onWatchVideo={(videoId) => {
                const notificationIndex = notifications.findIndex(n => n.id === videoId && !n.read);
                if (notificationIndex !== -1) {
                  markNotificationAsRead(videoId);
                }
              }}
            />
          </TabsContent>
          
          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  מפגשים מתוכננים
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingSessions.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-all">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex gap-4 items-start">
                            <div className="bg-primary/10 p-3 rounded-full text-primary flex-shrink-0">
                              <Clock className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-lg">{formatDate(session.session_date)}</p>
                              <p className="text-gray-500">{session.session_time}</p>
                              {session.location && (
                                <p className="text-gray-700 mt-1">מיקום: {session.location}</p>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="status-badge active self-start md:self-center">
                            מתוכנן
                          </Badge>
                        </div>
                        {session.notes && (
                          <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                            <p className="text-sm text-gray-600">{session.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">אין מפגשים מתוכננים כרגע</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="summaries">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  סיכומי מפגשים אחרונים
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sessionSummaries.length > 0 ? (
                  <div className="space-y-4">
                    {sessionSummaries.map((summary) => (
                      <div key={summary.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-all">
                        <div className="flex flex-col md:flex-row justify-between gap-4 mb-3">
                          <div className="flex gap-4 items-start">
                            <div className="bg-primary/10 p-3 rounded-full text-primary flex-shrink-0">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-lg">
                                {summary.session && formatDate(summary.session.session_date)}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`rounded-full px-3 py-1 ${summary.progress_rating >= 4 ? 'bg-green-100 text-green-700' : summary.progress_rating >= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'} self-start md:self-center`}
                          >
                            דירוג התקדמות: {summary.progress_rating}/5
                          </Badge>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg text-gray-700 text-sm">
                          {summary.summary_text}
                        </div>
                        
                        {summary.achieved_goals && summary.achieved_goals.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                            <p className="text-sm font-medium mb-1 text-gray-700">מטרות שהושגו:</p>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {summary.achieved_goals.map((goal, index) => (
                                <li key={index} className="py-0.5">{goal}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">אין סיכומי מפגשים זמינים כרגע</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  המטרות שלי
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Short-term goals */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                    <Badge variant="outline" className="font-normal bg-orange-50 text-orange-700 border-orange-200">
                      קצר טווח
                    </Badge>
                    מטרות קצרות טווח
                  </h3>
                  <div className="space-y-3">
                    {shortTermGoals.map(goal => (
                      <div key={goal.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:shadow-sm transition-all border border-gray-100">
                        <div className="flex-1">
                          {editingGoal === goal.id ? (
                            <Textarea 
                              value={editedGoalText} 
                              onChange={(e) => setEditedGoalText(e.target.value)}
                              className="min-h-[60px]"
                            />
                          ) : (
                            <p className={`${goal.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                              {goal.title}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {editingGoal === goal.id ? (
                            <Button 
                              size="sm" 
                              onClick={() => handleSaveGoal(goal.id, "short")}
                            >
                              שמור
                            </Button>
                          ) : (
                            <>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => handleEditGoal(goal.id, goal.title)}
                                className="hover:bg-gray-100"
                              >
                                <PencilLine className="h-4 w-4 text-gray-500" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant={goal.status === 'completed' ? 'default' : 'outline'}
                                onClick={() => handleToggleGoalStatus(goal.id, "short")}
                                className={goal.status === 'completed' ? '' : 'hover:bg-primary/5'}
                              >
                                {goal.status === 'completed' ? 'הושלם' : 'סמן כהושלם'}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Long-term goals */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                    <Badge variant="outline" className="font-normal bg-blue-50 text-blue-700 border-blue-200">
                      ארוך טווח
                    </Badge>
                    מטרות ארוכות טווח
                  </h3>
                  <div className="space-y-3">
                    {longTermGoals.map(goal => (
                      <div key={goal.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:shadow-sm transition-all border border-gray-100">
                        <div className="flex-1">
                          {editingGoal === goal.id ? (
                            <Textarea 
                              value={editedGoalText} 
                              onChange={(e) => setEditedGoalText(e.target.value)}
                              className="min-h-[60px]"
                            />
                          ) : (
                            <p className={`${goal.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                              {goal.title}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {editingGoal === goal.id ? (
                            <Button 
                              size="sm" 
                              onClick={() => handleSaveGoal(goal.id, "long")}
                            >
                              שמור
                            </Button>
                          ) : (
                            <>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => handleEditGoal(goal.id, goal.title)}
                                className="hover:bg-gray-100"
                              >
                                <PencilLine className="h-4 w-4 text-gray-500" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant={goal.status === 'completed' ? 'default' : 'outline'}
                                onClick={() => handleToggleGoalStatus(goal.id, "long")}
                                className={goal.status === 'completed' ? '' : 'hover:bg-primary/5'}
                              >
                                {goal.status === 'completed' ? 'הושלם' : 'סמן כהושלם'}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="game-prep">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-primary" />
                  הכנה למשחק
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center md:items-start text-center md:text-right">
                <div className="max-w-xl w-full mb-6">
                  <p className="text-gray-600 mb-4">מלא טופס הכנה מנטלית לפני משחק חשוב. הטופס יעזור לך להתכונן באופן מנטלי למשחק ולשפר את הביצועים שלך.</p>
                </div>
                
                <div className="bg-primary/5 rounded-xl p-6 border border-primary/10 w-full max-w-xl shadow-sm mb-6">
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <CheckSquare className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1 text-center md:text-right">
                      <h3 className="text-lg font-medium text-gray-900">טופס הכנה מנטלית למשחק</h3>
                      <p className="text-gray-500 text-sm mt-1">מילוי הטופס יעזור לך להתכונן באופן מיטבי למשחק</p>
                    </div>
                  </div>
                </div>
                
                <Button onClick={() => navigate('/game-prep')} className="gap-2">
                  פתח טופס הכנה למשחק
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PlayerProfileView;
