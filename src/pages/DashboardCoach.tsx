import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, ListChecks, User2, Plus, BookText, Loader2 } from 'lucide-react';
import { format, addDays, isPast, isToday } from 'date-fns';
import { he } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import * as z from "zod"
import { Checkbox } from "@/components/ui/checkbox"
import { SessionSummaryForm } from "@/components/session/SessionSummaryForm";
import { supabase } from '@/lib/supabase';
import { FormValues } from "@/components/session/summary-form/schemaValidation";

const formSchema = z.object({
  description: z.string().min(2, {
    message: "תיאור חייב להכיל לפחות 2 תווים.",
  }),
})

interface Session {
  id: string;
  session_date: string;
  session_time: string;
  description: string;
  player: {
    id: string;
    full_name: string;
  };
  session_summaries: any[];
}

const DashboardCoach: React.FC = () => {
  const navigate = useNavigate();
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [pastSessions, setPastSessions] = useState<Session[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [players, setPlayers] = useState<{ id: string; full_name: string }[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSessionForSummary, setSelectedSessionForSummary] = useState<Session | null>(null);
  const [isSessionSummaryOpen, setIsSessionSummaryOpen] = useState(false);
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
    },
  })

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPlayers();
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    setIsLoading(true);
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id,
          session_date,
          session_time,
          description,
          player: players (id, full_name),
          session_summaries (id)
        `)
        .eq('coach_id', user.id)
        .order('session_date', { ascending: true });

      if (error) {
        console.error("Error fetching sessions:", error);
        toast({
          title: "אירעה שגיאה!",
          description: "שגיאה בטעינת רשימת המפגשים",
          variant: "destructive",
        })
        return;
      }

      const upcoming = data.filter(session => {
        const sessionDate = new Date(session.session_date);
        return sessionDate >= today;
      });

      const past = data.filter(session => {
        const sessionDate = new Date(session.session_date);
        return sessionDate < today;
      });

      setUpcomingSessions(upcoming as Session[]);
      setPastSessions(past as Session[]);
    } catch (error) {
      console.error("Unexpected error fetching sessions:", error);
      toast({
        title: "אירעה שגיאה חמורה!",
        description: "שגיאה לא צפויה בטעינת רשימת המפגשים",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlayers = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('players')
      .select('id, full_name')
      .eq('coach_id', user.id);

    if (error) {
      console.error("Error fetching players:", error);
      toast({
        title: "אירעה שגיאה!",
        description: "שגיאה בטעינת רשימת השחקנים",
        variant: "destructive",
      })
      return;
    }

    setPlayers(data || []);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleCreateSessionOpen = () => {
    setIsCreateSessionOpen(true);
  };

  const handleCreateSessionClose = () => {
    setIsCreateSessionOpen(false);
    form.reset();
    setSelectedPlayer('');
  };

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayer(playerId);
  };

  const handleSaveSession = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    if (!user || !selectedDate || !selectedPlayer) return;

    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd', { locale: he });

      const { error } = await supabase.from('sessions').insert({
        session_date: formattedDate,
        session_time: format(selectedDate, 'HH:mm'),
        description: values.description,
        coach_id: user.id,
        player_id: selectedPlayer,
      });

      if (error) throw error;

      toast({
        title: "הצלחה!",
        description: "המפגש נוצר בהצלחה",
      })
      fetchSessions();
      handleCreateSessionClose();
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        title: "אירעה שגיאה!",
        description: "שגיאה ביצירת המפגש",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenSessionSummary = (session: Session) => {
    setSelectedSessionForSummary(session);
    setIsSessionSummaryOpen(true);
  };

  const handleCloseSessionSummary = () => {
    setSelectedSessionForSummary(null);
    setIsSessionSummaryOpen(false);
  };

  const handleSaveSessionSummary = async (sessionId: string, data: FormValues & { tools_used: string[] }) => {
    try {
      // Find the session to get the player_id
      const session = upcomingSessions.find(s => s.id === sessionId) || 
                       pastSessions.find(s => s.id === sessionId);
    
    if (!session) {
      toast.error("לא נמצא המפגש");
      return;
    }
    
    const playerId = session.player?.id;
    if (!playerId) {
      toast.error("לא נמצא השחקן");
      return;
    }
    
    const { error } = await supabase.from('session_summaries').insert({
      session_id: sessionId,
      coach_id: user.id,
      player_id: playerId, // Add player_id when creating summary
      summary_text: data.summary_text,
      achieved_goals: data.achieved_goals.split('\n').filter(Boolean),
      future_goals: data.future_goals.split('\n').filter(Boolean),
      progress_rating: data.progress_rating,
      next_session_focus: data.next_session_focus,
      additional_notes: data.additional_notes,
      tools_used: data.tools_used
    });

    if (error) throw error;
    
    toast.success("סיכום המפגש נשמר בהצלחה");
    fetchSessions(); // Refresh sessions data
  } catch (error) {
    console.error("Error saving session summary:", error);
    toast.error("שגיאה בשמירת סיכום המפגש");
  }
};

  const handleSessionSummarized = (event: CustomEvent) => {
    const { sessionId, playerId } = event.detail;
    console.log("Received sessionSummarized event for session:", sessionId, "and player:", playerId);
    fetchSessions();
  };

  useEffect(() => {
    window.addEventListener('sessionSummarized', handleSessionSummarized as EventListener);
    return () => {
      window.removeEventListener('sessionSummarized', handleSessionSummarized as EventListener);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-page">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        טוען נתונים...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page">
      <header className="w-full bg-primary text-white py-6 mb-8 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">דשבורד מאמן</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">
                <CalendarDays className="mr-2 h-5 w-5 inline-block" />
                לוח שנה
              </CardTitle>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[300px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: he }) : <span>בחר תאריך</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={he}
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) =>
                      date > addDays(new Date(), 365) || date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button onClick={handleCreateSessionOpen}>
                <Plus className="mr-2 h-4 w-4" />
                צור מפגש חדש
              </Button>
            </CardHeader>
            <CardContent className="pl-2 pr-2">
              <ScrollArea className="h-[400px] w-full rounded-md pr-2">
                <div className="relative overflow-auto">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 text-right">
                    מפגשים קרובים
                  </h3>
                  {upcomingSessions.length > 0 ? (
                    <ul className="space-y-2">
                      {upcomingSessions.map(session => (
                        <li key={session.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-lg font-medium text-gray-900 text-right">{session.description}</h4>
                              <p className="text-gray-600 text-sm text-right">
                                {format(new Date(session.session_date), 'dd/MM/yyyy', { locale: he })} בשעה {session.session_time}
                              </p>
                              <p className="text-gray-700 text-sm text-right">
                                עם {session.player?.full_name}
                              </p>
                            </div>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleOpenSessionSummary(session)}
                              disabled={session.session_summaries && session.session_summaries.length > 0}
                            >
                              {session.session_summaries && session.session_summaries.length > 0 ? (
                                <>סיכום קיים</>
                              ) : (
                                <>סכם מפגש</>
                              )}
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-center">אין מפגשים קרובים</p>
                  )}
                  <Separator className="my-4" />
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 text-right">
                    מפגשים שהיו
                  </h3>
                  {pastSessions.length > 0 ? (
                    <ul className="space-y-2">
                      {pastSessions.map(session => (
                        <li key={session.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-lg font-medium text-gray-900 text-right">{session.description}</h4>
                              <p className="text-gray-600 text-sm text-right">
                                {format(new Date(session.session_date), 'dd/MM/yyyy', { locale: he })} בשעה {session.session_time}
                              </p>
                              <p className="text-gray-700 text-sm text-right">
                                עם {session.player?.full_name}
                              </p>
                            </div>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleOpenSessionSummary(session)}
                              disabled={session.session_summaries && session.session_summaries.length > 0}
                            >
                              {session.session_summaries && session.session_summaries.length > 0 ? (
                                <>סיכום קיים</>
                              ) : (
                                <>סכם מפגש</>
                              )}
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-center">אין מפגשים שהיו</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">
                <User2 className="mr-2 h-5 w-5 inline-block" />
                שחקנים
              </CardTitle>
              <Button onClick={() => navigate('/players-list')}>
                <ListChecks className="mr-2 h-4 w-4" />
                רשימת שחקנים
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full rounded-md pr-2">
                <div className="relative overflow-auto">
                  {players.length > 0 ? (
                    <ul className="space-y-2">
                      {players.map(player => (
                        <li key={player.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out p-4">
                          <div className="flex justify-between items-center">
                            <div className="text-right">
                              <h4 className="text-lg font-medium text-gray-900">{player.full_name}</h4>
                            </div>
                            <Button variant="secondary" size="sm" onClick={() => navigate(`/player-profile/${player.id}`)}>
                              צפה בפרופיל
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-center">אין שחקנים כרגע</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Session Dialog */}
      <Dialog open={isCreateSessionOpen} onOpenChange={setIsCreateSessionOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>יצירת מפגש חדש</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveSession)} className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>תיאור המפגש</FormLabel>
                    <FormControl>
                      <Input placeholder="הכנס תיאור למפגש" {...field} />
                    </FormControl>
                    <FormDescription>
                      תן תיאור קצר למפגש
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={() => (
                    <FormItem className="col-span-1">
                      <FormLabel>תאריך</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[150px] justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarDays className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: he }) : <span>בחר תאריך</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            locale={he}
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        בחר תאריך למפגש
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="player"
                  render={() => (
                    <FormItem className="col-span-1">
                      <FormLabel>שחקן</FormLabel>
                      <Select onValueChange={handlePlayerSelect}>
                        <FormControl>
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="בחר שחקן" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {players.map(player => (
                            <SelectItem key={player.id} value={player.id}>
                              {player.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        בחר שחקן למפגש
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end">
                <Button type="button" variant="secondary" onClick={handleCreateSessionClose}>
                  ביטול
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      שומר...
                    </>
                  ) : (
                    "שמור"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Session Summary Dialog */}
      <Dialog open={isSessionSummaryOpen} onOpenChange={setIsSessionSummaryOpen}>
        <DialogContent className="sm:max-w-[80%]">
          <DialogHeader>
            <DialogTitle>סיכום מפגש</DialogTitle>
          </DialogHeader>
          {selectedSessionForSummary && (
            <SessionSummaryForm
              sessionId={selectedSessionForSummary.id}
              playerName={selectedSessionForSummary.player?.full_name || "Unknown Player"}
              sessionDate={format(new Date(selectedSessionForSummary.session_date), 'dd/MM/yyyy', { locale: he })}
              playerId={selectedSessionForSummary.player?.id}
              onSubmit={handleSaveSessionSummary}
              onCancel={handleCloseSessionSummary}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardCoach;
