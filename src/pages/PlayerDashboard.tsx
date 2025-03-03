
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Calendar, BookOpen, Target, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const PlayerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [watchedVideos, setWatchedVideos] = useState<string[]>([]);
  const [evaluationResults, setEvaluationResults] = useState<any>(null);
  const [playerName, setPlayerName] = useState("");
  const [playerDetails, setPlayerDetails] = useState<any>(null);
  const [lastMeeting, setLastMeeting] = useState({ text: "", date: "" });
  const [nextMeeting, setNextMeeting] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<any[]>([]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/player-auth");
  };

  const fetchPlayerData = async () => {
    try {
      setLoading(true);
      
      // Get player info
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate("/player-auth");
        return;
      }
      
      const playerId = session.session.user.user_metadata?.player_id;
      
      if (!playerId) {
        toast({
          title: "שגיאה",
          description: "לא נמצאו פרטי שחקן",
          variant: "destructive"
        });
        await supabase.auth.signOut();
        navigate("/player-auth");
        return;
      }

      // Get player details
      const { data: playerData, error: playerError } = await supabase
        .from("players")
        .select("*")
        .eq("id", playerId)
        .single();

      if (playerError || !playerData) {
        console.error("Error fetching player:", playerError);
        toast({
          title: "שגיאה בטעינת פרטי שחקן",
          description: "אנא נסה להתחבר מחדש",
          variant: "destructive"
        });
        return;
      }

      setPlayerName(playerData.full_name);
      setPlayerDetails(playerData);

      // Fetch evaluation results
      const { data: evalData } = await supabase
        .from('player_evaluations')
        .select('*')
        .eq('user_id', playerData.coach_id)
        .eq('player_name', playerData.full_name)
        .order('created_at', { ascending: false })
        .limit(1);

      if (evalData && evalData.length > 0) {
        setEvaluationResults(evalData[0]);
      }

      // Fetch last meeting
      const { data: lastMeetingData } = await supabase
        .from('last_meetings')
        .select('meeting_text, meeting_date')
        .eq('user_id', playerData.coach_id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (lastMeetingData && lastMeetingData.length > 0) {
        setLastMeeting({
          text: lastMeetingData[0].meeting_text,
          date: new Date(lastMeetingData[0].meeting_date).toLocaleDateString('he-IL')
        });
      }

      // Fetch next meeting
      const { data: nextMeetingData } = await supabase
        .from('next_meetings')
        .select('meeting_text')
        .eq('user_id', playerData.coach_id)
        .maybeSingle();

      if (nextMeetingData) {
        setNextMeeting(nextMeetingData.meeting_text);
      }

      // Fetch goals
      const { data: goalsData } = await supabase
        .from('short_term_goals')
        .select('goals')
        .eq('user_id', playerData.coach_id)
        .maybeSingle();

      if (goalsData && goalsData.goals) {
        setGoals(goalsData.goals);
      }

      // Fetch training videos
      const { data: videosData } = await supabase
        .from('training_videos')
        .select('*')
        .eq('user_id', playerData.coach_id)
        .order('created_at', { ascending: false });

      if (videosData) {
        // Filter videos by unlock date - only show videos that are unlocked
        const now = new Date();
        const filteredVideos = videosData.map(video => ({
          ...video,
          isLocked: video.unlock_date ? new Date(video.unlock_date) > now : false
        }));
        
        setVideos(filteredVideos);
      }

    } catch (error) {
      console.error('Error fetching player data:', error);
      toast({
        title: "שגיאה בטעינת נתונים",
        description: "אנא נסה להתחבר מחדש או פנה למאמן שלך",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayerData();
    
    // Setup auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate("/player-auth");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const handleWatchedToggle = async (videoId: string) => {
    setWatchedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId) 
        : [...prev, videoId]
    );

    // Here you could also save this to the database
    // if you want to track which videos the player has watched
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
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="text-center">
        <p className="text-lg font-medium">טוען...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-8">
        <header className="mb-12">
          <div className="flex justify-between items-center glass-card p-4 rounded-2xl shadow-md">
            <div className="flex gap-6 items-center">
              <Avatar className="h-14 w-14 border-2 border-primary shadow-md">
                <AvatarImage src={playerDetails?.profile_image || "/lovable-uploads/61e79669-b448-42d3-9bad-463ce7b4e254.png"} alt={playerName} />
                <AvatarFallback>{playerName ? playerName.substring(0, 2) : "NA"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {`ברוך הבא, ${playerName}! 🏆`}
                </h1>
                <p className="text-gray-600">אזור האימון האישי שלך</p>
              </div>
            </div>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive hover:text-white transition-colors duration-200" 
                      onClick={() => setShowLogoutDialog(true)}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>התנתק</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {evaluationResults && (
            <Card className="glass-card hover:shadow-lg transition-all duration-200 animate-fade-in">
              <CardHeader className="bg-primary/10 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-primary">הערכת אלמנטים</CardTitle>
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
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
              </CardContent>
            </Card>
          )}

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
                  <p className="font-medium flex-1">{lastMeeting.text || "לא נקבע עדיין מפגש"}</p>
                </div>
                {lastMeeting.date && (
                  <p className="text-gray-600 text-sm">תאריך מפגש: {lastMeeting.date}</p>
                )}
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
              <p className="text-gray-600">{nextMeeting || "טרם נקבע מפגש"}</p>
            </CardContent>
          </Card>

          {goals.length > 0 && (
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
          )}

          {videos.length > 0 && (
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
                            {!video.isLocked ? (
                              <Video className="h-4 w-4 text-primary group-hover:text-primary/70" />
                            ) : (
                              <span className="text-sm text-gray-400">🔒</span>
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{video.title}</p>
                              <p className="text-sm text-gray-500">
                                {video.isLocked 
                                  ? `ייפתח לצפייה ב-${new Date(video.unlock_date).toLocaleDateString('he-IL')}` 
                                  : "זמין לצפייה"}
                              </p>
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
                          </div>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{video.title}</DialogTitle>
                            <DialogDescription>
                              {!video.isLocked ? (
                                <div className="mt-4">
                                  <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
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
          )}

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
