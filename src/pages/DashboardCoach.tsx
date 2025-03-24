import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, Settings, Bell, PieChart, UserPlus, CalendarPlus, Users, Calendar, BarChart2, Loader2, Send, Check, LogOut, ChevronDown, ChevronUp, Share2, FileEdit, Clock, AlertCircle, FileText, Eye, Plus, Target, ClipboardCheck, BookOpen, Trophy } from 'lucide-react';
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
import { ClipboardList } from 'lucide-react';

const DashboardCoach = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ upcomingSessions: 0 });
  const [upcomingSessions, setUpcomingSessions] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase
        .from('stats')
        .select('upcomingSessions')
        .single();
      if (!error) {
        setStats(data);
      }
    };

    const fetchUpcomingSessions = async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('status', 'upcoming')
        .order('session_date', { ascending: true });
      if (!error) {
        setUpcomingSessions(data);
      }
    };

    fetchStats();
    fetchUpcomingSessions();
  }, []);

  return (
    <div className="flex flex-col space-y-4">
      <Card className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#3498DB]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">מפגשים קרובים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-[#3498DB]" />
              <div className="text-3xl font-bold text-[#2C3E50]">{stats.upcomingSessions}</div>
              <p className="text-sm text-gray-500">בשבוע הקרוב ({stats.upcomingSessions} מפגשים)</p>
            </div>
            
            <Button variant="outline" size="sm" className="flex items-center gap-1 text-[#3498DB] border-[#3498DB] hover:bg-[#3498DB]/10" onClick={() => navigate('/new-session')}>
              <Plus className="h-4 w-4" />
              הוסף מפגש
            </Button>
          </div>
          
          {upcomingSessions.length > 0 && <Collapsible className="mt-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full flex items-center justify-center text-[#3498DB]">
                  הצג רשימת מפגשים
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-2 mt-2 max-h-[200px] overflow-y-auto pr-1">
                  {upcomingSessions.map(session => <div key={session.id} className="p-2 rounded-md bg-gray-50 flex justify-between items-center text-sm hover:bg-gray-100 cursor-pointer" onClick={() => navigate('/edit-session', {
                    state: {
                      sessionId: session.id
                    }
                  })}>
                          <div>
                            <p className="font-medium">{session.player.full_name}</p>
                            <p className="text-gray-500 text-xs">{session.session_date} | {session.session_time}</p>
                          </div>
                          <div className="flex items-center">
                            {session.location && <span className="text-xs text-gray-500 ml-2">{session.location}</span>}
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>)}
                </div>
              </CollapsibleContent>
            </Collapsible>}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCoach;
