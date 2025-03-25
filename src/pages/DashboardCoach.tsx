import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, Settings, Bell, PieChart, UserPlus, CalendarPlus, Users, Calendar, BarChart2, Loader2, Send, Check, LogOut, ChevronDown, ChevronUp, Share2, FileEdit, Clock, AlertCircle, FileText, Eye, Plus, Target, ClipboardCheck, BookOpen, Trophy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Film } from 'lucide-react';
import { AdminMessageForm } from '@/components/admin/AdminMessageForm';
import { LandingPageDialog } from "@/components/landing-page/LandingPageDialog";
import { ClipboardList } from 'lucide-react';

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
  const {
    toast
  } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [coachName, setCoachName] = useState('');
  const [user, setUser] = useState<any>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
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
  const [players, setPlayers] = useState<{
    id: string;
    full_name: string;
  }[]>([]);
  const [isSessionFormOpen, setIsSessionFormOpen] = useState(false);
  const [showLandingPageDialog, setShowLandingPageDialog] = useState(false);

  useEffect(() => {
    const initUser = async () => {
      const {
        data: {
          user: authUser
        }
      } = await supabase.auth.getUser();
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
      const {
        data: sessionsData,
        error: sessionsError
      } = await supabase.from('sessions').select('session_date').eq('coach_id', userId);
      if (sessionsError) throw sessionsError;
      const currentMonthPastSessions = sessionsData?.filter(session => isBefore(new Date(session.session_date), today) && isAfter(new Date(session.session_date), firstDayOfMonth))?.length || 0;
      const currentMonthFutureSessions = sessionsData?.filter(session => {
        const sessionDate = new Date(session.session_date);
        return (isAfter(sessionDate, today) || isSameDay(sessionDate, today)) && isBefore(sessionDate, lastDayOfMonth);
      })?.length || 0;
      const lastMonthSessions = sessionsData?.filter(session => isBefore(new Date(session.session_date), firstDayOfMonth) && isAfter(new Date(session.session_date), startOfMonth(lastMonth)))?.length || 0;
      const twoMonthsAgoSessions = sessionsData?.filter(session => isBefore(new Date(session.session_date), startOfMonth(lastMonth)) && isAfter(new Date(session.session_date), startOfMonth(twoMonthsAgo)))?.length || 0;
      const {
        data: upcomingSessions,
        error: upcomingError
      } = await supabase.from('sessions').select(`
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
        `).eq('coach_id', userId).gte('session_date', today.toISOString().split('T')[0]).lte('session_date', nextWeek.toISOString().split('T')[0]).order('session_date', {
        ascending: true
      }).order('session_time', {
        ascending: true
      });
      if (upcomingError) throw upcomingError;
      const upcomingSessionsCount = upcomingSessions?.length || 0;
      const [playersCountResult, remindersResult] = await Promise.all([supabase.from('players').select('id').eq('coach_id', userId), supabase.from('notifications_log').select('id').eq('coach_id', userId).eq('status', 'Sent')]);
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
      const {
        data: pastSessions,
        error: pastSessionsError
      } = await supabase.from('sessions').select(`
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
        `).eq('coach_id', userId).lt('session_date', today.toISOString().split('T')[0]).order('session_date', {
        ascending: false
      }).limit(10);
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
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('לא נמצא משתמש מחובר');
      const {
        error
      } = await supabase.from('session_summaries').insert({
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
      setPastSessionsToSummarize(prev => prev.filter(session => session.id !== sessionId));
      const summarizedSession = pastSessionsToSummarize.find(s => s.id === sessionId);
      if (summarizedSession) {
        const updatedSession = {
          ...summarizedSession,
          has_summary: true
        };
        setSummarizedSessions(prev => [updatedSession, ...prev]);
      }
      toast({
        title: "הסיכום נשמר בהצלחה",
        description: "סיכום המפגש נשמר במערכת",
        duration: 1000
      });
      setTimeout(() => {
        document.querySelector<HTMLButtonElement>('[aria-label="Close"]')?.click();
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

  const handleViewSummary = async (sessionId: string) => {
    navigate(`/session-summaries?id=${sessionId}`);
  };

  const renderSessionCard = (session: UpcomingSession, showSummaryButton: boolean = true) => {
    const sessionDate = new Date(session.session_date);
    const isToday = isSameDay(sessionDate, new Date());
    const isPastSession = isPast(sessionDate);
    const hasNoSummary = isPastSession && !session.has_summary;
    if (isPastSession && session.has_summary && !showSummaryButton) {
      return null;
    }
    return <Card key={session.id} className={`bg-gray-50 hover:bg-white transition-all duration-300 ${isToday ? 'border-l-4 border-l-blue-500 shadow-blue-200' : hasNoSummary ? 'border-l-4 border-l-red-500 shadow-red-200' : session.has_summary ? 'border-l-4 border-l-green-500 shadow-green-200' : 'border'}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-[#2C3E50]">{session.player.full_name}</h3>
              <p className="text-sm text-gray-500">
                {session.session_date} | {session.session_time}
              </p>
            </div>
            <div>
              {isToday && <div className="flex items-center text-blue-600 text-sm font-medium">
                  <Clock className="h-4 w-4 mr-1" />
                  היום
                </div>}
              {hasNoSummary && <div className="flex items-center text-red-600 text-sm font-medium">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  חסר סיכום
                </div>}
              {session.has_summary && <div className="flex items-center text-green-600 text-sm font-medium">
                  <Check className="h-4 w-4 mr-1" />
                  סוכם
                </div>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{session.location || 'לא צוין מיקום'}</span>
            <div className="flex gap-2">
              {!session.reminder_sent && !isPastSession ? <Button variant="ghost" size="sm" onClick={() => handleSendReminder(session.id)} className="text-[#27AE60] hover:text-[#219A52]">
                  <Send className="h-4 w-4 mr-1" />
                  שלח תזכורת
                </Button> : !isPastSession ? <span className="text-sm text-[#27AE60] flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  נשלחה תזכורת
                </span> : null}
              {showSummaryButton && !session.has_summary && <Dialog>
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
                      <SessionSummaryForm sessionId={session.id} playerName={session.player.full_name} sessionDate={session.session_date} playerId={session.player.id || ''} onSubmit={data => handleSaveSessionSummary(session.id, data)} onCancel={() => document.querySelector<HTMLButtonElement>('[aria-label="Close"]')?.click()} forceEnable={!isPastSession} />
                    </div>
                  </DialogContent>
                </Dialog>}
              {session.has_summary && <Button variant="ghost" size="sm" className="flex items-center" onClick={() => handleViewSummary(session.id)}>
                  <FileText className="h-4 w-4 mr-1" />
                  צפה בסיכום
                </Button>}
            </div>
          </div>
        </CardContent>
      </Card>;
  };

  const renderUpcomingSessions = () => {
    return upcomingSessions.map(session => renderSessionCard(session));
  };

  const renderMentalResearchCard = () => {
    return (
      <Card className="bg-gray-50 hover:bg-white transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex justify-between">
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-amber-600" />
              ספריית המחקרים
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            גישה למחקרים עדכניים בתחום הפסיכולוגיה של הספורט
          </div>
          <Button variant="outline" size="sm" className="flex items-center" asChild>
            <Link to="/mental-research">
              <Eye className="h-4 w-4 mr-1" />
              לצפייה בכל המחקרים
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      {renderUpcomingSessions()}
      {renderMentalResearchCard()}
    </div>
  );
};

export default DashboardCoach;
