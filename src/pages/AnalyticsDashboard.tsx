
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ArrowRight, ChartBar, PieChart, LineChart } from "lucide-react";
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
      // Fetch basic stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_coach_statistics', { coach_id: userId });

      if (statsError) throw statsError;

      // Fetch monthly sessions data
      const { data: monthlyData, error: monthlyError } = await supabase
        .rpc('get_monthly_sessions_count', { coach_id: userId });

      if (monthlyError) throw monthlyError;

      // Fetch player distribution data
      const { data: distributionData, error: distributionError } = await supabase
        .rpc('get_player_session_distribution', { coach_id: userId });

      if (distributionError) throw distributionError;

      // Fetch monthly reminders data
      const { data: remindersData, error: remindersError } = await supabase
        .rpc('get_monthly_reminders_count', { coach_id: userId });

      if (remindersError) throw remindersError;

      setStats(statsData[0]);
      setChartData({
        monthlySessionsData: monthlyData,
        playerDistributionData: distributionData,
        monthlyRemindersData: remindersData
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

      await fetchData(user.id);

      // Subscribe to real-time changes
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

      // Cleanup subscription
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
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="transition-transform hover:scale-105"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            דוחות וסטטיסטיקות
          </h1>
          <div className="w-10" />
        </div>

        {/* Stats Cards */}
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Sessions Chart */}
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

          {/* Player Distribution Pie Chart */}
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

          {/* Monthly Reminders Chart */}
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
