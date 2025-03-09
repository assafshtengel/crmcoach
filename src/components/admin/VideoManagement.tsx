import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, Plus, Pencil, Trash2, CheckCircle, User, ExternalLink, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function VideoManagement() {
  const [videos, setVideos] = useState<any[]>([]);
  const [adminVideos, setAdminVideos] = useState<any[]>([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState("admin");
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingVideo, setAddingVideo] = useState(false);
  const [playersWithAssignments, setPlayersWithAssignments] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    category: "",
    is_admin_video: false,
  });

  const { toast } = useToast();

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: coachData } = await supabase
          .from('coaches')
          .select('id, email')
          .eq('id', user.id)
          .single();

        if (coachData && coachData.email === 'admin@example.com') {
          setIsAdmin(true);
        }
      }
    };

    checkUserRole();
    fetchVideos();
    fetchPlayers();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);

    try {
      console.log("Fetching videos...");
      
      const { data: adminVideoData, error: adminError } = await supabase
        .from('videos')
        .select('*')
        .eq('is_admin_video', true);

      if (adminError) {
        console.error("Error fetching admin videos:", adminError);
        throw adminError;
      }
      
      console.log("Admin videos fetched:", adminVideoData);
      setAdminVideos(adminVideoData || []);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log("Current user ID:", user.id);
        const { data: coachVideoData, error: coachError } = await supabase
          .from('videos')
          .select('*')
          .eq('coach_id', user.id)
          .eq('is_admin_video', false);

        if (coachError) {
          console.error("Error fetching coach videos:", coachError);
          throw coachError;
        }
        
        console.log("Coach videos fetched:", coachVideoData);
        setVideos(coachVideoData || []);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        title: "שגיאה בטעינת סרטונים",
        description: "לא ניתן לטעון את רשימת הסרטונים",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('players')
          .select('id, full_name')
          .eq('coach_id', user.id);

        if (error) throw error;
        setPlayers(data || []);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      url: "",
      description: "",
      category: "",
      is_admin_video: false,
    });
    setSelectedPlayers([]);
  };

  const handleAddVideo = async () => {
    if (addingVideo) return;
    setAddingVideo(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        toast({
          title: "שגיאה בהוספת סרטון",
          description: "חובה להיות מחובר למערכת",
          variant: "destructive",
        });
        return;
      }

      if (!formData.title || !formData.url) {
        toast({
          title: "שגיאה בהוספת סרטון",
          description: "כותרת וקישור URL הם שדות חובה",
          variant: "destructive",
        });
        return;
      }

      if (!formData.url.match(/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/)) {
        toast({
          title: "כתובת URL לא תקינה",
          description: "אנא הזן כתובת URL תקינה לסרטון",
          variant: "destructive",
        });
        return;
      }

      console.log("Adding video with user ID:", user.id);
      
      const videoData = {
        title: formData.title,
        url: formData.url,
        description: formData.description || null,
        category: formData.category || null,
        is_admin_video: isAdmin && currentTab === "admin",
        coach_id: user.id,
      };
      
      console.log("Video data being inserted:", videoData);

      const { data, error } = await supabase
        .from('videos')
        .insert(videoData)
        .select();

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      console.log("Video added successfully:", data);

      toast({
        title: "סרטון נוסף בהצלחה",
        description: "הסרטון נוסף למאגר הסרטונים",
      });

      resetForm();
      setOpenAddDialog(false);
      await fetchVideos();
    } catch (error: any) {
      console.error('Error adding video:', error);
      toast({
        title: "שגיאה בהוספת סרטון",
        description: error.message || "לא ניתן להוסיף את הסרטון",
        variant: "destructive",
      });
    } finally {
      setAddingVideo(false);
    }
  };

  const handleEditVideo = async () => {
    if (!selectedVideo) return;

    try {
      const { data, error } = await supabase
        .from('videos')
        .update({
          title: formData.title,
          url: formData.url,
          description: formData.description,
          category: formData.category,
        })
        .eq('id', selectedVideo.id)
        .select();

      if (error) throw error;

      toast({
        title: "סרטון עודכן בהצלחה",
        description: "הסרטון עודכן במאגר",
      });

      resetForm();
      setOpenEditDialog(false);
      fetchVideos();
    } catch (error) {
      console.error('Error updating video:', error);
      toast({
        title: "שגיאה בעדכון סרטון",
        description: "לא ניתן לעדכן את הסרטון",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVideo = async () => {
    if (!selectedVideo) return;

    try {
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('player_videos')
        .select('id, player_id')
        .eq('video_id', selectedVideo.id);

      if (assignmentsError) throw assignmentsError;

      for (const assignment of (assignmentsData || [])) {
        const { error: decrementError } = await supabase.rpc(
          'decrement_player_video_count',
          { player_id_param: assignment.player_id }
        );
        
        if (decrementError) console.error('Error decrementing video count:', decrementError);
      }

      const { error: deleteAssignmentsError } = await supabase
        .from('player_videos')
        .delete()
        .eq('video_id', selectedVideo.id);

      if (deleteAssignmentsError) throw deleteAssignmentsError;

      const { error: deleteVideoError } = await supabase
        .from('videos')
        .delete()
        .eq('id', selectedVideo.id);

      if (deleteVideoError) throw deleteVideoError;

      toast({
        title: "סרטון נמחק בהצלחה",
        description: "הסרטון הוסר ממאגר הסרטונים",
      });

      setOpenDeleteDialog(false);
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "שגיאה במחיקת סרטון",
        description: "לא ניתן למחוק את הסרטון",
        variant: "destructive",
      });
    }
  };

  const handleAssignVideo = async () => {
    if (!selectedVideo || !selectedPlayers.length) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not logged in');

      const newAssignments = selectedPlayers.filter(
        playerId => !playersWithAssignments[playerId]
      );
      
      if (newAssignments.length === 0) {
        toast({
          title: "כל השחקנים שנבחרו כבר קיבלו את הסרטון",
          description: "אין הקצאות חדשות לבצע",
        });
        setSelectedPlayers([]);
        setOpenAssignDialog(false);
        return;
      }

      const assignmentsToInsert = newAssignments.map(playerId => ({
        player_id: playerId,
        video_id: selectedVideo.id,
        assigned_by: user.id,
        watched: false,
      }));

      const { data, error } = await supabase
        .from('player_videos')
        .insert(assignmentsToInsert);

      if (error) throw error;

      for (const playerId of newAssignments) {
        const { error: incrementError } = await supabase.rpc(
          'increment_player_video_count',
          { player_id_param: playerId }
        );
        
        if (incrementError) console.error('Error incrementing video count:', incrementError);
        
        setPlayersWithAssignments(prev => ({
          ...prev,
          [playerId]: true
        }));
      }

      toast({
        title: "סרטון הוקצה בהצלחה",
        description: `הסרטון הוקצה ל-${newAssignments.length} שחקנים חדשים`,
      });

      setSelectedPlayers([]);
      setOpenAssignDialog(false);
    } catch (error) {
      console.error('Error assigning video:', error);
      toast({
        title: "שגיאה בהקצאת סרטון",
        description: "לא ניתן להקצות את הסרטון לשחקנים",
        variant: "destructive",
      });
    }
  };

  const openVideoUrl = (url: string) => {
    window.open(url, '_blank');
  };

  const handleEditClick = (video: any) => {
    setSelectedVideo(video);
    setFormData({
      title: video.title,
      url: video.url,
      description: video.description || '',
      category: video.category || '',
      is_admin_video: video.is_admin_video,
    });
    setOpenEditDialog(true);
  };

  const handleAssignClick = async (video: any) => {
    setSelectedVideo(video);
    setSelectedPlayers([]);
    setOpenAssignDialog(true);
    
    try {
      const { data, error } = await supabase
        .from('player_videos')
        .select('player_id')
        .eq('video_id', video.id);
        
      if (error) throw error;
      
      const assignmentsMap: Record<string, boolean> = {};
      (data || []).forEach(assignment => {
        assignmentsMap[assignment.player_id] = true;
      });
      
      setPlayersWithAssignments(assignmentsMap);
      console.log("Existing assignments:", assignmentsMap);
      
    } catch (error) {
      console.error('Error fetching video assignments:', error);
    }
  };

  const handleDeleteClick = (video: any) => {
    setSelectedVideo(video);
    setOpenDeleteDialog(true);
  };

  const togglePlayerSelection = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    } else {
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
  };

  const renderVideoCards = (videoList: any[]) => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
          <p className="mt-2 text-gray-500">טוען סרטונים...</p>
        </div>
      );
    }

    if (videoList.length === 0) {
      return (
        <div className="text-center py-12">
          <Film className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-gray-500">אין סרטונים זמינים</p>
          <p className="text-sm text-gray-400 mt-1">ניתן להוסיף סרטונים באמצעות כפתור ההוספה</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videoList.map((video) => (
          <Card key={video.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold truncate">{video.title}</CardTitle>
                {video.is_admin_video && (
                  <Badge variant="outline" className="bg-primary/10 text-primary text-xs">מנהל</Badge>
                )}
              </div>
              {video.category && (
                <Badge variant="secondary" className="mt-1">{video.category}</Badge>
              )}
            </CardHeader>
            <CardContent className="py-2">
              {video.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{video.description}</p>
              )}
              <div className="flex mt-2 space-x-2 rtl:space-x-reverse">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-blue-600"
                  onClick={() => openVideoUrl(video.url)}
                >
                  <ExternalLink className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                  צפה בסרטון
                </Button>
              </div>
            </CardContent>
            <CardFooter className="pt-2 border-t flex justify-between">
              <div className="flex space-x-2 rtl:space-x-reverse">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleEditClick(video)}
                >
                  <Pencil className="h-4 w-4 text-gray-500" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDeleteClick(video)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => handleAssignClick(video)}
              >
                <User className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                הקצה לשחקנים
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Film className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
            ניהול סרטוני וידאו
          </CardTitle>
          <CardDescription>
            נהל את מאגר הסרטונים והקצה אותם לשחקנים
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="admin">סרטוני מנהל</TabsTrigger>
                <TabsTrigger value="coach">הסרטונים שלי</TabsTrigger>
              </TabsList>
              <Button onClick={() => { resetForm(); setOpenAddDialog(true); }}>
                <Plus className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                הוסף סרטון
              </Button>
            </div>

            <TabsContent value="admin" className="mt-2">
              {renderVideoCards(adminVideos)}
            </TabsContent>
            
            <TabsContent value="coach" className="mt-2">
              {renderVideoCards(videos)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>הוסף סרטון חדש</DialogTitle>
            <DialogDescription>
              הזן את פרטי הסרטון להוספה למאגר
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">כותרת הסרטון</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="כותרת הסרטון"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">קישור לסרטון</Label>
              <Input
                id="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="https://example.com/video"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">תיאור</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="תיאור הסרטון"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">קטגוריה</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר קטגוריה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mental">mentorלי</SelectItem>
                  <SelectItem value="technical">טכני</SelectItem>
                  <SelectItem value="tactical">טקטי</SelectItem>
                  <SelectItem value="physical">פיזי</SelectItem>
                  <SelectItem value="other">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isAdmin && currentTab === "admin" && (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  id="is_admin_video"
                  checked={true}
                  disabled
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_admin_video">סרטון מנהל (זמין לכל המאמנים)</Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAddDialog(false)}>ביטול</Button>
            <Button 
              onClick={handleAddVideo}
              disabled={addingVideo}
            >
              {addingVideo ? 'מוסיף...' : 'הוסף סרטון'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ערוך סרטון</DialogTitle>
            <DialogDescription>
              עדכן את פרטי הסרטון
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">כותרת הסרטון</Label>
              <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="כותרת הסרטון"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-url">קישור לסרטון</Label>
              <Input
                id="edit-url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="https://example.com/video"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">תיאור</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="תיאור הסרטון"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">קטגוריה</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="בחר קטגוריה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mental">mentorלי</SelectItem>
                  <SelectItem value="technical">טכני</SelectItem>
                  <SelectItem value="tactical">טקטי</SelectItem>
                  <SelectItem value="physical">פיזי</SelectItem>
                  <SelectItem value="other">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditDialog(false)}>ביטול</Button>
            <Button onClick={handleEditVideo}>שמור שינויים</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openAssignDialog} onOpenChange={setOpenAssignDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>הקצה סרטון לשחקנים</DialogTitle>
            <DialogDescription>
              בחר את השחקנים להם ברצונך להקצות את הסרטון: {selectedVideo?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="mb-2 block">בחר שחקנים:</Label>
            <ScrollArea className="h-[200px] border rounded-md p-2">
              {players.length > 0 ? (
                <div className="space-y-2">
                  {players.map((player) => (
                    <div 
                      key={player.id} 
                      className={`flex items-center p-2 rounded-md cursor-pointer ${
                        selectedPlayers.includes(player.id) ? 'bg-primary/10' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => togglePlayerSelection(player.id)}
                    >
                      <div className="flex-1">{player.full_name}</div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        {playersWithAssignments[player.id] && (
                          <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 border-amber-200">
                            <Clock className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
                            הוקצה בעבר
                          </Badge>
                        )}
                        {selectedPlayers.includes(player.id) && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">אין שחקנים זמינים</div>
              )}
            </ScrollArea>
            <div className="mt-2 text-sm text-gray-500">
              נבחרו {selectedPlayers.length} שחקנים
              {selectedPlayers.filter(id => playersWithAssignments[id]).length > 0 && (
                <span className="text-amber-600"> (כולל {selectedPlayers.filter(id => playersWithAssignments[id]).length} שכבר קיבלו את הסרטון בעבר)</span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAssignDialog(false)}>ביטול</Button>
            <Button 
              onClick={handleAssignVideo}
              disabled={selectedPlayers.length === 0}
            >
              הקצה סרטון
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>מחיקת סרטון</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך למחוק את הסרטון "{selectedVideo?.title}"?
              <br />
              פעולה זו תסיר גם את כל ההקצאות של סרטון זה לשחקנים.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>ביטול</Button>
            <Button variant="destructive" onClick={handleDeleteVideo}>
              מחק סרטון
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
