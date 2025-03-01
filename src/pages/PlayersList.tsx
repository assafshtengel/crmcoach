
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, Pencil, Trash2, Loader2, UserCircle, Filter, CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { format, parseISO, differenceInDays } from 'date-fns';

interface Player {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  sport_field?: string;
  notes?: string;
  registration_link_id?: string | null;
  contact_status?: 'contacted' | 'pending' | null;
  created_at: string;
  // New fields for session tracking
  past_sessions_count: number;
  last_session_date?: string;
  next_session_date?: string;
  next_session_time?: string;
}

const PlayersList = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerToDelete, setPlayerToDelete] = useState<{ id: string; name: string } | null>(null);
  const [sportFieldFilter, setSportFieldFilter] = useState<string>('all');
  const [registrationTypeFilter, setRegistrationTypeFilter] = useState<string>('all');
  const [contactStatusFilter, setContactStatusFilter] = useState<string>('all');
  const [uniqueSportFields, setUniqueSportFields] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    // Apply filters whenever filter state or players change
    applyFilters();
  }, [sportFieldFilter, registrationTypeFilter, contactStatusFilter, players]);

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
    
    // Apply contact status filter
    if (contactStatusFilter === 'contacted') {
      result = result.filter(player => player.contact_status === 'contacted');
    } else if (contactStatusFilter === 'pending') {
      result = result.filter(player => player.contact_status === 'pending');
    }
    
    setFilteredPlayers(result);
  };

  const fetchPlayers = async () => {
    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        navigate('/auth');
        return;
      }

      console.log('Fetching players for coach:', user.id);

      // First get the players basic information
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select(`
          id,
          full_name,
          email,
          phone,
          sport_field,
          notes,
          registration_link_id,
          contact_status,
          coach_id,
          created_at
        `)
        .eq('coach_id', user.id);

      if (playersError) {
        console.error('Error fetching players:', playersError);
        setError(playersError.message);
        toast.error('שגיאה בטעינת רשימת השחקנים: ' + playersError.message);
        throw playersError;
      }

      // Process each player to get session information
      const today = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
      
      const playersWithSessionData = await Promise.all(
        (playersData || []).map(async (player) => {
          // Get count of past sessions
          const { count: pastSessionsCount, error: pastCountError } = await supabase
            .from('sessions')
            .select('id', { count: 'exact', head: true })
            .eq('player_id', player.id)
            .lt('session_date', today);
          
          if (pastCountError) {
            console.error('Error counting past sessions for player:', player.id, pastCountError);
          }
          
          // Get the date of the last session
          const { data: lastSession, error: lastSessionError } = await supabase
            .from('sessions')
            .select('session_date, session_time')
            .eq('player_id', player.id)
            .lt('session_date', today)
            .order('session_date', { ascending: false })
            .limit(1);
          
          if (lastSessionError) {
            console.error('Error getting last session for player:', player.id, lastSessionError);
          }
          
          // Get the next upcoming session
          const { data: nextSession, error: nextSessionError } = await supabase
            .from('sessions')
            .select('session_date, session_time')
            .eq('player_id', player.id)
            .gte('session_date', today)
            .order('session_date', { ascending: true })
            .limit(1);
          
          if (nextSessionError) {
            console.error('Error getting next session for player:', player.id, nextSessionError);
          }
          
          return { 
            ...player, 
            past_sessions_count: pastSessionsCount || 0,
            last_session_date: lastSession && lastSession.length > 0 ? lastSession[0].session_date : undefined,
            next_session_date: nextSession && nextSession.length > 0 ? nextSession[0].session_date : undefined,
            next_session_time: nextSession && nextSession.length > 0 ? nextSession[0].session_time : undefined
          };
        })
      );
      
      console.log('Players with session data:', playersWithSessionData);
      
      // Extract unique sport fields for filtering
      const sportFields = [...new Set(playersWithSessionData?.map(player => player.sport_field || 'לא צוין').filter(Boolean))];
      setUniqueSportFields(sportFields);
      
      setPlayers(playersWithSessionData || []);
      setFilteredPlayers(playersWithSessionData || []);
    } catch (error: any) {
      console.error('Error in fetchPlayers:', error);
      setError(error.message);
      toast.error('שגיאה בטעינת רשימת השחקנים');
    } finally {
      setLoading(false);
    }
  };

  const updateContactStatus = async (playerId: string, newStatus: 'contacted' | 'pending') => {
    try {
      const { error } = await supabase
        .from('players')
        .update({ contact_status: newStatus })
        .eq('id', playerId);

      if (error) throw error;

      // Update local state
      setPlayers(players.map(player => 
        player.id === playerId ? { ...player, contact_status: newStatus } : player
      ));

      toast.success(`סטטוס יצירת קשר עודכן בהצלחה`);
    } catch (error: any) {
      toast.error('שגיאה בעדכון סטטוס יצירת קשר');
      console.error('Error updating contact status:', error);
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
    setContactStatusFilter('all');
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return dateString || 'לא ידוע';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Format as HH:MM
  };

  // Check if the player has been inactive for more than 2 weeks
  const isInactive = (player: Player) => {
    if (!player.last_session_date && !player.next_session_date) {
      return true; // No activity at all
    }
    
    if (player.next_session_date) {
      return false; // Has a future session, not inactive
    }
    
    if (player.last_session_date) {
      const lastSessionDate = parseISO(player.last_session_date);
      const today = new Date();
      return differenceInDays(today, lastSessionDate) > 14; // More than 2 weeks since last session
    }
    
    return false;
  };

  // Get the session status for display
  const getSessionStatus = (player: Player) => {
    if (player.next_session_date) {
      return {
        type: 'upcoming',
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        message: 'מפגש קרוב מתוכנן',
        color: 'text-green-600'
      };
    } else if (isInactive(player)) {
      if (player.past_sessions_count === 0) {
        return {
          type: 'no_activity',
          icon: <XCircle className="h-4 w-4 text-red-600" />,
          message: 'ללא פעילות',
          color: 'text-red-600'
        };
      } else {
        return {
          type: 'inactive',
          icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
          message: 'יש לקבוע מפגש (לא פעיל יותר משבועיים)',
          color: 'text-amber-500'
        };
      }
    } else {
      return {
        type: 'active',
        icon: <CheckCircle className="h-4 w-4 text-blue-600" />,
        message: 'פעיל',
        color: 'text-blue-600'
      };
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
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">רשימת שחקנים</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/')}
              aria-label="חזרה לדף הראשי"
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

        {/* Debug information */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <h3 className="font-bold">שגיאה בטעינת רשימת השחקנים:</h3>
            <p>{error}</p>
            <Button onClick={fetchPlayers} className="mt-2" variant="secondary">
              נסה שוב
            </Button>
          </div>
        )}

        {/* Player count info */}
        <div className="mb-4 text-gray-600">
          סה"כ שחקנים: {players.length} | מוצגים: {filteredPlayers.length}
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
                <SelectTrigger className="w-[180px] text-right">
                  <SelectValue placeholder="כל הענפים" />
                </SelectTrigger>
                <SelectContent className="text-right">
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
                <SelectTrigger className="w-[180px] text-right">
                  <SelectValue placeholder="כל השחקנים" />
                </SelectTrigger>
                <SelectContent className="text-right">
                  <SelectItem value="all">כל השחקנים</SelectItem>
                  <SelectItem value="self">רישום עצמאי</SelectItem>
                  <SelectItem value="coach">נרשמו ע״י המאמן</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <span>סטטוס יצירת קשר:</span>
              <Select value={contactStatusFilter} onValueChange={setContactStatusFilter}>
                <SelectTrigger className="w-[180px] text-right">
                  <SelectValue placeholder="כל השחקנים" />
                </SelectTrigger>
                <SelectContent className="text-right">
                  <SelectItem value="all">כל השחקנים</SelectItem>
                  <SelectItem value="contacted">יצרנו קשר</SelectItem>
                  <SelectItem value="pending">ממתין ליצירת קשר</SelectItem>
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
          <div className="bg-white rounded-lg shadow overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>שם השחקן</TableHead>
                  <TableHead>ענף ספורט</TableHead>
                  <TableHead>אופן רישום</TableHead>
                  <TableHead>סטטוס יצירת קשר</TableHead>
                  <TableHead>תאריך רישום</TableHead>
                  <TableHead>מפגשים שהתקיימו</TableHead>
                  <TableHead>מפגש עתידי</TableHead>
                  <TableHead>אימייל</TableHead>
                  <TableHead>טלפון</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.map((player) => {
                  const sessionStatus = getSessionStatus(player);
                  
                  return (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {player.full_name}
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                {player.contact_status === 'contacted' ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                                )}
                              </TooltipTrigger>
                              <TooltipContent>
                                {player.contact_status === 'contacted' ? 'יצרנו קשר' : 'ממתין ליצירת קשר'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                      <TableCell>{player.sport_field || "לא צוין"}</TableCell>
                      <TableCell>
                        {player.registration_link_id ? 
                          <Badge variant="secondary">רישום עצמאי</Badge> : 
                          <Badge variant="outline">נרשם ע״י המאמן</Badge>
                        }
                      </TableCell>
                      <TableCell>
                        <Select
                          value={player.contact_status || 'pending'}
                          onValueChange={(value) => updateContactStatus(player.id, value as 'contacted' | 'pending')}
                        >
                          <SelectTrigger className="w-[140px] text-right">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="text-right">
                            <SelectItem value="contacted">
                              <div className="flex items-center">
                                <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                                יצרנו קשר
                              </div>
                            </SelectItem>
                            <SelectItem value="pending">
                              <div className="flex items-center">
                                <AlertCircle className="h-3 w-3 text-yellow-500 mr-2" />
                                ממתין ליצירת קשר
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(player.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-medium">
                          {player.past_sessions_count || 0}
                        </Badge>
                        {player.last_session_date && (
                          <div className="text-xs text-gray-500 mt-1">
                            אחרון: {formatDate(player.last_session_date)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={`flex items-center gap-1.5 ${sessionStatus.color}`}>
                                {sessionStatus.icon}
                                {player.next_session_date ? (
                                  <span className="text-sm">
                                    {formatDate(player.next_session_date)} {formatTime(player.next_session_time)}
                                  </span>
                                ) : (
                                  <span className="text-sm">
                                    {sessionStatus.type === 'no_activity' ? 'ללא פעילות' : 'לא נקבע'}
                                  </span>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {sessionStatus.message}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell dir="ltr">{player.email}</TableCell>
                      <TableCell dir="ltr">{player.phone || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewProfile(player.id)}
                                >
                                  <UserCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>צפה בפרופיל</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
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
                  );
                })}
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
