import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, LogOut, ArrowRight, Video, Target, Calendar, BookOpen, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const nextMeeting = "מפגש אישי עם אסף (30 דקות) - במהלך השבוע של 16.2-21.2, מועד מדויק ייקבע בהמשך";
  const playerName = "אורי";
  const weeklyProgress = 75;

  const videos = [
    {
      title: "אימון מנטאלי - שבוע 1",
      url: "https://www.youtube.com/watch?v=example1",
      date: "10.04.2024"
    },
    {
      title: "טכניקות נשימה",
      url: "https://www.youtube.com/watch?v=example2",
      date: "12.04.2024"
    }
  ];

  const goals = [
    "שיפור ביטחון עצמי במשחק",
    "פיתוח יכולת ריכוז למשך 90 דקות",
    "שליטה בלחץ במצבי משחק קריטיים"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(-1)}
                  >
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
            ברוך הבא, {playerName}! 🏆
          </h1>
          <Button 
            variant="outline" 
            size="icon"
            className="text-destructive hover:bg-destructive hover:text-white"
            onClick={() => setShowLogoutDialog(true)}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        <Card className="mb-6 bg-white/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">התקדמות שבועית</h3>
            <Progress value={weeklyProgress} className="h-2" />
            <p className="text-sm text-gray-600 mt-2">{weeklyProgress}% מהיעדים הושגו השבוע</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">המפגש הבא</CardTitle>
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{nextMeeting}</p>
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
                {videos.map((video, index) => (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer group">
                        <Play className="h-4 w-4 text-primary group-hover:text-primary/70" />
                        <div>
                          <p className="font-medium">{video.title}</p>
                          <p className="text-sm text-gray-500">{video.date}</p>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{video.title}</DialogTitle>
                        <DialogDescription>
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
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">מטרות</CardTitle>
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

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer bg-white/50 backdrop-blur-sm"
            onClick={() => navigate("/player-evaluation")}
          >
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

export default Dashboard;
