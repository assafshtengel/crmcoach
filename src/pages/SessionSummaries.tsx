
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Clock, 
  MoreVertical, 
  Pencil, 
  Trash2,
  Calendar,
  CheckCircle2,
  FileText,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, isAfter, isSameDay } from 'date-fns';
import { he } from 'date-fns/locale';

const SessionSummaries = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionSummaries, setSessionSummaries] = useState({});

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        console.log("Fetching sessions for coach:", user.id);

        const { data: sessionsData, error } = await supabase
          .from('sessions')
          .select(`
            *,
            player:players(full_name)
          `)
          .eq('coach_id', user.id)
          .order('session_date', { ascending: false });

        if (error) {
          console.error('Error fetching sessions:', error);
          toast.error('שגיאה בטעינת רשימת המפגשים');
          return;
        }

        console.log("Sessions fetched:", sessionsData?.length || 0);

        // Fetch summary information for each session
        const summariesPromises = sessionsData.map(async (session) => {
          const { data, error } = await supabase
            .from('session_summaries')
            .select('*')
            .eq('session_id', session.id)
            .maybeSingle();

          if (!error && data) {
            return { [session.id]: data };
          }
          return { [session.id]: null };
        });

        const summariesResults = await Promise.all(summariesPromises);
        const summariesMap = summariesResults.reduce((acc, curr) => {
          return { ...acc, ...curr };
        }, {});

        setSessions(sessionsData || []);
        setSessionSummaries(summariesMap);
      } catch (error) {
        console.error('Error in fetchSessions:', error);
        toast.error('שגיאה בטעינת המפגשים');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [navigate]);

  const handleDelete = async () => {
    if (!selectedSession) return;

    try {
      // Delete any summaries first
      const { error: summaryError } = await supabase
        .from('session_summaries')
        .delete()
        .eq('session_id', selectedSession.id);

      if (summaryError) {
        console.error('Error deleting session summary:', summaryError);
      }

      // Then delete the session
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', selectedSession.id);

      if (error) throw error;

      setSessions(prevSessions => 
        prevSessions.filter(session => session.id !== selectedSession.id)
      );
      toast.success('המפגש נמחק בהצלחה');
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('שגיאה במחיקת המפגש');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedSession(null);
    }
  };

  const handleEdit = (session) => {
    navigate('/edit-session', { state: { sessionId: session.id } });
  };

  const handleAddSummary = (session) => {
    navigate('/edit-session', { 
      state: { 
        sessionId: session.id, 
        needsSummary: true,
        forceEnable: isAfter(new Date(), parseISO(session.session_date)) || isSameDay(new Date(), parseISO(session.session_date))
      } 
    });
  };

  const handleViewSummary = (session) => {
    navigate('/edit-session', { 
      state: { 
        sessionId: session.id, 
        needsSummary: true 
      } 
    });
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: he });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  const isSessionPast = (dateString) => {
    const sessionDate = parseISO(dateString);
    return isAfter(new Date(), sessionDate);
  };

  const getSessionStatus = (session) => {
    const isPast = isSessionPast(session.session_date);
    const hasSummary = sessionSummaries[session.id] !== null;
    
    if (isPast && hasSummary) return "completed";
    if (isPast) return "past";
    return "upcoming";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">רשימת מפגשים</h1>
        <Button onClick={() => navigate('/new-session')} className="bg-green-600 hover:bg-green-700">
          קבע מפגש חדש
        </Button>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-xl font-medium text-gray-500 mb-2">אין מפגשים</p>
            <p className="text-gray-400 mb-6">לא נמצאו מפגשים קיימים</p>
            <Button onClick={() => navigate('/new-session')}>
              קבע מפגש חדש
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {sessions.map((session) => {
            const status = getSessionStatus(session);
            const isPast = status === 'past' || status === 'completed';
            const hasSummary = sessionSummaries[session.id] !== null;
            
            return (
              <Card key={session.id} className="overflow-hidden">
                <div className={`h-2 w-full ${status === 'completed' ? 'bg-green-500' : status === 'past' ? 'bg-orange-400' : 'bg-blue-500'}`}></div>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                      <div className="bg-gray-100 p-3 rounded-full">
                        <Clock className="h-6 w-6 text-gray-700" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{formatDate(session.session_date)}</h3>
                        <p className="text-gray-500">{session.session_time}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs font-normal">
                            {session.player.full_name}
                          </Badge>
                          <Badge variant="outline" className="text-xs font-normal">
                            {session.meeting_type === 'in_person' ? 'פגישה פרונטלית' : 'פגישת זום'}
                          </Badge>
                        </div>
                        {session.location && (
                          <p className="text-sm text-gray-600 mt-2">
                            מיקום: {session.location}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                      {status === 'completed' ? (
                        <Badge className="bg-green-500">הושלם</Badge>
                      ) : status === 'past' ? (
                        <Badge variant="outline" className="border-orange-400 text-orange-600">
                          מפגש עבר
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-blue-400 text-blue-600">
                          מתוכנן
                        </Badge>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(session)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            ערוך פרטים
                          </DropdownMenuItem>
                          {isPast && !hasSummary && (
                            <DropdownMenuItem onClick={() => handleAddSummary(session)}>
                              <FileText className="mr-2 h-4 w-4" />
                              הוסף סיכום
                            </DropdownMenuItem>
                          )}
                          {hasSummary && (
                            <DropdownMenuItem onClick={() => handleViewSummary(session)}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              צפה בסיכום
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setSelectedSession(session);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            מחק
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {session.notes && (
                    <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                      <p className="text-gray-600 whitespace-pre-line">{session.notes}</p>
                    </div>
                  )}
                  
                  {isPast && !hasSummary && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="outline"
                        className="text-primary"
                        onClick={() => handleAddSummary(session)}
                      >
                        הוסף סיכום
                        <ArrowRight className="mr-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>מחיקת מפגש</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך למחוק את המפגש הזה? פעולה זו אינה ניתנת לביטול.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              ביטול
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              מחק
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SessionSummaries;
