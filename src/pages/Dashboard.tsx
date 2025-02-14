import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, LogOut, ArrowRight, Video, Target, Calendar, BookOpen, Play, Check, Trash2 } from "lucide-react";
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

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [watchedVideos, setWatchedVideos] = useState<string[]>([]);
  const [evaluationResults, setEvaluationResults] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteCode, setDeleteCode] = useState("");
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
        console.error('Error fetching evaluation:', error);
        return;
      }

      // בדיקה אם יש תוצאות
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
          description: "הקוד שהוזן אינו נכון",
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
          title: "שגיאה במחיקת ההערכה",
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
        description: "תוכל למלא הערכה חדשה בכל עת"
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

  const nextMeeting = "מפגש אישי עם אסף (30 דקות) - במהלך השבוע של 16.2-21.2, מועד מדויק ייקבע בהמשך";
  const playerName = "אורי";
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
  const goals = ["רגוע יותר כאשר נמצא על הספסל", "הטמעת הבטחות בהתנסות של 1 על 1", "דיבור עצמי חיובי"];
  return <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
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
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent animate-fade-in">
            ברוך הבא, נהוראי! 🏆
          </h1>
          <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive hover:text-white" onClick={() => setShowLogoutDialog(true)}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {evaluationResults && <Card className="mb-6 bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">תוצאות חקירת האלמנטים האחרונה</CardTitle>
                <p className="text-sm text-gray-500">
                  תאריך: {new Date(evaluationResults.evaluation_date).toLocaleDateString('he-IL')}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-100" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">הציון הכולל:</span>
                  <span className={`text-xl font-bold ${getScoreColor(evaluationResults.total_score)}`}>
                    {evaluationResults.total_score.toFixed(1)}
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(evaluationResults.category_averages || {}).map(([category, score]: [string, any]) => <div key={category} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{score.name || category}</span>
                        <span className={`font-bold ${getScoreColor(score)}`}>
                          {typeof score === 'number' ? score.toFixed(1) : score}
                        </span>
                      </div>
                      <Progress value={typeof score === 'number' ? score * 10 : 0} className={`h-2 ${getProgressColor(score)}`} />
                    </div>)}
                </div>
              </div>
            </CardContent>
          </Card>}

        <Card className="mb-6 bg-white/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <p className="text-xl font-medium text-center mb-4" style={{
            background: "linear-gradient(to right, #8B5CF6, #3B82F6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
              התקדמות של 1% בכל יום מובילה אותך להיות פי 37 טוב יותר בסוף השנה
            </p>
            <p className="text-lg text-gray-600 text-center px-4 leading-relaxed">
              ברוך הבא למסע המנטאלי שלך! האתר שלנו מלווה אותך בתהליך ההתפתחות המנטאלית 
              שהתחלת, דרך סיכום מפגשים אישיים, מתן משימות ממוקדות, הכנה מנטאלית למשחקים, 
              ניתוח וסיכום משחקים, ועוד כלים שיתווספו בהמשך הדרך. אנחנו כאן ללוות אותך צעד אחר צעד 
              בדרך להצלחה שלך.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="backdrop-blur-sm bg-amber-500 hover:bg-amber-400">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">המפגש האחרון</CardTitle>
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <p className="font-medium flex-1">מפגש ראשון עם אסף בו למדנו את כלי ה-
                    <Button variant="link" className="px-1 font-semibold" onClick={() => navigate("/next")}>
                      NEXT
                    </Button>
                  </p>
                </div>
                <p className="text-gray-600">תאריך מפגש: 14.2.25</p>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-emerald-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">המפגש הבא</CardTitle>
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="">
              <p className="text-gray-600">{nextMeeting}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white/50 backdrop-blur-sm" onClick={() => window.open("https://drive.google.com/file/d/1-1I9uamFPUncyeuSTZWNQS3rwakYCsgd/view?usp=drive_link", "_blank")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">תוכנית הליווי</CardTitle>
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">לחץ כאן לצפייה בתוכנית הליווי המלאה</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm">
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

          <Card className="bg-white/50 backdrop-blur-sm">
            <CardHeader className="bg-[#377013]/[0.44] py-[11px] px-[51px] my-[9px] mx-0 rounded-sm">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">מטרות לטווח הקצר</CardTitle>
                <Target className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {goals.map((goal, index) => <li key={index} className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <span>{goal}</span>
                  </li>)}
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white/50 backdrop-blur-sm" onClick={() => navigate("/player-evaluation")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">חקירת אלמנטים</CardTitle>
                <Search className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">חקירה וניתוח של אלמנטים במשחק</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm">
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
                לאחר ההתנתקות תצטרך להתחבר מ��דש כדי לגשת למערכת
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
    </div>;
};

export default Dashboard;
