import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Search, LogOut, ArrowRight, Video, Target, Calendar, BookOpen, Play, Check, Trash2, Instagram, Facebook, Edit, Save, X, Plus, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from 'react-router-dom';
import { SessionFormDialog } from "@/components/sessions/SessionFormDialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminMessageForm } from "@/components/admin/AdminMessageForm";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [watchedVideos, setWatchedVideos] = useState<string[]>([]);
  const [evaluationResults, setEvaluationResults] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteCode, setDeleteCode] = useState("");
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [editedGoals, setEditedGoals] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([
    "יישום הנקסט - הטמעת החשיבה כל הזמן של להיות מוכן לנקודה הבאה כל הזמן",
    "יישום הנקסט על ידי מחיאת כף ומיד חשיבה על ביצוע הפעולה הבאה"
  ]);
  const [isEditingNextMeeting, setIsEditingNextMeeting] = useState(false);
  const [nextMeetingText, setNextMeetingText] = useState("מפגש אישי עם אסף - יתואם בהמשך השבוע הבא בין 16.2-21.2");
  const [isEditingLastMeeting, setIsEditingLastMeeting] = useState(false);
  const [lastMeetingText, setLastMeetingText] = useState("מפגש שני עם אסף בו למדנו את כלי ה-NEXT וה-SCOUT");
  const [lastMeetingDate, setLastMeetingDate] = useState("14.2.25");
  const [isSessionFormOpen, setIsSessionFormOpen] = useState(false);

  const SECURITY_CODE = "1976";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const fetchEvaluationResults = async () => {
    try {
      const {
        data: session
      } = await supabase.auth.getSession();
      if (!session.session) return;
      const {
        data,
        error
      } = await supabase.from('player_evaluations').select('*').eq('user_id', session.session.user.id).order('created_at', {
        ascending: false
      }).limit(1);
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

  useEffect(() => {
    fetchEvaluationResults();
  }, []);

  const handleDeleteEvaluation = async () => {
    try {
      if (deleteCode !== SECURITY_CODE) {
        toast({
          title: "קוד שגוי",
          description: "הקוד שהוז�� אינו נכון",
          variant: "destructive"
        });
        return;
      }
      const {
        data: session
      } = await supabase.auth.getSession();
      if (!session.session) return;
      const {
        error
      } = await supabase.from('player_evaluations').delete().eq('user_id', session.session.user.id);
      if (error) {
        console.error('Error deleting evaluation:', error);
        toast({
          title: "שגיאה במ���יקת ההערכה",
          description: "אנא נסה שוב מאוחר יותר",
          variant: "destructive"
        });
        return;
      }
      setEvaluationResults(null);
      setShowDeleteDialog(false);
      setDeleteCode("");
      toast({
        title: "ההערכה נמחקה בהצלחה",
        description: "תוכל למלא הערכה ��דשה בכל עת"
      });
    } catch (error) {
      console.error('Error in handleDeleteEvaluation:', error);
      toast({
        title: "שגיאה במחיקת ההערכה",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive"
      });
    }
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

  const handleEditGoals = () => {
    setIsEditingGoals(true);
    setEditedGoals([...goals]);
  };

  const handleSaveGoals = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      setGoals([...editedGoals]);
      setIsEditingGoals(false);

      toast({
        title: "המטרות נשמרו בהצלחה",
        description: "המטרות עודכנו ונשמרו",
      });
    } catch (error) {
      console.error('Error saving goals:', error);
      toast({
        title: "שגיאה בשמירת המטרות",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  };

  const handleCancelEditGoals = () => {
    setIsEditingGoals(false);
    setEditedGoals([]);
  };

  const handleGoalChange = (index: number, value: string) => {
    const newGoals = [...editedGoals];
    newGoals[index] = value;
    setEditedGoals(newGoals);
  };

  const fetchNextMeeting = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data, error } = await supabase
        .from('next_meetings')
        .select('meeting_text')
        .eq('user_id', session.session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching next meeting:', error);
        return;
      }

      if (data) {
        setNextMeetingText(data.meeting_text);
      }
    } catch (error) {
      console.error('Error in fetchNextMeeting:', error);
    }
  };

  const fetchLastMeeting = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data, error } = await supabase
        .from('last_meetings')
        .select('meeting_text, meeting_date')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error) {
        console.error('Error fetching last meeting:', error);
        return;
      }

      if (data) {
        setLastMeetingText(data.meeting_text);
        setLastMeetingDate(new Date(data.meeting_date).toLocaleDateString('he-IL'));
      }
    } catch (error) {
      console.error('Error in fetchLastMeeting:', error);
    }
  };

  const handleSaveLastMeeting = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { error: upsertError } = await supabase
        .from('last_meetings')
        .upsert({
          user_id: session.session.user.id,
          meeting_text: lastMeetingText,
          meeting_date: new Date().toISOString(),
        });

      if (upsertError) {
        console.error('Error saving last meeting:', upsertError);
        toast({
          title: "שגיאה בשמירת המפגש האחרון",
          description: "אנא נסה שוב מאוחר יותר",
          variant: "destructive",
        });
        return;
      }

      setIsEditingLastMeeting(false);
      setLastMeetingDate(new Date().toLocaleDateString('he-IL'));
      toast({
        title: "המפגש האחרון נשמר בהצלחה",
        description: "הפרטים עודכנו",
      });
    } catch (error) {
      console.error('Error in handleSaveLastMeeting:', error);
      toast({
        title: "שגיאה בשמירת המפגש האחרון",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  };

  const handleSaveNextMeeting = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { error: upsertError } = await supabase
        .from('next_meetings')
        .upsert({
          user_id: session.session.user.id,
          meeting_text: nextMeetingText,
        });

      if (upsertError) {
        console.error('Error saving next meeting:', upsertError);
        toast({
          title: "שגיאה בשמירת המפגש הבא",
          description: "אנא נסה שוב מאוחר יותר",
          variant: "destructive",
        });
        return;
      }

      setIsEditingNextMeeting(false);
      toast({
        title: "המפגש הבא נשמר בהצלחה",
        description: "הפרטים עודכנו",
      });
    } catch (error) {
      console.error('Error in handleSaveNextMeeting:', error);
      toast({
        title: "שגיאה בשמירת המפגש הבא",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchNextMeeting();
    fetchLastMeeting();
  }, []);

  const nextMeeting = "מפגש אישי עם אסף - יתואם בהמשך השבוע הבא בין 16.2-21.2";
  const playerName = "ליאם";
  const weeklyProgress = 75;
  const videos = [{
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
  }];

  const handleWatchedToggle = (videoId: string) => {
    setWatchedVideos(prev => prev.includes(videoId) ? prev.filter(id => id !== videoId) : [...prev, videoId]);
  };

  const handleAddSession = async (sessionData: {
    player_id: string;
    session_date: string;
    session_time: string;
    location?: string;
    notes?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "שגיאה",
          description: "יש להתחבר למערכת כדי להוסיף מפגש",
          variant: "destructive",
        });
        return;
      }

      const sessionWithCoach = {
        ...sessionData,
        coach_id: user.id
      };

      console.log('Adding new session:', sessionWithCoach);

      const { error } = await supabase
        .from('sessions')
        .insert(sessionWithCoach);

      if (error) {
        console.error('Error saving session:', error);
        throw error;
      }

      toast({
        title: "המפגש נוסף בהצלחה",
        description: "המפגש נוסף ללוח השנה",
      });
      
    } catch (error) {
      console.error('Error in handleAddSession:', error);
      toast({
        title: "שגיאה בהוספת המפגש",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-8">
        <header className="mb-12">
          <div className="flex justify-between items-center glass-card p-4 rounded-2xl shadow-md">
            <div className="flex gap-6 items-center">
              <Avatar className="h-14 w-14 border-2 border-primary shadow-md">
                <AvatarImage src="/lovable-uploads/61e79669-b448-42d3-9bad-463ce7b4e254.png" alt="ליאם אמזלג" />
                <AvatarFallback>לא</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  ברוך הבא, ליאם אמזלג! 🏆
                </h1>
                <p className="text-gray-600">מערכת האימון האישית שלך</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                variant="green"
                onClick={() => setIsSessionFormOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                הוסף מפגש חדש
              </Button>
              <Link 
                to="/game-preparation"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Target className="w-5 h-5" />
                הכנה למשחק
              </Link>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>חזור לעמוד הקודם</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
          <Card className="glass-card hover:shadow-lg transition-all duration-200 cursor-pointer animate-fade-in" onClick={() => navigate("/player-evaluation")}>
            <CardHeader className="bg-primary/10 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-primary">שאלון אבחון ראשוני</h3>
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
                  <p className="text-gray-600 mb-2">טרם מילאת את שאלון האבחון הראשוני</p>
                  <p className="text-sm text-gray-500">לחץ כאן למילוי השאלון</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card backdrop-blur-sm hover:shadow-lg transition-all duration-200 animate-fade-in">
            <CardHeader className="bg-primary/10 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-primary">המפגש האחרון</CardTitle>
                <div className="flex items-center gap-2">
                  {isEditingLastMeeting ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSaveLastMeeting}
                        className="h-8 w-8 hover:bg-primary/10"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditingLastMeeting(false)}
                        className="h-8 w-8 hover:bg-primary/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditingLastMeeting(true)}
                      className="h-8 w-8 hover:bg-primary/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  {isEditingLastMeeting ? (
                    <Textarea
                      value={lastMeetingText}
                      onChange={(e) => setLastMeetingText(e.target.value)}
                      className="min-h-[100px] bg-white/50"
                    />
                  ) : (
                    <p className="font-medium flex-1">{lastMeetingText}</p>
                  )}
                </div>
                <p className="text-gray-600 text-sm">תאריך מפגש: {lastMeetingDate}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card backdrop-blur-sm hover:shadow-lg transition-all duration-200 animate-fade-in">
            <CardHeader className="bg-primary/10 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-primary">המפגש הבא</CardTitle>
                <div className="flex items-center gap-2">
                  {isEditingNextMeeting ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSaveNextMeeting}
                        className="h-8 w-8 hover:bg-primary/10"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditingNextMeeting(false)}
                        className="h-8 w-8 hover:bg-primary/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditingNextMeeting(true)}
                      className="h-8 w-8 hover:bg-primary/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {isEditingNextMeeting ? (
                <Textarea
                  value={nextMeetingText}
                  onChange={(e) => setNextMeetingText(e.target.value)}
                  className="min-h-[100px] bg-white/50"
                />
              ) : (
                <p className="text-gray-600">{nextMeetingText}</p>
              )}
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
                {videos.map(video => <div key={video.id} className="space-y-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer group">
                          <Play className="h-4 w-4 text-primary group-hover:text-primary/70" />
                          <div className="flex-1">
                            <p className="font-medium">{video.title}</p>
                            <p className="text-sm text-gray-500">{video.date}</p>
                          </div>
                          {!video.isLocked && <div className="flex items-center gap-2">
                              <Checkbox id={`watched-${video.id}`} checked={watchedVideos.includes(video.id)} onCheckedChange={() => handleWatchedToggle(video.id)} className="ml-2" />
                              <label htmlFor={`watched-${video.id}`} className="text-sm text-gray-500">
                                צפיתי
                              </label>
                            </div>}
                          {video.isLocked && <span className="text-sm text-gray-400">🔒</span>}
                        </div>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{video.title}</DialogTitle>
                          <DialogDescription>
                            {!video.isLocked ? <div className="mt-4">
                                <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                  פתח בחלון חדש
                                </a>
                              </div> : <div className="mt-4 text-gray-500">
                                סרטון זה יהיה זמין לצפייה בתאריך המצוין
                              </div>}
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </div>)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50/30 hover:bg-blue-50/50 backdrop-blur-sm">
            <CardHeader className="bg-primary/10 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-primary">סרטוני וידאו</CardTitle>
                <Film className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="assigned" className="w-full">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="assigned" className="flex-1">סרטונים שהוקצו לי</TabsTrigger>
                  <TabsTrigger value="all" className="flex-1">כל הסרטונים</TabsTrigger>
                </TabsList>
                <TabsContent value="assigned" className="space-y-4">
                  <div className="text-center py-6 text-gray-500">
                    <Film className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>אין סרטונים שהוקצו לך כרגע</p>
                    <p className="text-sm mt-1">סרטונים שהמאמן יקצה לך יופיעו כאן</p>
                  </div>
                </TabsContent>
                <TabsContent value="all" className="space-y-4">
                  <div className="text-center py-6 text-gray-500">
                    <Film className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>אין סרטונים זמינים כרגע</p>
                    <p className="text-sm mt-1">סרטונים יתווספו למערכת בקרוב</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm">
            <CardHeader className="bg-[#377013]/[0.44] py-[11px] px-[51px] my-[9px] mx-0 rounded-sm">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">מטרות לטווח הקצר</CardTitle>
                <div className="flex items-center gap-2">
                  {isEditingGoals ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSaveGoals}
                        className="h-8 w-8"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCancelEditGoals}
                        className="h-8 w-8"
                        >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleEditGoals}
                      className="h-8 w-8"
                      >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(isEditingGoals ? editedGoals : goals).map((goal, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    {isEditingGoals ? (
                      <Input
                        value={goal}
                        onChange={(e) => handleGoalChange(index, e.target.value)}
                        className="flex-1"
                      />
                    ) : (
                      <span>{goal}</span>
                    )}
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
              <p className="text-gray-600">עקבו אחרי אסף ברשתות החברתיות</p>
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

          <AdminMessageForm />
        </div>

        <SessionFormDialog 
          open={isSessionFormOpen} 
          onOpenChange={setIsSessionFormOpen} 
          onSessionAdd={handleAddSession}
        />

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

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>מחיקת הערכת אלמנטים</DialogTitle>
              <DialogDescription>
                להמשך המחיקה, אנא הזן את קוד האבטחה
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input type="password" placeholder="הזן קוד אבטחה" value={deleteCode} onChange={e => setDeleteCode(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowDeleteDialog(false);
                setDeleteCode("");
              }}>
                ביטול
              </Button>
              <Button variant="destructive" onClick={handleDeleteEvaluation}>
                מחק הערכה
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;
