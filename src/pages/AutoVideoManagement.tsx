
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle, 
  ClockIcon, 
  Film, 
  ListChecks, 
  RefreshCw,
  Send
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
        .order('auto_sequence_order', { ascending: true, nullsLast: true });

      if (videosError) throw videosError;
      setVideos(videosData || []);

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
              שלח סרטונים מוכנים לשליחה
            </Button>
          </div>
        </div>

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
                        <TableHead className="w-20 text-center">פעולות</TableHead>
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
                              <Badge variant="success" className="bg-green-100 text-green-800">
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
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditSchedule(video)}
                            >
                              <span className="sr-only">ערוך תזמון</span>
                              <Calendar className="h-4 w-4" />
                            </Button>
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
    </div>
  );
}
