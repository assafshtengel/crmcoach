
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarClock, Users, MapPin, Clock, Calendar as CalendarIcon, Clock as ClockIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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

interface SessionFormValues {
  player_id: string;
  meeting_type: 'in_person' | 'zoom';
  location: string;
  notes: string;
  session_date: Date | undefined;
  session_time: string;
}

export function SessionFormDialog({ 
  open, 
  onOpenChange,
}: SessionFormDialogProps) {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Array<{id: string, full_name: string}>>([]);

  const form = useForm<SessionFormValues>({
    defaultValues: {
      player_id: '',
      meeting_type: 'in_person',
      location: '',
      notes: '',
      session_date: undefined,
      session_time: ''
    }
  });

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
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('שגיאה בטעינת נתונים');
      } finally {
        setLoading(false);
      }
    }

    if (open) {
      fetchData();
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (data: SessionFormValues) => {
    try {
      if (!data.player_id) {
        toast.error('נא לבחור שחקן');
        return;
      }

      if (!data.session_date) {
        toast.error('נא לבחור תאריך');
        return;
      }

      if (!data.session_time) {
        toast.error('נא לבחור שעה');
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('משתמש לא מחובר');
        return;
      }

      const formattedDate = format(data.session_date, 'yyyy-MM-dd');
      const selectedPlayer = players.find(p => p.id === data.player_id);

      const sessionData = {
        player_id: data.player_id,
        coach_id: user.id,
        session_date: formattedDate,
        session_time: data.session_time,
        location: data.location || '',
        notes: data.notes || '',
        reminder_sent: false,
        meeting_type: data.meeting_type
      };
      
      console.log('Creating new session:', sessionData);
      
      const { data: response, error } = await supabase
        .from('sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        console.error('Session creation error:', error);
        throw error;
      }
      
      // Create a notification for the new session
      const notificationData = {
        coach_id: user.id,
        type: 'new_session',
        message: `נקבע מפגש חדש עם ${selectedPlayer?.full_name} בתאריך ${formattedDate}`
      };
      
      await supabase
        .from('notifications')
        .insert(notificationData);
        
      const meetingTypeText = data.meeting_type === 'in_person' ? 'פרונטלי' : 'בזום';
      toast.success(`המפגש ${meetingTypeText} עם ${selectedPlayer?.full_name} נקבע בהצלחה!`);
      onOpenChange(false);
    } catch (error) {
      console.error('Error processing session data:', error);
      toast.error('אירעה שגיאה בשמירת המפגש');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto">
        <DialogHeader className="bg-gradient-to-r from-[#3498DB] to-[#9b87f5] text-white px-6 py-4 rounded-t-lg sticky top-0 z-10">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <CalendarClock className="h-6 w-6" />
            הוספת מפגש חדש
          </DialogTitle>
          <DialogDescription className="text-white/90 text-lg">
            תזמון מפגש עם שחקן
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6">
            {/* Player Selection */}
            <FormField
              control={form.control}
              name="player_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-base font-medium mb-2">
                    <Users className="h-5 w-5 text-[#3498DB]" />
                    בחירת שחקן
                  </FormLabel>
                  <ScrollArea className="h-[120px] rounded-md border p-2 border-[#D3E4FD] bg-[#F1F0FB]/30">
                    <div className="grid grid-cols-2 gap-2">
                      {players.map(player => (
                        <div 
                          key={player.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            field.value === player.id 
                              ? 'bg-[#3498DB]/10 border-[#3498DB] shadow-sm' 
                              : 'hover:bg-[#F1F0FB] border-gray-200'
                          }`}
                          onClick={() => form.setValue('player_id', player.id)}
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
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Meeting Type */}
              <FormField
                control={form.control}
                name="meeting_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-base font-medium mb-2">
                      <MapPin className="h-5 w-5 text-[#27AE60]" />
                      סוג מפגש
                    </FormLabel>
                    <RadioGroup 
                      value={field.value} 
                      onValueChange={(value) => form.setValue('meeting_type', value as 'in_person' | 'zoom')}
                      className="grid grid-cols-2 gap-2"
                    >
                      <div className={`relative border-2 rounded-lg p-2 transition-all ${field.value === 'in_person' ? 'border-[#27AE60] bg-[#27AE60]/10' : 'border-gray-200'}`}>
                        <div className="absolute top-2 right-2">
                          <RadioGroupItem value="in_person" id="in_person" className="text-[#27AE60]" />
                        </div>
                        <div className="pt-4 text-center">
                          <MapPin className="h-6 w-6 mx-auto mb-1 text-[#27AE60]" />
                          <Label htmlFor="in_person" className="cursor-pointer text-sm font-medium block">פרונטלי</Label>
                        </div>
                      </div>
                      
                      <div className={`relative border-2 rounded-lg p-2 transition-all ${field.value === 'zoom' ? 'border-[#3498DB] bg-[#3498DB]/10' : 'border-gray-200'}`}>
                        <div className="absolute top-2 right-2">
                          <RadioGroupItem value="zoom" id="zoom" className="text-[#3498DB]" />
                        </div>
                        <div className="pt-4 text-center">
                          <Clock className="h-6 w-6 mx-auto mb-1 text-[#3498DB]" />
                          <Label htmlFor="zoom" className="cursor-pointer text-sm font-medium block">זום</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-base font-medium mb-2">
                      <MapPin className="h-5 w-5 text-[#9b59b6]" />
                      מיקום
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={form.watch('meeting_type') === 'in_person' ? 'הכנס מיקום פיזי' : 'קישור לפגישת זום'} 
                        {...field}
                        className="border-[#D3E4FD] focus:border-[#9b87f5]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Picker */}
              <FormField
                control={form.control}
                name="session_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2 text-base font-medium mb-2">
                      <CalendarIcon className="h-5 w-5 text-[#3498DB]" />
                      תאריך
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-right font-normal border-[#D3E4FD]",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "yyyy-MM-dd")
                            ) : (
                              <span>בחר תאריך</span>
                            )}
                            <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="p-3 pointer-events-auto bg-white"
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              {/* Time Picker */}
              <FormField
                control={form.control}
                name="session_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-base font-medium mb-2">
                      <ClockIcon className="h-5 w-5 text-[#e74c3c]" />
                      שעה
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="time"
                        {...field}
                        className="border-[#D3E4FD] focus:border-[#9b87f5]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-base font-medium mb-2">
                    <Clock className="h-5 w-5 text-[#F1C40F]" />
                    הערות
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="הוסף הערות למפגש" 
                      className="resize-none h-20 border-[#D3E4FD] focus:border-[#9b87f5]"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6 pt-4 border-t border-[#F1F0FB]">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#D3E4FD]">
                ביטול
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-[#3498DB] to-[#9b87f5] hover:opacity-90">
                יצירת מפגש
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
