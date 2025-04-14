
import React from 'react';
import { usePlayerVideos } from '@/hooks/usePlayerVideos';
import { PlayerVideoCard } from '@/components/player/PlayerVideoCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PlayerVideos: React.FC = () => {
  const { 
    videos, 
    loading, 
    error, 
    refetchVideos 
  } = usePlayerVideos();
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <Button 
          onClick={() => {
            refetchVideos();
            toast({
              title: "מרענן סרטונים",
              description: "טוען סרטונים מחדש"
            });
          }}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          נסה שוב
        </Button>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <p className="text-gray-500 mb-4">אין סרטונים זמינים כרגע</p>
        <Button 
          onClick={refetchVideos}
          variant="outline"
        >
          רענן
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">הסרטונים שלי</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <PlayerVideoCard 
            key={video.id} 
            video={video} 
          />
        ))}
      </div>
    </div>
  );
};

export default PlayerVideos;
