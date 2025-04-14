
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayIcon, ExternalLink } from 'lucide-react';
import { usePlayerVideoAction } from '@/hooks/usePlayerVideoAction';

interface PlayerVideoCardProps {
  video: {
    id: string;
    title: string;
    description?: string;
    url: string;
    watched?: boolean;
    created_at: string;
  };
}

export const PlayerVideoCard: React.FC<PlayerVideoCardProps> = ({ video }) => {
  const { handleWatchVideo, isLoading } = usePlayerVideoAction();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
        <PlayIcon className="h-12 w-12 text-gray-400" />
        {video.watched && (
          <Badge 
            variant="success" 
            className="absolute top-2 right-2"
          >
            נצפה
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">
          {video.title}
        </h3>
        <p className="text-gray-500 text-sm mb-2">
          {formatDate(video.created_at)}
        </p>
        <p className="text-gray-700 text-sm line-clamp-2">
          {video.description || 'אין תיאור זמין'}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={() => handleWatchVideo(video)}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2"
        >
          {video.watched ? 'צפה שוב' : 'צפה עכשיו'}
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
