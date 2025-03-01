
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, Pencil, Trash2, Loader2, UserCircle, Filter } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface Player {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  sport_field?: string;
  notes?: string;
  registration_link_id?: string | null;
}

const PlayersList = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerToDelete, setPlayerToDelete] = useState<{ id: string; name: string } | null>(null);
  const [sportFieldFilter, setSportFieldFilter] = useState<string>('all');
  const [registrationTypeFilter, setRegistrationTypeFilter] = useState<string>('all');
  const [uniqueSportFields, setUniqueSportFields] = useState<string[]>([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    // Apply filters whenever filter state or players change
    applyFilters();
  }, [sportFieldFilter, registrationTypeFilter, players]);

  const applyFilters = () => {
    let result = [...players];
    
    // Apply sport field filter
    if (sportFieldFilter !== 'all') {
      result = result.filter(player => player.sport_field === sportFieldFilter);
    }
    
    // Apply registration type filter
    if (registrationTypeFilter === 'self') {
      result = result.filter(player => player.registration_link_id !== null);
    } else if (registrationTypeFilter === 'coach') {
      result = result.filter(player => player.registration_link_id === null);
    }
    
    setFilteredPlayers(result);
  };

  const fetchPlayers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        navigate('/auth');
        return;
      }

      console.log('Fetching players for coach:', user.id);

      const { data, error } = await supabase
        .from('players')
        .select(`
          id,
          full_name,
          email,
          phone,
          sport_field,
          notes,
          registration_link_id,
          coach_id
        `)
        .eq('coach_id', user.id);

      if (error) {
        console.error('Error fetching players:', error);
        throw error;
      }

      console.log('Players fetched successfully:', data);
      
      if (!data || data.length === 0) {
        console.log('No players found for coach:', user.id);
      }

      // Extract unique sport fields for filtering
      const sportFields = [...new Set(data?.map(player => player.sport_field || 'לא צוין').filter(Boolean))];
      setUniqueSportFields(sportFields);
      
      setPlayers(data || []);
      setFilteredPlayers(data || []);
    } catch (error: any) {
      console.error('Error in fetchPlayers:', error);
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

  const handleViewProfile = (playerId: string) => {
    navigate(`/player-profile/${playerId}`);
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

  const clearFilters = () => {
    setSportFieldFilter('all');
    setRegistrationTypeFilter('all');
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

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              <span className="font-medium">סינון:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span>ענף ספורט:</span>
              <Select value={sportFieldFilter} onValueChange={setSportFieldFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="כל הענפים" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הענפים</SelectItem>
                  {uniqueSportFields.map(field => (
                    <SelectItem key={field} value={field}>{field}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <span>אופן רישום:</span>
              <Select value={registrationTypeFilter} onValueChange={setRegistrationTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="כל השחקנים" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל השחקנים</SelectItem>
                  <SelectItem value="self">רישום עצמאי</SelectItem>
                  <SelectItem value="coach">נרשמו ע״י המאמן</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="outline" 
              onClick={clearFilters}
              size="sm"
            >
              נקה סינון
            </Button>
          </div>
        </Card>

        {filteredPlayers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {players.length === 0 ? 
              "לא נמצאו שחקנים במערכת" : 
              "לא נמצאו שחקנים התואמים את הסינון הנוכחי"
            }
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>שם השחקן</TableHead>
                  <TableHead>ענף ספורט</TableHead>
                  <TableHead>אופן רישום</TableHead>
                  <TableHead>אימייל</TableHead>
                  <TableHead>טלפון</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.map((player) => (
                  <TableRow 
                    key={player.id}
                    className={player.registration_link_id ? "bg-blue-50" : ""}
                  >
                    <TableCell className="font-medium">
                      {player.full_name}
                      {player.registration_link_id && (
                        <Badge variant="outline" className="mr-2 text-blue-600 border-blue-600">
                          ⚠ רישום עצמאי
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{player.sport_field || "לא צוין"}</TableCell>
                    <TableCell>
                      {player.registration_link_id ? 
                        <Badge variant="secondary">רישום עצמאי</Badge> : 
                        <Badge variant="outline">נרשם ע״י המאמן</Badge>
                      }
                    </TableCell>
                    <TableCell dir="ltr">{player.email}</TableCell>
                    <TableCell dir="ltr">{player.phone || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProfile(player.id)}
                          title="צפה בפרופיל"
                        >
                          <UserCircle className="h-4 w-4" />
                        </Button>
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
