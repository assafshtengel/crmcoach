import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, Settings, Bell, PieChart, UserPlus, CalendarPlus, Users, Calendar, BarChart2, Loader2, Send, Check, LogOut, ChevronDown, ChevronUp, Share2, FileEdit, Clock, AlertCircle, FileText, Eye, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format, startOfMonth, endOfMonth, subMonths, isBefore, isAfter, isSameDay, isPast, formatDistance } from 'date-fns';
import { he } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SessionSummaryForm } from "@/components/session/SessionSummaryForm";
import { Calendar as CalendarComponent } from '@/components/calendar/Calendar';
import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tool } from '@/types/tool';
import AllMeetingSummaries from './AllMeetingSummaries';
import { SessionFormDialog } from '@/components/sessions/SessionFormDialog';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

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
    id?: string;
  };
  has_summary?: boolean;
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

interface Notification {
  id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  type: string;
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

interface EventFormData {
  title: string;
  date: string;
  time: string;
  notes?: string;
}

const DashboardCoach = () => {
  const navigate = useNavigate();
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
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isSessionsExpanded, setIsSessionsExpanded] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [pastSessionsToSummarize, setPastSessionsToSummarize] = useState<UpcomingSession[]>([]);
  const [summarizedSessions, setSummarizedSessions] = useState<UpcomingSession[]>([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [players, setPlayers] = useState<{ id: string; full_name: string }[]>([]);
  const [isSessionFormOpen, setIsSessionFormOpen] = useState(false);

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
        twoMonthsAgoSessions,
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

  const markAsRead = async (notificationId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    try {
      const {
        error
      } = await supabase.from('notifications').update({
        is_read: true
      }).eq('id', notificationId);
      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === notificationId ? {
        ...n,
        is_read: true
      } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleSendReminder = async (sessionId: string) => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('לא נמצא משתמש מחובר');
      const session = upcomingSessions.find(s => s.id === sessionId);
      if (!session) throw new Error('לא נמצא מפגש');
      await supabase.from('notifications').insert({
        coach_id: user.id,
        type: 'reminder_scheduled',
        message: `תזכורת תשלח לשחקן ${session.player.full_name} בעוד 15 דקות`
      });
      const {
        error
      } = await supabase.from('notifications_log').insert([{
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

  const renderSessionCard = (session: UpcomingSession, showSummaryButton: boolean = true) => {
    const sessionDate = new Date(session.session_date);
    const isToday = isSameDay(sessionDate, new Date());
    const isPastSession = isPast(sessionDate);
    const hasNoSummary = isPastSession && !session.has_summary;

    if (isPastSession && session.has_summary && !showSummaryButton) {
      return null;
    }

    return (
      <Card 
        key={session.id} 
        className={`bg-gray-50 hover:bg-white transition-all duration-300 ${
          isToday ? 'border-l-4 border-l-blue-500 shadow-blue-200' :
          hasNoSummary ? 'border-l-4 border-l-red-500 shadow-red-200' :
          session.has_summary ? 'border-l-4 border-l-green-500 shadow-green-200' :
          'border'
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-[#2C3E50]">{session.player.full_name}</h3>
              <p className="text-sm text-gray-500">
                {session.session_date} | {session.session_time}
              </p>
            </div>
            <div>
              {isToday && (
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  <Clock className="h-4 w-4 mr-1" />
                  היום
                </div>
              )}
              {hasNoSummary && (
                <div className="flex items-center text-red-600 text-sm font-medium">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  חסר סיכום
                </div>
              )}
              {session.has_summary && (
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <Check className="h-4 w-4 mr-1" />
                  סוכם
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{session.location || 'לא צוין מיקום'}</span>
            <div className="flex gap-2">
              {!session.reminder_sent && !isPastSession ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSendReminder(session.id)}
                  className="text-[#27AE60] hover:text-[#219A52]"
                >
                  <Send className="h-4 w-4 mr-1" />
                  שלח תזכורת
                </Button>
              ) : !isPastSession ? (
                <span className="text-sm text-[#27AE60] flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  נשלחה תזכורת
                </span>
              ) : null}
              {showSummaryButton && !session.has_summary && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center">
                      <FileEdit className="h-4 w-4 mr-1" />
                      סכם מפגש
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>סיכום מפגש</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      <SessionSummaryForm
                        sessionId={session.id}
                        playerName={session.player.full_name}
                        sessionDate={session.session_date}
                        onSubmit={(data) => handleSaveSessionSummary(session.id, data)}
                        onCancel={() => document.querySelector<HTMLButtonElement>('[aria-label="Close"]')?.click()}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              {session.has_summary && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center"
                  onClick={() => session.player.id 
                    ? handleViewSummary(session.player.id, session.player.full_name) 
                    : navigate('/session-summaries')}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  צפה בסיכום
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
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

  const handleEventClick = (eventId: string) => {
    const session = upcomingSessions.find(s => s.id === eventId);
    if (session) {
      navigate('/edit-session', { state: { sessionId: eventId } });
    }
  };

  const getMonthlySessionsData = () => {
    return [{
      name: 'לפני חודשיים',
      מפגשים: stats.twoMonthsAgoSessions,
      fill: '#9CA3AF'
    }, {
      name: 'חודש קודם',
      מפגשים: stats.lastMonthSessions,
      fill: '#F59E0B'
    }, {
      name: 'החודש (בוצעו)',
      מפגשים: stats.currentMonthPastSessions,
      fill: '#10B981'
    }, {
      name: 'החודש (מתוכננים)',
      מפגשים: stats.currentMonthFutureSessions,
      fill: '#3B82F6'
    }];
  };

  useEffect(() => {
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
      setPlayers(data);
    };

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

      <header className="w-full bg-[#2C3E50] text-white py-6 mb-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-white/90" />
              </div>
              <div>
                <h1 className="text-2xl font-bold animate-fade-in">
                  {coachName ? (
                    <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text">
                      ברוך הבא, {coachName}
                    </span>
                  ) : (
                    'ברוך הבא'
                  )}
                </h1>
                <p className="text-white/70 text-sm">{format(new Date(), 'EEEE, dd MMMM yyyy', { locale: he })}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <CalendarComponent events={calendarEvents} onEventClick={handleEventClick} onEventAdd={handleAddEvent} />
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10"
                onClick={() => navigate('/registration-links')}
              >
                <Share2 className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">לינקי הרשמה</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative text-white hover:bg-white/10">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && 
                      <span className="absolute -top-1 -right-1 bg-[#E74C3C] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    }
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-2 border-b dark:border-gray-700">
                    <h3 className="font-semibold text-lg px-2 py-1 dark:text-white">התראות</h3>
                  </div>
                  <ScrollArea className="h-[400px]">
                    {notifications.length > 0 ? <div className="py-2">
                        {notifications.map(notification => <div key={notification.id} className={`relative w-full text-right px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${!notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                            <div className="flex justify-between items-start">
                              <p className="text-sm text-gray-900 dark:text-gray-100">{notification.message}</p>
                              {!notification.is_read && <Button variant="ghost" size="sm" className="h-6 ml-2 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={e => markAsRead(notification.id, e)}>
                                  <Check className="h-4 w-4" />
                                </Button>}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm', {
                        locale: he
                      })}
                            </p>
                          </div>)}
                      </div> : <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                        אין התראות חדשות
                      </div>}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => navigate('/profile-coach')}>
                <Settings className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">פרופיל</span>
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setIsLogoutDialogOpen(true)}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#27AE60]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">שחקנים פעילים</CardTitle>
              <Users className="h-5 w-5 text-[#27AE60]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#2C3E50]">{stats.totalPlayers}</div>
              <p className="text-sm text-gray-500 mb-3">רשומים במערכת</p>
              <Button 
                variant="outline" 
                className="w-full border-[#27AE60] text-[#27AE60] hover:bg-[#27AE60]/10"
                onClick={() => navigate('/players-list')}
              >
                <Users className="h-4 w-4 mr-2" />
                צפה ברשימת השחקנים
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#3498DB]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">מפגשים קרובים</CardTitle>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1 text-[#3498DB] border-[#3498DB] hover:bg-[#3498DB]/10"
                  onClick={() => setIsSessionFormOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  הוסף מפגש
                </Button>
                <Calendar className="h-5 w-5 text-[#3498DB]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#2C3E50]">{stats.upcomingSessions}</div>
              <p className="text-sm text-gray-500 mb-2">בשבוע הקרוב ({stats.upcomingSessions} מפגשים)</p>
              
              {upcomingSessions.length > 0 && (
                <Collapsible className="mt-2">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full flex items-center justify-center text-[#3498DB]">
                      הצג רשימת מפגשים
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="space-y-2 mt-2 max-h-[200px] overflow-y-auto pr-1">
                      {upcomingSessions.map((session) => (
                        <div 
                          key={session.id} 
                          className="p-2 rounded-md bg-gray-50 flex justify-between items-center text-sm hover:bg-gray-100 cursor-pointer"
                          onClick={() => navigate('/edit-session', { state: { sessionId: session.id } })}
                        >
                          <div>
                            <p className="font-medium">{session.player.full_name}</p>
                            <p className="text-gray-500 text-xs">{session.session_date} | {session.session_time}</p>
                          </div>
                          <div className="flex items-center">
                            {session.location && (
                              <span className="text-xs text-gray-500 ml-2">{session.location}</span>
                            )}
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#F1C40F]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">��זכורות שנשלחו</CardTitle>
              <Bell className="h-5 w-5 text-[#F1C40F]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#2C3E50]">{stats.totalReminders}</div>
              <p className="text-sm text-gray-500">סה״כ תזכורות</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#9b59b6] cursor-pointer"
            onClick={() => navigate('/new-player')}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">הוספת שחקן חדש</CardTitle>
              <UserPlus className="h-5 w-5 text-[#9b59b6]" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-3">צור כרטיס שחקן חדש במערכת</p>
              <Button 
                variant="default" 
                className="w-full bg-[#9b59b6] hover:bg-[#8e44ad]"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                הוסף שחקן חדש
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#e74c3c] cursor-pointer"
            onClick={() => navigate('/reports')}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">דוחות וסטטיסטיקה</CardTitle>
              <BarChart2 className="h-5 w-5 text-[#e74c3c]" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-3">צפה בנתונים סטטיסטיים מפורטים</p>
              <Button 
                variant="default" 
                className="w-full bg-[#e74c3c] hover:bg-[#c0392b]"
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                צפה בדוחות
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#9b87f5] cursor-pointer"
            onClick={() => navigate('/all-meeting-summaries')}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">סיכומי מפגשים</CardTitle>
              <FileText className="h-5 w-5 text-[#9b87f5]" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-3">צפה בסיכומי כל המפגשים, עם אפשרות סינון לפי שחקן</p>
              <Button 
                variant="default" 
                className="w-full bg-[#9b87f5] hover:bg-[#8a68f9]"
              >
                <Eye className="h-4 w-4 mr-2" />
                צפה בכל הסיכומים
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/90 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold text-[#2C3E50]">מפגשים אחרונים</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="unsummarized" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="unsummarized">ממתינים לסיכום ({pastSessionsToSummarize.length})</TabsTrigger>
                <TabsTrigger value="summarized">מסוכמים ({summarizedSessions.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="unsummarized" className="mt-0">
                <div className="space-y-4">
                  {pastSessionsToSummarize.length > 0 ? (
                    pastSessionsToSummarize.map(session => renderSessionCard(session))
                  ) : (
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <Check className="h-10 w-10 text-green-500 mx-auto mb-2" />
                      <h3 className="text-lg font-medium text-gray-800">הכל מסוכם!</h3>
                      <p className="text-gray-500 mt-1">כל המפגשים שלך מסוכמים</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="summarized" className="mt-0">
                <div className="space-y-4">
                  {summarizedSessions.length > 0 ? (
                    summarizedSessions.map(session => renderSessionCard(session, true))
                  ) : (
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <h3 className="text-lg font-medium text-gray-800">אין סיכומים</h3>
                      <p className="text-gray-500 mt-1">לא נמצאו מפגשים מסוכמים</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">סיכום מפגשים חודשי</CardTitle>
              <BarChart2 className="h-5 w-5 text-[#9b87f5]" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getMonthlySessionsData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="מפגשים" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardCoach;
