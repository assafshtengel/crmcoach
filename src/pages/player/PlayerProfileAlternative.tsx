import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { User, Calendar, FileText, Video, ArrowRight, LogOut, ExternalLink } from 'lucide-react';
import { PlayerData, PlayerSession, SessionSummary } from "@/types/player";

const PlayerProfileAlternative = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upcomingSessions, setUpcomingSessions] = useState<PlayerSession[]>([]);
  const [pastSessions, setPastSessions] = useState<PlayerSession[]>([]);
  const [sessionSummaries, setSessionSummaries] = useState<SessionSummary[]>([]);
  const [videos, setVideos] = useState<any[]>([]);

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

        if (error) throw error;
        setPlayer(data);
        
        const playerId = sessionData.id;
        const today = new Date().toISOString().split('T')[0];
        
        const { data: upcomingData, error: upcomingError } = await supabase
          .from("sessions")
          .select("*")
          .eq("player_id", playerId)
          .gte("session_date", today)
          .order("session_date", { ascending: true });
        
        if (!upcomingError && upcomingData) {
          setUpcomingSessions(upcomingData);
        } else if (upcomingError) {
          console.error("Error fetching upcoming sessions:", upcomingError);
        }
        
        const { data: pastData, error: pastError } = await supabase
          .from("sessions")
          .select("*")
          .eq("player_id", playerId)
          .lt("session_date", today)
          .order("session_date", { ascending: false })
          .limit(10);
        
        if (!pastError && pastData) {
          setPastSessions(pastData);
        } else if (pastError) {
          console.error("Error fetching past sessions:", pastError);
        }

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
          .eq("player_id", playerId)
          .order("created_at", { ascending: false });
        
        if (!summariesError && summariesData) {
          console.log("Fetched session summaries:", summariesData);
          setSessionSummaries(summariesData);
        } else if (summariesError) {
          console.error("Error fetching session summaries:", summariesError);
        }

        if (data.coach_id) {
          const { data: playerVideosData, error: playerVideosError } = await supabase
            .from("player_videos")
            .select(`
              id,
              watched,
              watched_at,
              video:video_id(
                id, 
                title, 
                url, 
                description, 
                category, 
                created_at
              )
            `)
            .eq("player_id", playerId);
          
          console.log("Player Videos Data:", playerVideosData); // Debug log added
            
          if (!playerVideosError && playerVideosData && playerVideosData.length > 0) {
            const formattedVideos = playerVideosData
              .filter(pv => pv.video) // Filter out any null videos
              .map(pv => ({
                id: pv.video.id,
                title: pv.video.title,
                url: pv.video.url,
                description: pv.video.description,
                category: pv.video.category,
                created_at: pv.video.created_at,
                watched: pv.watched,
                watched_at: pv.watched_at
              }));
            
            setVideos(formattedVideos);
          } else {
            const { data: videosData, error: videosError } = await supabase
              .from("videos")
              .select("*")
              .eq("coach_id", data.coach_id)
              .order("created_at", { ascending: false });
              
            console.log("Coach Videos Data:", videosData); // Debug log added
            
            if (!videosError && videosData) {
              setVideos(videosData);
            } else if (videosError) {
              console.error("Error fetching videos:", videosError);
            }
          }
        }
      } catch (error: any) {
        console.error("Error loading player data:", error);
        toast.error("שגיאה בטעינת פרטי השחקן");
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };

  const handleOpenVideo = (url: string | undefined) => {
    if (!url) {
      toast.error("קישור לסרטון חסר או לא תקין");
      return;
    }
    
    try {
      let validUrl = url.trim();
      if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
        validUrl = 'https://' + validUrl;
      }
      
      new URL(validUrl);
      
      window.open(validUrl, '_blank');
    } catch (error) {
      console.error("Invalid video URL:", url, error);
      toast.error("שגיאה בפתיחת הסרטון - כתובת לא תקינה");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F2FCE2] to-[#E5DEFF]">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="page-container">
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
      </div>
    );
  }

  const profileImageUrl = player.profile_image || 'https://api.dicebear.com/7.x/bottts/svg?seed=user123';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2FCE2] to-[#E5DEFF]">
      <header className="w-full bg-primary text-white py-3 shadow-lg sticky top-0 z-10 backdrop-blur-sm bg-opacity-95">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-lg md:text-2xl font-bold">פרופיל שחקן - תצוגה חלופית</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/player/profile')} className="text-white border-white hover:bg-white/20">
              לתצוגה הרגילה
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-white/10 transition-colors">
              <LogOut className="h-4 w-4 mr-2" />
              {!isMobile && "התנתק"}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <motion.div 
          className="rounded-xl overflow-hidden shadow-lg mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative h-32 bg-gradient-to-r from-primary to-[#7E69AB]"></div>
          <div className="bg-white rounded-b-xl px-6 py-4">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 relative -mt-16">
              <div className="rounded-full overflow-hidden w-24 h-24 border-4 border-white bg-white shadow-lg flex-shrink-0">
                <img 
                  src={profileImageUrl} 
                  alt={player.full_name} 
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE1MCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNFNUFFRkYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0ZGNzY3NiIgZm9udC1zaXplPSI0MCIgZm9udC1mYW1pbHk9IkFyaWFsIj57cGxheWVyLmZ1bGxfbmFtZVswXX08L3RleHQ+PC9zdmc+`;
                  }}
                />
              </div>
              <div className="flex-1 text-center md:text-right mb-2 md:mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{player.full_name}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                  {player.sport_field && (
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 shadow-sm">
                      {player.sport_field}
                    </Badge>
                  )}
                  {player.club && (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 shadow-sm">
                      {player.club}
                    </Badge>
                  )}
                  {player.year_group && (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 shadow-sm">
                      {player.year_group}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="shadow-md h-full">
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="shadow-md h-full">
              <CardHeader className="bg-gradient-to-r from-[#F2FCE2]/50 to-[#E5DEFF]/50 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Video className="h-5 w-5 text-primary" />
                  סרטונים אחרונים
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {videos.length > 0 ? (
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                    {videos.slice(0, 5).map((video) => (
                      <div key={video.id} className="bg-gray-50 rounded-lg p-3 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{video.title}</h3>
                            <p className="text-gray-500 text-sm mt-1">{new Date(video.created_at).toLocaleDateString()}</p>
                          </div>
                          {video.url ? (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-primary border-primary/20 bg-primary/5"
                              onClick={() => handleOpenVideo(video.url)}
                            >
                              צפה בסרטון
                              <ExternalLink className="mr-2 h-4 w-4" />
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed"
                              disabled
                            >
                              אין קישור
                              <ExternalLink className="mr-2 h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {video.description && (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{video.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <Video className="h-12 w-12 mx-auto opacity-20 mb-2" />
                    <p>אין סרטונים זמינים</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-[#F2FCE2]/50 to-[#E5DEFF]/50 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                מפגשים
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-lg mb-4">מפגשים מתוכננים</h3>
                  {upcomingSessions.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingSessions.map((session) => (
                        <div 
                          key={session.id} 
                          className="p-4 border border-gray-100 rounded-lg bg-white shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex gap-4 items-start">
                              <div className="bg-primary/10 p-3 rounded-full text-primary flex-shrink-0">
                                <Calendar className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-semibold text-lg">{formatDate(session.session_date)}</p>
                                <p className="text-gray-500">{session.session_time}</p>
                                {session.location && (
                                  <p className="text-gray-700 mt-1">מיקום: {session.location}</p>
                                )}
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 self-start md:self-center">
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
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">אין מפגשים מתוכננים כרגע</p>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium text-lg mb-4">מפגשים קודמים</h3>
                  {pastSessions.length > 0 ? (
                    <div className="space-y-4">
                      {pastSessions.map((session) => (
                        <div 
                          key={session.id} 
                          className="p-4 border border-gray-100 rounded-lg bg-white shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex gap-4 items-start">
                              <div className="bg-gray-100 p-3 rounded-full text-gray-500 flex-shrink-0">
                                <Calendar className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-semibold text-lg">{formatDate(session.session_date)}</p>
                                <p className="text-gray-500">{session.session_time}</p>
                                {session.location && (
                                  <p className="text-gray-700 mt-1">מיקום: {session.location}</p>
                                )}
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 self-start md:self-center">
                              הושלם
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
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">אין היסט��ריית מפגשים</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-[#F2FCE2]/50 to-[#E5DEFF]/50 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                סיכומי מפגשים
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {sessionSummaries.length > 0 ? (
                <div className="space-y-6">
                  {sessionSummaries.map((summary) => (
                    <div 
                      key={summary.id} 
                      className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all p-5"
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-3 mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {summary.session?.session_date ? 
                              formatDate(summary.session.session_date) : 
                              formatDate(summary.created_at)}
                          </h3>
                          {summary.session?.session_time && (
                            <p className="text-gray-500 text-sm">{summary.session.session_time}</p>
                          )}
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, index) => (
                            <div
                              key={index}
                              className={`h-5 w-5 ${
                                index < summary.progress_rating
                                  ? 'text-yellow-400'
                                  : 'text-gray-200'
                              }`}
                            >
                              ★
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {summary.summary_text && (
                        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600 mb-2">סיכום המפגש:</p>
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">{summary.summary_text}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {summary.achieved_goals && summary.achieved_goals.length > 0 && (
                          <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-green-700 mb-2">מטרות שהושגו:</p>
                            <ul className="space-y-1">
                              {summary.achieved_goals.map((goal, index) => (
                                <li key={index} className="text-sm text-gray-800 flex items-start">
                                  <span className="text-green-500 mr-2">✓</span> {goal}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {summary.future_goals && summary.future_goals.length > 0 && (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-blue-700 mb-2">מטרות עתידיות:</p>
                            <ul className="space-y-1">
                              {summary.future_goals.map((goal, index) => (
                                <li key={index} className="text-sm text-gray-800 flex items-start">
                                  <span className="text-blue-500 mr-2">•</span> {goal}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {summary.tools_used && summary.tools_used.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-600 mb-2">כלים שהיו בשימוש:</p>
                          <div className="flex flex-wrap gap-2">
                            {summary.tools_used.map((tool, index) => (
                              <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {summary.next_session_focus && (
                        <div className="mt-4 bg-purple-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-purple-700 mb-2">מיקוד למפגש הבא:</p>
                          <p className="text-sm text-gray-800">{summary.next_session_focus}</p>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mt-4 text-left">
                        נוצר בתאריך: {formatDate(summary.created_at)}
                      </p>
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
        </motion.div>
      </div>
    </div>
  );
};

export default PlayerProfileAlternative;
