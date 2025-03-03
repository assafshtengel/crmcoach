
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, LogOut, ArrowRight, Video, Target, Calendar, BookOpen, Play, Check, Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

const PlayerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { playerId } = useParams<{ playerId: string }>();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [watchedVideos, setWatchedVideos] = useState<string[]>([]);
  const [evaluationResults, setEvaluationResults] = useState<any>(null);
  const [playerData, setPlayerData] = useState<any>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [nextMeetingText, setNextMeetingText] = useState("");
  const [lastMeetingText, setLastMeetingText] = useState("");
  const [lastMeetingDate, setLastMeetingDate] = useState("");
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/player-auth");
  };

  // Fetch player data
  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);
        if (!playerId) return;
        
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerId)
          .single();
        
        if (error) {
          console.error("Error fetching player data:", error);
          toast({
            title: "שגיאה בטעינת פרטי השחקן",
            description: "אנא נסה שוב מאוחר יותר",
            variant: "destructive"
          });
          return;
        }
        
        setPlayerData(data);
      } catch (error) {
        console.error('Error in fetchPlayerData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerId, toast]);

  // Fetch evaluation results
  useEffect(() => {
    const fetchEvaluationResults = async () => {
      try {
        if (!playerId) return;
        
        const { data, error } = await supabase
          .from('player_evaluations')
          .select('*')
          .eq('user_id', playerId)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error("Error fetching evaluation:", error);
          return;
        }
        
        if (data && data.length > 0) {
          setEvaluationResults(data[0]);
        } else {
          setEvaluationResults(null);
        }
      } catch (error) {
        console.error('Error in fetchEvaluationResults:', error);
        setEvaluationResults(null);
      }
    };

    fetchEvaluationResults();
  }, [playerId]);

  // Fetch short term goals
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        if (!playerId) return;
        
        const { data, error } = await supabase
          .from('short_term_goals')
          .select('goals')
          .eq('user_id', playerId)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching goals:", error);
          return;
        }
        
        if (data && data.goals) {
          setGoals(data.goals);
        } else {
          setGoals([
            "יישום הנקסט - הטמעת החשיבה כל הזמן של להיות מוכן לנקודה הבאה כל הזמן",
            "יישום הנקסט על ידי מחיאת כף ומיד חשיבה על ביצוע הפעולה הבאה"
          ]);
        }
      } catch (error) {
        console.error('Error in fetchGoals:', error);
      }
    };

    fetchGoals();
  }, [playerId]);

  // Fetch meetings data
  useEffect(() => {
    const fetchMeetingsData = async () => {
      try {
        if (!playerId) return;
        
        // Fetch next meeting
        const { data: nextMeetingData, error: nextMeetingError } = await supabase
          .from('next_meetings')
          .select('meeting_text')
          .eq('user_id', playerId)
          .maybeSingle();
          
        if (nextMeetingError) {
          console.error('Error fetching next meeting:', nextMeetingError);
        } else if (nextMeetingData) {
          setNextMeetingText(nextMeetingData.meeting_text);
        } else {
          setNextMeetingText("מפגש אישי עם המאמן - יתואם בהמשך");
        }
        
        // Fetch last meeting
        const { data: lastMeetingData, error: lastMeetingError } = await supabase
          .from('last_meetings')
          .select('meeting_text, meeting_date')
          .eq('user_id', playerId)
          .order('created_at', { ascending: false })
          .maybeSingle();
          
        if (lastMeetingError) {
          console.error('Error fetching last meeting:', lastMeetingError);
        } else if (lastMeetingData) {
          setLastMeetingText(lastMeetingData.meeting_text);
          setLastMeetingDate(new Date(lastMeetingData.meeting_date).toLocaleDateString('he-IL'));
        } else {
          setLastMeetingText("מפגש עם המאמן בו למדנו את כלי ה-NEXT וה-SCOUT");
          setLastMeetingDate(new Date().toLocaleDateString('he-IL'));
        }
      } catch (error) {
        console.error('Error in fetchMeetingsData:', error);
      }
    };

    fetchMeetingsData();
  }, [playerId]);

  // Fetch training videos
  const [videos, setVideos] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        if (!playerId) return;
        
        const { data, error } = await supabase
          .from('training_videos')
          .select('*')
          .eq('user_id', playerId)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching videos:", error);
          return;
        }
        
        if (data && data.length > 0) {
          setVideos(data.map(video => ({
            id: video.id,
            title: video.title,
            url: video.url,
            date: video.unlock_date 
              ? new Date(video.unlock_date) > new Date() 
                ? `ייפתח לצפייה ב-${new Date(video.unlock_date).toLocaleDateString('he-IL')}`
                : "זמין לצפייה"
              : "זמין לצפייה",
            isLocked: video.unlock_date ? new Date(video.unlock_date) > new Date() : false
          })));
        } else {
          // Default videos if none found
          setVideos([{
            id: "video1",
            title: "הפסיכולוגיה של הביצוע – פרק 42: חוק ה-1%",
            url: "https://www.youtube.com/watch?v=3vt10U_ssc8&t=150s",
            date: "זמין לצפייה",
            isLocked: false
          }, {
            id: "video2",
            title: "חוק ה-1% - חלק ב'",
            url: "https://www.youtube.com/watch?v=example2",
            date: "ייפתח לצפייה ביום שלישי 18.2.25",
            isLocked: true
          }]);
        }
      } catch (error) {
        console.error('Error in fetchVideos:', error);
      }
    };

    fetchVideos();
  }, [playerId]);

  const handleWatchedToggle = (videoId: string) => {
    setWatchedVideos(prev => prev.includes(videoId) ? prev.filter(id => id !== videoId) : [...prev, videoId]);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number): string => {
    if (score >= 8) return 'bg-green-600';
    if (score >= 6) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">טוען...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-8">
        <header className="mb-12">
          <div className="flex justify-between items-center glass-card p-4 rounded-2xl shadow-md">
            <div className="flex gap-6 items-center">
              <Avatar className="h-14 w-14 border-2 border-primary shadow-md">
                <AvatarImage src={playerData?.profile_image} alt={playerData?.full_name} />
                <AvatarFallback>{playerData?.full_name?.slice(0, 2) || "NA"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  ברוך הבא, {playerData?.full_name || "שחקן"}! 🏆
                </h1>
                <p className="text-gray-600">מערכת האימון האישית שלך</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                className="text-destructive hover:bg-destructive hover:text-white transition-colors duration-200" 
                onClick={() => setShowLogoutDialog(true)}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="glass-card hover:shadow-lg transition-all duration-200 cursor-pointer">
            <CardHeader className="bg-primary/10 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-primary">תוצאות האבחון שלי</h3>
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {evaluationResults ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">הציון הכולל:</span>
                    <span className={`text-xl font-bold ${getScoreColor(evaluationResults.total_score)}`}>
                      {evaluationResults.total_score.toFixed(1)}
                    </span>
                  </div>
                  <div className="grid gap-4">
                    {Object.entries(evaluationResults.category_averages || {}).map(([category, score]: [string, any]) => (
                      <div key={category} className="bg-white/50 p-4 rounded-lg backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{score.name || category}</span>
                          <span className={`font-bold ${getScoreColor(score)}`}>
                            {typeof score === 'number' ? score.toFixed(1) : score}
                          </span>
                        </div>
                        <Progress 
                          value={typeof score === 'number' ? score * 10 : 0} 
                          className={`h-2 ${getProgressColor(score)}`} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600 mb-2">טרם בוצע אבחון ראשוני</p>
                  <p className="text-sm text-gray-500">המאמן שלך יכול לבצע עבורך אבחון</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card backdrop-blur-sm hover:shadow-lg transition-all duration-200 animate-fade-in">
            <CardHeader className="bg-primary/10 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-primary">המפגש האחרון</CardTitle>
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <p className="font-medium flex-1">{lastMeetingText}</p>
                </div>
                <p className="text-gray-600 text-sm">תאריך מפגש: {lastMeetingDate}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card backdrop-blur-sm hover:shadow-lg transition-all duration-200 animate-fade-in">
            <CardHeader className="bg-primary/10 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-primary">המפגש הבא</CardTitle>
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-600">{nextMeetingText}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-orange-50/30 hover:bg-orange-50/50 backdrop-blur-sm" onClick={() => window.open("https://www.shtengel.co.il/%D7%94%D7%A4%D7%95%D7%93%D7%A7%D7%90%D7%A1%D7%98", "_blank")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">פודקאסט כדורגלן העל</CardTitle>
                <svg className="h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 5.14v14"></path>
                  <path d="M19 5.14v14"></path>
                  <path d="M8 5.14a5 5 0 0 1 4 0"></path>
                  <path d="M19 5.14a5 5 0 0 0-4 0"></path>
                  <path d="M8 19.14a5 5 0 0 0 4 0"></path>
                  <path d="M19 19.14a5 5 0 0 1-4 0"></path>
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">האזן לפרקי הפודקאסט המלאים על פיתוח מנטלי בספורט</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50/30 hover:bg-purple-50/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">סרטוני הדרכה</CardTitle>
                <Video className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {videos.map(video => (
                  <div key={video.id} className="space-y-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer group">
                          <Play className="h-4 w-4 text-primary group-hover:text-primary/70" />
                          <div className="flex-1">
                            <p className="font-medium">{video.title}</p>
                            <p className="text-sm text-gray-500">{video.date}</p>
                          </div>
                          {!video.isLocked && (
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                id={`watched-${video.id}`} 
                                checked={watchedVideos.includes(video.id)} 
                                onCheckedChange={() => handleWatchedToggle(video.id)} 
                                className="ml-2" 
                              />
                              <label htmlFor={`watched-${video.id}`} className="text-sm text-gray-500">
                                צפיתי
                              </label>
                            </div>
                          )}
                          {video.isLocked && <span className="text-sm text-gray-400">🔒</span>}
                        </div>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{video.title}</DialogTitle>
                          <DialogDescription>
                            {!video.isLocked ? (
                              <div className="mt-4">
                                <a 
                                  href={video.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-primary hover:underline"
                                >
                                  פתח בחלון חדש
                                </a>
                              </div>
                            ) : (
                              <div className="mt-4 text-gray-500">
                                סרטון זה יהיה זמין לצפייה בתאריך המצוין
                              </div>
                            )}
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm">
            <CardHeader className="bg-[#377013]/[0.44] py-[11px] px-[51px] my-[9px] mx-0 rounded-sm">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">מטרות לטווח הקצר</CardTitle>
                <Target className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {goals.map((goal, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-teal-50/30 hover:bg-teal-50/50 backdrop-blur-sm" onClick={() => navigate("/mental-tools")}>
            <CardHeader className="bg-lime-800 hover:bg-lime-700">
              <div className="flex items-center justify-between px-[32px] py-[5px]">
                <CardTitle className="text-xl">כלים מנטליים</CardTitle>
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-secondary-foreground font-extrabold px-[29px] py-[7px] my-[12px] mx-0">צפה ברשימת הכלים המנטליים שלמדת במהלך המפגשים</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-indigo-50/30 hover:bg-indigo-50/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">פרטי קשר ורשתות חברתיות</CardTitle>
                <div className="flex gap-2">
                  <Instagram className="h-5 w-5 text-primary" />
                  <Facebook className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">עקבו אחרי המאמן ברשתות החברתיות</p>
            </CardContent>
          </Card>

          <Card className="bg-rose-50/30 hover:bg-rose-50/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">חומרי לימוד</CardTitle>
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-gray-600">חומרי קריאה והקלטות נוספות יהיו זמינים כאן</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent className="bg-white/95 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle>אתה בטוח שברצונך להתנתק?</AlertDialogTitle>
              <AlertDialogDescription>
                לאחר ההתנתקות תצטרך להתחבר מחדש כדי לגשת למערכת
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>לא</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>כן, התנתק</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default PlayerDashboard;
