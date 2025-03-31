import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MentalPrepForm } from "@/components/MentalPrepForm";
import { LogOut, ArrowRight, LayoutDashboard, Film, CheckCircle, Send, ExternalLink, FileCheck, BrainCircuit, BookOpen, FileEdit, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AdminMessageForm } from "@/components/admin/AdminMessageForm";
import { BeliefBreakingCard } from "@/components/ui/BeliefBreakingCard";
import { MentalLibrary } from "@/components/mental-library/MentalLibrary";
import { LandingPageDialog } from "@/components/landing-page/LandingPageDialog";
import { VideosTab } from "@/components/player/VideosTab";

const Index = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [assignedVideos, setAssignedVideos] = useState<any[]>([]);
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showLandingPageDialog, setShowLandingPageDialog] = useState(false);
  const [coachId, setCoachId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
      
      if (user) {
        setUserId(user.id);
        
        // Check if we are a player
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .select('coach_id')
          .eq('id', user.id)
          .single();
          
        if (!playerError && playerData) {
          setCoachId(playerData.coach_id);
        } else {
          console.error("Error fetching player's coach ID:", playerError);
        }
      } else {
        console.log("No authenticated user found");
        setLoading(false);
      }
    };
    getUserInfo();
  }, [navigate]);

  const fetchVideos = async (userId: string) => {
    setLoading(true);
    
    try {
      console.log("Fetching videos for player:", userId);
      
      const { data: assignedVideoData, error: assignedError } = await supabase
        .from('player_videos')
        .select(`
          id,
          watched,
          watched_at,
          videos:video_id (
            id,
            title,
            url,
            description,
            category
          )
        `)
        .eq('player_id', userId);
      
      if (assignedError) {
        console.error('Error fetching assigned videos:', assignedError);
        throw assignedError;
      }
      
      console.log("Assigned videos fetched:", assignedVideoData);
      
      const filteredAssignedVideos = assignedVideoData?.filter(video => video.videos) || [];
      setAssignedVideos(filteredAssignedVideos);
      
      const { data: allVideoData, error: allError } = await supabase
        .from('videos')
        .select('*')
        .eq('is_admin_video', true);
      
      if (allError) {
        console.error('Error fetching admin videos:', allError);
        throw allError;
      }
      
      console.log("Admin videos fetched:", allVideoData);
      setAllVideos(allVideoData || []);
      
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        title: "שגיאה בטעינת סרטונים",
        description: "לא ניתן לטעון את רשימת הסרטונים",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (videoUrl: string) => {
    window.open(videoUrl, '_blank');
  };

  const markVideoAsWatched = async (playerVideoId: string) => {
    try {
      const { error } = await supabase
        .from('player_videos')
        .update({
          watched: true,
          watched_at: new Date().toISOString()
        })
        .eq('id', playerVideoId);
      
      if (error) {
        console.error('Error marking video as watched:', error);
        throw error;
      }
      
      setAssignedVideos(prev => 
        prev.map(video => 
          video.id === playerVideoId 
            ? { ...video, watched: true, watched_at: new Date().toISOString() } 
            : video
        )
      );
      
      toast({
        title: "סרטון סומן כנצפה",
        description: "הסטטוס עודכן בהצלחה",
      });
    } catch (error) {
      console.error('Error marking video as watched:', error);
      toast({
        title: "שגיאה בסימון הסרטון",
        description: "לא ניתן לעדכן את סטטוס הצפייה",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const refreshVideos = () => {
    if (userId) {
      fetchVideos(userId);
      toast({
        title: "מרענן את רשימת הסרטונים",
        description: "רשימת הסרטונים מתעדכנת",
      });
    }
  };

  console.log("Landing page dialog state:", showLandingPageDialog);
  console.log("Rendering Index.tsx page with landing page button");

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-white py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <header className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-primary">שלום, {userEmail || 'אורח'}</h1>
          </div>
          
          <div className="flex flex-wrap gap-3 items-center">
            <Button
              onClick={() => setShowLandingPageDialog(true)}
              variant="green"
              className="flex items-center gap-2"
              size="lg"
            >
              <FileEdit className="h-4 w-4" />
              צור עמוד נחיתה אישי
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowLogoutDialog(true)}
            >
              <LogOut className="h-4 w-4" />
              התנתק
            </Button>
          </div>
        </header>

        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>האם אתה בטוח שברצונך להתנתק?</AlertDialogTitle>
              <AlertDialogDescription>
                לאחר ההתנתקות תצטרך להתחבר מחדש כדי לגשת למערכת.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ביטול</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>התנתק</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Film className="h-4 w-4" /> סרטונים
            </TabsTrigger>
            <TabsTrigger value="mental-prep" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" /> הכנה מנטלית
            </TabsTrigger>
            <TabsTrigger value="belief-breaking" className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4" /> שבירת אמונות
            </TabsTrigger>
            <TabsTrigger value="mental-library" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> ספריה מנטלית
            </TabsTrigger>
            <TabsTrigger value="admin-message" className="flex items-center gap-2">
              <Send className="h-4 w-4" /> הודעה למנהל
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">הסרטונים שלי</h2>
              <Button 
                variant="outline" 
                onClick={() => {
                  if (userId && coachId) {
                    // This just refreshes the component
                    setLoading(true);
                    setTimeout(() => setLoading(false), 100);
                  }
                }}
                className="flex items-center gap-2"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                רענן רשימה
              </Button>
            </div>

            {userId && coachId ? (
              <VideosTab 
                coachId={coachId} 
                playerId={userId} 
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">טוען מידע...</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="mental-prep">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">הכנה מנטלית</CardTitle>
              </CardHeader>
              <CardContent>
                <MentalPrepForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="belief-breaking">
            <BeliefBreakingCard />
          </TabsContent>

          <TabsContent value="mental-library">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">ספריה מנטלית</CardTitle>
              </CardHeader>
              <CardContent>
                <MentalLibrary />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin-message">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">שלח הודעה למנהל</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminMessageForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <LandingPageDialog
        open={showLandingPageDialog}
        onOpenChange={setShowLandingPageDialog}
      />
    </div>
  );
};

export default Index;
