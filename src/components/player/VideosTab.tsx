
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PlayIcon, ExternalLink, RefreshCcw, Link } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface Video {
  id: string;
  title: string;
  url: string;
  description: string;
  category?: string;
  created_at: string;
  is_auto_scheduled?: boolean;
  days_after_registration?: number;
}

interface VideosTabProps {
  coachId: string;
  playerId?: string;
  onWatchVideo?: (videoId: string) => void;
}

export const VideosTab = ({ coachId, playerId, onWatchVideo }: VideosTabProps) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching videos for coachId:", coachId, "playerId:", playerId);
      
      if (!coachId) {
        throw new Error("חסר מזהה מאמן");
      }
      
      if (!playerId) {
        await fetchAllVideos();
        return;
      }
      
      // First fetch manually assigned videos from player_videos
      const { data: playerVideos, error: playerVideosError } = await supabase
        .from("player_videos")
        .select(`
          video_id,
          watched,
          watched_at,
          videos:video_id (id, title, url, description, category, created_at)
        `)
        .eq("player_id", playerId);
        
      if (playerVideosError) {
        console.error("Error fetching player_videos:", playerVideosError);
        throw playerVideosError;
      }
      
      console.log("Manually assigned videos data:", playerVideos);
      
      // Get complete video objects from manually assigned videos
      const manuallyAssignedVideos = playerVideos
        ?.filter(pv => pv.videos) // Filter out any null video references
        .map(pv => {
          // Make sure we have the full video object with all required fields
          if (pv.videos) {
            return {
              ...pv.videos,
              watched: pv.watched,
              watched_at: pv.watched_at
            };
          }
          return null;
        })
        .filter(Boolean) || [];
        
      // Then fetch auto-assigned videos that have been sent
      const { data: autoAssignments, error: autoAssignmentsError } = await supabase
        .from("auto_video_assignments")
        .select(`
          video_id,
          scheduled_for,
          sent,
          videos:video_id (id, title, url, description, category, created_at, days_after_registration)
        `)
        .eq("player_id", playerId)
        .eq("sent", true);
        
      if (autoAssignmentsError) {
        console.error("Error fetching auto_video_assignments:", autoAssignmentsError);
        throw autoAssignmentsError;
      }
      
      console.log("Auto-assigned videos data:", autoAssignments);
      
      // Get complete video objects from auto-assigned videos
      const autoAssignedVideos = autoAssignments
        ?.filter(aa => aa.videos && aa.sent) // Only include sent videos with valid data
        .map(aa => {
          if (aa.videos) {
            return {
              ...aa.videos,
              is_auto_scheduled: true
            };
          }
          return null;
        })
        .filter(Boolean) || [];
      
      // Combine all videos, removing duplicates by ID
      const videoMap = new Map<string, Video>();
      
      [...manuallyAssignedVideos, ...autoAssignedVideos].forEach(video => {
        if (video && video.id) {
          videoMap.set(video.id, video as Video);
        }
      });
      
      const allAssignedVideos = Array.from(videoMap.values());
      
      console.log("Combined assigned videos:", allAssignedVideos);
      
      // If we got no videos from player assignments, try fetching coach videos
      if (allAssignedVideos.length === 0) {
        console.log("No assigned videos found, fetching coach videos instead");
        await fetchAllVideos();
        return;
      }
      
      // Verify all videos have required fields
      const validVideos = allAssignedVideos.filter(video => 
        video && video.id && video.title && video.created_at
      );
      
      if (validVideos.length === 0) {
        console.log("No valid videos found for this player");
        setVideos([]);
        setActiveVideo(null);
        setError("לא נמצאו סרטונים זמינים");
      } else {
        // Sort by date, newest first
        validVideos.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        setVideos(validVideos);
        setActiveVideo(validVideos[0]);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      setError("לא ניתן לטעון את הסרטונים");
      toast({
        title: "שגיאה בטעינת סרטונים",
        description: "לא ניתן לטעון את הסרטונים",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAllVideos = async () => {
    try {
      // Fetch both coach-specific and admin videos
      const { data: coachVideos, error: coachVideosError } = await supabase
        .from("videos")
        .select("*")
        .eq("coach_id", coachId)
        .eq("is_admin_video", false)
        .order("created_at", { ascending: false });
        
      if (coachVideosError) {
        console.error("Error fetching coach videos:", coachVideosError);
        throw coachVideosError;
      }
      
      const { data: adminVideos, error: adminVideosError } = await supabase
        .from("videos")
        .select("*")
        .eq("is_admin_video", true)
        .order("created_at", { ascending: false });
        
      if (adminVideosError) {
        console.error("Error fetching admin videos:", adminVideosError);
        throw adminVideosError;
      }
      
      console.log("Coach videos:", coachVideos?.length || 0, "Admin videos:", adminVideos?.length || 0);
      
      const allVideos = [...(coachVideos || []), ...(adminVideos || [])];
      
      if (allVideos.length === 0) {
        setError("לא נמצאו סרטונים זמינים");
        setVideos([]);
        setActiveVideo(null);
        return;
      }
      
      allVideos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      // Verify all videos have required fields
      const validVideos = allVideos.filter(video => 
        video && video.id && video.title && video.created_at
      );
      
      setVideos(validVideos);
      
      if (validVideos.length > 0) {
        setActiveVideo(validVideos[0]);
      } else {
        setActiveVideo(null);
        setError("לא נמצאו סרטונים תקינים");
      }
    } catch (error) {
      console.error("Error fetching all videos:", error);
      setError("לא ניתן לטעון את הסרטונים");
      toast({
        title: "שגיאה בטעינת סרטונים",
        description: "לא ניתן לטעון את הסרטונים",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    if (coachId) {
      fetchVideos();
    } else {
      setLoading(false);
      setError("חסר מזהה מאמן");
    }
  }, [coachId, playerId]);
  
  const handleWatchVideo = (video: Video) => {
    console.log("Handling watch video:", video);
    setActiveVideo(video);
    
    // Open the video URL if it exists
    if (video.url) {
      openVideoUrl(video.url);
    } else {
      toast({
        title: "שגיאה בפתיחת סרטון",
        description: "לא נמצא קישור לסרטון",
        variant: "destructive"
      });
    }
    
    if (onWatchVideo && video.id) {
      onWatchVideo(video.id);
    }
    
    // If this is a player view and the video hasn't been marked as watched
    if (playerId && video.id) {
      markVideoAsWatched(playerId, video.id);
    }
  };
  
  const markVideoAsWatched = async (playerId: string, videoId: string) => {
    try {
      // Check if this video exists in player_videos
      const { data, error } = await supabase
        .from('player_videos')
        .select('*')
        .eq('player_id', playerId)
        .eq('video_id', videoId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error("Error checking player_videos:", error);
        return;
      }
      
      if (data) {
        // Update existing record
        await supabase
          .from('player_videos')
          .update({ 
            watched: true,
            watched_at: new Date().toISOString()
          })
          .eq('player_id', playerId)
          .eq('video_id', videoId);
      } else {
        // Insert new record
        await supabase
          .from('player_videos')
          .insert([{ 
            player_id: playerId,
            video_id: videoId,
            watched: true,
            watched_at: new Date().toISOString(),
            assigned_by: coachId
          }]);
      }
      
      console.log(`Video ${videoId} marked as watched for player ${playerId}`);
    } catch (error) {
      console.error("Error marking video as watched:", error);
    }
  };
  
  const openVideoUrl = (url: string, event?: React.MouseEvent) => {
    console.log("Opening video URL:", url);
    if (event) {
      event.stopPropagation();
    }
    
    if (!url || typeof url !== 'string') {
      console.error("Invalid URL provided:", url);
      toast({
        title: "שגיאה בפתיחת סרטון",
        description: "לא נמצא קישור תקין לסרטון",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Validate URL before opening
      new URL(url); // This will throw an error if the URL is invalid
      window.open(url, '_blank');
    } catch (error) {
      console.error("Invalid URL:", url, error);
      toast({
        title: "שגיאה בפתיחת סרטון",
        description: "הקישור לסרטון אינו תקין",
        variant: "destructive"
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full h-[300px] rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-md" />
          <Skeleton className="h-24 rounded-md" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-500 font-medium">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4 flex items-center gap-2"
            onClick={() => fetchVideos()}
          >
            <RefreshCcw className="h-4 w-4" />
            נסה שוב
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (videos.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">אין סרטונים זמינים כרגע.</p>
          <Button 
            variant="outline" 
            className="mt-4 flex items-center gap-2"
            onClick={() => fetchVideos()}
          >
            <RefreshCcw className="h-4 w-4" />
            רענן
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activeVideo && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{activeVideo.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video relative rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
              <div className="text-center p-6 flex flex-col items-center gap-4">
                <Link className="h-16 w-16 text-primary" />
                <p className="text-gray-700 font-medium">לחץ על הכפתור למטה כדי לצפות בסרטון</p>
                <Button 
                  size="lg"
                  onClick={() => activeVideo.url ? openVideoUrl(activeVideo.url) : null}
                  className="mt-2 flex items-center gap-2"
                  disabled={!activeVideo.url}
                >
                  צפה בסרטון
                  <ExternalLink className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">פורסם: {formatDate(activeVideo.created_at)}</span>
              </div>
              <p className="whitespace-pre-line text-sm text-gray-700">{activeVideo.description}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((video) => (
          <Card 
            key={video.id} 
            className={`cursor-pointer hover:shadow-md transition-shadow ${activeVideo?.id === video.id ? 'ring-2 ring-primary' : ''}`}
            onClick={() => handleWatchVideo(video)}
          >
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div 
                  className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors"
                >
                  <PlayIcon className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-medium text-base truncate">{video.title}</h3>
                  <p className="text-gray-500 text-sm truncate">
                    {video.category || "כללי"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(video.created_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
