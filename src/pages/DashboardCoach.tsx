
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, Settings, Bell, PieChart, UserPlus, CalendarPlus, Users, Calendar, BarChart2, Loader2, Send, Check, LogOut, ChevronDown, ChevronUp, Share2, FileEdit, Clock, AlertCircle, FileText, Eye, Plus, Target, ClipboardCheck, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format, startOfMonth, endOfMonth, subMonths, isBefore, isAfter, isSameDay, isPast, formatDistance } from 'date-fns';
import { he } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SessionSummaryForm } from "@/components/session/SessionSummaryForm";
import { Calendar as CalendarComponent } from '@/components/calendar/Calendar';
import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tool } from '@/types/tool';
import AllMeetingSummaries from './AllMeetingSummaries';
import { SessionFormDialog } from '@/components/sessions/SessionFormDialog';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Film } from 'lucide-react';
import { AdminMessageForm } from '@/components/admin/AdminMessageForm';

const DashboardCoach = () => {
  const navigate = useNavigate();
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isNotificationsDialogOpen, setIsNotificationsDialogOpen] = useState(false);
  const [isSessionSummaryDialogOpen, setIsSessionSummaryDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [coach, setCoach] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Replace all those individual collapsible state variables with a single object
  const [collapsibleStates, setCollapsibleStates] = useState<Record<string, boolean>>({});
  
  // Helper function to toggle collapsible state
  const toggleCollapsible = (id: string) => {
    setCollapsibleStates(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) {
          throw userError;
        }

        if (userData?.user) {
          setUser(userData.user);

          const { data: coachData, error: coachError } = await supabase
            .from('coaches')
            .select('*')
            .eq('user_id', userData.user.id)
            .single();

          if (coachError) {
            throw coachError;
          }

          if (coachData) {
            setCoach(coachData);

            const { data: playersData, error: playersError } = await supabase
              .from('players')
              .select('*')
              .eq('coach_id', coachData.id);

            if (playersError) {
              throw playersError;
            }

            if (playersData) {
              setPlayers(playersData);
            }

            const { data: toolsData, error: toolsError } = await supabase
              .from('tools')
              .select('*')
              .eq('coach_id', coachData.id);

            if (toolsError) {
              throw toolsError;
            }

            if (toolsData) {
              setTools(toolsData);
            }

            const { data: meetingsData, error: meetingsError } = await supabase
              .from('meetings')
              .select('*')
              .eq('coach_id', coachData.id);

            if (meetingsError) {
              throw meetingsError;
            }

            if (meetingsData) {
              setMeetings(meetingsData);
            }
          }
        }
      } catch (error: any) {
        console.error("Error fetching data:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const { toast } = useToast();

  const handleLogout = () => {
    setIsAlertDialogOpen(true);
  };

  const confirmLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Failed to log out",
        description: "Please try again.",
        variant: "destructive",
      });
    } else {
      navigate('/login');
      toast({
        title: "Logged out successfully",
        description: "See you soon!",
      });
    }
    setIsAlertDialogOpen(false);
  };

  const cancelLogout = () => {
    setIsAlertDialogOpen(false);
  };

  const filteredMeetings = meetings.filter((meeting: any) => {
    return isSameDay(new Date(meeting.date), selectedDate);
  });

  const pastMeetings = meetings.filter((meeting: any) => {
    return isBefore(new Date(meeting.date), new Date());
  });

  const upcomingMeetings = meetings.filter((meeting: any) => {
    return isAfter(new Date(meeting.date), new Date());
  });

  const todayMeetings = meetings.filter((meeting: any) => {
    return isSameDay(new Date(meeting.date), new Date());
  });

  const handleSessionSummary = (session: any) => {
    setSelectedSession(session);
    setIsSessionSummaryDialogOpen(true);
  };

  const closeSessionSummaryDialog = () => {
    setIsSessionSummaryDialogOpen(false);
    setSelectedSession(null);
  };

  const data = [
    { name: 'Jan', uv: 4000, pv: 2400, amt: 2400 },
    { name: 'Feb', uv: 3000, pv: 1398, amt: 2210 },
    { name: 'Mar', uv: 2000, pv: 9800, amt: 2290 },
    { name: 'Apr', uv: 2780, pv: 3908, amt: 2000 },
    { name: 'May', uv: 1890, pv: 4800, amt: 2181 },
    { name: 'Jun', uv: 2390, pv: 3800, amt: 2500 },
    { name: 'Jul', uv: 3490, pv: 4300, amt: 2100 },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-4">
          <Card className="w-full md:w-64 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer" onClick={() => navigate('/profile')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Home className="h-5 w-5 text-blue-600" />
                בית
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                סקירה כללית של הפעילות שלך
              </p>
              <Button variant="outline" size="sm" className="w-full border-blue-200 text-blue-700 hover:bg-blue-200">
                עבור לבית
              </Button>
            </CardContent>
          </Card>

          <Card className="w-full md:w-64 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer" onClick={() => navigate('/settings')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="h-5 w-5 text-green-600" />
                הגדרות
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                הגדרות אישיות וניהול חשבון
              </p>
              <Button variant="outline" size="sm" className="w-full border-green-200 text-green-700 hover:bg-green-200">
                עבור להגדרות
              </Button>
            </CardContent>
          </Card>

          <Card className="w-full md:w-64 bg-yellow-50 hover:bg-yellow-100 transition-colors cursor-pointer" onClick={() => navigate('/notifications')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-yellow-600" />
                התראות
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                התראות ועדכונים חשובים
              </p>
              <Button variant="outline" size="sm" className="w-full border-yellow-200 text-yellow-700 hover:bg-yellow-200">
                עבור להתראות
              </Button>
            </CardContent>
          </Card>

          <Card className="w-full md:w-64 bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer" onClick={() => navigate('/statistics')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-600" />
                סטטיסטיקות
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                נתונים וסטטיסטיקות על הפעילות שלך
              </p>
              <Button variant="outline" size="sm" className="w-full border-purple-200 text-purple-700 hover:bg-purple-200">
                עבור לסטטיסטיקות
              </Button>
            </CardContent>
          </Card>
          
          {/* Mental Library Card - ONLY NEW ADDITION */}
          <Card className="w-full md:w-64 bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer" onClick={() => navigate('/mental-library')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-orange-600" />
                הספרייה המנטאלית
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                ספרים מומלצים לשיפור יכולות מנטליות בספורט
              </p>
              <Button variant="outline" size="sm" className="w-full border-orange-200 text-orange-700 hover:bg-orange-200">
                גישה לספרייה
              </Button>
            </CardContent>
          </Card>
          
          <Card className="w-full md:w-64 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => navigate('/all-meeting-summaries')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                סיכומי פגישות
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                ארכיון של סיכומי פגישות קודמות
              </p>
              <Button variant="outline" size="sm" className="w-full border-gray-200 text-gray-700 hover:bg-gray-200">
                עבור לסיכומים
              </Button>
            </CardContent>
          </Card>

          <Card className="w-full md:w-64 bg-teal-50 hover:bg-teal-100 transition-colors cursor-pointer" onClick={() => navigate('/admin-messages')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Send className="h-5 w-5 text-teal-600" />
                הודעות מנהל
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                הודעות חשובות מצוות הניהול
              </p>
              <Button variant="outline" size="sm" className="w-full border-teal-200 text-teal-700 hover:bg-teal-200">
                עבור להודעות
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar">לוח שנה</TabsTrigger>
            <TabsTrigger value="meetings">פגישות</TabsTrigger>
          </TabsList>
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>לוח שנה</CardTitle>
                <CardContent>
                  <CalendarComponent />
                </CardContent>
              </CardHeader>
            </Card>
          </TabsContent>
          <TabsContent value="meetings">
            <Card>
              <CardHeader>
                <CardTitle>פגישות להיום</CardTitle>
              </CardHeader>
              <CardContent>
                {todayMeetings.length === 0 ? (
                  <p>אין פגישות להיום.</p>
                ) : (
                  <ul>
                    {todayMeetings.map((meeting: any) => (
                      <li key={meeting.id} className="flex items-center justify-between py-2">
                        <span>{meeting.title}</span>
                        <span>{format(new Date(meeting.date), "HH:mm")}</span>
                        <Button size="sm" onClick={() => handleSessionSummary(meeting)}>סיכום</Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Dialog open={isSessionSummaryDialogOpen} onOpenChange={setIsSessionSummaryDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>סיכום פגישה</DialogTitle>
            </DialogHeader>
            <SessionSummaryForm sessionId={selectedSession?.id} onClose={closeSessionSummaryDialog} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DashboardCoach;
