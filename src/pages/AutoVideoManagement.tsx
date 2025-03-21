import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Loader2, RefreshCw, Check, AlertCircle, Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface Video {
  id: string;
  coach_id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  created_at: string;
  is_admin_video: boolean;
}

interface Player {
  id: string;
  full_name: string;
}

interface AutoVideoAssignment {
  id?: string;
  player_id: string;
  video_id: string;
  scheduled_for: string;
  sent: boolean | null;
}

const AutoVideoManagement = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [loadingVideos, setLoadingVideos] = useState<boolean>(true);
  const [loadingPlayers, setLoadingPlayers] = useState<boolean>(true);
  const [autoAssignments, setAutoAssignments] = useState<AutoVideoAssignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isResending, setIsResending] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchVideos = async () => {
    setLoadingVideos(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching videos:', error);
        toast.error('Failed to load videos.');
      } else {
        setVideos(data || []);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos.');
    } finally {
      setLoadingVideos(false);
    }
  };

  const fetchPlayers = async () => {
    setLoadingPlayers(true);
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, full_name')
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error fetching players:', error);
        toast.error('Failed to load players.');
      } else {
        setPlayers(data || []);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
      toast.error('Failed to load players.');
    } finally {
      setLoadingPlayers(false);
    }
  };

  const fetchAutoAssignments = async () => {
    setLoadingAssignments(true);
    try {
      const { data, error } = await supabase
        .from('auto_video_assignments')
        .select('*')
        .order('scheduled_for', { ascending: false });

      if (error) {
        console.error('Error fetching auto video assignments:', error);
        toast.error('Failed to load auto video assignments.');
      } else {
        setAutoAssignments(data || []);
      }
    } catch (error) {
      console.error('Error fetching auto video assignments:', error);
      toast.error('Failed to load auto video assignments.');
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    fetchVideos();
    fetchPlayers();
    fetchAutoAssignments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!selectedPlayer || !selectedVideo || !scheduledDate) {
      toast.error('Please fill in all fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('auto_video_assignments')
        .insert([
          {
            player_id: selectedPlayer,
            video_id: selectedVideo,
            scheduled_for: scheduledDate,
            sent: false,
          },
        ]);

      if (error) {
        console.error('Error creating auto video assignment:', error);
        toast.error('Failed to create auto video assignment.');
      } else {
        toast.success('Auto video assignment created successfully!');
        fetchAutoAssignments();
        setSelectedPlayer('');
        setSelectedVideo('');
        setScheduledDate('');
      }
    } catch (error) {
      console.error('Error creating auto video assignment:', error);
      toast.error('Failed to create auto video assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    setIsDeleting(id);
    try {
      const { error } = await supabase
        .from('auto_video_assignments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting auto video assignment:', error);
        toast.error('Failed to delete auto video assignment.');
      } else {
        toast.success('Auto video assignment deleted successfully!');
        fetchAutoAssignments();
      }
    } catch (error) {
      console.error('Error deleting auto video assignment:', error);
      toast.error('Failed to delete auto video assignment.');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleResendAssignment = async (assignment: AutoVideoAssignment) => {
    if (!assignment.id) {
      toast.error('Assignment ID is missing.');
      return;
    }

    setIsResending(assignment.id);

    try {
      // Optimistically update the UI
      setAutoAssignments(currentAssignments =>
        currentAssignments.map(a =>
          a.id === assignment.id ? { ...a, sent: null } : a
        )
      );

      const { data: player, error: playerError } = await supabase
        .from('players')
        .select('coach_id')
        .eq('id', assignment.player_id)
        .single();

      if (playerError) {
        console.error('Error fetching player coach ID:', playerError);
        toast.error('Failed to fetch player coach ID.');
        return;
      }

      const coachId = player?.coach_id;

      const { error } = await supabase
        .from('auto_video_assignments')
        .update({ sent: false })
        .eq('id', assignment.id);

      if (error) {
        console.error('Error resending auto video assignment:', error);
        toast.error('Failed to resend auto video assignment.');
      } else {
        // Create player_videos entry
        const { error: insertError } = await supabase
          .from("player_videos")
          .insert({
            player_id: assignment.player_id,
            video_id: assignment.video_id,
            watched: false,
            assigned_by: coachId
          });

        if (insertError) {
          if (insertError.code === "23505") { // Unique violation
            console.log(`Player video already exists for assignment ${assignment.id}`);
          } else {
            console.error(`Error creating player_video for assignment ${assignment.id}:`, insertError);
            toast.error('Failed to create player video.');
          }
        } else {
          toast.success('Auto video assignment resent successfully!');
        }

        fetchAutoAssignments();
      }
    } catch (error) {
      console.error('Error resending auto video assignment:', error);
      toast.error('Failed to resend auto video assignment.');
    } finally {
      setIsResending(null);
    }
  };

  const filteredAssignments = autoAssignments.filter(assignment => {
    const searchTermLower = searchTerm.toLowerCase();
    const player = players.find(p => p.id === assignment.player_id);
    const video = videos.find(v => v.id === assignment.video_id);

    const matchesSearchTerm =
      !searchTerm ||
      player?.full_name.toLowerCase().includes(searchTermLower) ||
      video?.title.toLowerCase().includes(searchTermLower);

    if (filterType === 'sent') {
      return assignment.sent === true && matchesSearchTerm;
    } else if (filterType === 'pending') {
      return assignment.sent === false && matchesSearchTerm;
    } else if (filterType === 'unsent') {
      return assignment.sent === null && matchesSearchTerm;
    }

    return matchesSearchTerm;
  });

  const FixPlayerVideosButton = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
  
    const handleFixPlayerVideos = async () => {
      try {
        setIsLoading(true);
        setResult(null);
  
        // Call the Edge Function to fix player videos
        const { data, error } = await supabase.functions.invoke('fix-player-videos', {
          method: 'POST'
        });
  
        if (error) {
          console.error('Error fixing player videos:', error);
          toast.error('שגיאה בתיקון סרטוני שחקנים');
          return;
        }
  
        console.log('Fix player videos result:', data);
        setResult(data);
        toast.success('תיקון סרטוני שחקנים הסתיים בהצלחה');
      } catch (error) {
        console.error('Error fixing player videos:', error);
        toast.error('שגיאה בתיקון סרטוני שחקנים');
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Button 
            onClick={handleFixPlayerVideos} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                מתקן סרטוני שחקנים...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                תקן סרטוני שחקנים
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground">
            פעולה זו תתקן רשומות חסרות ותעבד משימות אוטומטיות שלא בוצעו
          </p>
        </div>
  
        {result && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base">תוצאות תיקון</CardTitle>
            </CardHeader>
            <CardContent className="py-2 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>רשומות player_videos שתוקנו:</span>
                <Badge variant="outline">{result.fixed_player_videos || 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span>רשומות auto_assignments עם ערכי null שתוקנו:</span>
                <Badge variant="outline">{result.fixed_null_sent || 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span>משימות שעברו זמנן ובוצעו:</span>
                <Badge variant="outline">{result.processed_past_due || 0}</Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>ניהול שליחת סרטונים אוטומטית</CardTitle>
          <CardDescription>
            הגדרת שליחת סרטונים אוטומטית לשחקנים בתאריכים מוגדרים
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="player">שחקן</Label>
              <Select onValueChange={setSelectedPlayer}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="בחר שחקן" />
                </SelectTrigger>
                <SelectContent>
                  {loadingPlayers ? (
                    <SelectItem value="" disabled>
                      טוען שחקנים...
                    </SelectItem>
                  ) : (
                    players.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.full_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="video">סרטון</Label>
              <Select onValueChange={setSelectedVideo}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="בחר סרטון" />
                </SelectTrigger>
                <SelectContent>
                  {loadingVideos ? (
                    <SelectItem value="" disabled>
                      טוען סרטונים...
                    </SelectItem>
                  ) : (
                    videos.map((video) => (
                      <SelectItem key={video.id} value={video.id}>
                        {video.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="scheduledDate">תאריך שליחה</Label>
              <Input
                type="datetime-local"
                id="scheduledDate"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="mt-6">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  שולח...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  הוסף משימה
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <Card>
        <CardHeader>
          <CardTitle>רשימת משימות אוטומטיות</CardTitle>
          <CardDescription>
            ניהול משימות אוטומטיות לשליחת סרטונים
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center space-x-4">
            <Input
              type="text"
              placeholder="חפש שחקן או סרטון..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="סנן לפי סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">הכל</SelectItem>
                <SelectItem value="sent">נשלח</SelectItem>
                <SelectItem value="pending">ממתין</SelectItem>
                <SelectItem value="unsent">לא נשלח</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {loadingAssignments ? (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              טוען משימות...
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="flex items-center justify-center">
              <AlertCircle className="mr-2 h-4 w-4" />
              אין משימות אוטומטיות
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      שחקן
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      סרטון
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      תאריך שליחה
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      סטטוס
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      פעולות
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssignments.map((assignment) => {
                    const player = players.find((p) => p.id === assignment.player_id);
                    const video = videos.find((v) => v.id === assignment.video_id);
                    const scheduledDateFormatted = new Date(assignment.scheduled_for).toLocaleString();
                    let statusText = 'ממתין';
                    let statusColor = 'text-gray-500';
                    if (assignment.sent === true) {
                      statusText = 'נשלח';
                      statusColor = 'text-green-500';
                    } else if (assignment.sent === false) {
                      statusText = 'ממתין';
                      statusColor = 'text-gray-500';
                    } else {
                      statusText = 'לא נשלח';
                      statusColor = 'text-red-500';
                    }

                    return (
                      <tr key={assignment.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {player?.full_name || 'לא ידוע'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {video?.title || 'לא ידוע'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {scheduledDateFormatted}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                            {statusText}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {assignment.sent === true ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => window.open(video?.url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 ml-2" />
                              צפה בסרטון
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isResending === assignment.id}
                              onClick={() => handleResendAssignment(assignment)}
                            >
                              {isResending === assignment.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  שולח מחדש...
                                </>
                              ) : (
                                <>
                                  <Check className="mr-2 h-4 w-4" />
                                  שלח עכשיו
                                </>
                              )}
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isDeleting === assignment.id}
                            onClick={() => handleDeleteAssignment(assignment.id!)}
                            className="ml-2"
                          >
                            {isDeleting === assignment.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                מוחק...
                              </>
                            ) : (
                              <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                מחק
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <Card>
        <CardHeader>
          <CardTitle>כלי עזר</CardTitle>
          <CardDescription>פעולות תחזוקה</CardDescription>
        </CardHeader>
        <CardContent>
          <FixPlayerVideosButton />
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoVideoManagement;
