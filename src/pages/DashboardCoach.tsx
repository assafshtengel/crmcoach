
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Loader2, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Calendar } from '@/components/calendar/Calendar';
import { CalendarEvent, UpcomingSession, DashboardStats } from '@/types/dashboard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStats as StatsCards } from '@/components/dashboard/DashboardStats';
import { UpcomingSessions } from '@/components/dashboard/UpcomingSessions';
import { PastSessions } from '@/components/dashboard/PastSessions';
import { NotificationsDropdown } from '@/components/dashboard/NotificationsDropdown';
import { SessionFormDialog } from '@/components/sessions/SessionFormDialog';

const DashboardCoach = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [coachName, setCoachName] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<DashboardStats>({
    totalPlayers: 0,
    upcomingSessions: 0,
    currentMonthPastSessions: 0,
    currentMonthFutureSessions: 0,
    lastMonthSessions: 0,
    twoMonthsAgoSessions: 0,
    totalReminders: 0
  });
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [pastSessionsToSummarize, setPastSessionsToSummarize] = useState<UpcomingSession[]>([]);
  const [summarizedSessions, setSummarizedSessions] = useState<UpcomingSession[]>([]);
  const [isSessionFormOpen, setIsSessionFormOpen] = useState(false);
  const [players, setPlayers] = useState<{ id: string; full_name: string }[]>([]);

  useEffect(() => {
    const initUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
    };
    initUser();
  }, []);

  const fetchData = async (userId: string) => {
    try {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);
      
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('session_date')
        .eq('coach_id', userId);
      
      if (sessionsError) throw sessionsError;

      const currentMonthPastSessions = sessionsData?.filter(session => {
        const sessionDate = new Date(session.session_date);
        return sessionDate < today && sessionDate >= firstDayOfMonth;
      })?.length || 0;

      const currentMonthFutureSessions = sessionsData?.filter(session => {
        const sessionDate = new Date(session.session_date);
        return (sessionDate >= today) && sessionDate <= lastDayOfMonth;
      })?.length || 0;

      const lastMonthSessions = sessionsData?.filter(session => {
        const sessionDate = new Date(session.session_date);
        return sessionDate < firstDayOfMonth && sessionDate >= lastMonth;
      })?.length || 0;

      const twoMonthsAgoSessions = sessionsData?.filter(session => {
        const sessionDate = new Date(session.session_date);
        return sessionDate < lastMonth && sessionDate >= twoMonthsAgo;
      })?.length || 0;

      const { data: upcomingSessions, error: upcomingError } = await supabase
        .from('sessions')
        .select(`
          id,
          session_date,
          session_time,
          notes,
          location,
          reminder_sent,
          player:players (
            id,
            full_name
          ),
          session_summaries (
            id
          )
        `)
        .eq('coach_id', userId)
        .gte('session_date', today.toISOString().split('T')[0])
        .lte('session_date', nextWeek.toISOString().split('T')[0])
        .order('session_date', { ascending: true })
        .order('session_time', { ascending: true });

      if (upcomingError) throw upcomingError;

      const upcomingSessionsCount = upcomingSessions?.length || 0;

      const [playersCountResult, remindersResult] = await Promise.all([
        supabase
          .from('players')
          .select('id')
          .eq('coach_id', userId),
        supabase
          .from('notifications_log')
          .select('id')
          .eq('coach_id', userId)
          .eq('status', 'Sent')
      ]);

      if (upcomingSessions) {
        const formattedSessions: UpcomingSession[] = upcomingSessions.map((session: any) => ({
          id: session.id,
          session_date: session.session_date,
          session_time: session.session_time,
          notes: session.notes || '',
          location: session.location || '',
          reminder_sent: session.reminder_sent || false,
          player: {
            id: session.player?.id,
            full_name: session.player?.full_name || 'לא נמצא שחקן'
          },
          has_summary: Array.isArray(session.session_summaries) && session.session_summaries.length > 0
        }));
        setUpcomingSessions(formattedSessions);
      }

      setStats({
        totalPlayers: playersCountResult.data?.length || 0,
        upcomingSessions: upcomingSessionsCount,
        currentMonthPastSessions,
        currentMonthFutureSessions,
        lastMonthSessions,
        twoMonthsAgoSessions: twoMonthsAgoSessions,
        totalReminders: remindersResult.data?.length || 0
      });

      const { data: pastSessions, error: pastSessionsError } = await supabase
        .from('sessions')
        .select(`
          id,
          session_date,
          session_time,
          notes,
          location,
          reminder_sent,
          player:players (
            id,
            full_name
          ),
          session_summaries (
            id
          )
        `)
        .eq('coach_id', userId)
        .lt('session_date', today.toISOString().split('T')[0])
        .order('session_date', { ascending: false })
        .limit(10);

      if (pastSessionsError) throw pastSessionsError;

      if (pastSessions) {
        const sessionsToSummarize: UpcomingSession[] = [];
        const summarizedSessions: UpcomingSession[] = [];

        pastSessions.forEach((session: any) => {
          const hasSummary = Array.isArray(session.session_summaries) && session.session_summaries.length > 0;
          const formattedSession: UpcomingSession = {
            id: session.id,
            session_date: session.session_date,
            session_time: session.session_time,
            notes: session.notes || '',
            location: session.location || '',
            reminder_sent: session.reminder_sent || false,
            player: {
              id: session.player?.id,
              full_name: session.player?.full_name || 'לא נמצא שחקן'
            },
            has_summary: hasSummary
          };

          if (hasSummary) {
            summarizedSessions.push(formattedSession);
          } else {
            sessionsToSummarize.push(formattedSession);
          }
        });

        setPastSessionsToSummarize(sessionsToSummarize);
        setSummarizedSessions(summarizedSessions);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בטעינת הנתונים",
        description: "אנא נסה שוב מאוחר יותר"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async (userId: string) => {
    try {
      const {
        data: notificationsData,
        error
      } = await supabase.from('notifications').select('*').eq('coach_id', userId).order('created_at', {
        ascending: false
      }).limit(10);
      if (error) throw error;
      setNotifications(notificationsData || []);
      setUnreadCount(notificationsData?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchCalendarEvents = async (userId: string) => {
    try {
      const { data: rawSessions, error } = await supabase
        .from('sessions')
        .select(`
          id,
          session_date,
          session_time,
          location,
          notes,
          reminder_sent,
          player:players!inner(
            full_name
          )
        `)
        .eq('coach_id', userId);

      if (error) throw error;

      const events: CalendarEvent[] = rawSessions.map(session => ({
        id: session.id,
        title: session.player.full_name,
        start: `${session.session_date}T${session.session_time}`,
        location: session.location || undefined,
        extendedProps: {
          playerName: session.player.full_name,
          location: session.location || undefined,
          reminderSent: session.reminder_sent || false,
          notes: session.notes || undefined
        }
      }));

      setCalendarEvents(events);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בטעינת המפגשים",
        description: "אנא נסה שוב מאוחר יותר"
      });
    }
  };

  const handleSendReminder = async (sessionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('לא נמצא משתמש מחובר');
      const session = upcomingSessions.find(s => s.id === sessionId);
      if (!session) throw new Error('לא נמצא מפגש');
      await supabase.from('notifications').insert({
        coach_id: user.id,
        type: 'reminder_scheduled',
        message: `תזכורת תשלח לשחקן ${session.player.full_name} בעוד 15 דקות`
      });
      const { error } = await supabase.from('notifications_log').insert([{
        session_id: sessionId,
        status: 'Sent',
        message_content: 'תזכורת למפגש',
        coach_id: user.id
      }]);
      if (error) {
        await supabase.from('notifications').insert({
          coach_id: user.id,
          type: 'reminder_error',
          message: `⚠️ שגיאה: לא הצלחנו לשלוח תזכורת ל-${session.player.full_name}`
        });
        throw error;
      }
      await supabase.from('sessions').update({
        reminder_sent: true
      }).eq('id', sessionId);
      toast({
        title: "התזכורת נשלחה בהצלחה",
        description: "השחקן יקבל הודעה על המפגש"
      });
      fetchData(user.id);
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בשליחת התזכורת",
        description: "אנא נסה שוב מאוחר יותר"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
      toast({
        title: "התנתקת בהצלחה",
        description: "להתראות!"
      });
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בהתנתקות",
        description: "אנא נסה שוב"
      });
    }
  };

  const handleSaveSessionSummary = async (sessionId: string, data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('לא נמצא משתמש מחובר');

      const { error } = await supabase.from('session_summaries').insert({
        session_id: sessionId,
        coach_id: user.id,
        summary_text: data.summary_text,
        achieved_goals: data.achieved_goals.split('\n').filter(Boolean),
        future_goals: data.future_goals.split('\n').filter(Boolean),
        additional_notes: data.additional_notes,
        progress_rating: data.progress_rating,
        next_session_focus: data.next_session_focus
      });

      if (error) throw error;

      setUpcomingSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, has_summary: true }
            : session
        )
      );

      toast({
        title: "הסיכום נשמר בהצלחה",
        description: "סיכום המפגש נשמר במערכת",
        duration: 1000
      });

      setTimeout(() => {
        document.querySelector<HTMLButtonElement>('[aria-label="Close"]')?.click();
        navigate('/');
      }, 1000);

    } catch (error) {
      console.error('Error saving session summary:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בשמירת הסיכום",
        description: "אנא נסה שוב מאוחר יותר"
      });
    }
  };

  const handleViewSummary = async (playerId: string, playerName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive", 
          title: "שגיאה",
          description: "לא נמצא משתמש מחובר"
        });
        return;
      }

      const { data: summaries, error } = await supabase
        .from('session_summaries')
        .select(`
          id,
          session:sessions (
            player:players!inner (
              id,
              full_name
            )
          )
        `)
        .eq('coach_id', user.id)
        .eq('sessions.player_id', playerId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching summary:', error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת הסיכום",
          description: "לא ניתן לטעון את הסיכום כרגע, אנא נסה שוב מאוחר יותר"
        });
        return;
      }

      if (summaries && summaries.length > 0) {
        navigate(`/session-summaries?id=${summaries[0].id}`);
      } else {
        toast({
          title: "אין סיכומים זמינים",
          description: `אין סיכומים זמינים עבור ${playerName}`,
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error in handleViewSummary:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אירעה שגיאה בניסיון לצפות בסיכום"
      });
    }
  };

  const handleAddEvent = async (eventData: any) => {
    try {
      if (!user?.id) {
        throw new Error('משתמש לא מחובר');
      }

      const sessionData = {
        player_id: eventData.extendedProps?.player_id || '',
        coach_id: user.id,
        session_date: eventData.start.split('T')[0],
        session_time: eventData.start.split('T')[1],
        location: eventData.extendedProps?.location || '',
        notes: eventData.extendedProps?.notes || ''
      };

      console.log('Adding new session:', sessionData);

      const { error } = await supabase
        .from('sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      await fetchCalendarEvents(user.id);
      toast({
        title: "המפגש נוסף בהצלחה",
        description: "המפגש נוסף ללוח השנה",
      });
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בהוספת המפגש",
        description: "אנא נסה שוב מאוחר יותר",
      });
      throw error;
    }
  };

  const handleEventClick = (eventId: string) => {
    navigate('/edit-session', { state: { sessionId: eventId } });
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: coachData } = await supabase
          .from('coaches')
          .select('full_name, profile_picture')
          .eq('id', authUser.id)
          .single();
        
        if (coachData) {
          setCoachName(coachData.full_name);
          setProfilePicture(coachData.profile_picture);
        }

        await fetchData(authUser.id);
        await fetchNotifications(authUser.id);
        await fetchCalendarEvents(authUser.id);

        const channel = supabase.channel('dashboard-changes').on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications'
        }, payload => {
          if (payload.eventType === 'INSERT') {
            toast({
              title: "📢 התראה חדשה",
              description: payload.new.message,
              duration: 5000
            });
            fetchNotifications(authUser.id);
          } else {
            fetchNotifications(authUser.id);
          }
        }).subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    };
    initializeDashboard();
  }, []);

  const fetchPlayers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('players')
      .select('id, full_name')
      .eq('coach_id', user.id);

    if (error) {
      console.error('Error fetching players:', error);
      return;
    }
    setPlayers(data || []);
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>יציאה</AlertDialogTitle>
            <AlertDialogDescription>האם אתה בטוח שברצונך להתנתק?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>יציאה</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SessionFormDialog open={isSessionFormOpen} onOpenChange={setIsSessionFormOpen} />

      <DashboardHeader 
        coachName={coachName}
        profilePicture={profilePicture}
        notifications={notifications}
        unreadCount={unreadCount}
        markAsRead={(id, e) => e && id ? e.preventDefault() : null}
        calendarEvents={calendarEvents}
        onEventClick={handleEventClick}
        onEventAdd={handleAddEvent}
        onLogoutClick={() => setIsLogoutDialogOpen(true)}
      />

      <div className="max-w-7xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <StatsCards stats={stats} />
          
          <UpcomingSessions 
            sessions={upcomingSessions}
            onSendReminder={handleSendReminder}
            onSaveSessionSummary={handleSaveSessionSummary}
            onViewSummary={handleViewSummary}
          />
          
          <PastSessions 
            sessionsToSummarize={pastSessionsToSummarize}
            summarizedSessions={summarizedSessions}
            onSaveSessionSummary={handleSaveSessionSummary}
            onViewSummary={handleViewSummary}
          />
        </div>

        <div className="space-y-6">
          {/* Activity chart and other sidebar components could go here */}
        </div>
      </div>
    </div>
  );
};

export default DashboardCoach;
