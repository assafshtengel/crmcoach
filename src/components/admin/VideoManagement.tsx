import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Film, Plus, Pencil, Trash2, CheckCircle, User, ExternalLink, Clock, Calendar, AlertTriangle, Info } from "lucide-react";

export default function VideoManagement() {
  const [videos, setVideos] = useState<any[]>([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAutoScheduleDialog, setOpenAutoScheduleDialog] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingVideo, setAddingVideo] = useState(false);
  const [playersWithAssignments, setPlayersWithAssignments] = useState<Record<string, boolean>>({});
  const [autoScheduleData, setAutoScheduleData] = useState({
    is_auto_scheduled: false,
    days_after_registration: 1,
    auto_sequence_order: 1
  });
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    category: "",
    is_admin_video: false
  });
  const {
    toast
  } = useToast();

  useEffect(() => {
    fetchVideos();
    fetchPlayers();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      console.log("Fetching videos...");
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (user) {
        console.log("Current user ID:", user.id);
        const {
          data: coachVideoData,
          error: coachError
        } = await supabase.from('videos').select('*').eq('coach_id', user.id).eq('is_admin_video', false);
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
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayers = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (user) {
        const {
          data,
          error
        } = await supabase.from('players').select('id, full_name').eq('coach_id', user.id);
        if (error) throw error;
        setPlayers(data || []);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      url: "",
      description: "",
      category: "",
      is_admin_video: false
    });
    setSelectedPlayers([]);
    setAutoScheduleData({
      is_auto_scheduled: false,
      days_after_registration: 1,
      auto_sequence_order: 1
    });
  };

  const handleAutoScheduleChange = (name: string, value: any) => {
    setAutoScheduleData({
      ...autoScheduleData,
      [name]: value
    });
  };

  const handleAutoScheduleSave = async () => {
    if (!selectedVideo) return;
    try {
      const {
        error
      } = await supabase.from('videos').update({
        is_auto_scheduled: autoScheduleData.is_auto_scheduled,
        days_after_registration: autoScheduleData.is_auto_scheduled ? autoScheduleData.days_after_registration : null,
        auto_sequence_order: autoScheduleData.is_auto_scheduled ? autoScheduleData.auto_sequence_order : null
      }).eq('id', selectedVideo.id);
      if (error) throw error;
      toast({
        title: "הגדרות תזמון נשמרו בהצלחה",
        description: autoScheduleData.is_auto_scheduled ? `הסרטון יישלח אוטומטית ${autoScheduleData.days_after_registration} ימים לאחר הרשמת שחקן חדש` : "התזמון האוטומטי בוטל"
      });
      setOpenAutoScheduleDialog(false);
      fetchVideos();
    } catch (error) {
      console.error('Error saving auto-schedule settings:', error);
      toast({
        title: "שגיאה בשמירת הגדרות התזמון",
        description: "לא ניתן לשמור את הגדרות התזמון האוטומטי",
        variant: "destructive"
      });
    }
  };

  const handleAddVideo = async () => {
    if (addingVideo) return;
    setAddingVideo(true);
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        toast({
          title: "שגיאה בהוספת סרטון",
          description: "חובה להיות מחובר למערכת",
          variant: "destructive"
        });
        return;
      }
      if (!formData.title || !formData.url) {
        toast({
          title: "שגיאה בהוספת סרטון",
          description: "כותרת וקישור URL הם שדות חובה",
          variant: "destructive"
        });
        return;
      }
      if (!formData.url.match(/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/)) {
        toast({
          title: "כתובת URL לא תקינה",
          description: "אנא הזן כתובת URL תקינה לסרטון",
          variant: "destructive"
        });
        return;
      }
      console.log("Adding video with user ID:", user.id);
      const videoData = {
        title: formData.title,
        url: formData.url,
        description: formData.description || null,
        category: formData.category || null,
        is_admin_video: false,
        coach_id: user.id
      };
      console.log("Video data being inserted:", videoData);
      const {
        data,
        error
      } = await supabase.from('videos').insert(videoData).select();
      if (error) {
        console.error('Error details:', error);
        throw error;
      }
      console.log("Video added successfully:", data);
      toast({
        title: "סרטון נוסף בהצלחה",
        description: "הסרטון נוסף למאגר הסרטונים"
      });
      resetForm();
      setOpenAddDialog(false);
      await fetchVideos();
    } catch (error: any) {
      console.error('Error adding video:', error);
      toast({
        title: "שגיאה בהוספת סרטון",
        description: error.message || "לא ניתן להוסיף את הסרטון",
        variant: "destructive"
      });
    } finally {
      setAddingVideo(false);
    }
  };

  const handleEditVideo = async () => {
    if (!selectedVideo) return;
    try {
      const {
        data,
        error
      } = await supabase.from('videos').update({
        title: formData.title,
        url: formData.url,
        description: formData.description,
        category: formData.category
      }).eq('id', selectedVideo.id).select();
      if (error) throw error;
      toast({
        title: "סרטון עודכן בהצלחה",
        description: "הסרטון עודכן במאגר"
      });
      resetForm();
      setOpenEditDialog(false);
      fetchVideos();
    } catch (error) {
      console.error('Error updating video:', error);
      toast({
        title: "שגיאה בעדכון סרטון",
        description: "לא ניתן לעדכן את הסרטון",
        variant: "destructive"
      });
    }
  };

  const handleDeleteVideo = async () => {
    if (!selectedVideo) return;
    try {
      console.log("Starting video deletion process for ID:", selectedVideo.id);

      // First delete auto assignments
      const {
        error: assignmentsAutoError
      } = await supabase.from('auto_video_assignments').delete().eq('video_id', selectedVideo.id);
      if (assignmentsAutoError) {
        console.error('Error deleting auto assignments:', assignmentsAutoError);
      } else {
        console.log("Auto assignments deleted successfully");
      }

      // Get player_videos assignments to decrement counts
      const {
        data: assignmentsData,
        error: assignmentsError
      } = await supabase.from('player_videos').select('id, player_id').eq('video_id', selectedVideo.id);
      if (assignmentsError) {
        console.error('Error fetching video assignments:', assignmentsError);
      } else {
        console.log("Found assignments to delete:", assignmentsData?.length || 0);

        // Decrement video counts for each player
        if (assignmentsData && assignmentsData.length > 0) {
          for (const assignment of assignmentsData) {
            const {
              error: decrementError
            } = await supabase.rpc('decrement_player_video_count', {
              player_id_param: assignment.player_id
            });
            if (decrementError) {
              console.error('Error decrementing video count:', decrementError);
            }
          }
        }

        // Delete player_videos assignments
        const {
          error: deleteAssignmentsError
        } = await supabase.from('player_videos').delete().eq('video_id', selectedVideo.id);
        if (deleteAssignmentsError) {
          console.error('Error deleting video assignments:', deleteAssignmentsError);
        } else {
          console.log("All video assignments deleted successfully");
        }
      }

      // Finally delete the video itself
      const {
        error: deleteVideoError
      } = await supabase.from('videos').delete().eq('id', selectedVideo.id);
      if (deleteVideoError) {
        console.error('Error deleting video:', deleteVideoError);
        throw deleteVideoError;
      }
      console.log("Video deleted successfully");
      toast({
        title: "סרטון נמחק בהצלחה",
        description: "הסרטון הוסר ממאגר הסרטונים"
      });
      setOpenDeleteDialog(false);
      await fetchVideos(); // Refresh the video list
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "שגיאה במחיקת סרטון",
        description: "לא ניתן למחוק את הסרטון, נסה שוב מאוחר יותר",
        variant: "destructive"
      });
    }
  };

  const handleAssignClick = async (video: any) => {
    setSelectedVideo(video);
    setSelectedPlayers([]);
    setOpenAssignDialog(true);
    try {
      // Important fix: Get existing assignments for THIS SPECIFIC video
      const {
        data,
        error
      } = await supabase.from('player_videos').select('player_id').eq('video_id', video.id);
      if (error) {
        console.error('Error fetching video assignments:', error);
        throw error;
      }

      // Create a map of player IDs to assignment status
      const assignmentsMap: Record<string, boolean> = {};
      (data || []).forEach(assignment => {
        assignmentsMap[assignment.player_id] = true;
      });
      setPlayersWithAssignments(assignmentsMap);
      console.log("Existing assignments for video ID", video.id, ":", assignmentsMap);
    } catch (error) {
      console.error('Error fetching video assignments:', error);
      toast({
        title: "שגיאה בטעינת נתונים",
        description: "לא ניתן לטעון את רשימת השחקנים שכבר הוקצו להם הסרטון",
        variant: "destructive"
      });
    }
  };

  const handleAssignVideo = async () => {
    if (!selectedVideo || !selectedPlayers.length) return;
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not logged in');

      // Filter out players who already have this video assigned
      const newAssignments = selectedPlayers.filter(playerId => !playersWithAssignments[playerId]);
      if (newAssignments.length === 0) {
        toast({
          title: "כל השחקנים שנבחרו כבר קיבלו את הסרטון",
          description: "אין הקצאות חדשות לבצע"
        });
        setSelectedPlayers([]);
        setOpenAssignDialog(false);
        return;
      }

      // Insert new player-video assignments
      const assignmentsToInsert = newAssignments.map(playerId => ({
        player_id: playerId,
        video_id: selectedVideo.id,
        assigned_by: user.id,
        watched: false
      }));
      
      const {
        data,
        error
      } = await supabase.from('player_videos').insert(assignmentsToInsert);
      
      if (error) {
        console.error('Error assigning video:', error);
        if (error.code === '23505') {
          // Specific handling for duplicate key violation
          toast({
            title: "סרטון כבר הוקצה לשחקן",
            description: "חלק מהשחקנים כבר קיבלו את הסרטון הזה",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      }

      // Update video count for each player and send notifications
      for (const playerId of newAssignments) {
        // Increment video count
        const {
          error: incrementError
        } = await supabase.rpc('increment_player_video_count', {
          player_id_param: playerId
        });
        if (incrementError) console.error('Error incrementing video count:', incrementError);

        // Create notification for the player about the new video assignment
        const notificationData = {
          coach_id: user.id,
          player_id: playerId,
          type: 'video_assigned',
          message: `סרטון חדש הוקצה: ${selectedVideo.title}`,
          is_read: false,
          video_id: selectedVideo.id
        };
        
        const {
          error: notificationError
        } = await supabase.from('notifications').insert(notificationData);
        
        if (notificationError) {
          console.error('Error creating notification:', notificationError);
          // Log detailed error but continue with other players
          console.error('Notification data that failed:', notificationData);
          console.error('Error details:', notificationError);
        } else {
          console.log('Notification created successfully for player:', playerId);
        }

        // Update the local state to reflect the new assignment
        setPlayersWithAssignments(prev => ({
          ...prev,
          [playerId]: true
        }));
      }
      
      toast({
        title: "סרטון הוקצה בהצלחה",
        description: `הסרטון הוקצה ל-${newAssignments.length} שחקנים חדשים`
      });
      
      setSelectedPlayers([]);
      setOpenAssignDialog(false);
    } catch (error) {
      console.error('Error assigning video:', error);
      toast({
        title: "שגיאה בהקצאת סרטון",
        description: "לא ניתן להקצות את הסרטון לשחקנים",
        variant: "destructive"
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
      is_admin_video: video.is_admin_video
    });
    setOpenEditDialog(true);
  };

  const handleAutoScheduleClick = (video: any) => {
    setSelectedVideo(video);
    setAutoScheduleData({
      is_auto_scheduled: video.is_auto_scheduled || false,
      days_after_registration: video.days_after_registration || 1,
      auto_sequence_order: video.auto_sequence_order || 1
    });
    setOpenAutoScheduleDialog(true);
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

  const triggerProcessAutoAssignments = async () => {
    try {
      const {
        error
      } = await supabase.rpc('process_auto_video_assignments');
      if (error) throw error;
      toast({
        title: "סרטונים אוטומטיים עובדו",
        description: "הפעולה הושלמה בהצלחה"
      });
    } catch (error) {
      console.error('Error processing auto assignments:', error);
      toast({
        title: "שגיאה בעיבוד סרטונים אוטומטיים",
        description: "לא ניתן לעבד את הסרטונים האוטומטיים",
        variant: "destructive"
      });
    }
  };

  const isAutoScheduled = useMemo(() => {
    return (video: any) => {
      return video.is_auto_scheduled === true;
    };
  }, []);

  const renderVideoCards = (videoList: any[]) => {
    if (loading) {
      return <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
          <p className="mt-2 text-gray-500">טוען סרטונים...</p>
        </div>;
    }
    if (videoList.length === 0) {
      return <div className="text-center py-12">
          <Film className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-gray-500">אין סרטונים זמינים</p>
          <p className="text-sm text-gray-400 mt-1">ניתן להוסיף סרטונים באמצעות כפתור ההוספה</p>
        </div>;
    }
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videoList.map(video => <Card key={video.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg font-semibold truncate flex-1">{video.title}</CardTitle>
                <div className="flex gap-1 flex-shrink-0">
                  {isAutoScheduled(video) && <Badge variant="outline" className="bg-green-100 text-green-800 text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{video.days_after_registration} ימים</span>
                    </Badge>}
                </div>
              </div>
              {video.category && <Badge variant="secondary" className="mt-1">{video.category}</Badge>}
            </CardHeader>
            <CardContent className="pb-2">
              {video.description && <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>}
              <div className="mt-2">
                <Button variant="outline" size="sm" className="w-full text-blue-600 border-blue-200" onClick={() => openVideoUrl(video.url)}>
                  <ExternalLink className="h-3.5 w-3.5 mr-1 rtl:ml-1 rtl:mr-0" />
                  צפה בסרטון
                </Button>
              </div>
            </CardContent>
            <CardFooter className="pt-2 border-t flex justify-between flex-wrap gap-2">
              <div className="flex space-x-2 rtl:space-x-reverse">
                <Button variant="ghost" size="icon" onClick={() => handleEditClick(video)} title="ערוך סרטון">
                  <Pencil className="h-4 w-4 text-gray-500" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(video)} className="text-destructive" title="מחק סרטון">
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleAutoScheduleClick(video)} title="הגדר תזמון אוטומטי" className={isAutoScheduled(video) ? "text-green-600" : "text-gray-500"}>
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="secondary" size="sm" onClick={() => handleAssignClick(video)}>
                <User className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                הקצה לשחקנים
              </Button>
            </CardFooter>
          </Card>)}
      </div>;
  };

  return <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center mx-[240px] text-justify">
            <Film className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
            ניהול סרטוני וידאו
          </CardTitle>
          <CardDescription>
            נהל את מאגר הסרטונים, הקצה אותם לשחקנים או הגדר תזמון אוטומטי
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <div className="flex gap-2">
              <Button onClick={() => {
              resetForm();
              setOpenAddDialog(true);
            }} className="my-[17px] text-left py-[21px] mx-[164px] px-[141px] font-normal text-white">
                <Plus className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                הוסף סרטון
              </Button>
            </div>
          </div>

          {renderVideoCards(videos)}
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
              <Input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="כותרת הסרטון" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">קישור לסרטון</Label>
              <Input id="url" name="url" value={formData.url} onChange={handleInputChange} placeholder="https://example.com/video" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">תיאור</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="תיאור הסרטון" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">קטגוריה</Label>
              <Select value={formData.category} onValueChange={value => handleSelectChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר קטגוריה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mental">מנטאלי</SelectItem>
                  <SelectItem value="technical">טכני</SelectItem>
                  <SelectItem value="tactical">טקטי</SelectItem>
                  <SelectItem value="physical">פיזי</SelectItem>
                  <SelectItem value="other">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAddDialog(false)}>ביטול</Button>
            <Button type="submit" onClick={handleAddVideo} disabled={addingVideo}>
              {addingVideo ? <>
                  <div className="h-4 w-4 animate-spin mr-2 border-2 border-current border-t-transparent rounded-full"></div>
                  מוסיף...
                </> : "הוסף סרטון"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ערוך סרטון</DialogTitle>
            <DialogDescription>
              ערוך את פרטי הסרטון
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">כותרת הסרטון</Label>
              <Input id="edit-title" name="title" value={formData.title} onChange={handleInputChange} placeholder="כותרת הסרטון" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-url">קישור לסרטון</Label>
              <Input id="edit-url" name="url" value={formData.url} onChange={handleInputChange} placeholder="https://example.com/video" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">תיאור</Label>
              <Textarea id="edit-description" name="description" value={formData.description} onChange={handleInputChange} placeholder="תיאור הסרטון" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">קטגוריה</Label>
              <Select value={formData.category} onValueChange={value => handleSelectChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר קטגוריה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mental">מנטאלי</SelectItem>
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
            <Button type="submit" onClick={handleEditVideo}>
              שמור שינויים
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
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 py-3">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <div className="text-sm">
              מחיקת הסרטון תסיר אותו לצמיתות ותבטל את כל ההקצאות לשחקנים
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>ביטול</Button>
            <Button variant="destructive" onClick={handleDeleteVideo}>
              מחק סרטון
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openAssignDialog} onOpenChange={setOpenAssignDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>הקצה סרטון לשחקנים</DialogTitle>
            <DialogDescription>
              בחר את השחקנים שיקבלו את הסרטון "{selectedVideo?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {players.length === 0 ? <div className="text-center py-8">
                <User className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-2 text-gray-500">אין שחקנים זמינים</p>
              </div> : <ScrollArea className="h-[250px] pr-4 -mr-4">
                <div className="space-y-4">
                  {players.map(player => <div key={player.id} className={`flex items-center justify-between p-2 rounded-md border ${selectedPlayers.includes(player.id) ? 'bg-blue-50 border-blue-200' : 'border-gray-200 hover:bg-gray-50'} ${playersWithAssignments[player.id] ? 'opacity-60' : ''}`}>
                      <div className="flex items-center">
                        <input type="checkbox" id={`player-${player.id}`} checked={selectedPlayers.includes(player.id)} onChange={() => togglePlayerSelection(player.id)} className="h-4 w-4 rounded border-gray-300 text-blue-600 mr-2 rtl:ml-2 rtl:mr-0" />
                        <Label htmlFor={`player-${player.id}`} className="cursor-pointer">
                          {player.full_name}
                        </Label>
                      </div>
                      {playersWithAssignments[player.id] && <Badge variant="outline" className="text-green-600 border-green-200 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>נשלח</span>
                        </Badge>}
                    </div>)}
                </div>
              </ScrollArea>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAssignDialog(false)}>ביטול</Button>
            <Button type="submit" onClick={handleAssignVideo} disabled={selectedPlayers.length === 0}>
              הקצה סרטון
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openAutoScheduleDialog} onOpenChange={setOpenAutoScheduleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>הגדר תזמון אוטומטי</DialogTitle>
            <DialogDescription>
              ניתן להגדיר שליחה אוטומטית של הסרטון כמה ימים לאחר הרשמת שחקן חדש
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
