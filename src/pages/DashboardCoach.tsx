
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Calendar, BarChart2, BookOpen, Plus, LightbulbIcon } from "lucide-react";
import { MissingFormsAlert } from "@/components/dashboard/MissingFormsAlert";
import { UpcomingGamesAlert } from "@/components/dashboard/UpcomingGamesAlert";
import { OptimizedChart } from "@/components/analytics/OptimizedChart";
import { ChartDataProvider, useChartData } from "@/components/analytics/ChartDataProvider";
import { DateRangeSelector } from "@/components/analytics/DateRangeSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { BeliefBreakingCard } from "@/components/ui/BeliefBreakingCard";

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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-8 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-primary">לוח בקרה</h1>
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
        </div>
        <p className="text-muted-foreground mt-2">ברוך הבא למרכז הניהול. כאן תוכל לצפות בנתונים חשובים ולנהל את השחקנים שלך.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 p-1 rounded-xl shadow-sm">
          <MissingFormsAlert />
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-1 rounded-xl shadow-sm">
          <UpcomingGamesAlert />
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="שחקנים"
          value={playersCount}
          icon={<Users className="h-5 w-5 text-blue-600" />}
          isLoading={false}
          gradient="from-blue-50 to-blue-100"
        />
        <StatCard
          title="מפגשים הבאים"
          value={nextSessionCount}
          icon={<Calendar className="h-5 w-5 text-green-600" />}
          isLoading={false}
          gradient="from-green-50 to-green-100"
        />
        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              פעולות מהירות
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-3">
              <QuickActionButton
                icon={<Users className="h-4 w-4" />}
                text="הוסף שחקן"
                onClick="/new-player"
                gradient="from-blue-500 to-blue-600"
              />
              <QuickActionButton
                icon={<Calendar className="h-4 w-4" />}
                text="קבע מפגש"
                onClick="/sessions"
                gradient="from-green-500 to-green-600"
              />
              <QuickActionButton
                icon={<BarChart2 className="h-4 w-4" />}
                text="צפה בדוחות"
                onClick="/reports"
                gradient="from-amber-500 to-amber-600"
              />
              <QuickActionButton
                icon={<Plus className="h-4 w-4" />}
                text="יצירת דוח"
                onClick="/player-list"
                gradient="from-purple-500 to-purple-600"
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
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
            className="shadow-md hover:shadow-lg transition-all duration-300 border-blue-100 bg-gradient-to-br from-white to-blue-50"
          />
        </div>
        
        <div className="md:row-span-2">
          <BeliefBreakingCard />
        </div>
        
        <div className="md:col-span-2">
          <OptimizedChart
            title="מפגשים לאורך זמן"
            data={sessionsChartData}
            type="bar"
            dataKeys={[
              { key: 'sessionCount', color: '#4299e1', name: 'מפגשים' },
            ]}
            isLoading={isLoading}
            height={300}
            className="shadow-md hover:shadow-lg transition-all duration-300 border-green-100 bg-gradient-to-br from-white to-green-50"
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, isLoading, gradient }) => {
  return (
    <Card className={`bg-gradient-to-br ${gradient} border-0 shadow-md hover:shadow-lg transition-all duration-300`}>
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

const QuickActionButton = ({ icon, text, onClick, gradient }) => {
  const navigate = useNavigate();
  
  return (
    <Button
      variant="outline"
      className={`h-16 w-full flex flex-col items-center justify-center gap-1 bg-gradient-to-r ${gradient} text-white border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105`}
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
