
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  watched?: boolean;
  created_at: string;
}

export const usePlayerVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user session
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (!userId) {
        throw new Error('משתמש לא מזוהה');
      }

      // Fetch videos assigned to the player
      const { data: assignedVideos, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .contains('assigned_player_ids', [userId]);

      if (videosError) {
        throw videosError;
      }

      // Get watch status for these videos
      const { data: watchStatus, error: watchError } = await supabase
        .from('player_videos')
        .select('video_id, watched')
        .eq('player_id', userId)
        .in('video_id', assignedVideos.map(v => v.id));

      if (watchError) {
        throw watchError;
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
        if (a.watched !== b.watched) {
          return a.watched ? 1 : -1;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setVideos(sortedVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('אירעה שגיאה בטעינת הסרטונים');
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לטעון את הסרטונים',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return { 
    videos, 
    loading, 
    error, 
    refetchVideos: fetchVideos 
  };
};
