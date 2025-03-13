import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, FileText, ImageIcon, MessageSquare, Plus, Users, BarChart, BookOpen, Target, Bell, PieChart, Trophy, ClipboardList, TrendingUp, LineChart, UserPlus, CalendarPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTool, deleteTool, getTools } from "@/lib/api/tools";
import { Tool } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";

const DashboardCoach = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newToolName, setNewToolName] = useState("");
  const [newToolDescription, setNewToolDescription] = useState("");
  const [tools, setTools] = useState<Tool[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    sentVideos: 0,
    completedMeetings: 3,
    activePlayers: 5,
    unreadReports: 2
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
        setUserName(data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'מאמן');
        
        try {
          const { data: statsData, error } = await supabase
            .rpc('get_coach_statistics', { coach_id: data.user.id });
            
          if (!error && statsData) {
            setStats(prev => ({
              ...prev,
              sentVideos: statsData.totalsessions || 0,
              completedMeetings: statsData.successfulreminders || 3,
              activePlayers: statsData.activeplayerscount || 5
            }));
          }
        } catch (err) {
          console.error("Error fetching coach statistics:", err);
        }
      }
    };
    
    fetchUser();
  }, []);

  const { data: toolsData, isLoading, isError, error } = useQuery({
    queryKey: ["tools"],
    queryFn: () => {
      return getTools().then(data => {
        console.log("Successfully fetched tools");
        return data;
      }).catch(error => {
        console.error("Error fetching tools:", error);
        return [];
      });
    },
    retry: 1
  });

  useEffect(() => {
    if (toolsData) {
      setTools(toolsData as Tool[]);
    }
  }, [toolsData]);

  const createToolMutation = useMutation({
    mutationFn: (toolData: Omit<Tool, 'id' | 'created_at'>) => createTool(toolData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] });
      toast({
        title: "כלי חדש נוסף בהצלחה!",
        description: "הכלי החדש זמין כעת למשתמשים שלך.",
      });
      setNewToolName("");
      setNewToolDescription("");
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "אופס! משהו השתבש.",
        description: error.message || "אירעה שגיאה בעת יצירת הכלי.",
        variant: "destructive",
      });
    },
  });

  const deleteToolMutation = useMutation({
    mutationFn: (toolId: string) => deleteTool(toolId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] });
      toast({
        title: "הכלי נמחק בהצלחה!",
        description: "הכלי הוסר מהמערכת.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "אופס! משהו השתבש.",
        description: error.message || "אירעה שגיאה בעת מחיקת הכלי.",
        variant: "destructive",
      });
    },
  });

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleCreateTool = async () => {
    if (!newToolName || !newToolDescription) {
      toast({
        title: "חסרים פרטים",
        description: "יש למלא את כל השדות.",
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      toast({
        title: "משתמש לא מזוהה",
        description: "נא לבצע התחברות מחדש",
        variant: "destructive",
      });
      return;
    }

    await createToolMutation.mutateAsync({
      name: newToolName,
      description: newToolDescription,
      creatorId: userId
    });
  };

  const handleDeleteTool = async (toolId: string) => {
    await deleteToolMutation.mutateAsync(toolId);
  };

  const handleNewSession = () => {
    navigate("/new-session-form");
    toast({
      title: "מעבר לדף יצירת מפגש חדש",
      description: "כעת תוכל ליצור מפגש חדש",
    });
  };

  return (
    <div className="container mx-auto py-4 px-4 md:px-6 min-h-screen overflow-y-auto">
      <div className="mb-8 bg-gray-800 rounded-lg p-4 shadow-md text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative bg-red-500 p-2 rounded-full hover:bg-red-600"
            onClick={() => navigate("/notifications")}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-400 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-blue-500 p-2 rounded-full hover:bg-blue-600"
            onClick={() => navigate("/all-meeting-summaries")}
          >
            <FileText className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative bg-blue-500 p-2 rounded-full hover:bg-blue-600"
            onClick={() => navigate("/chat")}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {stats.unreadReports}
            </span>
          </Button>
        </div>
        <div className="flex items-center">
          <h1 className="text-xl font-bold ml-2">ברוך הבא, {userName} 👋</h1>
          <Button 
            variant="ghost" 
            className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center p-0"
            onClick={() => navigate("/profile-coach")}
          >
            <span className="text-gray-700 font-bold">
              {userName.charAt(0).toUpperCase()}
            </span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <Button 
          className="bg-green-500 hover:bg-green-600 flex items-center gap-2"
          onClick={() => navigate("/add-player")}
        >
          <UserPlus className="h-5 w-5" />
          הוסף משתתף חדש
        </Button>
        
        <Button 
          className="bg-blue-500 hover:bg-blue-600 flex items-center gap-2"
          onClick={handleNewSession}
        >
          <CalendarPlus className="h-5 w-5" />
          צור מפגש חדש
        </Button>
      </div>

      <h2 className="text-lg font-semibold text-gray-700 mb-4">שליחת הודעה למתאמנים</h2>
      
      <div className="bg-blue-50 p-4 rounded-md mb-8 flex items-center justify-between">
        <Button 
          className="bg-primary text-white"
          onClick={() => navigate("/send-message")}
        >
          שליחת הודעה למספר המתאמן
        </Button>
        <div className="flex items-center">
          <ClipboardList className="h-5 w-5 text-blue-500 mr-2" />
          <p className="text-blue-700 font-medium">שליחת הודעה למתאמנים</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-yellow-400">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-right text-gray-600">סרטונים שנצפו</p>
                <p className="text-4xl font-bold">{stats.sentVideos}</p>
                <p className="text-sm text-gray-500">משתתפים צפו בסרטונים</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <ImageIcon className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-4 border-yellow-400 text-yellow-600"
              onClick={() => navigate("/training-videos")}
            >
              הוסף סרטון חדש
            </Button>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-blue-400">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-right text-gray-600">מפגשים מתוזמנים</p>
                <p className="text-4xl font-bold">{stats.completedMeetings}</p>
                <p className="text-sm text-gray-500">מפגשים בשבוע הנוכחי (מתוך 10 מפגשים)</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <CalendarIcon className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-4 border-blue-400 text-blue-600"
              onClick={() => navigate("/sessions-list")}
            >
              צפה בפירוט המפגשים המתוזמנים
            </Button>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-green-400">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-right text-gray-600">משתתפים פעילים</p>
                <p className="text-4xl font-bold">{stats.activePlayers}</p>
                <p className="text-sm text-gray-500">משתתפים במסלול</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-green-500" />
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-4 border-green-400 text-green-600"
              onClick={() => navigate("/players-list")}
            >
              צפה בהתקדמות המשתתפים
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-purple-400">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-semibold text-lg text-gray-700">סיכומי מפגשים</h3>
            </div>
            <p className="text-gray-600 mb-6 text-right">צפה בסיכומי 10 המפגשים האחרונים וערוך אותם</p>
            <Button 
              className="w-full bg-purple-500 hover:bg-purple-600"
              onClick={() => navigate("/all-meeting-summaries")}
            >
              צפה בסיכומי מפגשים
            </Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-red-400">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <BarChart className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="font-semibold text-lg text-gray-700">דוחות וסטטיסטיקה</h3>
            </div>
            <p className="text-gray-600 mb-6 text-right">צפה בדוחות על התקדמות המשתתפים וביצועיהם</p>
            <Button 
              className="w-full bg-red-500 hover:bg-red-600"
              onClick={() => navigate("/reports")}
            >
              צפה בדוחות
            </Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-400">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Target className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-lg text-gray-700">הגדרת יעדים</h3>
            </div>
            <p className="text-gray-600 mb-6 text-right">הגדר יעדים אישיים למשתתפים ועקוב אחר התקדמותם</p>
            <Button 
              className="w-full bg-green-500 hover:bg-green-600"
              onClick={() => navigate("/goals")}
            >
              הגדר יעדים חדשים
            </Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-400">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-lg text-gray-700">הספרייה המנטלית</h3>
            </div>
            <p className="text-gray-600 mb-6 text-right">נהל ושתף את תכני הספרייה המנטלית עם המשתתפים</p>
            <Button 
              className="w-full bg-blue-500 hover:bg-blue-600"
              onClick={() => navigate("/mental-library")}
            >
              צפה בספרייה
            </Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-orange-400">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="font-semibold text-lg text-gray-700">הישגים ושיפורים</h3>
            </div>
            <p className="text-gray-600 mb-6 text-right">צפה בהישגים של המשתתפים ועקוב אחר שיפורם</p>
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={() => navigate("/player-statistics")}
            >
              צפה בהישגים
            </Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-400">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <LineChart className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-semibold text-lg text-gray-700">סיכומי משחק</h3>
            </div>
            <p className="text-gray-600 mb-6 text-right">צפה בסיכומי משחקים וניתוח ביצועים עבור כל משתתף</p>
            <Button 
              className="w-full bg-purple-500 hover:bg-purple-600"
              onClick={() => navigate("/game-summary")}
            >
              צפה בסיכומי משחק
            </Button>
          </CardContent>
        </Card>
      </div>

      <section className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={handleOpenDialog} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            הוסף כלי חדש
          </Button>
          <h2 className="text-2xl font-bold text-gray-800">
            כלים מנטליים
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="shadow-md">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-48 mb-4" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <div className="text-red-500 p-4 bg-red-50 rounded-md">
            <p>אירעה שגיאה בטעינת הכלים. {error instanceof Error ? error.message : ''}</p>
            <p className="text-sm mt-2">יתכן שטבלת הכלים אינה קיימת בבסיס הנתונים. אנא צור קשר עם מנהל המערכת.</p>
          </div>
        ) : tools.length === 0 ? (
          <div className="text-gray-500 p-8 bg-gray-50 rounded-md text-center">
            לא הוספת כלים עדיין. לחץ על "הוסף כלי חדש" כדי להתחיל.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Card key={tool.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-700 mb-2">
                    {tool.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{tool.description}</p>
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/tool-details/${tool.id}`)}
                    >
                      פרטים
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          מחק
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                          <AlertDialogDescription>
                            פעולה זו תמחק את הכלי לצמיתות ולא ניתן יהיה לבטל אותה.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            ביטול
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteTool(tool.id)}>
                            מחק
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>הוסף כלי חדש</AlertDialogTitle>
            <AlertDialogDescription>
              הזן את הפרטים של הכלי החדש שברצונך להוסיף.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                שם הכלי
              </Label>
              <Input
                type="text"
                id="name"
                value={newToolName}
                onChange={(e) => setNewToolName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                תיאור
              </Label>
              <Textarea
                id="description"
                value={newToolDescription}
                onChange={(e) => setNewToolDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseDialog}>
              ביטול
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateTool}>
              צור
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardCoach;
