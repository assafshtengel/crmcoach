
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
  const { toast } = useToast();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        console.log("Fetching videos for coachId:", coachId, "playerId:", playerId);
        
        if (!playerId) {
          // For coach view - show all videos
          fetchAllVideos();
          return;
        }
        
        // For player view - show all assigned videos (both manual and auto-scheduled)
        // First, get manually assigned videos through player_videos table
        const { data: playerVideos, error: playerVideosError } = await supabase
          .from("player_videos")
          .select(`
            video_id,
            watched,
            watched_at,
            videos:video_id (*)
          `)
          .eq("player_id", playerId);
          
        if (playerVideosError) {
          console.error("Error fetching player_videos:", playerVideosError);
          throw playerVideosError;
        }
        
        console.log("Manually assigned videos data:", playerVideos);
        
        // Extract video objects from the nested structure
        const manuallyAssignedVideos = playerVideos
          ?.filter(pv => pv.videos) // Filter out any null video references
          .map(pv => pv.videos as Video) || [];
          
        // Get auto-video assignments for this player that have been sent
        const { data: autoAssignments, error: autoAssignmentsError } = await supabase
          .from("auto_video_assignments")
          .select(`
            video_id,
            scheduled_for,
            sent,
            videos:video_id (*)
          `)
          .eq("player_id", playerId)
          .eq("sent", true);
          
        if (autoAssignmentsError) {
          console.error("Error fetching auto_video_assignments:", autoAssignmentsError);
          throw autoAssignmentsError;
        }
        
        console.log("Auto-assigned videos data:", autoAssignments);
        
        // Extract video objects from the auto assignments
        const autoAssignedVideos = autoAssignments
          ?.filter(aa => aa.videos && aa.sent) // Only include sent videos
          .map(aa => aa.videos as Video) || [];
          
        // Combine both manually assigned and auto-assigned videos
        // Use a map to prevent duplicates (a video might be both manually and auto assigned)
        const videoMap = new Map<string, Video>();
        
        [...manuallyAssignedVideos, ...autoAssignedVideos].forEach(video => {
          if (video && video.id) {
            videoMap.set(video.id, video);
          }
        });
        
        const allAssignedVideos = Array.from(videoMap.values());
        
        console.log("Combined assigned videos:", allAssignedVideos);
        
        // Sort videos by creation date (newest first)
        allAssignedVideos.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        setVideos(allAssignedVideos);
        
        // Set the first video as active if available
        if (allAssignedVideos.length > 0) {
          setActiveVideo(allAssignedVideos[0]);
        } else {
          setActiveVideo(null);
          console.log("No videos available for this player");
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
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
        // Fetch coach videos
        const { data: coachVideos, error: coachVideosError } = await supabase
          .from("videos")
          .select("*")
          .eq("coach_id", coachId)
          .eq("is_admin_video", false)
          .order("created_at", { ascending: false });
          
        if (coachVideosError) throw coachVideosError;
        
        // Fetch admin videos
        const { data: adminVideos, error: adminVideosError } = await supabase
          .from("videos")
          .select("*")
          .eq("is_admin_video", true)
          .order("created_at", { ascending: false });
          
        if (adminVideosError) throw adminVideosError;
        
        // Combine and sort videos
        const allVideos = [...(coachVideos || []), ...(adminVideos || [])];
        allVideos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        setVideos(allVideos);
        
        // Set the first video as active if available
        if (allVideos.length > 0) {
          setActiveVideo(allVideos[0]);
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
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
    }
  }, [coachId, playerId, toast]);
  
  const handleWatchVideo = (video: Video) => {
    setActiveVideo(video);
    if (onWatchVideo) {
      onWatchVideo(video.id);
    }
  };
  
  const getEmbedUrl = (url: string) => {
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
              <iframe 
                src={getEmbedUrl(activeVideo.url)} 
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={activeVideo.title}
              ></iframe>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">פורסם: {formatDate(activeVideo.created_at)}</span>
                <a 
                  href={activeVideo.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary flex items-center gap-1"
                >
                  צפה באתר המקורי <ExternalLink className="h-3 w-3" />
                </a>
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
                <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
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
