
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MentalPrepForm } from "@/components/MentalPrepForm";
import { LogOut, ArrowRight, LayoutDashboard, Film } from "lucide-react";
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

const Index = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [assignedVideos, setAssignedVideos] = useState<any[]>([]);
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    
    if (!assignedError && assignedVideoData) {
      setAssignedVideos(assignedVideoData);
    } else {
      console.error('Error fetching assigned videos:', assignedError);
    }
    
    // Fetch all videos (admin + coach videos)
    const { data: allVideoData, error: allError } = await supabase
      .from('videos')
      .select('*')
      .eq('is_admin_video', true);
    
    if (!allError && allVideoData) {
      setAllVideos(allVideoData);
    } else {
      console.error('Error fetching all videos:', allError);
    }
    
    setLoading(false);
  };

  const handleVideoClick = (videoUrl: string) => {
    window.open(videoUrl, '_blank');
  };

  const markVideoAsWatched = async (playerVideoId: string) => {
    const { error } = await supabase
      .from('player_videos')
      .update({
        watched: true,
        watched_at: new Date().toISOString()
      })
      .eq('id', playerVideoId);
    
    if (!error) {
      // Update the local state
      setAssignedVideos(prev => 
        prev.map(video => 
          video.id === playerVideoId 
            ? { ...video, watched: true, watched_at: new Date().toISOString() } 
            : video
        )
      );
    } else {
      console.error('Error marking video as watched:', error);
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
          
          {/* Video Card */}
          <Card className="bg-white shadow-lg border-primary/20 overflow-visible">
            <CardHeader className="bg-primary/10 py-4 rounded-t-lg border-b border-primary/10">
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
                  {loading ? (
                    <div className="text-center py-6">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
                      <p className="mt-2 text-gray-500">טוען סרטונים...</p>
                    </div>
                  ) : assignedVideos.length > 0 ? (
                    <div className="space-y-3">
                      {assignedVideos.map((playerVideo) => (
                        <div key={playerVideo.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex-1">
                            <h3 className="font-medium">{playerVideo.videos.title}</h3>
                            {playerVideo.videos.description && (
                              <p className="text-sm text-gray-500 mt-1">{playerVideo.videos.description}</p>
                            )}
                          </div>
                          <div className="flex space-x-2 rtl:space-x-reverse items-center">
                            {playerVideo.watched ? (
                              <span className="text-green-500 text-sm px-2 py-1 bg-green-50 rounded-full">נצפה</span>
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
