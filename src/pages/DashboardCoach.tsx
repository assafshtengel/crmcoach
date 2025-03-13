
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Code, ImageIcon, MessageSquare, Plus, Settings } from "lucide-react";
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch the current user from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
        setUserName(data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'מאמן');
      }
    };
    
    fetchUser();
  }, []);

  const { data: toolsData, isLoading, isError } = useQuery({
    queryKey: ["tools"],
    queryFn: () => getTools(),
  });

  useEffect(() => {
    if (toolsData) {
      setTools(toolsData);
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

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 min-h-screen overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          שלום {userName} 👋
        </h1>
        <p className="text-gray-500">
          ברוכים הבאים ללוח הבקרה שלך. כאן תוכלו לנהל את הכלים וההגדרות שלך.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div 
          className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#3498DB] cursor-pointer" 
          onClick={() => navigate("/tool-management")}
        >
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Code className="text-[#3498DB] mr-2 w-5 h-5" />
              <h3 className="font-semibold text-lg text-gray-700">
                ניהול כלים מנטליים
              </h3>
            </div>
            <p className="text-gray-600">
              הוסף, ערוך או הסר כלי אימון מנטליים הזמינים למשתמשים שלך.
            </p>
          </CardContent>
        </div>

        <div 
          className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#F1C40F] cursor-pointer" 
          onClick={() => navigate("/videos-management")}
        >
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <ImageIcon className="text-[#F1C40F] mr-2 w-5 h-5" />
              <h3 className="font-semibold text-lg text-gray-700">
                ניהול סרטוני וידאו
              </h3>
            </div>
            <p className="text-gray-600">
              נהל את סרטוני הוידאו הזמינים למשתמשים שלך.
            </p>
          </CardContent>
        </div>

        <div 
          className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#2ECC71] cursor-pointer" 
          onClick={() => navigate("/settings")}
        >
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Settings className="text-[#2ECC71] mr-2 w-5 h-5" />
              <h3 className="font-semibold text-lg text-gray-700">
                הגדרות
              </h3>
            </div>
            <p className="text-gray-600">
              עדכן את הגדרות הפרופיל שלך ונהל את המינוי שלך.
            </p>
          </CardContent>
        </div>
      </div>

      <section className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            כלים מנטליים שלך
          </h2>
          <Button onClick={handleOpenDialog}>
            <Plus className="w-4 h-4 mr-2" />
            הוסף כלי חדש
          </Button>
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
            אירעה שגיאה בטעינת הכלים. אנא נסו שוב מאוחר יותר.
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
