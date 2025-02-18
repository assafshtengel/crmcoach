
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Settings, Bell, PieChart, UserPlus, CalendarPlus, 
  Users, Calendar, BarChart2, Loader2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalPlayers: number;
  upcomingSessions: number;
  attendanceRate: number;
  totalReminders: number;
}

const DashboardCoach = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalPlayers: 0,
    upcomingSessions: 0,
    attendanceRate: 0,
    totalReminders: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async (userId: string) => {
    try {
      // Fetch all stats in parallel
      const [playersResult, sessionsResult, remindersResult] = await Promise.all([
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
      ]);

      setStats({
        totalPlayers: playersResult.count || 0,
        upcomingSessions: sessionsResult.count || 0,
        attendanceRate: 85, // יש להחליף עם חישוב אמיתי
        totalReminders: remindersResult.count || 0,
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

  useEffect(() => {
    const initializeDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await fetchData(user.id);

        // Subscribe to real-time changes
        const channel = supabase
          .channel('dashboard-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'sessions'
            },
            () => fetchData(user.id)
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'players'
            },
            () => fetchData(user.id)
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="w-full bg-[#1A1F2C] dark:bg-gray-800 text-white py-6 mb-8 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold">ברוך הבא, מאמן</h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              className="text-white hover:text-white/80"
              onClick={() => navigate('/analytics')}
            >
              <PieChart className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">דוחות וסטטיסטיקות</span>
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:text-white/80"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">תזכורות</span>
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:text-white/80"
              onClick={() => navigate('/profile-coach')}
            >
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">פרופיל</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">שחקנים רשומים</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPlayers}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">מפגשים קרובים</CardTitle>
              <Calendar className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingSessions}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">אחוז נוכחות</CardTitle>
              <BarChart2 className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">תזכורות שנשלחו</CardTitle>
              <Bell className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReminders}</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card 
            className="bg-white/80 backdrop-blur-sm hover:bg-gray-50 transition-all cursor-pointer transform hover:-translate-y-1 duration-200"
            onClick={() => navigate('/new-player')}
          >
            <CardHeader className="flex flex-row items-center space-y-0">
              <UserPlus className="h-5 w-5 mr-4 text-primary" />
              <CardTitle>רישום שחקן חדש</CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="bg-white/80 backdrop-blur-sm hover:bg-gray-50 transition-all cursor-pointer transform hover:-translate-y-1 duration-200"
            onClick={() => navigate('/new-session')}
          >
            <CardHeader className="flex flex-row items-center space-y-0">
              <CalendarPlus className="h-5 w-5 mr-4 text-primary" />
              <CardTitle>קביעת מפגש חדש</CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="bg-white/80 backdrop-blur-sm hover:bg-gray-50 transition-all cursor-pointer transform hover:-translate-y-1 duration-200"
            onClick={() => navigate('/players-list')}
          >
            <CardHeader className="flex flex-row items-center space-y-0">
              <Users className="h-5 w-5 mr-4 text-primary" />
              <CardTitle>ריכוז כל השחקנים</CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="bg-white/80 backdrop-blur-sm hover:bg-gray-50 transition-all cursor-pointer transform hover:-translate-y-1 duration-200"
            onClick={() => navigate('/sessions-list')}
          >
            <CardHeader className="flex flex-row items-center space-y-0">
              <Calendar className="h-5 w-5 mr-4 text-primary" />
              <CardTitle>ריכוז כל המפגשים</CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="bg-white/80 backdrop-blur-sm hover:bg-gray-50 transition-all cursor-pointer transform hover:-translate-y-1 duration-200"
            onClick={() => navigate('/notifications')}
          >
            <CardHeader className="flex flex-row items-center space-y-0">
              <Bell className="h-5 w-5 mr-4 text-primary" />
              <CardTitle>מעקב תזכורות</CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="bg-white/80 backdrop-blur-sm hover:bg-gray-50 transition-all cursor-pointer transform hover:-translate-y-1 duration-200"
            onClick={() => navigate('/analytics')}
          >
            <CardHeader className="flex flex-row items-center space-y-0">
              <PieChart className="h-5 w-5 mr-4 text-primary" />
              <CardTitle>דוחות וסטטיסטיקות</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardCoach;
