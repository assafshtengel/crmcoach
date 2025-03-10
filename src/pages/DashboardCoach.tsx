import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ArrowRight, ListFilter, User, CheckCircle, BarChart, FileText } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { Calendar } from '@/components/calendar/Calendar';
import { toast } from 'sonner';
import { SessionSummaryForm } from '@/components/session/SessionSummaryForm';

interface Player {
  id: string;
  full_name: string;
  profile_image?: string;
}

interface Session {
  id: string;
  session_date: string;
  session_time: string;
  notes?: string;
  player: {
    id: string;
    full_name: string;
    profile_image?: string;
  };
  has_started: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  extendedProps: {
    playerName: string;
    location?: string;
    reminderSent: boolean;
    notes?: string;
    eventType?: 'reminder' | 'task' | 'other';
    player_id?: string;
  };
}

const DashboardCoach = () => {
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [recentPlayers, setRecentPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    successfulReminders: 0,
    activePlayersCount: 0
  });
  // Add state for managing the summary form
  const [showSummaryForm, setShowSummaryForm] = useState(false);
  const [summarySession, setSummarySession] = useState<Session | null>(null);

  useEffect(() => {
    fetchData();
    fetchCalendarEvents();
    fetchRecentPlayers();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error("User not found");
        return;
      }

      const coachId = user.id;

      // Fetch recent sessions
      const { data: recentSessionsData, error: recentSessionsError } = await supabase
        .from('sessions')
        .select(`
          id,
          session_date,
          session_time,
          notes,
          has_started,
          player:players!inner(id, full_name, profile_image)
        `)
        .eq('coach_id', coachId)
        .order('session_date', { ascending: false })
        .limit(3);

      if (recentSessionsError) {
        throw recentSessionsError;
      }

      setRecentSessions(recentSessionsData || []);

      // Fetch upcoming sessions
      const { data: upcomingSessionsData, error: upcomingSessionsError } = await supabase
        .from('sessions')
        .select(`
          id,
          session_date,
          session_time,
          notes,
          has_started,
          player:players!inner(id, full_name, profile_image)
        `)
        .eq('coach_id', coachId)
        .gte('session_date', format(new Date(), 'yyyy-MM-dd'))
        .order('session_date', { ascending: true })
        .limit(3);

      if (upcomingSessionsError) {
        throw upcomingSessionsError;
      }

      setUpcomingSessions(upcomingSessionsData || []);

      // Fetch statistics
      const { data: statsData, error: statsError } = await supabase
        .from('coach_stats')
        .select('*')
        .eq('coach_id', coachId)
        .single();

      if (statsError) {
        throw statsError;
      }

      setStats(statsData || {
        totalSessions: 0,
        successfulReminders: 0,
        activePlayersCount: 0
      });

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error("User not found");
        return;
      }

      const coachId = user.id;

      const { data: sessions, error } = await supabase
        .from('sessions')
        .select(`
          id,
          session_date,
          session_time,
          notes,
          has_started,
          player:players!inner(id, full_name)
        `)
        .eq('coach_id', coachId);

      if (error) {
        throw error;
      }

      const events: CalendarEvent[] = sessions ? sessions.map(session => ({
        id: session.id,
        title: session.player.full_name,
        start: `${session.session_date}T${session.session_time}:00`,
        extendedProps: {
          playerName: session.player.full_name,
          location: 'Zoom',
          reminderSent: true,
          notes: session.notes,
          eventType: 'task',
          player_id: session.player.id
        }
      })) : [];

      setCalendarEvents(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
    }
  };

  const fetchRecentPlayers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error("User not found");
        return;
      }

      const coachId = user.id;

      const { data: players, error } = await supabase
        .from('players')
        .select('*')
        .eq('coach_id', coachId)
        .limit(4);

      if (error) {
        throw error;
      }

      setRecentPlayers(players || []);
    } catch (error) {
      console.error("Error fetching recent players:", error);
    }
  };

  const handleSummarizeSession = (session: Session) => {
    setSummarySession(session);
    setShowSummaryForm(true);
  };

  const handleSummarySubmit = async (data: any) => {
    if (!summarySession) return;
    
    try {
      console.log('Saving session summary:', data);
      
      // First, save the summary data to the session_summaries table
      const { data: summaryData, error: summaryError } = await supabase
        .from('session_summaries')
        .upsert({
          session_id: summarySession.id,
          player_id: summarySession.player.id,
          summary_text: data.summary_text,
          achieved_goals: data.achieved_goals,
          future_goals: data.future_goals,
          progress_rating: data.progress_rating,
          next_session_focus: data.next_session_focus,
          additional_notes: data.additional_notes,
          tools_used: data.tools_used || []
        })
        .select();
      
      if (summaryError) throw summaryError;

      // Then, update the session to mark it as summarized
      const { error: sessionError } = await supabase
        .from('sessions')
        .update({ has_started: true, has_summary: true })
        .eq('id', summarySession.id);
      
      if (sessionError) throw sessionError;
      
      // Update the local state
      setRecentSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === summarySession.id 
            ? { ...session, has_started: true } 
            : session
        )
      );
      
      setUpcomingSessions(prevSessions => 
        prevSessions.filter(session => session.id !== summarySession.id)
      );
      
      toast.success('סיכום המפגש נשמר בהצלחה');
      setShowSummaryForm(false);
      setSummarySession(null);
    } catch (error: any) {
      console.error('Error saving session summary:', error);
      toast.error('שגיאה בשמירת סיכום המפגש');
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">לוח בקרה</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">סה"כ מפגשים</CardTitle>
            <BarChart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-gray-500">
              <CheckCircle className="h-3 w-3 text-green-500 inline-block mr-1" />
              {stats.successfulReminders} תזכורות נשלחו בהצלחה
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">שחקנים פעילים</CardTitle>
            <User className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePlayersCount}</div>
            <p className="text-xs text-gray-500">+20% מהחודש האחרון</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">קישורים מהירים</CardTitle>
            <ListFilter className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/new-session" className="w-full">קביעת מפגש חדש</Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/new-player" className="w-full">הוספת שחקן חדש</Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/sessions" className="w-full">רשימת מפגשים</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>מפגשים</CardTitle>
              <CardDescription>מפגשים אחרונים ומתוכננים</CardDescription>
            </div>
            <Link to="/sessions">
              <Button variant="ghost" className="text-primary">
                כל המפגשים <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="upcoming">מפגשים מתוכננים</TabsTrigger>
                <TabsTrigger value="recent">מפגשים אחרונים</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming">
                {upcomingSessions.length === 0 ? (
                  <div className="text-center p-4 text-gray-500">אין מפגשים מתוכננים</div>
                ) : (
                  <div className="space-y-2">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="p-2 rounded-md bg-gray-50 flex justify-between items-center text-sm hover:bg-gray-100 cursor-pointer">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={session.player.profile_image} />
                            <AvatarFallback>{session.player.full_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{session.player.full_name}</p>
                            <p className="text-xs text-gray-500 flex items-center">
                              <CalendarIcon className="h-3 w-3 inline ml-1" />
                              {session.session_date} | {session.session_time}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSummarizeSession(session);
                            }}
                          >
                            <FileText className="h-4 w-4 ml-1" />
                            סכם מפגש
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="recent">
                {recentSessions.length === 0 ? (
                  <div className="text-center p-4 text-gray-500">אין מפגשים אחרונים</div>
                ) : (
                  <div className="space-y-2">
                    {recentSessions.map((session) => (
                      <div key={session.id} className="p-2 rounded-md bg-gray-50 flex justify-between items-center text-sm hover:bg-gray-100 cursor-pointer">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={session.player.profile_image} />
                            <AvatarFallback>{session.player.full_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{session.player.full_name}</p>
                            <p className="text-xs text-gray-500 flex items-center">
                              <CalendarIcon className="h-3 w-3 inline ml-1" />
                              {session.session_date} | {session.session_time}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSummarizeSession(session);
                            }}
                          >
                            <FileText className="h-4 w-4 ml-1" />
                            סכם מפגש
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>שחקנים אחרונים</CardTitle>
            <Link to="/players">
              <Button variant="ghost" className="text-primary">
                כל השחקנים <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="grid grid-cols-2 gap-4">
              {recentPlayers.map((player) => (
                <Link to={`/player/${player.id}`} key={player.id}>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={player.profile_image} alt={player.full_name} />
                        <AvatarFallback>{player.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium leading-none">{player.full_name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {showSummaryForm && summarySession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-[#1A1F2C] text-white p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">סיכום מפגש</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowSummaryForm(false);
                  setSummarySession(null);
                }}
                className="text-white hover:bg-white/20"
              >
                סגור
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              <SessionSummaryForm
                sessionId={summarySession.id}
                playerName={summarySession.player.full_name}
                sessionDate={summarySession.session_date}
                onSubmit={handleSummarySubmit}
                onCancel={() => {
                  setShowSummaryForm(false);
                  setSummarySession(null);
                }}
                forceEnable={!summarySession.has_started}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCoach;
