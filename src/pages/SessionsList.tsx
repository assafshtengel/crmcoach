import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, Pencil, Trash2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SessionSummaryForm } from '@/components/session/SessionSummaryForm';

interface Session {
  id: string;
  session_date: string;
  session_time: string;
  notes: string;
  has_started: boolean;
  player: {
    full_name: string;
    id: string;
  };
}

// Define the raw type as it comes from Supabase
interface RawSession {
  id: string;
  session_date: string;
  session_time: string;
  notes: string;
  has_started: boolean;
  player: {
    full_name: string;
    id: string;
  };
}

const SessionsList = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [sessionToDelete, setSessionToDelete] = useState<{ id: string; playerName: string } | null>(null);
  const [activeTab, setActiveTab] = useState("table");
  const [summarySession, setSummarySession] = useState<Session | null>(null);
  const [showSummaryForm, setShowSummaryForm] = useState(false);

  useEffect(() => {
    fetchSessions();
    
    // Set up real-time subscription for session status changes
    const channel = supabase
      .channel('session-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'sessions'
      }, (payload) => {
        console.log('Session updated:', payload);
        fetchSessions(); // Refresh sessions when updates occur
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: sessionsData, error } = await supabase
        .from('sessions')
        .select(`
          id,
          session_date,
          session_time,
          notes,
          has_started,
          player:players!inner(id, full_name)
        `)
        .eq('coach_id', user.id);

      if (error) throw error;

      // Type assertion and transformation
      const rawSessions = sessionsData as unknown as RawSession[];
      const formattedSessions = rawSessions.map(session => ({
        id: session.id,
        session_date: session.session_date,
        session_time: session.session_time,
        notes: session.notes,
        has_started: session.has_started ?? false,
        player: {
          id: session.player.id,
          full_name: session.player.full_name
        }
      }));

      setSessions(formattedSessions);
    } catch (error: any) {
      toast.error('שגיאה בטעינת רשימת המפגשים');
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSession = (sessionId: string) => {
    navigate('/edit-session', { state: { sessionId } });
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
      setSessions(sessions.map(session => 
        session.id === summarySession.id 
          ? { ...session, has_started: true } 
          : session
      ));
      
      toast.success('סיכום המפגש נשמר בהצלחה');
      setShowSummaryForm(false);
      setSummarySession(null);
    } catch (error: any) {
      console.error('Error saving session summary:', error);
      toast.error('שגיאה בשמירת סיכום המפגש');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return;

    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionToDelete.id);

      if (error) throw error;

      setSessions(sessions.filter(session => session.id !== sessionToDelete.id));
      toast.success('המפגש נמחק בהצלחה');
      setSessionToDelete(null);
    } catch (error: any) {
      toast.error('שגיאה במחיקת המפגש');
      console.error('Error deleting session:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const upcomingSessions = sessions.filter(session => !session.has_started);
  const pastSessions = sessions.filter(session => session.has_started);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="w-full bg-[#1A1F2C] text-white py-6 mb-8 shadow-md">
        <div className="max-w-7xl mx-auto px-8">
          <h1 className="text-3xl font-bold">רשימת מפגשים</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
            title="חזרה לדף הראשי"
          >
            <Home className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => navigate('/new-session')}
            className="bg-primary hover:bg-primary/90"
          >
            קביעת מפגש חדש
          </Button>
        </div>

        <Tabs defaultValue="upcoming" className="w-full mb-6">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="upcoming">מפגשים קרובים ({upcomingSessions.length})</TabsTrigger>
            <TabsTrigger value="past">מפגשים לסיכום ({pastSessions.length})</TabsTrigger>
          </TabsList>
        
          <TabsContent value="upcoming">
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                לא נמצאו מפגשים קרובים במערכת
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full mb-6 grid grid-cols-2">
                  <TabsTrigger value="table">טבלה</TabsTrigger>
                  <TabsTrigger value="cards">כרטיסיות</TabsTrigger>
                </TabsList>
                
                <TabsContent value="table" className="w-full">
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>תאריך</TableHead>
                          <TableHead>שעה</TableHead>
                          <TableHead>שם השחקן</TableHead>
                          <TableHead>הערות</TableHead>
                          <TableHead>פעולות</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {upcomingSessions.map((session) => (
                          <TableRow key={session.id}>
                            <TableCell dir="ltr">{session.session_date}</TableCell>
                            <TableCell dir="ltr">{session.session_time}</TableCell>
                            <TableCell>{session.player.full_name}</TableCell>
                            <TableCell>{session.notes}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditSession(session.id)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSummarizeSession(session)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  סכם מפגש
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSessionToDelete({ 
                                    id: session.id, 
                                    playerName: session.player.full_name 
                                  })}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                
                <TabsContent value="cards" className="w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="text-right">
                            <h3 className="font-medium text-lg">{session.player.full_name}</h3>
                            <p className="text-sm text-gray-500">{session.session_date} • {session.session_time}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSession(session.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSessionToDelete({ 
                                id: session.id, 
                                playerName: session.player.full_name 
                              })}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {session.notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            <p className="line-clamp-2">{session.notes}</p>
                          </div>
                        )}
                        <div className="mt-3 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSummarizeSession(session)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            סכם מפגש
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </TabsContent>
        
          <TabsContent value="past">
            {pastSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                לא נמצאו מפגשים קודמים לסיכום במערכת
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full mb-6 grid grid-cols-2">
                  <TabsTrigger value="table">טבלה</TabsTrigger>
                  <TabsTrigger value="cards">כרטיסיות</TabsTrigger>
                </TabsList>
                
                <TabsContent value="table" className="w-full">
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>תאריך</TableHead>
                          <TableHead>שעה</TableHead>
                          <TableHead>שם השחקן</TableHead>
                          <TableHead>הערות</TableHead>
                          <TableHead>פעולות</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pastSessions.map((session) => (
                          <TableRow key={session.id}>
                            <TableCell dir="ltr">{session.session_date}</TableCell>
                            <TableCell dir="ltr">{session.session_time}</TableCell>
                            <TableCell>{session.player.full_name}</TableCell>
                            <TableCell>{session.notes}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSummarizeSession(session)}
                                >
                                  סכם מפגש
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                
                <TabsContent value="cards" className="w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pastSessions.map((session) => (
                      <div key={session.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 border-l-4 border-l-orange-500">
                        <div className="flex justify-between items-start mb-3">
                          <div className="text-right">
                            <h3 className="font-medium text-lg">{session.player.full_name}</h3>
                            <p className="text-sm text-gray-500">{session.session_date} • {session.session_time}</p>
                          </div>
                          <div className="flex">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSummarizeSession(session)}
                              className="text-orange-600 hover:text-orange-700"
                            >
                              סכם מפגש
                            </Button>
                          </div>
                        </div>
                        {session.notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            <p className="line-clamp-2">{session.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </TabsContent>
        </Tabs>

        <AlertDialog 
          open={!!sessionToDelete} 
          onOpenChange={() => setSessionToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
              <AlertDialogDescription>
                האם אתה בטוח שברצונך למחוק את המפגש עם {sessionToDelete?.playerName}?
                <br />
                פעולה זו לא ניתנת לביטול.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ביטול</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                מחק
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
    </div>
  );
};

export default SessionsList;
