import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, Settings, Bell, PieChart, UserPlus, CalendarPlus, Users, Calendar, BarChart2, Loader2, Send, Check, LogOut, ChevronDown, ChevronUp, Share2, FileEdit, Clock, AlertCircle, FileText, Eye, Plus, Target, ClipboardCheck, BookOpen, Trophy, Menu } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
import { LandingPageDialog } from "@/components/landing-page/LandingPageDialog";
import { ClipboardList} from 'lucide-react';

const DashboardCoach = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [coach, setCoach] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [is কূপModalOpen, setIsKupModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isSessionSummaryOpen, setIsSessionSummaryOpen] = useState(false);
  const [isAllMeetingSummariesOpen, setIsAllMeetingSummariesOpen] = useState(false);
  const [isSessionFormDialogOpen, setIsSessionFormDialogOpen] = useState(false);
  const [isLandingPageDialogOpen, setIsLandingPageDialogOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  const [isMessageFormOpen, setIsMessageFormOpen] = useState(false);

  useEffect(() => {
    fetchCoachData();
    fetchSessions();
    fetchTools();
  }, []);

  const fetchCoachData = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: coachData, error } = await supabase
        .from('coaches')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error("Error fetching coach data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch coach data.",
          variant: "destructive",
        });
      } else {
        setCoach(coachData);
      }
    }
  };

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching sessions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch sessions.",
        variant: "destructive",
      });
    } else {
      setSessions(data);
    }
  };

  const fetchTools = async () => {
    const { data, error } = await supabase
      .from('tools')
      .select('*');

    if (error) {
      console.error("Error fetching tools:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tools.",
        variant: "destructive",
      });
    } else {
      setTools(data);
    }
  };

  const handleSessionClick = (session: any) => {
    setSelectedSession(session);
    setIsSessionSummaryOpen(true);
  };

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
  };

  const onEventClick = (selectedEvent: any) => {
    setSelectedEvent(selectedEvent);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            שלום {coach?.first_name} {coach?.last_name}
          </h1>
          <div className="space-x-2">
            <Button onClick={() => setIsLandingPageDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              עריכת דף נחיתה
            </Button>
            <Button onClick={() => setIsMessageFormOpen(true)}>
              <Send className="h-4 w-4 mr-2" />
              הודעה למשתמשים
            </Button>
            <Button onClick={() => setIsSessionFormDialogOpen(true)}>
              <CalendarPlus className="h-4 w-4 mr-2" />
              הוספת מפגש
            </Button>
            <Button variant="secondary" onClick={() => supabase.auth.signOut()}>
              <LogOut className="h-4 w-4 mr-2" />
              התנתק
            </Button>
          </div>
        </div>

        <LandingPageDialog open={isLandingPageDialogOpen} setOpen={setIsLandingPageDialogOpen} />

        <AdminMessageForm open={isMessageFormOpen} setOpen={setIsMessageFormOpen} />

        <SessionFormDialog open={isSessionFormDialogOpen} setOpen={setIsSessionFormDialogOpen} refetchSessions={fetchSessions} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          <Card className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#4CAF50] cursor-pointer" onClick={() => setIsAllMeetingSummariesOpen(true)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">סיכומי מפגשים</CardTitle>
              <FileText className="h-5 w-5 text-[#4CAF50]" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-3">צפייה וניהול של כל סיכומי המפגשים שלך</p>
              <Button variant="default" className="w-full bg-[#4CAF50] hover:bg-[#388E3C]">
                <FileText className="h-4 w-4 mr-2" />
                צפייה בסיכומי מפגשים
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#2196F3] cursor-pointer" onClick={() => navigate('/coach-management')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">ניהול מאמנים</CardTitle>
              <Users className="h-5 w-5 text-[#2196F3]" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-3">הוספה, עריכה ומחיקה של מאמנים במערכת</p>
              <Button variant="default" className="w-full bg-[#2196F3] hover:bg-[#1976D2]">
                <Users className="h-4 w-4 mr-2" />
                ניהול מאמנים
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#FF9800] cursor-pointer" onClick={() => navigate('/user-management')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">ניהול משתמשים</CardTitle>
              <UserPlus className="h-5 w-5 text-[#FF9800]" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-3">הוספה, עריכה ומחיקה של משתמשים במערכת</p>
              <Button variant="default" className="w-full bg-[#FF9800] hover:bg-[#F57C00]">
                <UserPlus className="h-4 w-4 mr-2" />
                ניהול משתמשים
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#9C27B0] cursor-pointer" onClick={() => window.open('https://hebrew-performance-review.lovable.app/', '_self')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">איבחון במשחק</CardTitle>
              <ClipboardCheck className="h-5 w-5 text-[#9C27B0]" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-3">איבחון התנהגות שחקן במהלך משחק</p>
              <Button variant="default" className="w-full bg-[#9C27B0] hover:bg-[#7B1FA2]">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                מלא איבחון משחק
              </Button>
            </CardContent>
          </Card>

          {tools.map((tool) => (
            <Card key={tool.id} className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#673AB7] cursor-pointer" onClick={() => window.open(tool.url, '_blank')}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{tool.name}</CardTitle>
                <Wrench className="h-5 w-5 text-[#673AB7]" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-3">{tool.description}</p>
                <Button variant="default" className="w-full bg-[#673AB7] hover:bg-[#512DA8]">
                  <Wrench className="h-4 w-4 mr-2" />
                  השתמש בכלי
                </Button>
              </CardContent>
            </Card>
          ))}

          <Card className="col-span-1 md:col-span-2 lg:col-span-3 bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle>לוח שנה</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <CalendarComponent
                events={events}
                onMonthChange={handleMonthChange}
                onEventClick={onEventClick}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <AllMeetingSummaries open={isAllMeetingSummariesOpen} setOpen={setIsAllMeetingSummariesOpen} sessions={sessions} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div>
              <p>Date: {format(new Date(selectedEvent.start), 'dd/MM/yyyy')}</p>
              {/* Add more details here as needed */}
            </div>
          )}
          <Button onClick={() => setIsDialogOpen(false)}>סגור</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isSessionSummaryOpen} onOpenChange={setIsSessionSummaryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>סיכום מפגש</DialogTitle>
          </DialogHeader>
          <SessionSummaryForm session={selectedSession} onClose={() => setIsSessionSummaryOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardCoach;
