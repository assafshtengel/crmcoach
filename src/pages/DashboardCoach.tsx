import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, Settings, Bell, PieChart, UserPlus, CalendarPlus, Users, Calendar, BarChart2, Loader2, Send, Check, LogOut, ChevronDown, ChevronUp, Share2, FileEdit, Clock, AlertCircle, FileText, Eye, Plus } from 'lucide-react';
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

interface UpcomingSession {
  id: string;
  session_date: string;
  session_time: string;
  location: string;
  player_name: string;
  player_id: string;
}

interface Player {
  id: string;
  full_name: string;
}

interface Coach {
  id: string;
  full_name: string;
  email: string;
}

const DashboardCoach: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [open, setOpen] = React.useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tools, setTools] = useState<Tool[]>([]);
  const [showAllSummaries, setShowAllSummaries] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [monthlySessions, setMonthlySessions] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isClockOpen, setIsClockOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isFileOpen, setIsFileOpen] = useState(false);
  const [isEyeOpen, setIsEyeOpen] = useState(false);
  const [isPlusOpen, setIsPlusOpen] = useState(false);
  const [isWrenchOpen, setIsWrenchOpen] = useState(false);
  const [isToolOpen, setIsToolOpen] = useState(false);
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const [isPlayerProfileOpen, setIsPlayerProfileOpen] = useState(false);

  useEffect(() => {
    const fetchCoachData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: coachData, error } = await supabase
            .from('coaches')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error("Error fetching coach data:", error);
            toast({
              title: "Error!",
              description: "Failed to retrieve coach data.",
            });
          }

          if (coachData) {
            setCoach({
              id: coachData.id,
              full_name: coachData.full_name,
              email: coachData.email,
            });
          }
        } else {
          navigate('/auth');
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast({
          title: "Unexpected Error!",
          description: "An unexpected error occurred.",
        });
      }
    };

    fetchCoachData();
  }, [navigate, toast]);

  useEffect(() => {
    const fetchUpcomingSessions = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from('sessions')
            .select('*, players(full_name)')
            .eq('coach_id', user.id)
            .gte('session_date', format(new Date(), 'yyyy-MM-dd'))
            .order('session_date', { ascending: true });

          if (error) {
            console.error("Error fetching upcoming sessions:", error);
            toast({
              title: "Error!",
              description: "Failed to retrieve upcoming sessions.",
            });
          }

          if (data) {
            const sessionsWithPlayerName = data.map(session => ({
              id: session.id,
              session_date: session.session_date,
              session_time: session.session_time,
              location: session.location,
              player_name: (session.players as any)?.full_name || 'Unknown Player',
              player_id: session.player_id,
            }));
            setUpcomingSessions(sessionsWithPlayerName);
          }
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast({
          title: "Unexpected Error!",
          description: "An unexpected error occurred while fetching sessions.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingSessions();
  }, [toast]);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('tools')
            .select('*')
            .eq('coach_id', user.id);

          if (error) {
            console.error("Error fetching tools:", error);
            toast({
              title: "Error!",
              description: "Failed to retrieve tools.",
            });
          }

          if (data) {
            setTools(data);
          }
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast({
          title: "Unexpected Error!",
          description: "An unexpected error occurred while fetching tools.",
        });
      }
    };

    fetchTools();
  }, [toast]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq('coach_id', user.id);

          if (error) {
            console.error("Error fetching players:", error);
            toast({
              title: "Error!",
              description: "Failed to retrieve players.",
            });
          }

          if (data) {
            setPlayers(data);
          }
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast({
          title: "Unexpected Error!",
          description: "An unexpected error occurred while fetching players.",
        });
      }
    };

    fetchPlayers();
  }, [toast]);

  useEffect(() => {
    const fetchMonthlySessions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const start = startOfMonth(selectedDate);
          const end = endOfMonth(selectedDate);

          const { data, error } = await supabase
            .from('sessions')
            .select('session_date')
            .eq('coach_id', user.id)
            .gte('session_date', format(start, 'yyyy-MM-dd'))
            .lte('session_date', format(end, 'yyyy-MM-dd'));

          if (error) {
            console.error("Error fetching monthly sessions:", error);
            toast({
              title: "Error!",
              description: "Failed to retrieve monthly sessions.",
            });
          }

          if (data) {
            setMonthlySessions(data);
          }
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast({
          title: "Unexpected Error!",
          description: "An unexpected error occurred while fetching monthly sessions.",
        });
      }
    };

    fetchMonthlySessions();
  }, [selectedDate, toast]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };

  const handleMonthChange = (newDate: Date) => {
    setSelectedDate(newDate);
  };

  const handlePrevMonth = () => {
    handleMonthChange(subMonths(selectedDate, 1));
  };

  const handleNextMonth = () => {
    handleMonthChange(subMonths(selectedDate, -1));
  };

  const handleSessionDelete = async (sessionId: string) => {
    setIsAlertDialogOpen(true);

    const confirmDelete = async () => {
      try {
        const { error } = await supabase
          .from('sessions')
          .delete()
          .eq('id', sessionId);

        if (error) {
          console.error("Error deleting session:", error);
          toast({
            title: "Error!",
            description: "Failed to delete the session.",
          });
        } else {
          toast({
            title: "Success!",
            description: "Session deleted successfully.",
          });
          setUpcomingSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId));
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast({
          title: "Unexpected Error!",
          description: "An unexpected error occurred while deleting the session.",
        });
      } finally {
        setIsAlertDialogOpen(false);
      }
    };

    const cancelDelete = () => {
      setIsAlertDialogOpen(false);
    };

    return { confirmDelete, cancelDelete };
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout failed:", error);
        toast({
          title: "Error!",
          description: "Logout failed. Please try again.",
        });
      } else {
        navigate('/auth');
      }
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      toast({
        title: "Unexpected Error!",
        description: "An unexpected error occurred during logout.",
      });
    }
  };

  const renderDateHeader = () => {
    return (
      <div className="flex items-center justify-between p-4">
        <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
          <ChevronLeftIcon className="h-5 w-5" />
        </Button>
        <div className="flex flex-col items-center space-y-1">
          <div className="font-semibold">
            {format(selectedDate, 'MMMM', { locale: he })} {format(selectedDate, 'yyyy')}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleNextMonth}>
          <ChevronRightIcon className="h-5 w-5" />
        </Button>
      </div>
    );
  };

  const ChevronLeftIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );

  const ChevronRightIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );

  const data = [
    { name: 'כלי 1', value: 400 },
    { name: 'כלי 2', value: 300 },
    { name: 'כלי 3', value: 200 },
    { name: 'כלי 4', value: 500 },
    { name: 'כלי 5', value: 700 },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default">הוספת מפגש חדש</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>הוספת מפגש חדש</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו בלתי הפיכה. האם אתה בטוח שברצונך למחוק מפגש זה?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertDialogOpen(false)}>
              ביטול
            </AlertDialogCancel>
            <AlertDialogAction>מחק</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="container mx-auto py-12 px-4">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            שלום {coach?.full_name}
          </h1>

          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Users className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="absolute right-0 mt-2 w-40">
              <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/profile-coach'); setIsDropdownOpen(false); }}>
                <UserPlus className="mr-2 h-4 w-4" />
                פרופיל
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/signup-coach'); setIsDropdownOpen(false); }}>
                <Settings className="mr-2 h-4 w-4" />
                הגדרות
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                התנתקות
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Tabs defaultValue="analytics" className="w-full space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics" className="text-sm">סטטיסטיקות</TabsTrigger>
            <TabsTrigger value="sessions" className="text-sm">מפגשים</TabsTrigger>
            <TabsTrigger value="tools" className="text-sm">כלים</TabsTrigger>
            <TabsTrigger value="management" className="text-sm">ניהול</TabsTrigger>
          </TabsList>
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="col-span-1 md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <PieChart className="size-5" />
                    ביצועי שחקנים
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="col-span-1 md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <BarChart2 className="size-5" />
                    התפלגות כלים
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Calendar Card */}
              <Card className="col-span-1 md:col-span-1 overflow-hidden">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Calendar className="size-5" />
                    לוח שנה
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
                    {isCalendarOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {isCalendarOpen && (
                    <div className="border rounded-md p-2">
                      {renderDateHeader()}
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) => isBefore(date, subMonths(new Date(), 1)) || isAfter(date, subMonths(new Date(), 1))}
                        initialFocus
                      />
                    </div>
                  )}
                  <div className="flex space-x-2 sm:space-x-4">
                    <Button variant="outline" onClick={() => navigate('/all-meeting-summaries')}>
                      סיכום פגישות
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Sessions Card */}
              <Card className="col-span-1 md:col-span-2 overflow-hidden">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Calendar className="size-5" />
                    מפגשים קרובים
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/new-session')}
                      className="flex items-center gap-1"
                    >
                      <Plus className="size-4" />
                      הוסף מפגש
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  <ScrollArea className="h-[300px] w-full rounded-md border">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : upcomingSessions.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {upcomingSessions.map((session) => (
                          <div key={session.id} className="py-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <Link to={`/dashboard/player-profile/${session.player_id}`} className="font-medium hover:underline">
                                  {session.player_name}
                                </Link>
                                <p className="text-gray-500">
                                  {format(new Date(session.session_date), 'dd/MM/yyyy')} - {session.session_time}
                                </p>
                                <p className="text-gray-500">{session.location}</p>
                              </div>
                              <div className="flex space-x-2">
                                <Button variant="secondary" size="icon" onClick={() => navigate(`/edit-session?sessionId=${session.id}`)}>
                                  <FileEdit className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => {
                                  const { confirmDelete } = handleSessionDelete(session.id);
                                  confirmDelete();
                                }}>
                                  <AlertCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">אין מפגשים קרובים.</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tools.map((tool) => (
                <Card key={tool.id} className="col-span-1">
                  <CardHeader>
                    <CardTitle className="text-xl">{tool.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{tool.description}</p>
                    <Button variant="outline" onClick={() => window.open(tool.link, '_blank')}>
                      עבור לכלי
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="management" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Users className="size-5" />
                    ניהול שחקנים
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>הוספה, עריכה ומחיקה של שחקנים.</p>
                  <Button onClick={() => navigate('/players-list')}>
                    עבור לניהול שחקנים
                  </Button>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Wrench className="size-5" />
                    ניהול כלים
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>הוספה, עריכה ומחיקה של כלים.</p>
                  <Button onClick={() => navigate('/tool-management')}>
                    עבור לניהול כלים
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <SessionFormDialog open={open} onOpenChange={setOpen} />
    </div>
  );
};

export default DashboardCoach;
