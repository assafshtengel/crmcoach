import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { format, parseISO, isAfter, isSameDay } from 'date-fns';
import { he } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  UserPlus, 
  LayoutDashboard, 
  Settings, 
  Users, 
  FileText, 
  Target, 
  PlusCircle,
  CheckCircle2,
  Eye,
  MessageSquare,
  Activity,
  Wrench
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface Player {
  id: string;
  full_name: string;
  profile_image_url?: string | null;
}

interface Session {
  id: string;
  session_date: string;
  session_time: string;
  notes?: string | null;
  player_id: string;
  meeting_type: 'in_person' | 'zoom';
  location?: string | null;
}

interface Goal {
  id: string;
  created_at: string;
  title: string;
  description?: string | null;
  is_completed: boolean;
}

interface Summary {
  id: string;
  created_at: string;
  summary_text: string;
  achieved_goals: string[];
  future_goals: string[];
  progress_rating: number;
  next_session_focus: string;
  session_id: string;
}

const DashboardCoach = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [completedGoals, setCompletedGoals] = useState<Goal[]>([]);
  const [recentSummaries, setRecentSummaries] = useState<Summary[]>([]);
  
  // Add these new state variables
  const [selectedSummaryId, setSelectedSummaryId] = useState<string | null>(null);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [summaryDetails, setSummaryDetails] = useState<any>(null);
  const [toolsList, setToolsList] = useState<Record<string, any>>({});
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        setUser(user);

        // Fetch all data in parallel
        await Promise.all([
          fetchSessions(user.id),
          fetchPlayers(user.id),
          fetchGoals(user.id),
          fetchSummaries(user.id),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error('שגיאה בטעינת המידע');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const fetchSessions = async (coachId: string) => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('coach_id', coachId)
        .order('session_date', { ascending: true });

      if (error) {
        console.error('Error fetching sessions:', error);
        toast.error('שגיאה בטעינת רשימת המפגשים');
        return;
      }

      setSessions(data || []);
      
      // Filter upcoming sessions
      const now = new Date();
      const upcoming = data?.filter(session => isAfter(parseISO(session.session_date), now) || isSameDay(parseISO(session.session_date), now)) || [];
      setUpcomingSessions(upcoming);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('שגיאה בטעינת רשימת המפגשים');
    }
  };

  const fetchPlayers = async (coachId: string) => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('coach_id', coachId);

      if (error) {
        console.error('Error fetching players:', error);
        toast.error('שגיאה בטעינת רשימת השחקנים');
        return;
      }

      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast.error('שגיאה בטעינת רשימת השחקנים');
    }
  };

  const fetchGoals = async (coachId: string) => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('coach_id', coachId);

      if (error) {
        console.error('Error fetching goals:', error);
        toast.error('שגיאה בטעינת רשימת המטרות');
        return;
      }

      setGoals(data || []);
      
      // Filter completed goals
      const completed = data?.filter(goal => goal.is_completed) || [];
      setCompletedGoals(completed);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('שגיאה בטעינת רשימת המטרות');
    }
  };

  const fetchSummaries = async (coachId: string) => {
    try {
      const { data, error } = await supabase
        .from('session_summaries')
        .select(`
          *,
          session:sessions (
            id,
            session_date,
            player:players (
              id,
              full_name
            )
          )
        `)
        .eq('coach_id', coachId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching summaries:', error);
        toast.error('שגיאה בטעינת רשימת הסיכומים');
        return;
      }

      setSummaries(data || []);
      setRecentSummaries(data || []);
    } catch (error) {
      console.error('Error fetching summaries:', error);
      toast.error('שגיאה בטעינת רשימת הסיכומים');
    }
  };

  // Add new function to fetch all tools
  const fetchTools = async () => {
    try {
      const { data: toolsData, error } = await supabase
        .from('coach_tools')
        .select('*');
      
      if (error) {
        console.error('Error fetching tools:', error);
        return;
      }

      // Convert to record for easier lookup
      const toolsRecord: Record<string, any> = {};
      toolsData?.forEach((tool: any) => {
        toolsRecord[tool.id] = tool;
      });
      
      setToolsList(toolsRecord);
    } catch (error) {
      console.error('Error fetching tools:', error);
    }
  };

  // Add new function to fetch specific summary details
  const fetchSummaryDetails = async (summaryId: string) => {
    setLoadingSummary(true);
    try {
      const { data, error } = await supabase
        .from('session_summaries')
        .select(`
          *,
          session:sessions (
            id,
            session_date,
            player:players (
              id,
              full_name
            )
          )
        `)
        .eq('id', summaryId)
        .single();

      if (error) {
        console.error('Error fetching summary:', error);
        toast.error('שגיאה בטעינת סיכום המפגש');
        return;
      }

      setSummaryDetails(data);
      setSummaryDialogOpen(true);
    } catch (error) {
      console.error('Error in fetchSummaryDetails:', error);
      toast.error('שגיאה בטעינת סיכום המפגש');
    } finally {
      setLoadingSummary(false);
    }
  };

  // Add this useEffect to fetch tools when component mounts
  useEffect(() => {
    fetchTools();
  }, []);

  // Modify the handleViewSummary function
  const handleViewSummary = (summaryId: string) => {
    setSelectedSummaryId(summaryId);
    fetchSummaryDetails(summaryId);
  };

  // Add this function to render the summary details
  const renderSummaryDetails = () => {
    if (!summaryDetails) return null;

    return (
      <ScrollArea className="h-[calc(100vh-200px)] px-4">
        <div className="space-y-6 text-right">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-[#6E59A5]">סיכום המפגש</h3>
            <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{summaryDetails.summary_text}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-[#7E69AB]">מטרות שהושגו</h3>
            <div className="space-y-2">
              {summaryDetails.achieved_goals && summaryDetails.achieved_goals.map((goal: string, index: number) => (
                <div key={index} className="flex items-start gap-2 bg-green-50 p-3 rounded-lg border border-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">{goal}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-[#9b87f5]">מטרות להמשך</h3>
            <div className="space-y-2">
              {summaryDetails.future_goals && summaryDetails.future_goals.map((goal: string, index: number) => (
                <div key={index} className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <Calendar className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">{goal}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tools Used Section */}
          {summaryDetails.tools_used && summaryDetails.tools_used.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-[#8B5CF6]">כלים מנטליים שהשתמשנו במפגש</h3>
              <div className="space-y-2">
                {summaryDetails.tools_used.map((toolId: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 bg-purple-50 p-3 rounded-lg border border-purple-100">
                    <Wrench className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-700 font-medium">{toolsList[toolId]?.name || 'כלי לא זמין'}</p>
                      {toolsList[toolId]?.description && (
                        <p className="text-gray-500 text-sm mt-1">{toolsList[toolId].description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <h3 className="text-lg font-semibold mb-2 text-[#D6BCFA]">פוקוס למפגש הבא</h3>
            <p className="text-gray-700">{summaryDetails.next_session_focus}</p>
          </div>

          {summaryDetails.additional_notes && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-2 text-[#8B5CF6]">הערות נוספות</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{summaryDetails.additional_notes}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: he });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  const upcomingMeetingSection = () => {
    if (loading) return <SkeletonMeetingCard />;

    return (
      <Card className="col-span-2 bg-white shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            מפגש קרוב
          </CardTitle>
          <CardDescription>המפגש הקרוב ביותר שלך</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length > 0 ? (
            <div className="space-y-3">
              {upcomingSessions.slice(0, 2).map(session => (
                <div key={session.id} className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">{formatDate(session.session_date)}</h3>
                    <p className="text-xs text-gray-500">{session.session_time}</p>
                  </div>
                  <Badge variant="secondary">{session.meeting_type === 'in_person' ? 'פרונטלי' : 'זום'}</Badge>
                </div>
              ))}
              {upcomingSessions.length > 2 && (
                <Button variant="link" className="w-full justify-center">
                  טען עוד
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">אין מפגשים קרובים</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => navigate('/sessions-list')} className="w-full">
            לרשימת מפגשים מלאה
            <LayoutDashboard className="mr-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const quickActionsSection = () => {
    return (
      <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            פעולות מהירות
          </CardTitle>
          <CardDescription>גישה מהירה לפעולות נפוצות</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Button onClick={() => navigate('/new-session')} variant="outline">
            קבע מפגש
          </Button>
          <Button onClick={() => navigate('/new-player')} variant="outline">
            הוסף שחקן
          </Button>
          <Button onClick={() => navigate('/mental-tools')} variant="outline">
            כלי מנטלי
          </Button>
          <Button onClick={() => navigate('/daily-challenge')} variant="outline">
            אתגר יומי
          </Button>
        </CardContent>
      </Card>
    );
  };

  const completedGoalsSection = () => {
    if (loading) return <SkeletonGoalCard />;

    return (
      <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            מטרות שהושלמו
          </CardTitle>
          <CardDescription>סקירה של המטרות האחרונות שהושלמו</CardDescription>
        </CardHeader>
        <CardContent>
          {completedGoals.length > 0 ? (
            <div className="space-y-3">
              {completedGoals.slice(0, 3).map(goal => (
                <div key={goal.id} className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">{goal.title}</h3>
                    <p className="text-xs text-gray-500">{format(new Date(goal.created_at), 'dd/MM/yyyy', { locale: he })}</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              ))}
              {completedGoals.length > 3 && (
                <Button variant="link" className="w-full justify-center">
                  טען עוד
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">אין מטרות שהושלמו</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => navigate('/goals')} className="w-full">
            לניהול מטרות
            <LayoutDashboard className="mr-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const recentMeetingSection = () => {
    if (loading) return <SkeletonSummaryCard />;

    const renderSummaryCard = (summary: any) => {
      return (
        <Card key={summary.id} className="bg-white shadow-sm hover:shadow-md transition-all duration-200 mt-4">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <Badge
                className={`${summary.progress_rating >= 4 ? 'bg-green-100 text-green-800' : 
                  summary.progress_rating >= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}
              >
                דירוג התקדמות: {summary.progress_rating}/5
              </Badge>
              <CardTitle className="text-base">{summary.session?.player?.full_name}</CardTitle>
            </div>
            <CardDescription className="text-xs">
              {summary.session?.session_date ? format(new Date(summary.session.session_date), 'dd/MM/yyyy', { locale: he }) : 'תאריך לא ידוע'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-sm text-gray-600 line-clamp-2">{summary.summary_text}</p>
          </CardContent>
          <CardFooter className="pt-0 flex justify-between">
            <small className="text-gray-500">
              {format(new Date(summary.created_at), 'HH:mm dd/MM', { locale: he })}
            </small>
            <Button 
              size="sm" 
              variant="ghost" 
              className="flex items-center"
              onClick={() => handleViewSummary(summary.id)}
            >
              <Eye className="mr-1 h-4 w-4" />
              צפה בסיכום
            </Button>
          </CardFooter>
        </Card>
      );
    };

    return (
      <Card className="col-span-2 bg-white shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            סיכום מפגש אחרון
          </CardTitle>
          <CardDescription>סקירה של סיכומי המפגשים האחרונים</CardDescription>
        </CardHeader>
        <CardContent>
          {recentSummaries.length > 0 ? (
            <div className="space-y-3">
              {recentSummaries.map(renderSummaryCard)}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">אין סיכומי מפגשים</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => navigate('/all-meeting-summaries')} className="w-full">
            לכל הסיכומים
            <LayoutDashboard className="mr-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const SkeletonMeetingCard = () => (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle><Skeleton className="h-6 w-32" /></CardTitle>
        <CardDescription><Skeleton className="h-4 w-48" /></CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-8 w-full" />
      </CardFooter>
    </Card>
  );

  const SkeletonGoalCard = () => (
    <Card>
      <CardHeader>
        <CardTitle><Skeleton className="h-6 w-32" /></CardTitle>
        <CardDescription><Skeleton className="h-4 w-48" /></CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-8 w-full" />
      </CardFooter>
    </Card>
  );

  const SkeletonSummaryCard = () => (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle><Skeleton className="h-6 w-32" /></CardTitle>
        <CardDescription><Skeleton className="h-4 w-48" /></CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-24 w-full" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-8 w-full" />
      </CardFooter>
    </Card>
  );

  return (
    <div className="bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">דשבורד</h1>
            <p className="text-gray-500">סקירה מהירה של הפעילות שלך</p>
          </div>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              דשבורד
            </TabsTrigger>
            <TabsTrigger value="players" onClick={() => navigate('/players-list')} className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              שחקנים
            </TabsTrigger>
            <TabsTrigger value="sessions" onClick={() => navigate('/sessions-list')} className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              מפגשים
            </TabsTrigger>
            <TabsTrigger value="goals" onClick={() => navigate('/goals')} className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              מטרות
            </TabsTrigger>
            <TabsTrigger value="reports" onClick={() => navigate('/reports')} className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              דוחות
            </TabsTrigger>
            <TabsTrigger value="settings" onClick={() => navigate('/profile-coach')} className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              הגדרות
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingMeetingSection()}
              {quickActionsSection()}
              {completedGoalsSection()}
              {recentMeetingSection()}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Summary Dialog */}
      <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
        <DialogContent className="max-w-3xl max-h-screen">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between mb-4 text-right">
              <span className="text-[#6E59A5]">
                סיכום מפגש - {summaryDetails?.session?.player?.full_name || "שחקן לא ידוע"}
              </span>
              <span className="text-sm font-normal text-gray-500">
                {summaryDetails?.session?.session_date 
                  ? format(new Date(summaryDetails.session.session_date), 'dd/MM/yyyy', { locale: he }) 
                  : 'תאריך לא ידוע'}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          {loadingSummary ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            renderSummaryDetails()
          )}
          
          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <div className="text-gray-600 text-right w-full">
              דירוג התקדמות: <span className="font-semibold text-[#6E59A5]">{summaryDetails?.progress_rating}/5</span>
            </div>
            <Button variant="outline" onClick={() => setSummaryDialogOpen(false)}>סגור</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardCoach;
