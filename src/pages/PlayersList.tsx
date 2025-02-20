
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, Pencil, Trash2, Loader2 } from 'lucide-react';
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

interface Player {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  notes?: string;
}

const positionLabels: Record<string, string> = {
  goalkeeper: "שוער",
  defender: "בלם",
  fullback: "מגן",
  midfielder: "קשר",
  winger: "כנף",
  striker: "חלוץ"
};

const PlayersList = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [playerToDelete, setPlayerToDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      console.log('Fetching players for coach:', user.id); // הוספת לוג לדיבוג

      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('coach_id', user.id);

      if (error) {
        console.error('Error details:', error); // הוספת לוג לדיבוג
        throw error;
      }

      console.log('Players fetched:', data); // הוספת לוג לדיבוג
      setPlayers(data || []);
    } catch (error: any) {
      console.error('Full error details:', error); // הוספת לוג לדיבוג
      toast.error('שגיאה בטעינת רשימת השחקנים');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSession = (playerId: string, playerName: string) => {
    navigate('/new-session', { 
      state: { 
        selectedPlayerId: playerId,
        selectedPlayerName: playerName 
      } 
    });
  };

  const handleEditPlayer = (playerId: string) => {
    navigate('/edit-player', { state: { playerId } });
  };

  const handleDeleteConfirm = async () => {
    if (!playerToDelete) return;

    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerToDelete.id);

      if (error) throw error;

      setPlayers(players.filter(player => player.id !== playerToDelete.id));
      toast.success('השחקן נמחק בהצלחה');
      setPlayerToDelete(null);
    } catch (error: any) {
      toast.error('שגיאה במחיקת השחקן');
      console.error('Error deleting player:', error);
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
      {/* Header */}
      <header className="w-full bg-[#1A1F2C] text-white py-6 mb-8 shadow-md">
        <div className="max-w-7xl mx-auto px-8">
          <h1 className="text-3xl font-bold">רשימת שחקנים</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/')}
              title="חזרה לדף הראשי"
            >
              <Home className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={() => navigate('/new-player')}
            className="bg-primary hover:bg-primary/90"
          >
            הוספת שחקן חדש
          </Button>
        </div>

        {players.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            לא נמצאו שחקנים במערכת
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>שם השחקן</TableHead>
                  <TableHead>עמדה</TableHead>
                  <TableHead>אימייל</TableHead>
                  <TableHead>טלפון</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">{player.full_name}</TableCell>
                    <TableCell>{positionLabels[player.position] || player.position}</TableCell>
                    <TableCell dir="ltr">{player.email}</TableCell>
                    <TableCell dir="ltr">{player.phone}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPlayer(player.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleScheduleSession(player.id, player.full_name)}
                          className="gap-2"
                        >
                          <Calendar className="h-4 w-4" />
                          קבע מפגש
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPlayerToDelete({ id: player.id, name: player.full_name })}
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
        )}

        <AlertDialog 
          open={!!playerToDelete} 
          onOpenChange={() => setPlayerToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
              <AlertDialogDescription>
                האם אתה בטוח שברצונך למחוק את השחקן {playerToDelete?.name}?
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

export default PlayersList;
