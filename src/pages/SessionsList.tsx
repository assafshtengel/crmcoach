
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

interface Session {
  id: string;
  session_date: string;
  session_time: string;
  notes: string;
  player: {
    full_name: string;
  };
}

// Define the raw type as it comes from Supabase
interface RawSession {
  id: string;
  session_date: string;
  session_time: string;
  notes: string;
  player: {
    full_name: string;
  };
}

const SessionsList = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [sessionToDelete, setSessionToDelete] = useState<{ id: string; playerName: string } | null>(null);
  const [activeTab, setActiveTab] = useState("table");

  useEffect(() => {
    fetchSessions();
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
          player:players!inner(full_name)
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
        player: {
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

        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            לא נמצאו מפגשים במערכת
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
                    {sessions.map((session) => (
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
                {sessions.map((session) => (
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
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

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
      </div>
    </div>
  );
};

export default SessionsList;
