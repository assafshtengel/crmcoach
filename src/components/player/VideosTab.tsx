
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
      console.log("Fetching videos for coachId:", coachId, "playerId:", playerId);
      
      if (!coachId) {
        throw new Error("חסר מזהה מאמן");
      }
      
      // If no player ID, we're in coach view, show all videos for coach
      if (!playerId) {
        await fetchAllVideos();
        return;
      }
      
      // First check if this player belongs to the specified coach
      const { data: playerData, error: playerCheckError } = await supabase
        .from("players")
        .select("coach_id")
        .eq("id", playerId)
        .single();
        
      if (playerCheckError) {
        console.error("Error checking player's coach:", playerCheckError);
        throw new Error("שגיאה באימות שיוך השחקן למאמן");
      }
      
      // If the playerId is provided but the player doesn't belong to this coach,
      // show an error or empty state
      if (playerData.coach_id !== coachId) {
        console.log("Player doesn't belong to the specified coach");
        setVideos([]);
        setActiveVideo(null);
        setError("השחקן אינו שייך למאמן זה, אין סרטונים זמינים");
        setLoading(false);
        return;
      }
      
      // IMPORTANT FIX: Only get videos explicitly assigned to this player
      // through player_videos table or auto_video_assignments
      await fetchPlayerAssignedVideos(playerId);
      
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
  
  const fetchPlayerAssignedVideos = async (playerId: string) => {
    try {
      // Get videos specifically assigned to this player through player_videos table
      const { data: playerVideos, error: playerVideosError } = await supabase
        .from("player_videos")
        .select(`
          id,
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
      
      console.log("Player videos data:", playerVideos);
      
      // Get auto-assigned videos for this specific player
      const { data: autoAssignments, error: autoAssignmentsError } = await supabase
        .from("auto_video_assignments")
        .select(`
          id,
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
      
      // Process manually assigned videos
      const manuallyAssignedVideos = playerVideos
        ?.filter(pv => pv.videos)
        .map(pv => {
          if (pv.videos) {
            return {
              ...pv.videos,
              watched: pv.watched,
              watched_at: pv.watched_at,
              player_video_id: pv.id
            };
          }
          return null;
        })
        .filter(Boolean) || [];
      
      // Process auto-assigned videos
      const autoAssignedVideos = autoAssignments
        ?.filter(aa => aa.videos && aa.sent)
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
      
      // Collect any missing video IDs
      const videoIds = new Set<string>();
      let missingVideoIds: string[] = [];
      
      playerVideos?.forEach(pv => {
        if (pv.video_id && !pv.videos) {
          videoIds.add(pv.video_id);
          missingVideoIds.push(pv.video_id);
        }
      });
      
      autoAssignments?.forEach(aa => {
        if (aa.video_id && !aa.videos && !videoIds.has(aa.video_id)) {
          videoIds.add(aa.video_id);
          missingVideoIds.push(aa.video_id);
        }
      });
      
      // Fetch any missing videos
      let missingVideos: any[] = [];
      if (missingVideoIds.length > 0) {
        const { data: fetchedVideos, error: missingError } = await supabase
          .from("videos")
          .select("*")
          .in("id", missingVideoIds);
          
        if (missingError) {
          console.error("Error fetching missing videos:", missingError);
        } else if (fetchedVideos) {
          missingVideos = fetchedVideos;
        }
      }
      
      // Process missing videos and add player_video_id if available
      const mappedMissingVideos = missingVideos.map(mv => {
        const playerVideo = playerVideos?.find(pv => pv.video_id === mv.id);
        if (playerVideo) {
          return {
            ...mv,
            watched: playerVideo.watched,
            watched_at: playerVideo.watched_at,
            player_video_id: playerVideo.id
          };
        }
        return mv;
      });
      
      // Combine all videos, removing duplicates
      const videoMap = new Map<string, Video>();
      [...manuallyAssignedVideos, ...autoAssignedVideos, ...mappedMissingVideos].forEach(video => {
        if (video && video.id) {
          videoMap.set(video.id, video as Video);
        }
      });
      
      const allAssignedVideos = Array.from(videoMap.values());
      
      console.log("Combined assigned videos:", allAssignedVideos.length);
      
      if (allAssignedVideos.length === 0) {
        setVideos([]);
        setActiveVideo(null);
        setError("לא נמצאו סרטונים זמינים עבור שחקן זה");
        return;
      }
      
      // Filter out invalid videos and sort by date
      const validVideos = allAssignedVideos.filter(video => 
        video && video.id && video.title && video.created_at
      );
      
      if (validVideos.length === 0) {
        setVideos([]);
        setActiveVideo(null);
        setError("לא נמצאו סרטונים זמינים");
      } else {
        validVideos.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        setVideos(validVideos);
        setActiveVideo(validVideos[0]);
      }
    } catch (error) {
      console.error("Error in fetchPlayerAssignedVideos:", error);
      throw error;
    }
  };
  
  const fetchAllVideos = async () => {
    try {
      console.log("Fetching coach videos as fallback");
      
      // Ensure we're fetching videos only for the specific coach
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
      
      console.log("Coach videos:", coachVideos?.length || 0);
      
      if (!coachVideos || coachVideos.length === 0) {
        console.log("No coach videos found, fetching admin videos");
        await fetchAdminVideos();
        return;
      }
      
      setVideos(coachVideos);
      
      if (coachVideos.length > 0) {
        setActiveVideo(coachVideos[0]);
        setError(null);
      } else {
        setActiveVideo(null);
        setError("לא נמצאו סרטונים זמינים");
      }
    } catch (error) {
      console.error("Error fetching coach videos:", error);
      await fetchAdminVideos();
    }
  };
  
  const fetchAdminVideos = async () => {
    try {
      console.log("Fetching admin videos as final fallback");
      
      const { data: adminVideos, error: adminVideosError } = await supabase
        .from("videos")
        .select("*")
        .eq("is_admin_video", true)
        .order("created_at", { ascending: false });
        
      if (adminVideosError) {
        console.error("Error fetching admin videos:", adminVideosError);
        throw adminVideosError;
      }
      
      console.log("Admin videos:", adminVideos?.length || 0);
      
      setVideos(adminVideos || []);
      
      if (adminVideos && adminVideos.length > 0) {
        setActiveVideo(adminVideos[0]);
        setError(null);
      } else {
        setActiveVideo(null);
        setError("לא נמצאו סרטונים זמינים");
      }
    } catch (error) {
      console.error("Error fetching admin videos:", error);
      setVideos([]);
      setActiveVideo(null);
      setError("לא ניתן לטעון את הסרטונים");
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
      console.log("Marking video as watched:", { playerId, videoId, playerVideoId });
      
      if (playerVideoId) {
        const { error } = await supabase
          .from('player_videos')
          .update({ 
            watched: true,
            watched_at: new Date().toISOString()
          })
          .eq('id', playerVideoId);
          
        if (error) {
          console.error("Error updating player_videos by ID:", error);
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
          console.error("Error checking player_videos:", error);
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
      
      setVideos(prevVideos => 
        prevVideos.map(v => 
          v.id === videoId ? { ...v, watched: true, watched_at: new Date().toISOString() } : v
        )
      );
      
      console.log(`Video ${videoId} marked as watched for player ${playerId}`);
      
      toast({
        title: "סרטון סומן כנצפה",
        description: "הסטטוס עודכן בהצלחה",
      });
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
      let cleanUrl = url.trim();
      
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl;
      }
      
      new URL(cleanUrl);
      window.open(cleanUrl, '_blank');
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
