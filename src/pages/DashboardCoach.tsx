
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, UserPlus, Users, CalendarDays, BarChart, User, Mail, LogOut, FileEdit, Activity, Brain, Calendar } from "lucide-react";
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

interface Coach {
  first_name: string;
  last_name: string;
  email: string;
}

const DashboardCoach = () => {
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [coachData, setCoachData] = useState<Coach | null>(null);
  const [stats, setStats] = useState({
    players: 0,
    sessionsFuture: 0,
    sessionsPast: 0,
    dailyChallenge: 0,
  });

  useEffect(() => {
    const getCoachData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error } = await supabase
            .from("coaches")
            .select("first_name, last_name, email")
            .eq("id", user.id)
            .single();
          
          if (error) throw error;
          setCoachData(data);
          
          // Get player count
          const { count: playerCount, error: playerError } = await supabase
            .from("players")
            .select("id", { count: "exact", head: true })
            .eq("coach_id", user.id);
          
          if (playerError) throw playerError;
          
          // Get future sessions count
          const today = new Date().toISOString();
          const { count: futureSessions, error: futureError } = await supabase
            .from("sessions")
            .select("id", { count: "exact", head: true })
            .eq("coach_id", user.id)
            .gte("date", today);
          
          if (futureError) throw futureError;
          
          // Get past sessions count
          const { count: pastSessions, error: pastError } = await supabase
            .from("sessions")
            .select("id", { count: "exact", head: true })
            .eq("coach_id", user.id)
            .lt("date", today);
          
          if (pastError) throw pastError;
          
          setStats({
            players: playerCount || 0,
            sessionsFuture: futureSessions || 0,
            sessionsPast: pastSessions || 0,
            dailyChallenge: 0, // Placeholder
          });
        }
      } catch (error) {
        console.error("Error fetching coach data:", error);
      }
    };
    
    getCoachData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-white py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              שלום {coachData ? `${coachData.first_name} ${coachData.last_name}` : "מאמן"}
            </h1>
            <p className="text-gray-600">ברוך הבא למערכת הניהול שלך</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="text-destructive hover:bg-destructive hover:text-white transition-colors"
              onClick={() => setShowLogoutDialog(true)}
            >
              <LogOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/profile-coach")}
              className="transition-colors"
            >
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="mr-2 h-5 w-5 text-primary" />
                שחקנים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.players}</p>
            </CardContent>
            <CardFooter>
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={() => navigate("/players-list")}
              >
                <span>הצג שחקנים</span>
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                מפגשים עתידיים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.sessionsFuture}</p>
            </CardContent>
            <CardFooter>
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={() => navigate("/sessions-list")}
              >
                <span>הצג מפגשים</span>
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <CalendarDays className="mr-2 h-5 w-5 text-primary" />
                מפגשים שהתקיימו
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.sessionsPast}</p>
            </CardContent>
            <CardFooter>
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={() => navigate("/session-summaries")}
              >
                <span>סיכומי מפגשים</span>
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Activity className="mr-2 h-5 w-5 text-primary" />
                נתוני שחקנים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-medium">ניתוח ביצועים</p>
            </CardContent>
            <CardFooter>
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={() => navigate("/analytics")}
              >
                <span>צפה בנתונים</span>
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="col-span-1 bg-gradient-to-br from-orange-50 to-orange-100 transition-transform hover:scale-[1.01]">
            <CardHeader>
              <CardTitle className="text-xl">הוספת שחקן חדש</CardTitle>
              <CardDescription>
                הוסף שחקן חדש למערכת שלך
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <UserPlus className="h-16 w-16 text-orange-500" />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => navigate("/new-player")}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                הוסף שחקן חדש
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="col-span-1 bg-gradient-to-br from-blue-50 to-blue-100 transition-transform hover:scale-[1.01]">
            <CardHeader>
              <CardTitle className="text-xl">תיאום מפגש חדש</CardTitle>
              <CardDescription>
                צור מפגש חדש עם שחקן
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <CalendarDays className="h-16 w-16 text-blue-500" />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => navigate("/new-session")}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                צור מפגש חדש
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="col-span-1 bg-gradient-to-br from-purple-50 to-purple-100 transition-transform hover:scale-[1.01]">
            <CardHeader>
              <CardTitle className="text-xl">כלים מנטליים</CardTitle>
              <CardDescription>
                גש למאגר הכלים המנטליים
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <Brain className="h-16 w-16 text-purple-500" />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => navigate("/mental-tools")}
                className="w-full bg-purple-500 hover:bg-purple-600"
              >
                כלים מנטליים
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">פעולות נוספות</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="justify-start" 
                onClick={() => navigate("/player-evaluation")}
              >
                <FileEdit className="mr-2 h-4 w-4" />
                הערכת שחקן
              </Button>
              <Button 
                variant="outline" 
                className="justify-start" 
                onClick={() => navigate("/game-prep")}
              >
                <Activity className="mr-2 h-4 w-4" />
                הכנה למשחק
              </Button>
              <Button 
                variant="outline" 
                className="justify-start" 
                onClick={() => navigate("/registration-links")}
              >
                <Mail className="mr-2 h-4 w-4" />
                קישורי הרשמה
              </Button>
              <Button 
                variant="outline" 
                className="justify-start" 
                onClick={() => navigate("/tool-management")}
              >
                <Brain className="mr-2 h-4 w-4" />
                ניהול כלים
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">דוחות ונתונים</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="justify-start" 
                onClick={() => navigate("/reports")}
              >
                <BarChart className="mr-2 h-4 w-4" />
                דוחות מפגשים
              </Button>
              <Button 
                variant="outline" 
                className="justify-start" 
                onClick={() => navigate("/all-meeting-summaries")}
              >
                <FileEdit className="mr-2 h-4 w-4" />
                סיכומי מפגשים
              </Button>
              <Button 
                variant="outline" 
                className="justify-start" 
                onClick={() => navigate("/mental-commitment")}
              >
                <Brain className="mr-2 h-4 w-4" />
                התחייבות מנטלית
              </Button>
              <Button 
                variant="outline" 
                className="justify-start" 
                onClick={() => navigate("/huze")}
              >
                <FileEdit className="mr-2 h-4 w-4" />
                חוזה
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>אתה בטוח שברצונך להתנתק?</AlertDialogTitle>
            <AlertDialogDescription>
              לאחר ההתנתקות תצטרך להתחבר מחדש כדי לגשת למערכת
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>לא</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
              כן, התנתק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardCoach;
