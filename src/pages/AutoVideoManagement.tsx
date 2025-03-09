
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertCircle,
  ArrowLeft, 
  Calendar, 
  CheckCircle, 
  ClockIcon, 
  Film, 
  Info,
  ListChecks, 
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";

type VideoWithSchedule = {
  id: string;
  title: string;
  days_after_registration: number | null;
  is_auto_scheduled: boolean;
  auto_sequence_order: number | null;
  category: string | null;
  description: string | null;
  url: string;
};

type Assignment = {
  id: string;
  player_id: string;
  video_id: string;
  assigned_at: string;
  scheduled_for: string;
  sent: boolean;
  created_at: string;
  players: {
    full_name: string;
    email: string;
  };
  videos: {
    title: string;
    days_after_registration: number;
  };
};

export default function AutoVideoManagement() {
  const [videos, setVideos] = useState<VideoWithSchedule[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingVideos, setProcessingVideos] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoWithSchedule | null>(null);
  const [stats, setStats] = useState({
    totalScheduled: 0,
    totalSent: 0,
    sentLast24h: 0
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch videos with auto-scheduling info
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .order('auto_sequence_order', { ascending: true, nullsFirst: true });

      if (videosError) throw videosError;
      
      // Check for duplicates and log them for debugging
      const videoIds = new Set();
      const duplicates = [];
      videosData?.forEach(video => {
        if (videoIds.has(video.id)) {
          duplicates.push(video);
        } else {
          videoIds.add(video.id);
        }
      });
      
      if (duplicates.length > 0) {
        console.log("Found duplicate videos:", duplicates);
      }
      
      // Remove duplicates from the data
      const uniqueVideos = videosData?.filter((video, index, self) =>
        index === self.findIndex((v) => v.id === video.id)
      );
      
      setVideos(uniqueVideos || []);

      // Fetch auto assignments history
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('auto_video_assignments')
        .select(`
          id, 
          player_id,
          video_id,
          assigned_at,
          scheduled_for,
          sent,
          created_at,
          players:player_id (full_name, email),
          videos:video_id (title, days_after_registration)
        `)
        .order('scheduled_for', { ascending: false })
        .limit(50);

      if (assignmentsError) throw assignmentsError;
      setAssignments(assignmentsData || []);

      // Get statistics
      const { data: scheduledCount, error: scheduledError } = await supabase
        .from('auto_video_assignments')
        .select('id', { count: 'exact' });

      const { data: sentCount, error: sentError } = await supabase
        .from('auto_video_assignments')
        .select('id', { count: 'exact' })
        .eq('sent', true);

      const { data: sentLast24h, error: recent24hError } = await supabase
        .from('auto_video_assignments')
        .select('id', { count: 'exact' })
        .eq('sent', true)
        .gt('scheduled_for', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      setStats({
        totalScheduled: scheduledCount?.length || 0,
        totalSent: sentCount?.length || 0,
        sentLast24h: sentLast24h?.length || 0
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בטעינת הנתונים",
        description: "לא ניתן לטעון את רשימת הסרטונים האוטומטיים",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchedule = (video: VideoWithSchedule) => {
    setSelectedVideo(video);
    setOpenEditDialog(true);
  };

  const handleDeleteVideo = (video: VideoWithSchedule) => {
    setSelectedVideo(video);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteVideo = async () => {
    if (!selectedVideo) return;
    
    try {
      // First delete any auto assignments
      const { error: autoAssignError } = await supabase
        .from('auto_video_assignments')
        .delete()
        .eq('video_id', selectedVideo.id);
        
      if (autoAssignError) throw autoAssignError;
      
      // Then check if we need to remove player video assignments
      const { data: playerVideos, error: pvError } = await supabase
        .from('player_videos')
        .select('id, player_id')
        .eq('video_id', selectedVideo.id);
        
      if (pvError) throw pvError;
      
      // Decrement player video count for each assignment
      for (const pv of (playerVideos || [])) {
        await supabase.rpc('decrement_player_video_count', { 
          player_id_param: pv.player_id 
        });
      }
      
      // Delete player video assignments
      if (playerVideos && playerVideos.length > 0) {
        const { error: deleteAssignError } = await supabase
          .from('player_videos')
          .delete()
          .eq('video_id', selectedVideo.id);
          
        if (deleteAssignError) throw deleteAssignError;
      }
      
      // Finally delete the video itself
      const { error: deleteError } = await supabase
        .from('videos')
        .delete()
        .eq('id', selectedVideo.id);
        
      if (deleteError) throw deleteError;
      
      toast({
        title: "הסרטון נמחק בהצלחה",
        description: "הסרטון ותזמוניו האוטומטיים הוסרו מהמערכת",
      });
      
      // Refresh data
      fetchData();
      
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        variant: "destructive",
        title: "שגיאה במחיקת הסרטון",
        description: "לא ניתן למחוק את הסרטון. נסה שוב מאוחר יותר.",
      });
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const handleScheduleSave = async () => {
    if (!selectedVideo) return;

    try {
      const { error } = await supabase
        .from('videos')
        .update({
          is_auto_scheduled: selectedVideo.is_auto_scheduled,
          days_after_registration: selectedVideo.days_after_registration,
          auto_sequence_order: selectedVideo.auto_sequence_order
        })
        .eq('id', selectedVideo.id);

      if (error) throw error;

      toast({
        title: "הגדרות תזמון נשמרו בהצלחה",
        description: selectedVideo.is_auto_scheduled 
          ? `הסרטון יישלח אוטומטית ${selectedVideo.days_after_registration} ימים לאחר הרשמת שחקן חדש` 
          : "התזמון האוטומטי בוטל",
      });

      setOpenEditDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error saving schedule settings:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בשמירת הגדרות התזמון",
        description: "לא ניתן לשמור את הגדרות התזמון האוטומטי",
      });
    }
  };

  const processAutoVideos = async () => {
    setProcessingVideos(true);
    try {
      const response = await supabase.functions.invoke('process-auto-videos');
      const data = await response.data;
      
      if (response.error) throw response.error;

      toast({
        title: "סרטונים אוטומטיים עובדו בהצלחה",
        description: `${data.sent_in_last24h} סרטונים נשלחו ב-24 השעות האחרונות`,
      });

      // Refresh the data
      fetchData();
    } catch (error) {
      console.error('Error processing auto videos:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בעיבוד סרטונים אוטומטיים",
        description: "לא ניתן לעבד את הסרטונים האוטומטיים",
      });
    } finally {
      setProcessingVideos(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('he-IL');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold">ניהול סרטונים אוטומטיים</h1>
            <p className="text-muted-foreground">
              הגדר סרטונים שיישלחו אוטומטית לשחקנים חדשים במערכת
            </p>
          </div>
          <div className="flex space-x-4 rtl:space-x-reverse">
            <Button
              variant="outline"
              onClick={() => navigate("/tool-management")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              חזרה לניהול כלים
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={processAutoVideos}
                    disabled={processingVideos}
                    className="gap-2"
                  >
                    {processingVideos ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    שלח סרטונים מוכנים לשליחה כעת
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px] text-center">
                  <p>הסרטונים נשלחים אוטומטית לשחקנים חדשים, אך ניתן ללחוץ כאן כדי לעבד ולשלוח מיידית במקום להמתין לשליחה האוטומטית הבאה</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <Card className="bg-blue-50 border-blue-200 mb-2">
          <CardContent className="flex items-center p-4 gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              המערכת שולחת סרטונים אוטומטית לשחקנים חדשים לפי לוח הזמנים שהגדרת. אין צורך ללחוץ על כפתור השליחה אלא אם ברצונך לאלץ שליחה מיידית.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">סרטונים מתוזמנים</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalScheduled}</div>
              <p className="text-muted-foreground text-sm">סה"כ סרטונים מתוזמנים במערכת</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">סרטונים שנשלחו</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalSent}</div>
              <p className="text-muted-foreground text-sm">סה"כ סרטונים שנשלחו בהצלחה</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">נשלחו לאחרונה</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.sentLast24h}</div>
              <p className="text-muted-foreground text-sm">נשלחו ב-24 השעות האחרונות</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* רשימת סרטונים לתזמון אוטומטי */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                הגדרות שליחה אוטומטית
              </CardTitle>
              <CardDescription>
                הגדר כמה ימים לאחר הרישום של שחקן כל סרטון יישלח אליו
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-6">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
                  <p className="mt-2 text-gray-500">טוען נתונים...</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12 text-center">#</TableHead>
                        <TableHead>כותרת הסרטון</TableHead>
                        <TableHead className="w-32 text-center">ימים לאחר רישום</TableHead>
                        <TableHead className="w-32 text-center">סטטוס</TableHead>
                        <TableHead className="w-24 text-center">פעולות</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {videos.map((video, index) => (
                        <TableRow key={video.id}>
                          <TableCell className="text-center font-medium">
                            {video.auto_sequence_order || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{video.title}</div>
                            {video.category && (
                              <Badge variant="outline" className="mt-1">{video.category}</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {video.is_auto_scheduled ? (
                              <span className="font-medium">{video.days_after_registration} ימים</span>
                            ) : (
                              <span className="text-muted-foreground">לא מתוזמן</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {video.is_auto_scheduled ? (
                              <Badge variant="outline" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                פעיל
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                לא פעיל
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center space-x-2 rtl:space-x-reverse">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditSchedule(video)}
                              >
                                <span className="sr-only">ערוך תזמון</span>
                                <Calendar className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                                onClick={() => handleDeleteVideo(video)}
                              >
                                <span className="sr-only">מחק סרטון</span>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}

                      {videos.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <Film className="h-8 w-8 text-muted-foreground" />
                              <p>אין סרטונים במערכת</p>
                              <p className="text-sm text-muted-foreground">הוסף סרטונים בעמוד ניהול הסרטונים</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
            <CardFooter className="border-t bg-muted/50 p-2">
              <p className="text-xs text-muted-foreground w-full text-center">
                רק שחקנים חדשים שנרשמים אחרי הגדרת התזמון האוטומטי יקבלו את הסרטונים
              </p>
            </CardFooter>
          </Card>

          {/* היסטוריית שליחות אוטומטיות */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                היסטוריית שליחה אוטומטית
              </CardTitle>
              <CardDescription>
                רשימת הסרטונים שנשלחו אוטומטית לשחקנים
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-6">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
                  <p className="mt-2 text-gray-500">טוען נתונים...</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>שחקן</TableHead>
                        <TableHead>סרטון</TableHead>
                        <TableHead className="text-center">תאריך תזמון</TableHead>
                        <TableHead className="text-center">תאריך שליחה</TableHead>
                        <TableHead className="text-center">סטטוס</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">{assignment.players?.full_name || "לא ידוע"}</TableCell>
                          <TableCell>{assignment.videos?.title || "סרטון לא קיים"}</TableCell>
                          <TableCell className="text-center">{formatDate(assignment.scheduled_for)}</TableCell>
                          <TableCell className="text-center">
                            {assignment.sent ? formatDate(assignment.scheduled_for) : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {assignment.sent ? (
                              <Badge variant="outline" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                נשלח
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                <ClockIcon className="h-3.5 w-3.5 mr-1" />
                                ממתין
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}

                      {assignments.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <ListChecks className="h-8 w-8 text-muted-foreground" />
                              <p>אין היסטוריית שליחות אוטומטיות</p>
                              <p className="text-sm text-muted-foreground">
                                הגדר תזמונים אוטומטיים כדי לראות שליחות פה
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* דיאלוג עריכת תזמון */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>הגדרת תזמון אוטומטי</DialogTitle>
            <DialogDescription>
              הגדר מתי הסרטון יישלח אוטומטית לשחקנים חדשים
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedVideo && (
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <p className="font-semibold">{selectedVideo.title}</p>
                {selectedVideo.description && (
                  <p className="text-sm text-gray-600 mt-1">{selectedVideo.description}</p>
                )}
              </div>
            )}
            <div className="space-y-4">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  id="is_auto_scheduled"
                  checked={selectedVideo?.is_auto_scheduled || false}
                  onChange={(e) => 
                    selectedVideo && setSelectedVideo({
                      ...selectedVideo,
                      is_auto_scheduled: e.target.checked
                    })
                  }
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_auto_scheduled" className="flex-1 cursor-pointer">
                  הפעל תזמון אוטומטי לשחקנים חדשים
                </Label>
              </div>

              {selectedVideo?.is_auto_scheduled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="days_after">שלח לאחר (ימים מרישום)</Label>
                    <Input
                      id="days_after"
                      type="number"
                      min={1}
                      value={selectedVideo.days_after_registration || 1}
                      onChange={(e) => 
                        selectedVideo && setSelectedVideo({
                          ...selectedVideo,
                          days_after_registration: parseInt(e.target.value) || 1
                        })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      הסרטון יישלח אוטומטית לשחקנים חדשים לאחר מספר ימים זה מיום הרישום שלהם
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sequence_order">סדר בסדרת הסרטונים</Label>
                    <Input
                      id="sequence_order"
                      type="number"
                      min={1}
                      value={selectedVideo.auto_sequence_order || 1}
                      onChange={(e) => 
                        selectedVideo && setSelectedVideo({
                          ...selectedVideo,
                          auto_sequence_order: parseInt(e.target.value) || 1
                        })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      מספר סידורי לסידור הסרטונים בטבלה (לנוחיות המשתמש בלבד)
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditDialog(false)}>
              ביטול
            </Button>
            <Button onClick={handleScheduleSave}>
              <Calendar className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              שמור הגדרות תזמון
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* דיאלוג אישור מחיקה */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח שברצונך למחוק את הסרטון?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את הסרטון מכל התזמונים האוטומטיים וגם מהשחקנים שהסרטון הוקצה להם. פעולה זו אינה ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedVideo && (
            <div className="bg-gray-50 p-3 rounded-md my-2">
              <div className="font-semibold">{selectedVideo.title}</div>
              {selectedVideo.description && (
                <p className="text-sm text-gray-600 mt-1">{selectedVideo.description}</p>
              )}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteVideo}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              מחק סרטון
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
