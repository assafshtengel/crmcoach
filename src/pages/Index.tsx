import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MentalPrepForm } from "@/components/MentalPrepForm";
import { LogOut, ArrowRight, LayoutDashboard, Film, CheckCircle, Send } from "lucide-react";
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

const Index = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [assignedVideos, setAssignedVideos] = useState<any[]>([]);
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
      
      if (user) {
        fetchVideos(user.id);
      }
    };
    getUserEmail();
  }, []);

  const fetchVideos = async (userId: string) => {
    setLoading(true);
    
    try {
      console.log("Fetching videos for player:", userId);
      
      // Fetch assigned videos for this player
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
      setAssignedVideos(assignedVideoData || []);
      
      // Fetch all videos (admin + coach videos)
      const { data: allVideoData, error: allError } = await supabase
        .from('videos')
        .select('*')
        .eq('is_admin_video', true);
      
      if (allError) {
        console.error('Error fetching all videos:', allError);
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
      
      // Update the local state
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-white py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              className="transition-transform hover:scale-105"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/")}
              className="transition-transform hover:scale-105"
            >
              <LayoutDashboard className="h-4 w-4" />
            </Button>
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            ברוך הבא{userEmail ? `, ${userEmail}` : ''}
          </h1>
          <Button 
            variant="outline" 
            size="icon"
            className="text-destructive hover:bg-destructive hover:text-white transition-colors"
            onClick={() => setShowLogoutDialog(true)}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl transform -rotate-1"></div>
            <div className="relative">
              <MentalPrepForm />
            </div>
          </div>
          
          {/* Add AdminMessageForm in a card before the Video Card */}
          <Card className="bg-white/90 shadow-md">
            <CardHeader className="bg-primary/10 py-4 rounded-t-lg border-b border-primary/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-primary">שליחת הודעה למנהלים</CardTitle>
                <Send className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <AdminMessageForm />
            </CardContent>
          </Card>
          
          {/* Video Card */}
          <Card className="bg-white shadow-lg border-primary/20 overflow-visible">
            <CardHeader className="bg-primary/10 py-4 rounded-t-lg border-b border-primary/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-primary">סרטוני וידאו</CardTitle>
                <div className="flex items-center">
                  {assignedVideos.length > 0 && !assignedVideos.every(v => v.watched) && (
                    <Badge variant="outline" className="mr-2 bg-amber-100 text-amber-800 border-amber-200">
                      יש סרטונים חדשים
                    </Badge>
                  )}
                  <Film className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="assigned" className="w-full">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="assigned" className="flex-1">
                    סרטונים שהוקצו לי
                    {assignedVideos.length > 0 && !assignedVideos.every(v => v.watched) && (
                      <span className="bg-primary text-white text-xs rounded-full ml-2 px-2 py-0.5">
                        {assignedVideos.filter(v => !v.watched).length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="all" className="flex-1">כל הסרטונים</TabsTrigger>
                </TabsList>
                <TabsContent value="assigned" className="space-y-4">
                  {loading ? (
                    <div className="text-center py-6">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
                      <p className="mt-2 text-gray-500">טוען סרטונים...</p>
                    </div>
                  ) : assignedVideos.length > 0 ? (
                    <div className="space-y-3">
                      {assignedVideos.map((playerVideo) => (
                        <div 
                          key={playerVideo.id} 
                          className={`flex justify-between items-center p-3 rounded-lg transition-colors ${
                            playerVideo.watched 
                              ? 'bg-gray-50 hover:bg-gray-100' 
                              : 'bg-amber-50 hover:bg-amber-100 border border-amber-200'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h3 className="font-medium">{playerVideo.videos.title}</h3>
                              {!playerVideo.watched && (
                                <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 border-amber-200">
                                  חדש
                                </Badge>
                              )}
                            </div>
                            {playerVideo.videos.description && (
                              <p className="text-sm text-gray-500 mt-1">{playerVideo.videos.description}</p>
                            )}
                            {playerVideo.videos.category && (
                              <Badge variant="secondary" className="mt-1">{playerVideo.videos.category}</Badge>
                            )}
                          </div>
                          <div className="flex space-x-2 rtl:space-x-reverse items-center">
                            {playerVideo.watched ? (
                              <div className="flex items-center text-green-500 text-sm px-2 py-1 bg-green-50 rounded-full">
                                <CheckCircle className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                                <span>נצפה</span>
                              </div>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-primary text-sm"
                                onClick={() => markVideoAsWatched(playerVideo.id)}
                              >
                                סמן כנצפה
                              </Button>
                            )}
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleVideoClick(playerVideo.videos.url)}
                            >
                              צפה
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Film className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p>אין סרטונים שהוקצו לך כרגע</p>
                      <p className="text-sm mt-1">סרטונים שהמאמן יקצה לך יופיעו כאן</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="all" className="space-y-4">
                  {loading ? (
                    <div className="text-center py-6">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
                      <p className="mt-2 text-gray-500">טוען סרטונים...</p>
                    </div>
                  ) : allVideos.length > 0 ? (
                    <div className="space-y-3">
                      {allVideos.map((video) => (
                        <div key={video.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex-1">
                            <h3 className="font-medium">{video.title}</h3>
                            {video.description && (
                              <p className="text-sm text-gray-500 mt-1">{video.description}</p>
                            )}
                            {video.category && (
                              <span className="inline-block text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 mt-2">
                                {video.category}
                              </span>
                            )}
                          </div>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleVideoClick(video.url)}
                          >
                            צפה
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Film className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p>אין סרטונים זמינים כרגע</p>
                      <p className="text-sm mt-1">סרטונים יתווספו למערכת בקרוב</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
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

export default Index;
