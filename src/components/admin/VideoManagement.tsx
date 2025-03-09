
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Film, Plus, Trash2, Edit, Link2, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Video = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  category: string | null;
  tags: string[] | null;
  is_admin_video: boolean;
  coach_id: string | null;
  created_at: string;
};

type Player = {
  id: string;
  full_name: string;
  email: string;
  video_count: number;
};

type PlayerVideo = {
  id: string;
  player_id: string;
  video_id: string;
  assigned_by: string;
  watched: boolean;
  watched_at: string | null;
  created_at: string;
  player_name?: string;
  video_title?: string;
};

const VideoManagement = ({ isAdmin = false }: { isAdmin?: boolean }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [adminVideos, setAdminVideos] = useState<Video[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [assignedVideos, setAssignedVideos] = useState<PlayerVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  
  // Form state
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoCategory, setVideoCategory] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [selectedVideoId, setSelectedVideoId] = useState("");

  useEffect(() => {
    fetchVideos();
    if (!isAdmin) {
      fetchPlayers();
      fetchAssignedVideos();
    }
  }, [isAdmin]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      // Fetch coach's own videos
      const { data: coachVideos, error: coachError } = await supabase
        .from('videos')
        .select('*')
        .eq('coach_id', user.id);
      
      if (coachError) throw coachError;
      
      // Fetch admin videos
      const { data: allAdminVideos, error: adminError } = await supabase
        .from('videos')
        .select('*')
        .eq('is_admin_video', true);
      
      if (adminError) throw adminError;
      
      setVideos(coachVideos || []);
      setAdminVideos(allAdminVideos || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("שגיאה בטעינת הסרטונים");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      const { data, error } = await supabase
        .from('players')
        .select('id, full_name, email, video_count')
        .eq('coach_id', user.id);
      
      if (error) throw error;
      
      setPlayers(data || []);
    } catch (error) {
      console.error("Error fetching players:", error);
      toast.error("שגיאה בטעינת השחקנים");
    }
  };

  const fetchAssignedVideos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      const { data, error } = await supabase
        .from('player_videos')
        .select(`
          *,
          players:player_id (full_name),
          videos:video_id (title)
        `)
        .eq('assigned_by', user.id);
      
      if (error) throw error;
      
      const formattedData = data?.map(item => ({
        ...item,
        player_name: item.players?.full_name,
        video_title: item.videos?.title
      }));
      
      setAssignedVideos(formattedData || []);
    } catch (error) {
      console.error("Error fetching assigned videos:", error);
      toast.error("שגיאה בטעינת הסרטונים המוקצים");
    }
  };

  const handleAddVideo = async () => {
    try {
      if (!videoTitle || !videoUrl) {
        toast.error("יש למלא את כל השדות החובה");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("יש להתחבר מחדש");
        return;
      }

      const videoData = {
        title: videoTitle,
        url: videoUrl,
        description: videoDescription || null,
        category: videoCategory || null,
        is_admin_video: isAdmin,
        coach_id: isAdmin ? null : user.id
      };

      const { data, error } = await supabase
        .from('videos')
        .insert(videoData)
        .select();

      if (error) throw error;

      toast.success("הסרטון נוסף בהצלחה");
      setAddDialogOpen(false);
      clearForm();
      fetchVideos();
    } catch (error) {
      console.error("Error adding video:", error);
      toast.error("שגיאה בהוספת הסרטון");
    }
  };

  const handleUpdateVideo = async () => {
    try {
      if (!currentVideo || !videoTitle || !videoUrl) {
        toast.error("יש למלא את כל השדות החובה");
        return;
      }

      const videoData = {
        title: videoTitle,
        url: videoUrl,
        description: videoDescription || null,
        category: videoCategory || null
      };

      const { error } = await supabase
        .from('videos')
        .update(videoData)
        .eq('id', currentVideo.id);

      if (error) throw error;

      toast.success("הסרטון עודכן בהצלחה");
      setAddDialogOpen(false);
      clearForm();
      fetchVideos();
    } catch (error) {
      console.error("Error updating video:", error);
      toast.error("שגיאה בעדכון הסרטון");
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    try {
      // Check if video is assigned to players first
      const { data: assignedCount, error: checkError } = await supabase
        .from('player_videos')
        .select('id', { count: 'exact' })
        .eq('video_id', videoId);
      
      if (checkError) throw checkError;
      
      if (assignedCount && assignedCount.length > 0) {
        // First delete all assignments
        const { error: deleteAssignmentsError } = await supabase
          .from('player_videos')
          .delete()
          .eq('video_id', videoId);
        
        if (deleteAssignmentsError) throw deleteAssignmentsError;
      }
      
      // Then delete the video
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;

      toast.success("הסרטון נמחק בהצלחה");
      fetchVideos();
      fetchAssignedVideos();
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("שגיאה במחיקת הסרטון");
    }
  };

  const handleAssignVideo = async () => {
    try {
      if (!selectedPlayerId || !selectedVideoId) {
        toast.error("יש לבחור שחקן וסרטון");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("יש להתחבר מחדש");
        return;
      }

      // Check if already assigned
      const { data: existingAssignment, error: checkError } = await supabase
        .from('player_videos')
        .select('id')
        .eq('player_id', selectedPlayerId)
        .eq('video_id', selectedVideoId);
      
      if (checkError) throw checkError;
      
      if (existingAssignment && existingAssignment.length > 0) {
        toast.error("הסרטון כבר מוקצה לשחקן זה");
        return;
      }

      const { error } = await supabase
        .from('player_videos')
        .insert({
          player_id: selectedPlayerId,
          video_id: selectedVideoId,
          assigned_by: user.id
        });

      if (error) throw error;

      // Update the player's video count
      const { error: updateError } = await supabase.rpc(
        'increment_player_video_count',
        { player_id_param: selectedPlayerId }
      );

      if (updateError) {
        console.error("Error updating video count:", updateError);
        // Continue anyway
      }

      toast.success("הסרטון הוקצה בהצלחה");
      setAssignDialogOpen(false);
      setSelectedPlayerId("");
      setSelectedVideoId("");
      fetchAssignedVideos();
      fetchPlayers();
    } catch (error) {
      console.error("Error assigning video:", error);
      toast.error("שגיאה בהקצאת הסרטון");
    }
  };

  const handleRemoveAssignment = async (assignmentId: string, playerId: string) => {
    try {
      const { error } = await supabase
        .from('player_videos')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      // Update the player's video count
      const { error: updateError } = await supabase.rpc(
        'decrement_player_video_count',
        { player_id_param: playerId }
      );

      if (updateError) {
        console.error("Error updating video count:", updateError);
        // Continue anyway
      }

      toast.success("הקצאת הסרטון בוטלה בהצלחה");
      fetchAssignedVideos();
      fetchPlayers();
    } catch (error) {
      console.error("Error removing assignment:", error);
      toast.error("שגיאה בביטול הקצאת הסרטון");
    }
  };

  const handleEditVideo = (video: Video) => {
    setCurrentVideo(video);
    setVideoTitle(video.title);
    setVideoUrl(video.url);
    setVideoDescription(video.description || "");
    setVideoCategory(video.category || "");
    setAddDialogOpen(true);
  };

  const handleAddVideoClick = () => {
    clearForm();
    setCurrentVideo(null);
    setAddDialogOpen(true);
  };

  const clearForm = () => {
    setVideoTitle("");
    setVideoUrl("");
    setVideoDescription("");
    setVideoCategory("");
    setCurrentVideo(null);
  };

  const openVideoUrl = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">ניהול סרטוני וידאו</CardTitle>
        <Film className="h-6 w-6 text-primary" />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="videos">סרטונים שלי</TabsTrigger>
            <TabsTrigger value="admin-videos">סרטוני מערכת</TabsTrigger>
            {!isAdmin && <TabsTrigger value="assigned">הקצאות</TabsTrigger>}
          </TabsList>

          {/* My Videos Tab */}
          <TabsContent value="videos" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">רשימת הסרטונים</h3>
              <Button onClick={handleAddVideoClick} className="gap-2">
                <Plus className="h-4 w-4" /> הוסף סרטון
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-6">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
                <p className="mt-2 text-gray-500">טוען סרטונים...</p>
              </div>
            ) : videos.length > 0 ? (
              <div className="space-y-3">
                {videos.map((video) => (
                  <div key={video.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{video.title}</h3>
                      {video.description && (
                        <p className="text-sm text-gray-500 mt-1">{video.description}</p>
                      )}
                      {video.category && (
                        <span className="inline-block text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 mt-2">
                          {video.category}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!isAdmin && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditVideo(video)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openVideoUrl(video.url)}
                      >
                        <Link2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteVideo(video.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Film className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>אין סרטונים שהוספת עדיין</p>
                <p className="text-sm mt-1">לחץ על 'הוסף סרטון' כדי להתחיל</p>
              </div>
            )}
          </TabsContent>

          {/* Admin Videos Tab */}
          <TabsContent value="admin-videos" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">סרטוני מערכת</h3>
              {isAdmin && (
                <Button onClick={handleAddVideoClick} className="gap-2">
                  <Plus className="h-4 w-4" /> הוסף סרטון
                </Button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-6">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
                <p className="mt-2 text-gray-500">טוען סרטונים...</p>
              </div>
            ) : adminVideos.length > 0 ? (
              <div className="space-y-3">
                {adminVideos.map((video) => (
                  <div key={video.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{video.title}</h3>
                      {video.description && (
                        <p className="text-sm text-gray-500 mt-1">{video.description}</p>
                      )}
                      {video.category && (
                        <span className="inline-block text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 mt-2">
                          {video.category}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditVideo(video)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openVideoUrl(video.url)}
                      >
                        <Link2 className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteVideo(video.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      {!isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => {
                            setSelectedVideoId(video.id);
                            setAssignDialogOpen(true);
                          }}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          הקצה
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Film className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>אין סרטוני מערכת זמינים כרגע</p>
                {isAdmin && <p className="text-sm mt-1">לחץ על 'הוסף סרטון' כדי להתחיל</p>}
              </div>
            )}
          </TabsContent>

          {/* Assigned Videos Tab */}
          {!isAdmin && (
            <TabsContent value="assigned" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">סרטונים שהוקצו לשחקנים</h3>
                <Button onClick={() => setAssignDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" /> הקצה סרטון
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-6">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
                  <p className="mt-2 text-gray-500">טוען הקצאות...</p>
                </div>
              ) : assignedVideos.length > 0 ? (
                <div className="space-y-3">
                  {assignedVideos.map((assignment) => (
                    <div key={assignment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{assignment.video_title}</h3>
                          <span className={`text-sm px-2 py-0.5 rounded-full ${assignment.watched ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {assignment.watched ? 'נצפה' : 'לא נצפה'}
                          </span>
                        </div>
                        <p className="text-sm mt-1">
                          <span className="font-medium">שחקן: </span>
                          {assignment.player_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          תאריך הקצאה: {new Date(assignment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleRemoveAssignment(assignment.id, assignment.player_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Film className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>לא הקצת סרטונים לשחקנים עדיין</p>
                  <p className="text-sm mt-1">לחץ על 'הקצה סרטון' כדי להתחיל</p>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>

        {/* Add/Edit Video Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{currentVideo ? "ערוך סרטון" : "הוסף סרטון חדש"}</DialogTitle>
              <DialogDescription>
                הזן את פרטי הסרטון כאן. לחץ על שמור כשתסיים.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">כותרת הסרטון</Label>
                <Input
                  id="title"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="הזן כותרת"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="url">קישור URL</Label>
                <Input
                  id="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">תיאור (אופציונלי)</Label>
                <Textarea
                  id="description"
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder="הזן תיאור קצר"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">קטגוריה (אופציונלי)</Label>
                <Input
                  id="category"
                  value={videoCategory}
                  onChange={(e) => setVideoCategory(e.target.value)}
                  placeholder="הזן קטגוריה"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                ביטול
              </Button>
              <Button onClick={currentVideo ? handleUpdateVideo : handleAddVideo}>
                {currentVideo ? "עדכן" : "הוסף"} סרטון
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Video Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>הקצה סרטון לשחקן</DialogTitle>
              <DialogDescription>
                בחר שחקן וסרטון להקצאה.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="player">שחקן</Label>
                <Select
                  value={selectedPlayerId}
                  onValueChange={setSelectedPlayerId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר שחקן" />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.full_name} ({player.video_count} סרטונים)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="video">סרטון</Label>
                <Select
                  value={selectedVideoId}
                  onValueChange={setSelectedVideoId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר סרטון" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Show both admin videos and coach videos */}
                    <div className="p-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-500">הסרטונים שלי</p>
                    </div>
                    {videos.map((video) => (
                      <SelectItem key={video.id} value={video.id}>
                        {video.title}
                      </SelectItem>
                    ))}
                    <div className="p-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-500">סרטוני מערכת</p>
                    </div>
                    {adminVideos.map((video) => (
                      <SelectItem key={video.id} value={video.id}>
                        {video.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                ביטול
              </Button>
              <Button onClick={handleAssignVideo}>
                הקצה סרטון
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default VideoManagement;
