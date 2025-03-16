import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronDown, ChevronUp, RefreshCw, Send, ClipboardCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, isAfter, isBefore } from 'date-fns';
import { he } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SessionSummaryForm } from '@/components/session/SessionSummaryForm';

interface UpcomingEvent {
  id: string;
  playerId: string;
  playerName: string;
  date: string;
  time?: string;
  sentReminder: boolean;
  type: 'game' | 'session';
  location?: string;
  hasStarted?: boolean;
  hasSummary?: boolean;
}

export function UpcomingGamesAlert() {
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<{id: string, playerName: string, date: string} | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchUpcomingEvents = async () => {
    setRefreshing(true);
    try {
      const today = new Date();
      const next7Days = addDays(today, 7);
      
      const todayFormatted = format(today, 'yyyy-MM-dd');
      const next7DaysFormatted = format(next7Days, 'yyyy-MM-dd');
      
      const { data: gamesData, error: gamesError } = await supabase
        .from('player_meetings')
        .select(`
          id,
          player_id,
          meeting_date,
          meeting_time,
          meeting_type,
          location,
          players(full_name)
        `)
        .eq('meeting_type', 'game')
        .gte('meeting_date', todayFormatted)
        .lte('meeting_date', next7DaysFormatted)
        .order('meeting_date');

      if (gamesError) throw gamesError;
      
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select(`
          id,
          player_id,
          session_date,
          session_time,
          location,
          has_started,
          players(full_name)
        `)
        .gte('session_date', todayFormatted)
        .lte('session_date', next7DaysFormatted)
        .order('session_date');

      if (sessionsError) throw sessionsError;
      
      const sessionIds = sessionsData?.map(session => session.id) || [];
      
      const { data: summariesData, error: summariesError } = await supabase
        .from('session_summaries')
        .select('session_id')
        .in('session_id', sessionIds);
        
      if (summariesError) throw summariesError;
      
      const sessionIdsWithSummaries = new Set(
        summariesData?.map(summary => summary.session_id) || []
      );
      
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications_log')
        .select('message_content, session_id')
        .ilike('message_content', '%תזכורת למשחק%')
        .is('error_message', null);
        
      if (notificationsError) throw notificationsError;
      
      const gameIdsWithReminders = new Set(
        notificationsData
          .filter(n => n.session_id)
          .map(n => n.session_id)
      );
      
      const formattedGames = gamesData ? gamesData.map(game => ({
        id: game.id,
        playerId: game.player_id,
        playerName: game.players?.full_name || 'Unknown Player',
        date: game.meeting_date,
        time: game.meeting_time,
        location: game.location,
        sentReminder: gameIdsWithReminders.has(game.id),
        type: 'game' as const
      })) : [];
      
      const formattedSessions = sessionsData ? sessionsData.map(session => ({
        id: session.id,
        playerId: session.player_id,
        playerName: session.players?.full_name || 'Unknown Player',
        date: session.session_date,
        time: session.session_time,
        location: session.location,
        sentReminder: false,
        hasStarted: session.has_started,
        hasSummary: sessionIdsWithSummaries.has(session.id),
        type: 'session' as const
      })) : [];
      
      const allEvents = [...formattedGames, ...formattedSessions].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || '00:00:00'}`);
        const dateB = new Date(`${b.date}T${b.time || '00:00:00'}`);
        return dateA.getTime() - dateB.getTime();
      });
      
      setUpcomingEvents(allEvents.slice(0, 5));
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      toast({
        variant: 'destructive',
        title: 'שגיאה בטעינת נתונים',
        description: 'לא ניתן לטעון את נתוני האירועים הקרובים'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUpcomingEvents();
    
    const gameChannel = supabase
      .channel('upcoming-games-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'player_meetings',
        filter: 'meeting_type=eq.game'
      }, () => {
        fetchUpcomingEvents();
      })
      .subscribe();
      
    const sessionChannel = supabase
      .channel('upcoming-sessions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sessions'
      }, () => {
        fetchUpcomingEvents();
      })
      .subscribe();
      
    const handleSessionSummarized = () => {
      fetchUpcomingEvents();
    };
    
    window.addEventListener('sessionSummarized', handleSessionSummarized);
      
    return () => {
      supabase.removeChannel(gameChannel);
      supabase.removeChannel(sessionChannel);
      window.removeEventListener('sessionSummarized', handleSessionSummarized);
    };
  }, []);

  const runManualCheck = async () => {
    try {
      setRefreshing(true);
      await supabase.functions.invoke('automated-notifications', {
        body: { action: 'send_game_reminders' }
      });
      
      toast({
        title: 'תזכורות נשלחו',
        description: 'תזכורות למשחקים נשלחו בהצלחה'
      });
      
      setTimeout(() => {
        fetchUpcomingEvents();
      }, 2000);
    } catch (error) {
      console.error('Error sending game reminders:', error);
      toast({
        variant: 'destructive',
        title: 'שגיאה בשליחת תזכורות',
        description: 'לא ניתן לשלוח תזכורות למשחקים כעת'
      });
    } finally {
      setRefreshing(false);
    }
  };

  const sendManualReminder = async (gameId: string, playerId: string, playerName: string) => {
    setSendingReminder(gameId);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: userData.user.id,
          recipient_id: playerId,
          content: `שלום ${playerName}, זוהי תזכורת למשחק הקרוב. אנא מלא את שאלון ההכנה למשחק בקישור הבא: /player/game-preparation/${gameId}`,
          is_read: false
        });

      if (messageError) throw messageError;
      
      await supabase.from('notifications_log').insert({
        coach_id: userData.user.id,
        message_content: `תזכורת למשחק נשלחה ל${playerName}`,
        status: 'Sent',
        session_id: gameId
      });
      
      toast({
        title: 'תזכורת נשלחה',
        description: `תזכורת נשלחה ל${playerName} בהצלחה`
      });
      
      fetchUpcomingEvents();
    } catch (error) {
      console.error('Error sending manual reminder:', error);
      toast({
        variant: 'destructive',
        title: 'שגיאה בשליחת תזכורת',
        description: 'לא ניתן לשלוח תזכורת כעת'
      });
    } finally {
      setSendingReminder(null);
    }
  };

  const handleSummarizeSession = (session: UpcomingEvent) => {
    if (!session.hasStarted) {
      toast({
        variant: 'destructive',
        title: 'פעולה לא אפשרית',
        description: 'לא ניתן לסכם מפגש שטרם התחיל'
      });
      return;
    }
    
    setSelectedSession({
      id: session.id,
      playerName: session.playerName,
      date: format(new Date(session.date), 'dd/MM/yyyy')
    });
  };

  const handleSubmitSummary = async (data: any) => {
    if (!selectedSession) return;
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('session_summaries')
        .insert({
          session_id: selectedSession.id,
          coach_id: userData.user.id,
          summary_text: data.summary_text,
          achieved_goals: data.achieved_goals.split('\n').filter((g: string) => g.trim()),
          future_goals: data.future_goals.split('\n').filter((g: string) => g.trim()),
          additional_notes: data.additional_notes,
          progress_rating: data.progress_rating,
          next_session_focus: data.next_session_focus,
          tools_used: data.tools_used
        });
      
      if (error) throw error;
      
      fetchUpcomingEvents();
      
      setSelectedSession(null);
    } catch (error) {
      console.error('Error submitting session summary:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-1 p-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-blue-500" />
            <Skeleton className="h-4 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (upcomingEvents.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-1 p-3">
          <CardTitle className="flex items-center gap-2 text-blue-600 text-sm">
            <Calendar className="h-4 w-4" />
            אין מפגשים או משחקים בשבוע הקרוב
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-1">
          <div className="flex justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1 h-7 text-xs"
              onClick={fetchUpcomingEvents}
              disabled={refreshing}
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
              רענן
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-1 p-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span>
                {upcomingEvents.length} 
                {upcomingEvents.some(e => e.type === 'game') && upcomingEvents.some(e => e.type === 'session') 
                  ? ' מפגשים ומשחקים' 
                  : upcomingEvents.some(e => e.type === 'game') 
                    ? ' משחקים' 
                    : ' מפגשים'} קרובים
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1 h-6 p-1"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        {expanded && (
          <CardContent className="p-3 pt-1">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {upcomingEvents.map(event => {
                const eventDate = new Date(event.date);
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                
                const isToday = 
                  eventDate.getDate() === today.getDate() && 
                  eventDate.getMonth() === today.getMonth() && 
                  eventDate.getFullYear() === today.getFullYear();
                  
                const isTomorrow = 
                  eventDate.getDate() === tomorrow.getDate() && 
                  eventDate.getMonth() === tomorrow.getMonth() && 
                  eventDate.getFullYear() === tomorrow.getFullYear();
                
                return (
                  <div 
                    key={`${event.type}-${event.id}`} 
                    className="flex items-center justify-between p-1.5 bg-white rounded-md shadow-sm"
                  >
                    <div className="flex items-center gap-1.5">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs ${
                        event.type === 'game' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {format(new Date(event.date), 'dd', { locale: he })}
                      </div>
                      <div>
                        <div className="font-medium text-xs flex items-center gap-1.5 flex-wrap">
                          {event.playerName}
                          {isToday && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">היום</Badge>
                          )}
                          {isTomorrow && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-800 border-yellow-200">מחר</Badge>
                          )}
                          <Badge className={`text-[10px] px-1.5 py-0.5 ${event.type === 'game' 
                            ? 'bg-blue-100 text-blue-800 border-blue-200' 
                            : 'bg-green-100 text-green-800 border-green-200'}`}>
                            {event.type === 'game' ? 'משחק' : 'מפגש'}
                          </Badge>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {format(new Date(event.date), 'EEEE, dd/MM', { locale: he })}
                          {event.time && ` - ${event.time.substring(0, 5)}`}
                          {event.location && ` - ${event.location}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {event.type === 'game' && (
                        event.sentReminder ? (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-800 border-green-200">
                            נשלח
                          </Badge>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-6 px-2 text-[10px] flex items-center gap-1"
                            onClick={() => sendManualReminder(event.id, event.playerId, event.playerName)}
                            disabled={sendingReminder === event.id}
                          >
                            {sendingReminder === event.id ? (
                              <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                            ) : (
                              <Send className="h-2.5 w-2.5" />
                            )}
                            שלח
                          </Button>
                        )
                      )}
                      
                      {event.type === 'session' && (
                        event.hasSummary ? (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-800 border-green-200">
                            סוכם
                          </Badge>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-6 px-2 text-[10px] flex items-center gap-1"
                            onClick={() => handleSummarizeSession(event)}
                          >
                            <ClipboardCheck className="h-2.5 w-2.5" />
                            סכם
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs flex items-center gap-1"
                onClick={() => navigate('/sessions')}
              >
                <Calendar className="h-3 w-3" />
                צפה בכל המפגשים
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
      
      {selectedSession && (
        <Dialog open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>סיכום מפגש עם {selectedSession.playerName}</DialogTitle>
            </DialogHeader>
            <SessionSummaryForm 
              sessionId={selectedSession.id}
              playerName={selectedSession.playerName}
              sessionDate={selectedSession.date}
              onSubmit={handleSubmitSummary}
              onCancel={() => setSelectedSession(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
