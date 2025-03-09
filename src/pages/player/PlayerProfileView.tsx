
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideosTab } from "@/components/player/VideosTab";
import { Bell, User, LogOut, Calendar, Target, FileText, StickyNote } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

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

const PlayerProfileView = () => {
  const navigate = useNavigate();
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [sessionSummaries, setSessionSummaries] = useState([]);

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

          // Load session summaries
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
            setSessionSummaries(summariesData);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-500">לא נמצאו פרטי שחקן. אנא התחבר מחדש.</p>
            <Button onClick={() => navigate("/player-auth")} className="mt-4">
              חזרה לדף ההתחברות
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profileImageUrl = player.profile_image || 'https://via.placeholder.com/150';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="w-full bg-[#1A1F2C] text-white py-6 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">פרופיל שחקן</h1>
          <div className="flex items-center gap-3">
            <Popover open={showNotifications} onOpenChange={setShowNotifications}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-white" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px]" variant="default">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-2">
                  <h3 className="font-semibold">התראות</h3>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500">אין התראות חדשות</p>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`p-2 border rounded ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}
                          onClick={() => {
                            if (notification.type === 'video') {
                              markNotificationAsRead(notification.id);
                              setActiveTab('videos');
                              setShowNotifications(false);
                            }
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{notification.title}</p>
                              <p className="text-xs text-gray-500">
                                {notification.type === 'video' ? 'סרטון חדש' : 'הודעה חדשה'}
                              </p>
                            </div>
                            {!notification.read && (
                              <Badge variant="default" className="text-xs">חדש</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              התנתק
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-24 h-24 relative rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={profileImageUrl}
                  alt={player.full_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/150?text=' + encodeURIComponent(player.full_name);
                  }}
                />
              </div>
              <div className="text-center md:text-right flex-1">
                <h2 className="text-2xl font-bold">{player.full_name}</h2>
                <p className="text-gray-500">
                  {player.sport_field || "לא צוין ענף ספורטיבי"}
                </p>
                <p className="text-gray-700 mt-1">
                  {player.club && player.year_group 
                    ? `${player.club} • ${player.year_group}`
                    : player.club || player.year_group || "לא צוין מועדון/קבוצת גיל"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              פרופיל
            </TabsTrigger>
            <TabsTrigger value="videos">
              סרטונים
              {unreadCount > 0 && (
                <Badge variant="default" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <Calendar className="h-4 w-4 mr-2" />
              מפגשים
            </TabsTrigger>
            <TabsTrigger value="summaries">
              <FileText className="h-4 w-4 mr-2" />
              סיכומים
            </TabsTrigger>
            <TabsTrigger value="goals">
              <Target className="h-4 w-4 mr-2" />
              מטרות
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">פרטים אישיים</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">שם מלא</p>
                  <p>{player.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">כתובת אימייל</p>
                  <p dir="ltr" className="font-mono text-sm">{player.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">ענף ספורט</p>
                  <p>{player.sport_field || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">מועדון</p>
                  <p>{player.club || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">שכבת גיל</p>
                  <p>{player.year_group || "-"}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">הכנה למשחק</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">מלא טופס הכנה מנטלית לפני משחק חשוב</p>
                <Button onClick={() => navigate('/game-prep')}>
                  טופס הכנה למשחק
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="videos">
            <VideosTab 
              coachId={player.coach_id || ''} 
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
                <CardTitle className="text-lg">מפגשים מתוכננים</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingSessions.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-semibold">{formatDate(session.session_date)}</p>
                            <p className="text-sm text-gray-500">{session.session_time}</p>
                          </div>
                          {session.location && (
                            <div className="text-right">
                              <p className="text-sm font-medium">מיקום</p>
                              <p className="text-sm">{session.location}</p>
                            </div>
                          )}
                        </div>
                        {session.notes && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-sm text-gray-600">{session.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">אין מפגשים מתוכננים כרגע</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="summaries">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">סיכומי מפגשים אחרונים</CardTitle>
              </CardHeader>
              <CardContent>
                {sessionSummaries.length > 0 ? (
                  <div className="space-y-4">
                    {sessionSummaries.map((summary) => (
                      <div key={summary.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold">
                            {summary.session && formatDate(summary.session.session_date)}
                          </p>
                          <Badge variant="outline">דירוג התקדמות: {summary.progress_rating}/5</Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-3">{summary.summary_text}</p>
                        
                        {summary.achieved_goals && summary.achieved_goals.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium mb-1">מטרות שהושגו:</p>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {summary.achieved_goals.slice(0, 2).map((goal, index) => (
                                <li key={index}>{goal}</li>
                              ))}
                              {summary.achieved_goals.length > 2 && <li>...</li>}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">אין סיכומי מפגשים זמינים כרגע</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">המטרות שלי</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <h3 className="font-medium">מטרות קצרות טווח</h3>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <ul className="list-disc list-inside space-y-1">
                      <li>לשפר דיוק בבעיטות חופשיות</li>
                      <li>לעבוד על אסרטיביות בהגנה</li>
                      <li>להגביר יכולות קבלת החלטות תחת לחץ</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">מטרות ארוכות טווח</h3>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <ul className="list-disc list-inside space-y-1">
                      <li>להיות שחקן הרכב קבוע בקבוצה</li>
                      <li>לשפר מדדים גופניים כלליים ב-15%</li>
                      <li>להפוך למנהיג בקבוצה</li>
                    </ul>
                  </div>
                </div>
                
                <Button className="mt-4 w-full">
                  <StickyNote className="h-4 w-4 mr-2" />
                  עדכון מטרות
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
