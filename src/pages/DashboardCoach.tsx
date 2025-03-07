import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { CalendarDays, Plus, Users, FileText, Clock, ArrowRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';

const DashboardCoach = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [playerCount, setPlayerCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [summaryCount, setSummaryCount] = useState(0);
  const [userData, setUserData] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState({
    completed: 0,
    planned: 0,
    total: 0
  });

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }
      
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchPlayerCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { count, error } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('coach_id', user.id);
      
      if (error) throw error;
      
      setPlayerCount(count || 0);
    } catch (error) {
      console.error('Error fetching player count:', error);
    }
  };

  const fetchSessionCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { count, error } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('coach_id', user.id);
      
      if (error) throw error;
      
      setSessionCount(count || 0);
    } catch (error) {
      console.error('Error fetching session count:', error);
    }
  };

  const fetchSummaryCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { count, error } = await supabase
        .from('session_summaries')
        .select('*', { count: 'exact', head: true })
        .eq('coach_id', user.id);
      
      if (error) throw error;
      
      setSummaryCount(count || 0);
    } catch (error) {
      console.error('Error fetching summary count:', error);
    }
  };

  // Modify the function that fetches monthly stats to correctly count planned sessions
  const fetchMonthlyStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentDate = new Date();
      const firstDayOfMonth = startOfMonth(currentDate);
      const lastDayOfMonth = endOfMonth(currentDate);
      
      // Fetch all sessions for this month
      const { data: monthSessions, error: monthError } = await supabase
        .from('sessions')
        .select('*')
        .eq('coach_id', user.id)
        .gte('session_date', firstDayOfMonth.toISOString().split('T')[0])
        .lte('session_date', lastDayOfMonth.toISOString().split('T')[0]);

      if (monthError) throw monthError;

      // Get current date in YYYY-MM-DD format for comparison
      const today = new Date().toISOString().split('T')[0];
      
      // Count completed and planned sessions
      let completed = 0;
      let planned = 0;
      
      if (monthSessions) {
        monthSessions.forEach(session => {
          // If session date is before or equal to today, it's completed
          if (session.session_date <= today) {
            completed++;
          } else {
            // Otherwise it's planned
            planned++;
          }
        });
      }

      setMonthlyStats({
        completed,
        planned,
        total: completed + planned
      });
      
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
    }
  };

  // Modify the function that fetches upcoming sessions to ensure consistency
  const fetchUpcomingSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { data: sessions, error } = await supabase
        .from('sessions')
        .select(`
          id,
          session_date,
          session_time,
          notes,
          players(id, full_name, avatar_url)
        `)
        .eq('coach_id', user.id)
        .gte('session_date', today)
        .order('session_date', { ascending: true })
        .order('session_time', { ascending: true })
        .limit(5);

      if (error) throw error;

      setUpcomingSessions(sessions || []);
      
      // Update monthly stats whenever we fetch upcoming sessions to ensure consistency
      fetchMonthlyStats();
      
    } catch (error) {
      console.error('Error fetching upcoming sessions:', error);
    }
  };

  // Make sure both functions are called in the initial load useEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchUserData(),
          fetchPlayerCount(),
          fetchSessionCount(),
          fetchUpcomingSessions(),
          fetchSummaryCount(),
          fetchMonthlyStats()
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('שגיאה בטעינת נתוני הדף');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const chartData = [
    {
      name: 'מפגשים',
      מתוכננים: monthlyStats.planned,
      הושלמו: monthlyStats.completed,
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="w-full bg-[#1A1F2C] text-white py-6 mb-8 shadow-md">
        <div className="max-w-7xl mx-auto px-8">
          <h1 className="text-3xl font-bold">לוח הבקרה</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarImage src={userData?.avatar_url} />
              <AvatarFallback>{userData?.full_name ? getInitials(userData.full_name) : 'C'}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{userData?.full_name || 'מאמן'}</h2>
              <p className="text-gray-600">{userData?.email}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/new-session')} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              מפגש חדש
            </Button>
            <Button onClick={() => navigate('/new-player')} variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              שחקן חדש
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                שחקנים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-3xl font-bold">{playerCount}</span>
                <Button variant="ghost" size="sm" onClick={() => navigate('/players-list')} className="text-primary">
                  צפה ברשימה
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                מפגשים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-3xl font-bold">{sessionCount}</span>
                <Button variant="ghost" size="sm" onClick={() => navigate('/sessions-list')} className="text-primary">
                  צפה ברשימה
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                סיכומי מפגשים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-3xl font-bold">{summaryCount}</span>
                <Button variant="ghost" size="sm" onClick={() => navigate('/session-summaries')} className="text-primary">
                  צפה ברשימה
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                מפגשים קרובים
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-gray-200">
                          <AvatarImage src={session.players?.avatar_url} />
                          <AvatarFallback>{getInitials(session.players?.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{session.players?.full_name}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(session.session_date)} • {session.session_time}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary"
                        onClick={() => navigate(`/edit-session`, { state: { sessionId: session.id } })}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  אין מפגשים קרובים
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                סיכום מפגשים חודשי
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="הושלמו" fill="#4f46e5" />
                    <Bar dataKey="מתוכננים" fill="#93c5fd" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">הושלמו</p>
                  <p className="text-xl font-bold">{monthlyStats.completed}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">מתוכננים</p>
                  <p className="text-xl font-bold">{monthlyStats.planned}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/players-list')}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium">ניהול שחקנים</h3>
                <p className="text-sm text-gray-500">צפה, הוסף ועדכן שחקנים</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/sessions-list')}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <CalendarDays className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium">ניהול מפגשים</h3>
                <p className="text-sm text-gray-500">צפה, הוסף ועדכן מפגשים</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/session-summaries')}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium">סיכומי מפגשים</h3>
                <p className="text-sm text-gray-500">צפה וערוך סיכומי מפגשים</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/tool-management')}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-amber-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                <h3 className="font-medium">כלים מנטליים</h3>
                <p className="text-sm text-gray-500">נהל את הכלים המנטליים</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardCoach;
