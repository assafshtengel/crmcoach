import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  UserPlus, 
  Calendar, 
  BarChart2, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Download, 
  FileDown,
  Printer
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface MonthlyData {
  name: string;
  newPlayers: number;
  sessions: number;
}

interface MonthlyCountItem {
  key: string;
  name: string;
  count: number;
}

interface ComparisonStats {
  newPlayersThisMonth: number;
  newPlayersLastMonth: number;
  playersPercentChange: number;
  sessionsThisMonth: number;
  sessionsLastMonth: number;
  sessionsPercentChange: number;
  totalActivePlayers: number;
  averageSessionsPerPlayer: number;
}

const PlayerStatistics = () => {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [comparisonStats, setComparisonStats] = useState<ComparisonStats>({
    newPlayersThisMonth: 0,
    newPlayersLastMonth: 0,
    playersPercentChange: 0,
    sessionsThisMonth: 0,
    sessionsLastMonth: 0,
    sessionsPercentChange: 0,
    totalActivePlayers: 0,
    averageSessionsPerPlayer: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isPdfExporting, setIsPdfExporting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        const [playersData, sessionsData] = await Promise.all([
          fetchMonthlyPlayersData(user.id),
          fetchMonthlySessionsData(user.id)
        ]);

        const combinedData = processMonthlyData(playersData, sessionsData);
        setMonthlyData(combinedData);

        const stats = calculateComparisonStats(playersData, sessionsData);
        setComparisonStats(stats);

      } catch (error) {
        console.error("Error fetching statistics:", error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת הנתונים",
          description: "אנא נסה שוב מאוחר יותר"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, [navigate, toast]);

  const fetchMonthlyPlayersData = async (coachId: string): Promise<MonthlyCountItem[]> => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 5);

    const formattedStartDate = sixMonthsAgo.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('players')
      .select('created_at')
      .eq('coach_id', coachId)
      .gte('created_at', formattedStartDate);

    if (error) throw error;

    return processMonthlyCountsData(data || [], 'created_at');
  };

  const fetchMonthlySessionsData = async (coachId: string): Promise<MonthlyCountItem[]> => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 5);

    const formattedStartDate = sixMonthsAgo.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('sessions')
      .select('session_date')
      .eq('coach_id', coachId)
      .gte('session_date', formattedStartDate);

    if (error) throw error;

    return processMonthlyCountsData(data || [], 'session_date');
  };

  const processMonthlyCountsData = (data: any[], dateField: string): MonthlyCountItem[] => {
    const monthlyCounts: Record<string, { count: number; name: string }> = {};
    const monthNames = [
      "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
      "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
    ];

    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date();
      month.setMonth(today.getMonth() - i);
      const monthKey = `${month.getFullYear()}-${month.getMonth() + 1}`;
      const monthName = `${monthNames[month.getMonth()]} ${month.getFullYear()}`;
      monthlyCounts[monthKey] = { count: 0, name: monthName };
    }

    data.forEach(item => {
      const date = new Date(item[dateField]);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (monthlyCounts[monthKey]) {
        monthlyCounts[monthKey].count++;
      }
    });

    return Object.entries(monthlyCounts).map(([key, value]) => ({
      key,
      name: value.name,
      count: value.count
    }));
  };

  const processMonthlyData = (playersData: MonthlyCountItem[], sessionsData: MonthlyCountItem[]): MonthlyData[] => {
    const combinedData: MonthlyData[] = [];

    playersData.forEach((playerMonth, index) => {
      const sessionMonth = sessionsData[index];
      combinedData.push({
        name: playerMonth.name,
        newPlayers: playerMonth.count,
        sessions: sessionMonth ? sessionMonth.count : 0
      });
    });

    return combinedData;
  };

  const calculateComparisonStats = (playersData: MonthlyCountItem[], sessionsData: MonthlyCountItem[]): ComparisonStats => {
    const currentMonthPlayers = playersData[5]?.count || 0;
    const previousMonthPlayers = playersData[4]?.count || 0;
    const currentMonthSessions = sessionsData[5]?.count || 0;
    const previousMonthSessions = sessionsData[4]?.count || 0;

    const playersPercentChange = previousMonthPlayers === 0 
      ? 100 
      : ((currentMonthPlayers - previousMonthPlayers) / previousMonthPlayers) * 100;
    
    const sessionsPercentChange = previousMonthSessions === 0 
      ? 100 
      : ((currentMonthSessions - previousMonthSessions) / previousMonthSessions) * 100;

    const fetchTotalActivePlayers = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_coach_statistics');
        
        if (error) {
          console.error("Error fetching active players:", error);
          return { totalActivePlayers: 0, averageSessionsPerPlayer: 0 };
        }

        const totalPlayers = data[0]?.activeplayerscount || 0;
        const totalSessions = data[0]?.totalsessions || 0;
        const averageSessionsPerPlayer = totalPlayers > 0 
          ? Number((totalSessions / totalPlayers).toFixed(1)) 
          : 0;

        setComparisonStats(prev => ({
          ...prev,
          totalActivePlayers: totalPlayers,
          averageSessionsPerPlayer: averageSessionsPerPlayer
        }));
      } catch (error) {
        console.error("Error fetching active players:", error);
      }
    };

    fetchTotalActivePlayers();

    return {
      newPlayersThisMonth: currentMonthPlayers,
      newPlayersLastMonth: previousMonthPlayers,
      playersPercentChange: Number(playersPercentChange.toFixed(1)),
      sessionsThisMonth: currentMonthSessions,
      sessionsLastMonth: previousMonthSessions,
      sessionsPercentChange: Number(sessionsPercentChange.toFixed(1)),
      totalActivePlayers: 0,
      averageSessionsPerPlayer: 0
    };
  };

  const handleExportToPdf = async () => {
    try {
      setIsPdfExporting(true);
      const element = document.getElementById('statistics-content');
      if (!element) {
        throw new Error("Element not found");
      }

      const currentDate = new Date();
      const dateStr = currentDate.toISOString().split('T')[0];
      
      toast({
        title: "מכין PDF",
        description: "מייצר קובץ PDF, אנא המתן...",
      });

      const originalStyle = element.style.cssText;
      element.style.backgroundColor = 'white';
      element.style.padding = '20px';

      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      element.style.cssText = originalStyle;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`סטטיסטיקות_שחקנים_${dateStr}.pdf`);

      toast({
        title: "הייצוא הושלם בהצלחה",
        description: "קובץ ה-PDF נוצר ונשמר",
      });
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בייצוא",
        description: "לא ניתן היה לייצא את הנתונים ל-PDF",
      });
    } finally {
      setIsPdfExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getTrendIcon = (percentChange: number) => {
    return percentChange >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">טוען נתונים...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/analytics')}
            className="transition-transform hover:scale-105"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            סטטיסטיקות שחקנים ומפגשים
          </h1>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportToPdf}
              disabled={isPdfExporting}
              className="flex items-center gap-1 transition-all hover:bg-primary hover:text-white"
            >
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-1 transition-all hover:bg-primary hover:text-white"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">הדפסה</span>
            </Button>
          </div>
        </div>

        <div id="statistics-content" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">שחקנים חדשים החודש</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{comparisonStats.newPlayersThisMonth}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {getTrendIcon(comparisonStats.playersPercentChange)}
                  <span className={`ml-1 ${comparisonStats.playersPercentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(comparisonStats.playersPercentChange)}% לעומת חודש קודם ({comparisonStats.newPlayersLastMonth})
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">מפגשים החודש</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{comparisonStats.sessionsThisMonth}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {getTrendIcon(comparisonStats.sessionsPercentChange)}
                  <span className={`ml-1 ${comparisonStats.sessionsPercentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(comparisonStats.sessionsPercentChange)}% לעומת חודש קודם ({comparisonStats.sessionsLastMonth})
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">שחקנים פעילים</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{comparisonStats.totalActivePlayers}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  שחקנים עם שני מפגשים ומעלה
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ממוצע מפגשים לשחקן</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{comparisonStats.averageSessionsPerPlayer}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  מפגשים לשחקן פעיל
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>שחקנים חדשים לפי חודשים</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="newPlayers" name="שחקנים חדשים" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>מפגשים לפי חודשים</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sessions" name="מפגשים" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>השוואה: שחקנים חדשים מול מפגשים</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="newPlayers" 
                      name="שחקנים חדשים" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sessions" 
                      name="מפגשים" 
                      stroke="#82ca9d" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatistics;

