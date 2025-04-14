
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const usePlayerVideoAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleWatchVideo = async (video: {
    id: string;
    url: string;
    watched?: boolean;
  }) => {
    try {
      setIsLoading(true);

      // Open video URL
      window.open(video.url, '_blank');

      // Get current user session
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (!userId) {
        throw new Error('משתמש לא מזוהה');
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

      toast({
        title: 'סרטון סומן כנצפה',
        description: 'הסטטוס עודכן בהצלחה'
      });
    } catch (error) {
      console.error('Error marking video as watched:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לסמן את הסרטון כנצפה',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { handleWatchVideo, isLoading };
};
