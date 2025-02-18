
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Settings, Bell, PieChart, UserPlus, CalendarPlus, 
  Users, Calendar, BarChart2, Loader2, Send, Check
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface DashboardStats {
  totalPlayers: number;
  upcomingSessions: number;
  attendanceRate: number;
  totalReminders: number;
}

interface UpcomingSession {
  id: string;
  session_date: string;
  session_time: string;
  notes: string;
  reminder_sent: boolean;
  player: {
    full_name: string;
  };
}

interface SessionWithPlayer {
  id: string;
  session_date: string;
  session_time: string;
  notes: string;
  reminder_sent: boolean;
  players: {
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

const DashboardCoach = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<DashboardStats>({
    totalPlayers: 0,
    upcomingSessions: 0,
    attendanceRate: 0,
    totalReminders: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);

  const fetchData = async (userId: string) => {
    try {
      const [playersResult, sessionsResult, remindersResult, upcomingSessionsResult] = await Promise.all([
        supabase
          .from('players')
          .select('id', { count: 'exact' })
          .eq('coach_id', userId),
        supabase
          .from('sessions')
          .select('id', { count: 'exact' })
          .eq('coach_id', userId)
          .gte('session_date', new Date().toISOString().split('T')[0]),
        supabase
          .from('notifications_log')
          .select('id', { count: 'exact' })
          .eq('coach_id', userId)
          .eq('status', 'Sent'),
        supabase
          .from('sessions')
          .select(`
            id,
            session_date,
            session_time,
            notes,
            reminder_sent,
            players!inner(
              full_name
            )
          `)
          .eq('coach_id', userId)
          .gte('session_date', new Date().toISOString().split('T')[0])
          .order('session_date', { ascending: true })
          .order('session_time', { ascending: true })
          .limit(10)
      ]);

      setStats({
        totalPlayers: playersResult.count || 0,
        upcomingSessions: sessionsResult.count || 0,
        attendanceRate: 85,
        totalReminders: remindersResult.count || 0,
      });

      if (upcomingSessionsResult.data) {
        const sessions = upcomingSessionsResult.data as SessionWithPlayer[];
        const formattedSessions: UpcomingSession[] = sessions.map(session => ({
          id: session.id,
          session_date: session.session_date,
          session_time: session.session_time,
          notes: session.notes,
          reminder_sent: session.reminder_sent,
          player: {
            full_name: session.players.full_name
          }
        }));
        setUpcomingSessions(formattedSessions);
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

  const markAsRead = async (notificationId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
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

      const { error } = await supabase
        .from('notifications_log')
        .insert([{
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

      await supabase
        .from('sessions')
        .update({ reminder_sent: true })
        .eq('id', sessionId);

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

  useEffect(() => {
    const initializeDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await fetchData(user.id);
        await fetchNotifications(user.id);

        const channel = supabase
          .channel('dashboard-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notifications'
            },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                toast({
                  title: "📢 התראה חדשה",
                  description: payload.new.message,
                  duration: 5000
                });
                fetchNotifications(user.id);
              } else {
                fetchNotifications(user.id);
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    };

    initializeDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatsColor = (value: number, type: string) => {
    switch (type) {
      case 'attendance':
        return value < 70 ? 'text-red-500' : value < 85 ? 'text-orange-500' : 'text-green-500';
      case 'sessions':
        return value === 0 ? 'text-red-500' : value < 3 ? 'text-orange-500' : 'text-green-500';
      default:
        return value === 0 ? 'text-orange-500' : 'text-green-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="w-full bg-[#1A1F2C] dark:bg-gray-800 text-white py-6 mb-8 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold">ברוך הבא, מאמן</h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              className="text-white hover:text-white/80 transition-all duration-300 hover:scale-105"
              onClick={() => navigate('/analytics')}
            >
              <PieChart className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">דוחות וסטטיסטיקות</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative text-white hover:text-white/80 transition-all duration-300 hover:scale-105"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-gray-800">
                <div className="p-2 border-b dark:border-gray-700">
                  <h3 className="font-semibold text-lg px-2 py-1 dark:text-white">התראות</h3>
                </div>
                <ScrollArea className="h-[400px]">
                  {notifications.length > 0 ? (
                    <div className="py-2">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`relative w-full text-right px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <p className="text-sm text-gray-900 dark:text-gray-100">{notification.message}</p>
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 ml-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={(e) => markAsRead(notification.id, e)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                      אין התראות חדשות
                    </div>
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              className="text-white hover:text-white/80 transition-all duration-300 hover:scale-105"
              onClick={() => navigate('/profile-coach')}
            >
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">פרופיל</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-800/60 transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">שחקנים רשומים</CardTitle>
              <Users className={`h-4 w-4 ${getStatsColor(stats.totalPlayers, 'default')}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatsColor(stats.totalPlayers, 'default')}`}>
                {stats.totalPlayers}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-800/60 transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">מפגשים קרובים</CardTitle>
              <Calendar className={`h-4 w-4 ${getStatsColor(stats.upcomingSessions, 'sessions')}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatsColor(stats.upcomingSessions, 'sessions')}`}>
                {stats.upcomingSessions}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-800/60 transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">אחוז נוכחות</CardTitle>
              <BarChart2 className={`h-4 w-4 ${getStatsColor(stats.attendanceRate, 'attendance')}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatsColor(stats.attendanceRate, 'attendance')}`}>
                {stats.attendanceRate}%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-800/60 transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">תזכורות שנשלחו</CardTitle>
              <Bell className={`h-4 w-4 ${getStatsColor(stats.totalReminders, 'default')}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatsColor(stats.totalReminders, 'default')}`}>
                {stats.totalReminders}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="dark:text-white">מפגשים קרובים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="dark:text-gray-300">תאריך</TableHead>
                    <TableHead className="dark:text-gray-300">שעה</TableHead>
                    <TableHead className="dark:text-gray-300">שם השחקן</TableHead>
                    <TableHead className="hidden md:table-cell dark:text-gray-300">הערות</TableHead>
                    <TableHead className="dark:text-gray-300">סטטוס תזכורת</TableHead>
                    <TableHead className="dark:text-gray-300">פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingSessions.map((session) => (
                    <TableRow key={session.id} className="dark:text-gray-300">
                      <TableCell>{session.session_date}</TableCell>
                      <TableCell>{session.session_time}</TableCell>
                      <TableCell>{session.player.full_name}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs truncate">
                        {session.notes || 'אין הערות'}
                      </TableCell>
                      <TableCell>
                        {session.reminder_sent ? (
                          <span className="inline-flex items-center text-green-500 dark:text-green-400">
                            <Check className="h-4 w-4 mr-1" />
                            נשלח
                          </span>
                        ) : (
                          <span className="text-orange-500 dark:text-orange-400">ממתין</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendReminder(session.id)}
                          disabled={session.reminder_sent}
                          className="transition-all duration-300 hover:scale-105"
                        >
                          <Send className="h-4 w-4" />
                          <span className="sr-only">שלח תזכורת</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card 
            className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer transform hover:scale-105 border-2 border-primary/10 hover:border-primary"
            onClick={() => navigate('/new-player')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold dark:text-white">רישום שחקן חדש</CardTitle>
              <UserPlus className="h-6 w-6 text-primary dark:text-primary/80" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">הוסף שחקן חדש למערכת</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer transform hover:scale-105 border-2 border-primary/10 hover:border-primary"
            onClick={() => navigate('/new-session')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold dark:text-white">קביעת מפגש חדש</CardTitle>
              <CalendarPlus className="h-6 w-6 text-primary dark:text-primary/80" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">קבע מפגש אימון חדש</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer transform hover:scale-105 border-2 border-primary/10 hover:border-primary"
            onClick={() => navigate('/players-list')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold dark:text-white">ריכוז כל השחקנים</CardTitle>
              <Users className="h-6 w-6 text-primary dark:text-primary/80" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">צפה בכל השחקנים הרשומים</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer transform hover:scale-105 border-2 border-primary/10 hover:border-primary"
            onClick={() => navigate('/sessions-list')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold dark:text-white">ריכוז כל המפגשים</CardTitle>
              <Calendar className="h-6 w-6 text-primary dark:text-primary/80" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">צפה בכל המפגשים המתוכננים</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer transform hover:scale-105 border-2 border-primary/10 hover:border-primary"
            onClick={() => navigate('/notifications')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold dark:text-white">מעקב תזכורות</CardTitle>
              <Bell className="h-6 w-6 text-primary dark:text-primary/80" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">נהל את מערך התזכורות</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer transform hover:scale-105 border-2 border-primary/10 hover:border-primary"
            onClick={() => navigate('/analytics')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold dark:text-white">דוחות וסטטיסטיקות</CardTitle>
              <PieChart className="h-6 w-6 text-primary dark:text-primary/80" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">צפה בנתונים וניתוחים</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardCoach;
