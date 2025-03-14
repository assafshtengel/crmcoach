
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Calendar, BarChart2, BookOpen, Plus } from "lucide-react";
import { MissingFormsAlert } from "@/components/dashboard/MissingFormsAlert";
import { UpcomingGamesAlert } from "@/components/dashboard/UpcomingGamesAlert";
import { OptimizedChart } from "@/components/analytics/OptimizedChart";
import { ChartDataProvider, useChartData } from "@/components/analytics/ChartDataProvider";
import { DateRangeSelector } from "@/components/analytics/DateRangeSelector";
import { Skeleton } from "@/components/ui/skeleton";

const AnalyticsDashboardContent = () => {
  const { chartData, isLoading, dateRange, setDateRange } = useChartData();
  const [playersCount, setPlayersCount] = useState(0);
  const [nextSessionCount, setNextSessionCount] = useState(0);
  
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        // Fetch players count
        const { count: playersCount, error: playersError } = await supabase
          .from('players')
          .select('*', { count: 'exact', head: true })
          .eq('coach_id', user.id);
          
        if (playersError) throw playersError;
        
        // Get today's date
        const today = new Date();
        const formattedToday = today.toISOString().split('T')[0];
        
        // Fetch upcoming sessions count
        const { count: sessionsCount, error: sessionsError } = await supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true })
          .eq('coach_id', user.id)
          .gte('session_date', formattedToday);
          
        if (sessionsError) throw sessionsError;
        
        setPlayersCount(playersCount || 0);
        setNextSessionCount(sessionsCount || 0);
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };
    
    fetchCounts();
  }, []);
  
  const mentalStateChartData = chartData.mentalStates || [];
  const sessionsChartData = chartData.sessions || [];
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">לוח בקרה</h1>
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <MissingFormsAlert />
        <UpcomingGamesAlert />
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="שחקנים"
          value={playersCount}
          icon={<Users className="h-5 w-5 text-blue-600" />}
          isLoading={false}
        />
        <StatCard
          title="מפגשים הבאים"
          value={nextSessionCount}
          icon={<Calendar className="h-5 w-5 text-green-600" />}
          isLoading={false}
        />
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              פעולות מהירות
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-2">
              <QuickActionButton
                icon={<Users className="h-4 w-4" />}
                text="הוסף שחקן"
                onClick="/new-player"
              />
              <QuickActionButton
                icon={<Calendar className="h-4 w-4" />}
                text="קבע מפגש"
                onClick="/sessions"
              />
              <QuickActionButton
                icon={<BarChart2 className="h-4 w-4" />}
                text="צפה בדוחות"
                onClick="/reports"
              />
              <QuickActionButton
                icon={<Plus className="h-4 w-4" />}
                text="יצירת דוח"
                onClick="/player-list"
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <OptimizedChart
          title="מצב מנטלי של שחקנים לאורך זמן"
          data={mentalStateChartData}
          type="line"
          dataKeys={[
            { key: 'feelingScore', color: '#4299e1', name: 'תחושה כללית' },
            { key: 'motivationLevel', color: '#48bb78', name: 'מוטיבציה' },
            { key: 'fatigueLevel', color: '#ed8936', name: 'עייפות מנטלית' },
          ]}
          isLoading={isLoading}
          height={300}
        />
        
        <OptimizedChart
          title="מפגשים לאורך זמן"
          data={sessionsChartData}
          type="bar"
          dataKeys={[
            { key: 'sessionCount', color: '#4299e1', name: 'מפגשים' },
          ]}
          isLoading={isLoading}
          height={300}
        />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, isLoading }) => {
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-3xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
};

const QuickActionButton = ({ icon, text, onClick }) => {
  const navigate = useNavigate();
  
  return (
    <Button
      variant="outline"
      className="h-16 w-full flex flex-col items-center justify-center gap-1"
      onClick={() => navigate(onClick)}
    >
      {icon}
      <span className="text-xs">{text}</span>
    </Button>
  );
};

export default function DashboardCoach() {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <ChartDataProvider>
          <AnalyticsDashboardContent />
        </ChartDataProvider>
      </div>
    </Layout>
  );
}
