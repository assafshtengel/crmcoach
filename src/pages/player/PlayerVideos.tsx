
import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { PlayIcon, ExternalLink, RefreshCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScreenSize } from "@/hooks/use-screen-size";

interface Video {
  id: string;
  title: string;
  url: string;
  description: string;
  category?: string;
  created_at: string;
  watched?: boolean;
  watched_at?: string;
}

const PlayerVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const { width } = useScreenSize();

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user ID from session
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) {
        console.error("[ERROR] No user ID found in session");
        setError("יש להתחבר כדי לצפות בסרטונים");
        setLoading(false);
        return;
      }
      
      console.log("[DEBUG] Fetching videos for user:", userId);
      
      // Fetch videos assigned to this player
      const { data: assignedVideos, error: videosError } = await supabase
        .from("videos")
        .select("*")
        .contains('assigned_player_ids', [userId]);
        
      if (videosError) {
        console.error("[ERROR] Error fetching assigned videos:", videosError);
        setError("לא ניתן לטעון את הסרטונים");
        setLoading(false);
        return;
      }
      
      console.log("[DEBUG] Assigned videos found:", assignedVideos?.length || 0);
      
      if (!assignedVideos || assignedVideos.length === 0) {
        setError("אין סרטונים זמינים כרגע");
        setLoading(false);
        return;
      }
      
      // Get watch status for these videos
      const { data: watchStatus, error: watchError } = await supabase
        .from('player_videos')
        .select('video_id, watched, watched_at')
        .eq('player_id', userId)
        .in('video_id', assignedVideos.map(v => v.id));
        
      if (watchError) {
        console.error("[ERROR] Error fetching watch status:", watchError);
      }
      
      // Create a map of video_id -> watched status
      const watchMap: Record<string, boolean> = {};
      watchStatus?.forEach(status => {
        watchMap[status.video_id] = status.watched || false;
      });
      
      // Combine video data with watch status
      const videosWithStatus = assignedVideos.map(video => ({
        ...video,
        watched: watchMap[video.id] || false
      }));
      
      // Sort by creation date (newest first) and then by watched status
      const sortedVideos = videosWithStatus.sort((a, b) => {
        // First sort by watched status (unwatched first)
        if (a.watched !== b.watched) {
          return a.watched ? 1 : -1;
        }
        // Then sort by creation date (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      setVideos(sortedVideos);
      
      if (sortedVideos.length > 0) {
        setSelectedVideo(sortedVideos[0]);
      }
    } catch (error) {
      console.error("[ERROR] Error in fetchVideos:", error);
      setError("אירעה שגיאה בטעינת הסרטונים");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleWatchVideo = async (video: Video) => {
    try {
      if (!video.url) {
        toast.error("לא נמצא קישור לסרטון");
        return;
      }
      
      // Open video URL
      openVideoUrl(video.url);
      
      // Mark video as watched
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) {
        console.error("[ERROR] No user ID found when marking video as watched");
        return;
      }
      
      // Check if a record exists
      const { data: existing } = await supabase
        .from('player_videos')
        .select('id')
        .eq('player_id', userId)
        .eq('video_id', video.id)
        .maybeSingle();
        
      const now = new Date().toISOString();
      
      if (existing) {
        // Update existing record
        await supabase
          .from('player_videos')
          .update({ 
            watched: true,
            watched_at: now
          })
          .eq('id', existing.id);
      } else {
        // Create new record
        await supabase
          .from('player_videos')
          .insert([{ 
            player_id: userId,
            video_id: video.id,
            watched: true,
            watched_at: now
          }]);
      }
      
      // Update local state
      setVideos(prevVideos => 
        prevVideos.map(v => 
          v.id === video.id ? { ...v, watched: true, watched_at: now } : v
        )
      );
      
      if (selectedVideo?.id === video.id) {
        setSelectedVideo({ ...video, watched: true, watched_at: now });
      }
      
      toast.success("הסרטון סומן כנצפה");
      
    } catch (error) {
      console.error("[ERROR] Error marking video as watched:", error);
      toast.error("אירעה שגיאה בסימון הסרטון כנצפה");
    }
  };

  const openVideoUrl = (url: string) => {
    try {
      let cleanUrl = url.trim();
      
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl;
      }
      
      window.open(cleanUrl, '_blank');
    } catch (error) {
      console.error("[ERROR] Invalid URL:", url, error);
      toast.error("הקישור לסרטון אינו תקין");
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
      <div className="p-4 space-y-4">
        <Skeleton className="h-12 w-3/4 rounded-lg" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button 
          variant="outline" 
          onClick={fetchVideos}
          className="flex items-center gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          נסה שנית
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">הסרטונים שלי</h1>

      <div className={`grid grid-cols-1 ${width > 640 ? 'md:grid-cols-2 lg:grid-cols-3' : ''} gap-4`}>
        {videos.map((video) => (
          <Card 
            key={video.id} 
            className="overflow-hidden transition-shadow hover:shadow-md"
          >
            <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
              <PlayIcon className="h-12 w-12 text-gray-400" />
              {video.watched && (
                <Badge className="absolute top-2 right-2 bg-green-100 text-green-800" variant="success">
                  נצפה
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-1 line-clamp-1">{video.title}</h3>
              <p className="text-gray-500 text-sm mb-2">{formatDate(video.created_at)}</p>
              <p className="text-gray-700 text-sm line-clamp-2">{video.description}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button 
                onClick={() => handleWatchVideo(video)} 
                className="w-full flex items-center justify-center gap-2"
              >
                {video.watched ? 'צפה שוב' : 'צפה עכשיו'}
                <ExternalLink className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">אין סרטונים זמינים כרגע</p>
        </div>
      )}
    </div>
  );
};

export default PlayerVideos;
