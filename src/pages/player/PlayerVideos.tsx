
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, Video, Filter, Search, Clock, PlayCircle, ThumbsUp, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
  created_at: string;
  watched: boolean;
  watched_at: string | null;
}

const PlayerVideos = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [videos, searchQuery, selectedCategory]);

  const fetchVideos = async () => {
    try {
      const playerSessionStr = localStorage.getItem('playerSession');
      
      if (!playerSessionStr) {
        navigate('/player-auth');
        return;
      }
      
      const playerSession = JSON.parse(playerSessionStr);
      
      const { data, error } = await supabase
        .from('player_videos')
        .select(`
          *,
          videos (
            id,
            title,
            description,
            url,
            category,
            tags,
            created_at
          )
        `)
        .eq('player_id', playerSession.id);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Transform the data to match our Video interface
        const formattedVideos = data.map(item => ({
          id: item.videos.id,
          title: item.videos.title,
          description: item.videos.description,
          url: item.videos.url,
          category: item.videos.category || 'אחר',
          tags: item.videos.tags || [],
          created_at: item.videos.created_at,
          watched: item.watched,
          watched_at: item.watched_at
        }));
        
        setVideos(formattedVideos);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(formattedVideos.map(video => video.category))
        ).filter(Boolean) as string[];
        
        setCategories(uniqueCategories);
      }
    } catch (error: any) {
      console.error('Error loading videos:', error);
      toast.error(error.message || "אירעה שגיאה בטעינת הסרטונים");
    } finally {
      setLoading(false);
    }
  };

  const filterVideos = () => {
    let filtered = [...videos];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        video.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(video => video.category === selectedCategory);
    }
    
    setFilteredVideos(filtered);
  };

  const markVideoAsWatched = async (videoId: string) => {
    try {
      const playerSessionStr = localStorage.getItem('playerSession');
      if (!playerSessionStr) return;
      
      const playerSession = JSON.parse(playerSessionStr);
      
      const { error } = await supabase
        .from('player_videos')
        .update({ 
          watched: true,
          watched_at: new Date().toISOString()
        })
        .eq('player_id', playerSession.id)
        .eq('video_id', videoId);
        
      if (error) throw error;
      
      // Update local state
      setVideos(videos.map(video => 
        video.id === videoId 
          ? { ...video, watched: true, watched_at: new Date().toISOString() } 
          : video
      ));
      
      toast.success("הסרטון סומן כנצפה");
    } catch (error: any) {
      console.error('Error marking video as watched:', error);
      toast.error(error.message || "אירעה שגיאה בעדכון סטטוס הצפייה");
    }
  };

  const handlePlayVideo = (video: Video) => {
    // If this is the first time watching the video, mark it as watched
    if (!video.watched) {
      markVideoAsWatched(video.id);
    }
    
    // Open the video in a new tab or implement a modal player
    window.open(video.url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/player-profile')}
            className="ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">סרטוני אימון וניתוחים</h1>
        </div>

        <Card className="mb-6 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center">
              <Video className="mr-2 h-5 w-5 text-primary" /> 
              הספרייה שלי
            </CardTitle>
            <CardDescription>
              צפה בסרטוני האימון והניתוחים שהמאמן שיתף איתך
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="חפש סרטונים..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select 
                  className="border rounded p-2 bg-background"
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                >
                  <option value="">כל הקטגוריות</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">כל הסרטונים</TabsTrigger>
                <TabsTrigger value="unwatched">טרם נצפו</TabsTrigger>
                <TabsTrigger value="watched">נצפו</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="w-32 h-20 rounded" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredVideos.length > 0 ? (
                  <div className="grid gap-4">
                    {filteredVideos.map(video => (
                      <VideoCard 
                        key={video.id} 
                        video={video} 
                        onPlay={() => handlePlayVideo(video)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <Video className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">אין סרטונים זמינים</p>
                    <p className="text-sm mt-2">המאמן שלך טרם שיתף איתך סרטונים</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="unwatched">
                {!loading && filteredVideos.filter(v => !v.watched).length > 0 ? (
                  <div className="grid gap-4">
                    {filteredVideos
                      .filter(video => !video.watched)
                      .map(video => (
                        <VideoCard 
                          key={video.id} 
                          video={video} 
                          onPlay={() => handlePlayVideo(video)}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <PlayCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">אין סרטונים שטרם נצפו</p>
                    <p className="text-sm mt-2">צפית בכל הסרטונים שהמאמן שיתף איתך</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="watched">
                {!loading && filteredVideos.filter(v => v.watched).length > 0 ? (
                  <div className="grid gap-4">
                    {filteredVideos
                      .filter(video => video.watched)
                      .map(video => (
                        <VideoCard 
                          key={video.id} 
                          video={video} 
                          onPlay={() => handlePlayVideo(video)}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">אין סרטונים שנצפו</p>
                    <p className="text-sm mt-2">טרם צפית באף סרטון שהמאמן שיתף איתך</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface VideoCardProps {
  video: Video;
  onPlay: () => void;
}

const VideoCard = ({ video, onPlay }: VideoCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('he-IL', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
  };

  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow ${video.watched ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="flex flex-col md:flex-row">
        <div className="relative md:w-48 h-32 bg-gray-100 cursor-pointer" onClick={onPlay}>
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayCircle className="h-10 w-10 text-primary hover:text-primary/80 transition-colors" />
          </div>
          {video.watched && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              נצפה
            </Badge>
          )}
        </div>
        <div className="p-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg mb-1">{video.title}</h3>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{video.description}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onPlay}>
              <PlayCircle className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {video.category && (
              <Badge variant="outline" className="bg-primary/5">
                {video.category}
              </Badge>
            )}
            {video.tags && video.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex justify-between items-center mt-3 text-sm text-muted-foreground">
            <div>נוסף: {formatDate(video.created_at)}</div>
            {video.watched && video.watched_at && (
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" /> נצפה: {formatDate(video.watched_at)}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PlayerVideos;
