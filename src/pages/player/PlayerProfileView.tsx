
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideosTab } from "@/components/player/VideosTab";
import { Bell, User, LogOut } from "lucide-react";
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

  // Load player data from session
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
        
        // Fetch player data from Supabase
        const { data, error } = await supabase
          .from("players")
          .select("*")
          .eq("id", sessionData.id)
          .single();

        if (error) {
          throw error;
        }

        setPlayer(data);
        
        // Fetch notifications - for now we'll mock this with video data
        const { data: videosData, error: videosError } = await supabase
          .from("videos")
          .select("*")
          .eq("coach_id", data.coach_id)
          .order("created_at", { ascending: false })
          .limit(5);
          
        if (videosError) {
          console.error("Error fetching videos:", videosError);
        } else if (videosData) {
          // Convert videos to notifications
          const videoNotifications: Notification[] = videosData.map(video => ({
            id: video.id,
            title: video.title,
            type: "video",
            read: false, // We'd store this in a player_notifications table in a real app
            contentId: video.id,
            created_at: video.created_at
          }));
          
          setNotifications(videoNotifications);
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
                    <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px]" variant="destructive">
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
                              <Badge variant="primary" className="text-xs">חדש</Badge>
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              פרופיל
            </TabsTrigger>
            <TabsTrigger value="videos">
              סרטונים
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
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
        </Tabs>
      </div>
    </div>
  );
};

export default PlayerProfileView;
