
import React, { useState } from 'react';
import { usePlayers } from '@/contexts/PlayersContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, Pencil, Trash2 } from 'lucide-react';
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

const SessionsList = () => {
  const { sessions, deleteSession } = usePlayers();
  const navigate = useNavigate();
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);

  const handleEditSession = (session: Session) => {
    navigate('/edit-session', { state: { session } });
  };

  const handleDeleteConfirm = () => {
    if (sessionToDelete) {
      deleteSession(sessionToDelete.id);
      toast.success('המפגש נמחק בהצלחה');
      setSessionToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="w-full bg-[#1A1F2C] text-white py-6 mb-8 shadow-md">
        <div className="max-w-7xl mx-auto px-8">
          <h1 className="text-3xl font-bold">רשימת מפגשים</h1>
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
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            לא נמצאו מפגשים במערכת
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>תאריך</TableHead>
                  <TableHead>שעה</TableHead>
                  <TableHead>שם השחקן</TableHead>
                  <TableHead>תיאור המפגש</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell dir="ltr">{session.date}</TableCell>
                    <TableCell dir="ltr">{session.time}</TableCell>
                    <TableCell>{session.playerName}</TableCell>
                    <TableCell>{session.description}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSession(session)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSessionToDelete(session)}
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
          open={!!sessionToDelete} 
          onOpenChange={() => setSessionToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
              <AlertDialogDescription>
                האם אתה בטוח שברצונך למחוק את המפגש עם {sessionToDelete?.playerName} 
                בתאריך {sessionToDelete?.date} בשעה {sessionToDelete?.time}?
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
