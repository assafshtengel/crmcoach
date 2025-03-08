import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ArrowRight, ChartBar, PieChart, LineChart, BarChart2, Users, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line
} from "recharts";

interface Stats {
  totalSessions: number;
  successfulReminders: number;
  activePlayersCount: number;
}

interface ChartData {
  monthlySessionsData: { name: string; sessions: number }[];
  playerDistributionData: { name: string; value: number }[];
  monthlyRemindersData: { name: string; reminders: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalSessions: 0,
    successfulReminders: 0,
    activePlayersCount: 0
  });
  const [chartData, setChartData] = useState<ChartData>({
    monthlySessionsData: [],
    playerDistributionData: [],
    monthlyRemindersData: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchData = async (userId: string) => {
    try {
      console.log("Fetching stats for user:", userId);

      const { data: statsData, error: statsError } = await supabase
        .rpc('get_coach_statistics', { coach_id: userId });

      if (statsError) {
        console.error('Stats error:', statsError);
        throw statsError;
      }

      console.log("Stats data received:", statsData);

      const { data: monthlyData, error: monthlyError } = await supabase
        .rpc('get_monthly_sessions_count', { coach_id: userId });

      if (monthlyError) {
        console.error('Monthly sessions error:', monthlyError);
        throw monthlyError;
      }

      console.log("Monthly data received:", monthlyData);

      const { data: distributionData, error: distributionError } = await supabase
        .rpc('get_player_session_distribution', { coach_id: userId });

      if (distributionError) {
        console.error('Distribution error:', distributionError);
        throw distributionError;
      }

      console.log("Distribution data received:", distributionData);

      const { data: remindersData, error: remindersError } = await supabase
        .rpc('get_monthly_reminders_count', { coach_id: userId });

      if (remindersError) {
        console.error('Reminders error:', remindersError);
        throw remindersError;
      }

      console.log("Reminders data received:", remindersData);

      setStats({
        totalSessions: statsData[0]?.totalsessions || 0,
        successfulReminders: statsData[0]?.successfulreminders || 0,
        activePlayersCount: statsData[0]?.activeplayerscount || 0
      });

      setChartData({
        monthlySessionsData: monthlyData || [],
        playerDistributionData: distributionData || [],
        monthlyRemindersData: remindersData || []
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
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
    const initializeData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      console.log("Initializing data for user:", user.id);
      await fetchData(user.id);

      const sessionsChannel = supabase
        .channel('analytics-changes')
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
            table: 'notifications_log'
          },
          () => fetchData(user.id)
        )
        .subscribe();

      return () => {
        supabase.removeChannel(sessionsChannel);
      };
    };

    initializeData();
  }, [navigate]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">טוען...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              className="transition-transform hover:scale-105"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="transition-transform hover:scale-105 flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              <span>דף הבית</span>
            </Button>
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            דוחות וסטטיסטיקות
          </h1>
          <div className="w-10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/player-statistics')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">סטטיסטיקות שחקנים</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">נתונים סטטיסטיים על שחקנים חדשים ומפגשים לפי חודשים</p>
              <Button variant="outline" className="w-full mt-4">לצפייה</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/reports')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">דוחות טרום משחק</CardTitle>
              <BarChart2 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">צפייה בדוחות של הכנות טרום משחק</p>
              <Button variant="outline" className="w-full mt-4">לצפייה</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">ביצועי שחקנים</CardTitle>
              <LineChart className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">גרפים וניתוחים של ביצועי השחקנים לאורך זמן</p>
              <Button variant="outline" className="w-full mt-4">בקרוב</Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">סה"כ מפגשים</CardTitle>
              <ChartBar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">תזכורות שנשלחו בהצלחה</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successfulReminders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">שחקנים פעילים</CardTitle>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePlayersCount}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>מפגשים לפי חודשים</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.monthlySessionsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sessions" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>התפלגות שחקנים לפי מפגשים</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={chartData.playerDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.playerDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>תזכורות שנשלחו לפי חודשים</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={chartData.monthlyRemindersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="reminders" stroke="#8884d8" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
