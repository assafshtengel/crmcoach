
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PlayIcon, ExternalLink } from "lucide-react";
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

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching videos for coachId:", coachId, "playerId:", playerId);
        
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
        
        // Verify all videos have required fields
        const validVideos = allAssignedVideos.filter(video => 
          video && video.id && video.title && video.created_at
        );
        
        if (validVideos.length === 0) {
          console.log("No valid videos found for this player");
          setVideos([]);
          setActiveVideo(null);
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
        const { data: coachVideos, error: coachVideosError } = await supabase
          .from("videos")
          .select("*")
          .eq("coach_id", coachId)
          .eq("is_admin_video", false)
          .order("created_at", { ascending: false });
          
        if (coachVideosError) throw coachVideosError;
        
        const { data: adminVideos, error: adminVideosError } = await supabase
          .from("videos")
          .select("*")
          .eq("is_admin_video", true)
          .order("created_at", { ascending: false });
          
        if (adminVideosError) throw adminVideosError;
        
        const allVideos = [...(coachVideos || []), ...(adminVideos || [])];
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
    
    if (coachId) {
      fetchVideos();
    } else {
      setLoading(false);
      setError("חסר מזהה מאמן");
    }
  }, [coachId, playerId, toast]);
  
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
    
    if (!url) {
      toast({
        title: "שגיאה בפתיחת סרטון",
        description: "לא נמצא קישור לסרטון",
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
  
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    
    try {
      // Validate URL to prevent errors
      new URL(url);
      
      if (url.includes("youtube.com/watch")) {
        const videoId = new URL(url).searchParams.get("v");
        return `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes("youtu.be")) {
        const parts = url.split("/");
        const videoId = parts[parts.length - 1].split("?")[0];
        return `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes("vimeo.com")) {
        const vimeoId = url.split("/").pop();
        return `https://player.vimeo.com/video/${vimeoId}`;
      }
      return url;
    } catch (error) {
      console.error("Error processing URL:", url, error);
      return "";
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
            className="mt-4"
            onClick={() => window.location.reload()}
          >
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
            <div className="aspect-video relative rounded-md overflow-hidden">
              {activeVideo.url ? (
                <iframe 
                  src={getEmbedUrl(activeVideo.url)} 
                  className="absolute top-0 left-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={activeVideo.title}
                ></iframe>
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">לא נמצא קישור לסרטון</p>
                </div>
              )}
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">פורסם: {formatDate(activeVideo.created_at)}</span>
                {activeVideo.url && (
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="text-sm text-primary flex items-center gap-1 p-0 h-auto"
                    onClick={() => openVideoUrl(activeVideo.url)}
                  >
                    צפה באתר המקורי <ExternalLink className="h-3 w-3" />
                  </Button>
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
                  className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (video.url) {
                      openVideoUrl(video.url, e);
                    } else {
                      toast({
                        title: "שגיאה בפתיחת סרטון",
                        description: "לא נמצא קישור לסרטון",
                        variant: "destructive"
                      });
                    }
                  }}
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
