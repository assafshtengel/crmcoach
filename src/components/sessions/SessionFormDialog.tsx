
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar } from '@/components/calendar/Calendar';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarClock, Users, MapPin, Clock, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface SessionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSessionAdd?: (sessionData: {
    player_id: string;
    session_date: string;
    session_time: string;
    location?: string;
    notes?: string;
    meeting_type: 'in_person' | 'zoom';
  }) => Promise<void>;
}

export function SessionFormDialog({ 
  open, 
  onOpenChange,
}: SessionFormDialogProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [meetingType, setMeetingType] = useState<'in_person' | 'zoom'>('in_person');
  const [players, setPlayers] = useState<Array<{id: string, full_name: string}>>([]);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('id, full_name')
          .eq('coach_id', user.id);

        if (playersError) throw playersError;
        setPlayers(playersData || []);

        await fetchSessions(user.id);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('שגיאה בטעינת נתונים');
      } finally {
        setLoading(false);
      }
    }

    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchSessions = async (coachId: string) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select(`
          *,
          players (full_name)
        `)
        .eq('coach_id', coachId)
        .gte('session_date', today.toISOString().split('T')[0]);

      if (sessionsError) throw sessionsError;

      const formattedEvents = (sessionsData || []).map(session => ({
        id: session.id,
        title: session.players?.full_name || 'מפגש',
        start: `${session.session_date}T${session.session_time}:00`,
        extendedProps: {
          playerName: session.players?.full_name || 'מפגש',
          player_id: session.player_id,
          location: session.location,
          reminderSent: session.reminder_sent,
          notes: session.notes,
          eventType: 'meeting'
        }
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('שגיאה בטעינת המפגשים');
    }
  };

  const handleEventClick = (eventId: string) => {
    console.log('Event clicked:', eventId);
  };

  const handleAddEvent = async (eventData: any) => {
    try {
      if (!selectedPlayerId) {
        toast.error('נא לבחור שחקן לפני הוספת מפגש');
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('משתמש לא מחובר');
        return;
      }

      const sessionData = {
        player_id: selectedPlayerId,
        coach_id: user.id,
        session_date: eventData.start.split('T')[0],
        session_time: eventData.start.split('T')[1].substring(0, 5),
        location: location || '',
        notes: notes || '',
        reminder_sent: false,
        meeting_type: meetingType
      };
      
      console.log('Creating new session:', sessionData);
      
      const { data, error } = await supabase
        .from('sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        console.error('Session creation error:', error);
        throw error;
      }

      await fetchSessions(user.id);
      
      toast.success('המפגש נוצר בהצלחה');
      
      // Reset form
      setSelectedPlayerId(undefined);
      setLocation('');
      setNotes('');
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error processing event data:', error);
      toast.error('אירעה שגיאה בשמירת המפגש');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-[#3498DB] to-[#9b87f5] text-white px-6 py-4 rounded-t-lg">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <CalendarClock className="h-6 w-6" />
            הוספת מפגש חדש
          </DialogTitle>
          <DialogDescription className="text-white/90 text-lg">
            תזמון מפגש עם שחקן
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
          <div className="md:col-span-2">
            <Card className="shadow-sm h-full">
              <CardContent className="p-4">
                {!loading && (
                  <Calendar
                    events={events}
                    onEventClick={handleEventClick}
                    onEventAdd={handleAddEvent}
                    selectedPlayerId={selectedPlayerId}
                    players={players}
                    setSelectedPlayerId={setSelectedPlayerId}
                  />
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-4">
            <Card className="border-[#3498DB] shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-[#3498DB]" />
                  <h3 className="font-medium text-lg">בחירת שחקן</h3>
                </div>
                
                <ScrollArea className="h-[200px] rounded-md border p-2">
                  <div className="grid grid-cols-1 gap-2">
                    {players.map(player => (
                      <div 
                        key={player.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          selectedPlayerId === player.id 
                            ? 'bg-[#3498DB]/10 border-[#3498DB]' 
                            : 'hover:bg-gray-50 border-gray-200'
                        }`}
                        onClick={() => setSelectedPlayerId(player.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-[#3498DB]/20 flex items-center justify-center text-[#3498DB] font-medium">
                            {player.full_name.charAt(0)}
                          </div>
                          <span className="font-medium">{player.full_name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-[#27AE60]" />
                  <h3 className="font-medium text-lg">סוג מפגש</h3>
                </div>
                
                <RadioGroup 
                  value={meetingType} 
                  onValueChange={(value) => setMeetingType(value as 'in_person' | 'zoom')}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className={`relative border-2 rounded-lg p-2 transition-all ${meetingType === 'in_person' ? 'border-[#27AE60] bg-[#27AE60]/10' : 'border-gray-200'}`}>
                    <div className="absolute top-2 right-2">
                      <RadioGroupItem value="in_person" id="in_person" className="text-[#27AE60]" />
                    </div>
                    <div className="pt-4 text-center">
                      <MapPin className="h-6 w-6 mx-auto mb-1 text-[#27AE60]" />
                      <Label htmlFor="in_person" className="cursor-pointer text-sm font-medium block">פרונטלי</Label>
                    </div>
                  </div>
                  
                  <div className={`relative border-2 rounded-lg p-2 transition-all ${meetingType === 'zoom' ? 'border-[#3498DB] bg-[#3498DB]/10' : 'border-gray-200'}`}>
                    <div className="absolute top-2 right-2">
                      <RadioGroupItem value="zoom" id="zoom" className="text-[#3498DB]" />
                    </div>
                    <div className="pt-4 text-center">
                      <Clock className="h-6 w-6 mx-auto mb-1 text-[#3498DB]" />
                      <Label htmlFor="zoom" className="cursor-pointer text-sm font-medium block">זום</Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-[#9b59b6]" />
                  <h3 className="font-medium">מיקום</h3>
                </div>
                <Input 
                  placeholder={meetingType === 'in_person' ? 'הכנס מיקום פיזי' : 'קישור לפגישת זום'} 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                  className="mb-4"
                />
                
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-5 w-5 text-[#F1C40F]" />
                  <h3 className="font-medium">הערות</h3>
                </div>
                <Textarea 
                  placeholder="הוסף הערות למפגש" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none h-20"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
