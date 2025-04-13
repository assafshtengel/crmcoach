
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
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
  watched?: boolean;
  watched_at?: string;
  player_video_id?: string;
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
      console.log("[DEBUG] Fetching videos for coachId:", coachId, "playerId:", playerId);
      
      if (!coachId) {
        throw new Error("חסר מזהה מאמן");
      }
      
      if (!playerId) {
        await fetchCoachVideos();
        return;
      }
      
      await fetchPlayerAssignedVideos(playerId);
      
    } catch (error) {
      console.error("[ERROR] Error fetching videos:", error);
      setError("לא ניתן לטעון את הסרטונים");
      toast({
        title: "שגיאה בטעינת סרטונים",
        description: "לא ניתן לטעון את הסרטונים.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPlayerAssignedVideos = async (playerId: string) => {
    try {
      console.log("[DEBUG] Fetching assigned videos for player:", playerId);
      
      // Get player_videos to find which videos are assigned to the player
      const { data: playerVideosData, error: playerVideosError } = await supabase
        .from("player_videos")
        .select("*")
        .eq("player_id", playerId);
        
      console.log("[DEBUG] Raw player_videos data:", playerVideosData);
      
      if (playerVideosError) {
        console.error("[ERROR] Error fetching player_videos:", playerVideosError);
        throw playerVideosError;
      }
      
      if (!playerVideosData || playerVideosData.length === 0) {
        console.log("[INFO] No player_videos found for this player, fetching coach videos instead");
        
        // If no videos specifically assigned to player, try to get coach videos
        if (coachId) {
          await fetchCoachVideos();
          return;
        }
        
        setVideos([]);
        setActiveVideo(null);
        setError("אין סרטונים זמינים כרגע");
        return;
      }
      
      // Extract video IDs from player_videos
      const videoIds = playerVideosData.map(pv => pv.video_id);
      console.log("[DEBUG] Extracted video IDs:", videoIds);
      
      // Fetch the complete video information
      if (videoIds.length > 0) {
        const { data: videosData, error: videosError } = await supabase
          .from("videos")
          .select("*")
          .in("id", videoIds);
          
        console.log("[DEBUG] Full videos data:", videosData);
        
        if (videosError) {
          console.error("[ERROR] Error fetching videos data:", videosError);
          throw videosError;
        }
        
        if (!videosData || videosData.length === 0) {
          console.log("[INFO] No videos found with the provided IDs");
          setVideos([]);
          setActiveVideo(null);
          setError("לא נמצאו סרטונים תואמים");
          return;
        }
        
        // Combine information from player_videos and videos tables
        const formattedVideos = videosData.map(video => {
          // Find the corresponding player_video record
          const playerVideo = playerVideosData.find(pv => pv.video_id === video.id);
          
          return {
            id: video.id,
            title: video.title,
            url: video.url,
            description: video.description || "",
            category: video.category,
            created_at: video.created_at,
            is_auto_scheduled: video.is_auto_scheduled,
            days_after_registration: video.days_after_registration,
            // Information from player_videos
            player_video_id: playerVideo?.id,
            watched: playerVideo?.watched || false,
            watched_at: playerVideo?.watched_at
          } as Video;
        });
        
        console.log("[DEBUG] Formatted combined videos:", formattedVideos);
        
        // Sort by creation date (newest first)
        formattedVideos.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        setVideos(formattedVideos);
        
        if (formattedVideos.length > 0) {
          setActiveVideo(formattedVideos[0]);
          setError(null);
        } else {
          setActiveVideo(null);
          setError("לא נמצאו סרטונים לשחקן זה");
        }
      } else {
        setVideos([]);
        setActiveVideo(null);
        setError("לא נמצאו סרטונים לשחקן זה");
      }
      
    } catch (error) {
      console.error("[ERROR] Error in fetchPlayerAssignedVideos:", error);
      
      // Fallback to coach videos if there's an error fetching player-specific videos
      try {
        if (coachId) {
          console.log("[INFO] Trying to fetch coach videos instead");
          await fetchCoachVideos();
        }
      } catch (coachError) {
        console.error("[ERROR] Error fetching coach videos fallback:", coachError);
        setVideos([]);
        setActiveVideo(null);
        setError("אין סרטונים זמינים כרגע");
      }
    }
  };
  
  const fetchCoachVideos = async () => {
    try {
      console.log("[DEBUG] Fetching coach videos");
      
      const { data: coachVideos, error: coachVideosError } = await supabase
        .from("videos")
        .select("*")
        .eq("coach_id", coachId)
        .eq("is_admin_video", false)
        .order("created_at", { ascending: false });
        
      if (coachVideosError) {
        console.error("[ERROR] Error fetching coach videos:", coachVideosError);
        throw coachVideosError;
      }
      
      console.log("[DEBUG] Coach videos:", coachVideos?.length || 0);
      
      if (coachVideos && coachVideos.length > 0) {
        const formattedVideos = coachVideos.map(video => ({
          id: video.id,
          title: video.title,
          url: video.url,
          description: video.description || "",
          category: video.category,
          created_at: video.created_at,
          is_auto_scheduled: video.is_auto_scheduled,
          days_after_registration: video.days_after_registration,
          watched: false
        }));
        
        setVideos(formattedVideos);
        setActiveVideo(formattedVideos[0]);
        setError(null);
      } else {
        setVideos([]);
        setActiveVideo(null);
        setError("לא נמצאו סרטונים זמינים");
      }
    } catch (error) {
      console.error("[ERROR] Error fetching coach videos:", error);
      setVideos([]);
      setActiveVideo(null);
      setError("לא ניתן לטעון את הסרטונים");
    }
  };

  // Load videos when the component is mounted
  useEffect(() => {
    console.log("[DEBUG] VideosTab mounted - coachId:", coachId, "playerId:", playerId);
    if (coachId) {
      fetchVideos();
    } else {
      setLoading(false);
      setError("חסר מזהה מאמן");
    }
  }, [coachId, playerId]);
  
  const handleWatchVideo = (video: Video) => {
    console.log("[DEBUG] Handling watch video:", video);
    setActiveVideo(video);
    
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
    
    if (playerId && video.id && !video.watched) {
      if (video.player_video_id) {
        markVideoAsWatched(playerId, video.id, video.player_video_id);
      } else {
        markVideoAsWatched(playerId, video.id);
      }
    }
  };
  
  const markVideoAsWatched = async (playerId: string, videoId: string, playerVideoId?: string) => {
    try {
      console.log("[DEBUG] Marking video as watched:", { playerId, videoId, playerVideoId });
      
      if (playerVideoId) {
        const { error } = await supabase
          .from('player_videos')
          .update({ 
            watched: true,
            watched_at: new Date().toISOString()
          })
          .eq('id', playerVideoId);
          
        if (error) {
          console.error("[ERROR] Error updating player_videos by ID:", error);
          return;
        }
      } else {
        const { data, error } = await supabase
          .from('player_videos')
          .select('id')
          .eq('player_id', playerId)
          .eq('video_id', videoId)
          .maybeSingle();
        
        if (error) {
          console.error("[ERROR] Error checking player_videos:", error);
          return;
        }
        
        if (data) {
          await supabase
            .from('player_videos')
            .update({ 
              watched: true,
              watched_at: new Date().toISOString()
            })
            .eq('id', data.id);
        } else {
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
      }
      
      // Update local state to reflect the change
      setVideos(prevVideos => 
        prevVideos.map(v => 
          v.id === videoId ? { ...v, watched: true, watched_at: new Date().toISOString() } : v
        )
      );
      
      console.log(`[DEBUG] Video ${videoId} marked as watched for player ${playerId}`);
      
      toast({
        title: "סרטון סומן כנצפה",
        description: "הסטטוס עודכן בהצלחה",
      });
    } catch (error) {
      console.error("[ERROR] Error marking video as watched:", error);
    }
  };
  
  const openVideoUrl = (url: string, event?: React.MouseEvent) => {
    console.log("[DEBUG] Opening video URL:", url);
    if (event) {
      event.stopPropagation();
    }
    
    if (!url || typeof url !== 'string') {
      console.error("[ERROR] Invalid URL provided:", url);
      toast({
        title: "שגיאה בפתיחת סרטון",
        description: "לא נמצא קישור תקין לסרטון",
        variant: "destructive"
      });
      return;
    }
    
    try {
      let cleanUrl = url.trim();
      
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl;
      }
      
      new URL(cleanUrl);
      window.open(cleanUrl, '_blank');
    } catch (error) {
      console.error("[ERROR] Invalid URL:", url, error);
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
                {activeVideo.watched && (
                  <span className="text-sm text-green-600 flex items-center">
                    <PlayIcon className="h-3 w-3 mr-1" /> נצפה
                  </span>
                )}
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
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-400">
                      {formatDate(video.created_at)}
                    </p>
                    {video.watched && (
                      <span className="text-xs text-green-600 flex items-center">
                        <PlayIcon className="h-3 w-3 mr-1" /> נצפה
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
