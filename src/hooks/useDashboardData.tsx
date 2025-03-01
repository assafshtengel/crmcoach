
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, subMonths, isBefore, isAfter } from 'date-fns';

interface DashboardStats {
  totalPlayers: number;
  upcomingSessions: number;
  currentMonthPastSessions: number;
  currentMonthFutureSessions: number;
  lastMonthSessions: number;
  twoMonthsAgoSessions: number;
  totalReminders: number;
}

interface UpcomingSession {
  id: string;
  session_date: string;
  session_time: string;
  notes: string;
  reminder_sent: boolean;
  location: string;
  player: {
    full_name: string;
  };
  has_summary?: boolean;
}

interface Notification {
  id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  type: string;
}

interface SessionResponse {
  id: string;
  session_date: string;
  session_time: string;
  location: string | null;
  notes: string | null;
  reminder_sent: boolean | null;
  player: {
    full_name: string;
  };
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  location?: string;
  extendedProps: {
    playerName: string;
    location?: string;
    reminderSent: boolean;
    notes?: string;
  };
}

export const useDashboardData = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [coachName, setCoachName] = useState('');
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalPlayers: 0,
    upcomingSessions: 0,
    currentMonthPastSessions: 0,
    currentMonthFutureSessions: 0,
    lastMonthSessions: 0,
    twoMonthsAgoSessions: 0,
    totalReminders: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  const fetchData = async (userId: string) => {
    try {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      const firstDayOfMonth = startOfMonth(today);
      const lastDayOfMonth = endOfMonth(today);
      const lastMonth = subMonths(today, 1);
      const twoMonthsAgo = subMonths(today, 2);
      
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('session_date')
        .eq('coach_id', userId);
      
      if (sessionsError) throw sessionsError;

      const currentMonthPastSessions = sessionsData?.filter(session => 
        isBefore(new Date(session.session_date), today) && 
        isAfter(new Date(session.session_date), firstDayOfMonth)
      )?.length || 0;

      const currentMonthFutureSessions = sessionsData?.filter(session => 
        isAfter(new Date(session.session_date), today) && 
        isBefore(new Date(session.session_date), lastDayOfMonth)
      )?.length || 0;

      const lastMonthSessions = sessionsData?.filter(session => 
        isBefore(new Date(session.session_date), firstDayOfMonth) && 
        isAfter(new Date(session.session_date), startOfMonth(lastMonth))
      )?.length || 0;

      const twoMonthsAgoSessions = sessionsData?.filter(session => 
        isBefore(new Date(session.session_date), startOfMonth(lastMonth)) && 
        isAfter(new Date(session.session_date), startOfMonth(twoMonthsAgo))
      )?.length || 0;

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
        twoMonthsAgoSessions,
        totalReminders: remindersResult.data?.length || 0
      });

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
      const { data: notificationsData, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('coach_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
        
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

      const sessions = (rawSessions as any[])?.map(session => ({
        id: session.id as string,
        session_date: session.session_date as string,
        session_time: session.session_time as string,
        location: session.location as string | null,
        notes: session.notes as string | null,
        reminder_sent: session.reminder_sent as boolean | null,
        player: {
          full_name: session.player?.full_name as string
        }
      })) as SessionResponse[];

      const events: CalendarEvent[] = sessions.map(session => ({
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

  const handleAddEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    try {
      if (!user?.id) {
        throw new Error('משתמש לא מחובר');
      }

      const { data, error } = await supabase
        .from('sessions')
        .insert([
          {
            coach_id: user.id,
            session_date: eventData.start.split('T')[0],
            session_time: eventData.start.split('T')[1],
            notes: eventData.extendedProps.notes,
            reminder_sent: false
          }
        ])
        .select()
        .single();

      if (error) throw error;

      await fetchCalendarEvents(user.id);
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser(authUser);
        
        const { data: coachData } = await supabase
          .from('coaches')
          .select('full_name')
          .eq('id', authUser.id)
          .single();
        
        if (coachData) {
          setCoachName(coachData.full_name);
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

  return {
    isLoading,
    stats,
    upcomingSessions,
    notifications,
    unreadCount,
    coachName,
    user,
    calendarEvents,
    fetchData,
    fetchNotifications,
    fetchCalendarEvents,
    handleAddEvent
  };
};
