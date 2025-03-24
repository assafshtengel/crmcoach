import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';

interface Player {
  id: string;
  full_name: string;
}

interface SessionFormData {
  session_date: string;
  session_time: string;
  player_id: string;
  notes: string;
  location: string;
  meeting_type: 'in_person' | 'zoom';
}

const NewSessionForm = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const timeInputRef = React.useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<SessionFormData>({
    session_date: '',
    session_time: '',
    player_id: '',
    notes: '',
    location: '',
    meeting_type: 'in_person'
  });

  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: playersData, error } = await supabase
        .from('players')
        .select('id, full_name')
        .eq('coach_id', user.id);

      if (error) {
        toast.error('שגיאה בטעינת רשימת השחקנים');
        return;
      }

      setPlayers(playersData || []);
      setIsLoading(false);
    };

    fetchPlayers();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('לא נמצא משתמש מחובר');
        navigate('/auth');
        return;
      }
      
      const { error } = await supabase
        .from('sessions')
        .insert({
          coach_id: user.id,
          player_id: formData.player_id,
          session_date: formData.session_date,
          session_time: formData.session_time,
          notes: formData.notes || null,
          location: formData.location || null,
          meeting_type: formData.meeting_type,
          has_started: false,
          reminder_sent: false
        });

      if (error) throw error;

      const playerName = players.find(p => p.id === formData.player_id)?.full_name;
      const meetingTypeText = formData.meeting_type === 'in_person' ? 'פרונטלי' : 'בזום';
      
      toast.success(`מפגש ${meetingTypeText} חדש עם ${playerName} נקבע בהצלחה!`);
      navigate('/sessions-list');
    } catch (error: any) {
      console.error('Error creating session:', error);
      toast.error('שגיאה בקביעת המפגש');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlayerSelect = (value: string) => {
    setFormData(prev => ({ ...prev, player_id: value }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      const formattedDate = format(date, 'yyyy-MM-dd');
      setFormData(prev => ({ ...prev, session_date: formattedDate }));
      setOpen(false);

      setTimeout(() => {
        if (timeInputRef.current) {
          timeInputRef.current.focus();
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-md mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">קביעת מפגש חדש</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="session_date">תאריך</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-right font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                      id="session_date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, 'dd/MM/yyyy')
                      ) : (
                        <span>בחר תאריך...</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session_time">שעה</Label>
                <Input
                  id="session_time"
                  name="session_time"
                  type="time"
                  value={formData.session_time}
                  onChange={handleInputChange}
                  required
                  dir="ltr"
                  ref={timeInputRef}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="player">בחר שחקן</Label>
                <Select
                  value={formData.player_id}
                  onValueChange={handlePlayerSelect}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר שחקן" />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>סוג מפגש</Label>
                <RadioGroup 
                  value={formData.meeting_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, meeting_type: value as 'in_person' | 'zoom' }))}
                  className="flex space-x-4 rtl:space-x-reverse"
                >
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value="in_person" id="r-in_person" />
                    <Label htmlFor="r-in_person" className="cursor-pointer">פרונטלי</Label>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value="zoom" id="r-zoom" />
                    <Label htmlFor="r-zoom" className="cursor-pointer">זום</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  {formData.meeting_type === 'in_person' ? 'מיקום' : 'קישור לזום (אופציונלי)'}
                </Label>
                <Input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder={formData.meeting_type === 'in_person' 
                    ? "הכנס את מיקום המפגש" 
                    : "הכנס קישור לפגישת זום (אופציונלי)"
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">הערות</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="הוסף הערות למפגש..."
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => navigate('/dashboard')}
                >
                  ביטול
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'אנא המתן...' : 'קבע מפגש'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewSessionForm;
