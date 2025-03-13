
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, CalendarDays, CheckCircle, Circle, Clock, MapPin } from "lucide-react";
import { format, isSameDay, parseISO, startOfDay } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface Meeting {
  id: string;
  player_id: string;
  coach_id: string;
  coach?: {
    full_name: string;
  };
  meeting_date: string;
  meeting_time: string;
  location: string;
  meeting_type: 'in_person' | 'zoom';
  notes: string;
  is_completed: boolean;
}

interface Goal {
  id: string;
  player_id: string;
  title: string;
  description?: string;
  due_date?: string;
  progress?: number;
}

const TrainingForecasts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [shortTermGoals, setShortTermGoals] = useState<Goal[]>([]);
  const [longTermGoals, setLongTermGoals] = useState<Goal[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const playerSessionStr = localStorage.getItem('playerSession');
        
        if (!playerSessionStr) {
          navigate('/player-auth');
          return;
        }
        
        const playerSession = JSON.parse(playerSessionStr);
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch upcoming meetings
        const { data: meetingsData, error: meetingsError } = await supabase
          .from('player_meetings')
          .select(`
            *,
            coach (
              full_name
            )
          `)
          .eq('player_id', playerSession.id)
          .gte('meeting_date', today)
          .order('meeting_date', { ascending: true })
          .order('meeting_time', { ascending: true })
          .limit(5);

        if (meetingsError) throw meetingsError;
        setUpcomingMeetings(meetingsData || []);

        // Fetch player goals
        const { data: goalsData, error: goalsError } = await supabase
          .from('player_goals')
          .select('*')
          .eq('player_id', playerSession.id)
          .single();

        if (goalsError && goalsError.code !== 'PGRST116') {
          throw goalsError;
        }

        if (goalsData) {
          setShortTermGoals(goalsData.short_term_goals || []);
          setLongTermGoals(goalsData.long_term_goals || []);
        }
      } catch (error: any) {
        console.error('Error loading data:', error);
        toast.error(error.message || "אירעה שגיאה בטעינת הנתונים");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  const getNextMeetingText = () => {
    if (upcomingMeetings.length === 0) return "אין פגישות מתוכננות";
    
    const nextMeeting = upcomingMeetings[0];
    const meetingDate = parseISO(nextMeeting.meeting_date);
    
    // Check if meeting is today
    const isToday = isSameDay(meetingDate, new Date());
    
    if (isToday) {
      return `היום בשעה ${nextMeeting.meeting_time.slice(0, 5)}`;
    } else {
      return `${format(meetingDate, 'dd/MM', { locale: he })} בשעה ${nextMeeting.meeting_time.slice(0, 5)}`;
    }
  };

  const getGoalProgress = (goal: Goal) => {
    return goal.progress || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/player-profile')}
            className="ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">תחזיות אימון</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                הפגישה הבאה
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingMeetings.length > 0 ? (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">
                      {upcomingMeetings[0].meeting_type === 'zoom' ? 'פגישת זום' : 'פגישה פרונטלית'}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {getNextMeetingText()}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {upcomingMeetings[0].location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{upcomingMeetings[0].location}</span>
                      </div>
                    )}
                    
                    {upcomingMeetings[0].coach?.full_name && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">מאמן:</span>
                        <span>{upcomingMeetings[0].coach.full_name}</span>
                      </div>
                    )}
                    
                    {upcomingMeetings[0].notes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-gray-600">{upcomingMeetings[0].notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/player/meetings')}
                      className="w-full"
                    >
                      צפייה בכל הפגישות
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">אין פגישות מתוכננות</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                מטרות קרובות
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shortTermGoals.length > 0 ? (
                <div className="space-y-4">
                  {shortTermGoals.slice(0, 3).map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {getGoalProgress(goal) >= 100 ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Circle className="h-4 w-4 text-gray-300" />
                          )}
                          <h3 className="font-medium">{goal.title}</h3>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {goal.due_date ? format(parseISO(goal.due_date), 'dd/MM/yyyy', { locale: he }) : ''}
                        </span>
                      </div>
                      {goal.description && (
                        <p className="text-sm text-gray-600 pr-6">{goal.description}</p>
                      )}
                      <div className="pr-6">
                        <div className="flex justify-between text-xs mb-1">
                          <span>התקדמות</span>
                          <span>{getGoalProgress(goal)}%</span>
                        </div>
                        <Progress value={getGoalProgress(goal)} className="h-2" />
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/player/goals')}
                      className="w-full"
                    >
                      צפייה בכל המטרות
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">אין מטרות לטווח קצר</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="upcoming" className="flex-1">פגישות קרובות</TabsTrigger>
            <TabsTrigger value="goals" className="flex-1">מטרות לטווח ארוך</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">לוח זמנים</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {upcomingMeetings.length > 0 ? (
                  <div>
                    {upcomingMeetings.map((meeting) => (
                      <div key={meeting.id} className="p-4 border-b last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">
                              {meeting.meeting_type === 'zoom' ? 'פגישת זום' : 'פגישה פרונטלית'}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                              <CalendarDays className="h-4 w-4" />
                              {format(parseISO(meeting.meeting_date), 'dd/MM/yyyy', { locale: he })}
                              <span className="mx-1">•</span>
                              <Clock className="h-4 w-4 mr-1" />
                              {meeting.meeting_time.slice(0, 5)}
                            </div>
                          </div>
                          <div className="text-right">
                            {meeting.location && (
                              <div className="flex items-center gap-1 text-sm">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span>{meeting.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-gray-500">אין פגישות מתוכננות</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="goals">
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">מטרות לטווח ארוך</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {longTermGoals.length > 0 ? (
                  <div>
                    {longTermGoals.map((goal, index) => (
                      <div key={index} className="p-4 border-b last:border-0">
                        <div className="mb-2">
                          <div className="flex items-center gap-2">
                            {getGoalProgress(goal) >= 100 ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4 text-gray-300" />
                            )}
                            <h3 className="font-medium">{goal.title}</h3>
                          </div>
                          {goal.description && (
                            <p className="text-sm text-gray-600 mt-2 pr-6">{goal.description}</p>
                          )}
                        </div>
                        <div className="pr-6 mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>התקדמות</span>
                            <span>{getGoalProgress(goal)}%</span>
                          </div>
                          <Progress value={getGoalProgress(goal)} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-gray-500">אין מטרות לטווח ארוך</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TrainingForecasts;
