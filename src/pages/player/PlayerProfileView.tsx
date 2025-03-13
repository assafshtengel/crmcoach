import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, User, Calendar, PenTool, Video, Activity, FileText, Notebook, Brain, Folder, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const PlayerProfileView = () => {
  const [playerData, setPlayerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mentalStateToday, setMentalStateToday] = useState<boolean>(false);
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [pastMeetings, setPastMeetings] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        const playerSessionStr = localStorage.getItem('playerSession');
        
        if (!playerSessionStr) {
          navigate('/player-auth');
          return;
        }
        
        const playerSession = JSON.parse(playerSessionStr);
        
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerSession.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        setPlayerData(data);

        // Get today's date in ISO format for all queries
        const today = new Date().toISOString().split('T')[0];
        
        // Check if player has submitted mental state form today
        const { data: mentalStateData, error: mentalStateError } = await supabase
          .from('player_mental_states')
          .select('id')
          .eq('player_id', playerSession.id)
          .gte('created_at', `${today}T00:00:00`)
          .lt('created_at', `${today}T23:59:59`)
          .limit(1);
          
        if (mentalStateError) {
          console.error('Error checking mental state:', mentalStateError);
        } else {
          setMentalStateToday(mentalStateData && mentalStateData.length > 0);
        }

        // Fetch upcoming meetings
        const { data: upcomingData, error: upcomingError } = await supabase
          .from('player_meetings')
          .select(`
            *,
            coaches (
              full_name
            )
          `)
          .eq('player_id', playerSession.id)
          .gte('meeting_date', today)
          .order('meeting_date', { ascending: true })
          .order('meeting_time', { ascending: true })
          .limit(5);

        if (upcomingError) throw upcomingError;
        setUpcomingMeetings(upcomingData || []);

        // Fetch past meetings with summaries
        const { data: pastData, error: pastError } = await supabase
          .from('player_meetings')
          .select(`
            *,
            coaches (
              full_name
            ),
            meeting_logs (
              summary,
              achievements,
              next_steps
            )
          `)
          .eq('player_id', playerSession.id)
          .lt('meeting_date', today)
          .order('meeting_date', { ascending: false })
          .order('meeting_time', { ascending: false })
          .limit(5);

        if (pastError) throw pastError;
        setPastMeetings(pastData || []);

      } catch (error: any) {
        console.error('Error loading player data:', error);
        toast.error(error.message || "אירעה שגיאה בטעינת נתוני השחקן");
      } finally {
        setLoading(false);
      }
    };
    
    loadPlayerData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('playerSession');
    navigate('/player-auth');
  };

  const handleNavigation = (path: string) => {
    // Update implemented pages list to include our player/goals page
    const implementedPages = [
      '/player/daily-mental-state', 
      '/player/mental-state-history',
      '/player/chat',
      '/player/contract',
      '/player/training-summary',
      '/player/game-summary',
      '/player/meetings',
      '/player/goals',
      '/player/game-preparation',
    ];
    
    if (implementedPages.includes(path)) {
      navigate(path);
    } else if (path.startsWith('/player-file/') && playerData?.id) {
      navigate(path);
    } else {
      toast.info("עמוד זה בפיתוח, יהיה זמין בקרוב");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">לא נמצאו נתוני שחקן</h2>
          <Button onClick={() => navigate('/player-auth')} className="mt-4">
            חזרה לדף התחברות
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button variant="outline" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-center">
            שלום, {playerData.full_name}
          </h1>
          <div className="w-9"></div> {/* Spacer for alignment */}
        </div>

        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              פרטי שחקן
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">שם מלא</p>
                <p className="font-medium">{playerData.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">אימייל</p>
                <p className="font-medium">{playerData.email}</p>
              </div>
              {playerData.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">טלפון</p>
                  <p className="font-medium">{playerData.phone}</p>
                </div>
              )}
              {playerData.birthdate && (
                <div>
                  <p className="text-sm text-muted-foreground">תאריך לידה</p>
                  <p className="font-medium">{playerData.birthdate}</p>
                </div>
              )}
              {playerData.club && (
                <div>
                  <p className="text-sm text-muted-foreground">מועדון</p>
                  <p className="font-medium">{playerData.club}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Daily Mental State */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5" />
                מצב מנטלי יומי
              </CardTitle>
              <CardDescription>
                שתף את המאמן במצב המנטלי שלך
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${mentalStateToday ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm text-muted-foreground">
                  {mentalStateToday ? 'מילאת את השאלון היום' : 'לא מילאת את השאלון היום'}
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  className="flex-1" 
                  onClick={() => handleNavigation('/player/daily-mental-state')}
                  variant={mentalStateToday ? "outline" : "default"}
                >
                  {mentalStateToday ? 'מילוי שאלון חדש' : 'מלא שאלון'}
                </Button>
                <Button 
                  className="flex-1" 
                  variant="outline"
                  onClick={() => handleNavigation('/player/mental-state-history')}
                >
                  היסטוריה
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Game Summary */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5" />
                סיכומי משחק
              </CardTitle>
              <CardDescription>
                סיכומי ביצועים אישיים במשחקים
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => handleNavigation('/player/game-summary')}
              >
                צפה והוסף סיכומי משחק
              </Button>
            </CardContent>
          </Card>

          {/* Training Summary */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Notebook className="h-5 w-5" />
                סיכומי אימונים
              </CardTitle>
              <CardDescription>
                סיכומי ביצועים אישיים באימונים
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => handleNavigation('/player/training-summary')}
              >
                צפה והוסף סיכומי אימונים
              </Button>
            </CardContent>
          </Card>

          {/* Videos */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Video className="h-5 w-5" />
                סרטוני אימון
              </CardTitle>
              <CardDescription>
                צפה בסרטוני אימון והנחיות מהמאמן
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => handleNavigation('/player/videos')}
              >
                צפה בסרטונים
              </Button>
            </CardContent>
          </Card>

          {/* Meetings */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                יומן פגישות
              </CardTitle>
              <CardDescription>
                צפה במועדי הפגישות הקרובות
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => handleNavigation('/player/meetings')}
              >
                צפה ביומן
              </Button>
            </CardContent>
          </Card>

          {/* Goals */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PenTool className="h-5 w-5" />
                מטרות אימון
              </CardTitle>
              <CardDescription>
                צפה במטרות האימון שלך
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => handleNavigation('/player/goals')}
              >
                צפה במטרות
              </Button>
            </CardContent>
          </Card>

          {/* Game Preparation */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                הכנה למשחק
              </CardTitle>
              <CardDescription>
                טופס הכנה מנטלית למשחק
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => handleNavigation('/player/game-preparation')}
              >
                מלא טופס הכנה
              </Button>
            </CardContent>
          </Card>

          {/* Contract */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                חוזה לחתימה
              </CardTitle>
              <CardDescription>
                חוזה התקשרות עם המאמן
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => handleNavigation('/player/contract')}
              >
                צפה בחוזה
              </Button>
            </CardContent>
          </Card>

          {/* Chat */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                צ'אט עם המאמן
              </CardTitle>
              <CardDescription>
                תקשורת ישירה עם המאמן האישי
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => handleNavigation('/player/chat')}
              >
                פתח צ'אט
              </Button>
            </CardContent>
          </Card>

          {/* Player File */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">תיק שחקן</CardTitle>
              <CardDescription>כל המידע במקום אחד</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                צפו בתיק השחקן שלכם המכיל את כל המידע על פעילותכם, מטרות והתקדמות.
              </p>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handleNavigation(`/player-file/${playerData?.id}`)}
              >
                <Folder className="mr-2 h-4 w-4" />
                צפייה בתיק השחקן שלי
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="upcoming" className="mb-8">
          <TabsList className="w-full">
            <TabsTrigger value="upcoming" className="flex-1">פגישות קרובות</TabsTrigger>
            <TabsTrigger value="past" className="flex-1">פגישות קודמות</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                {upcomingMeetings.length === 0 ? (
                  <p className="text-center text-muted-foreground">אין לך פגישות קרובות</p>
                ) : (
                  <div className="space-y-4">
                    {upcomingMeetings.map((meeting) => (
                      <Card key={meeting.id} className="shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">
                            {new Date(meeting.meeting_date).toLocaleDateString('he-IL')}
                          </CardTitle>
                          <CardDescription>
                            {meeting.meeting_time.slice(0, 5)} - {meeting.meeting_type === 'training' ? 'אימון' : 'פגישה'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {meeting.location && (
                              <p className="text-sm">
                                <span className="font-medium">מיקום:</span> {meeting.location}
                              </p>
                            )}
                            {meeting.coaches?.full_name && (
                              <p className="text-sm">
                                <span className="font-medium">מאמן:</span> {meeting.coaches.full_name}
                              </p>
                            )}
                            {meeting.notes && (
                              <p className="text-sm">
                                <span className="font-medium">הערות:</span> {meeting.notes}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                {pastMeetings.length === 0 ? (
                  <p className="text-center text-muted-foreground">אין פגישות קודמות</p>
                ) : (
                  <div className="space-y-4">
                    {pastMeetings.map((meeting) => (
                      <Card key={meeting.id} className="shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">
                            {new Date(meeting.meeting_date).toLocaleDateString('he-IL')}
                          </CardTitle>
                          <CardDescription>
                            {meeting.meeting_time.slice(0, 5)} - {meeting.meeting_type === 'training' ? 'אימון' : 'פגישה'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {meeting.location && (
                              <p className="text-sm">
                                <span className="font-medium">מיקום:</span> {meeting.location}
                              </p>
                            )}
                            {meeting.coaches?.full_name && (
                              <p className="text-sm">
                                <span className="font-medium">מאמן:</span> {meeting.coaches.full_name}
                              </p>
                            )}
                            {meeting.meeting_logs?.[0] && (
                              <>
                                <div className="border-t pt-2">
                                  <h4 className="font-medium mb-1">סיכום האימון:</h4>
                                  <p className="text-sm whitespace-pre-line">{meeting.meeting_logs[0].summary}</p>
                                </div>
                                {meeting.meeting_logs[0].achievements && (
                                  <div>
                                    <h4 className="font-medium mb-1">הישגים:</h4>
                                    <p className="text-sm">{meeting.meeting_logs[0].achievements}</p>
                                  </div>
                                )}
                                {meeting.meeting_logs[0].next_steps && (
                                  <div>
                                    <h4 className="font-medium mb-1">צעדים הבאים:</h4>
                                    <p className="text-sm">{meeting.meeting_logs[0].next_steps}</p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PlayerProfileView;
