
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Search, Video } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Meeting {
  id: string;
  player_id: string;
  coach_id: string;
  coach: {
    full_name: string;
  };
  meeting_date: string;
  meeting_time: string;
  location: string;
  meeting_type: 'in_person' | 'zoom';
  notes: string;
  meeting_logs?: {
    id: string;
    summary: string;
    achievements: string;
    next_steps: string;
  }[];
}

const PlayerMeetings = () => {
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [pastMeetings, setPastMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const playerSessionStr = localStorage.getItem('playerSession');
        
        if (!playerSessionStr) {
          navigate('/player-auth');
          return;
        }
        
        const playerSession = JSON.parse(playerSessionStr);
        
        // Get today's date in ISO format for all queries
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch upcoming meetings
        const { data: upcomingData, error: upcomingError } = await supabase
          .from('player_meetings')
          .select(`
            *,
            coaches (
              full_name
            )
          `)
          .eq('player_id', playerSession.id)
          .gte('meeting_date', today)
          .order('meeting_date', { ascending: true })
          .order('meeting_time', { ascending: true });

        if (upcomingError) throw upcomingError;
        setUpcomingMeetings(upcomingData || []);

        // Fetch past meetings with summaries
        const { data: pastData, error: pastError } = await supabase
          .from('player_meetings')
          .select(`
            *,
            coaches (
              full_name
            ),
            meeting_logs (
              id,
              summary,
              achievements,
              next_steps
            )
          `)
          .eq('player_id', playerSession.id)
          .lt('meeting_date', today)
          .order('meeting_date', { ascending: false })
          .order('meeting_time', { ascending: false });

        if (pastError) throw pastError;
        setPastMeetings(pastData || []);
      } catch (error: any) {
        console.error('Error loading meetings:', error);
        toast.error(error.message || "אירעה שגיאה בטעינת הפגישות");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeetings();
  }, [navigate]);

  const filterMeetings = (meetings: Meeting[]) => {
    if (!searchQuery) return meetings;
    
    return meetings.filter(meeting => 
      meeting.location?.includes(searchQuery) || 
      meeting.notes?.includes(searchQuery) ||
      (meeting.meeting_logs && meeting.meeting_logs.some(log => 
        log.summary?.includes(searchQuery) ||
        log.achievements?.includes(searchQuery) ||
        log.next_steps?.includes(searchQuery)
      ))
    );
  };

  const filteredUpcomingMeetings = filterMeetings(upcomingMeetings);
  const filteredPastMeetings = filterMeetings(pastMeetings);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/player-profile')}
            className="ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">יומן פגישות</h1>
        </div>

        <div className="relative w-full max-w-md mb-6">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש בפגישות..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
        </div>

        <Tabs defaultValue="upcoming" className="mb-8">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="upcoming" className="flex-1">פגישות קרובות</TabsTrigger>
            <TabsTrigger value="past" className="flex-1">פגישות קודמות</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {filteredUpcomingMeetings.length === 0 ? (
              <Card className="text-center p-8 bg-white shadow-md">
                <CardContent className="pt-6">
                  <p className="text-xl text-gray-500">אין לך פגישות קרובות</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredUpcomingMeetings.map((meeting) => (
                  <Card key={meeting.id} className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            {meeting.meeting_type === 'zoom' ? (
                              <Video className="h-5 w-5 text-blue-500" />
                            ) : (
                              <MapPin className="h-5 w-5 text-emerald-500" />
                            )}
                            {meeting.meeting_type === 'zoom' ? 'פגישת זום' : 'פגישה פרונטלית'}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            {new Date(meeting.meeting_date).toLocaleDateString('he-IL')}
                            <span className="mx-1">•</span>
                            <Clock className="h-4 w-4 text-muted-foreground ml-1" />
                            {meeting.meeting_time.slice(0, 5)}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {meeting.location && (
                          <div>
                            <Label className="text-sm text-muted-foreground">מיקום:</Label>
                            <p className="text-sm font-medium">{meeting.location}</p>
                          </div>
                        )}
                        
                        {meeting.coaches?.full_name && (
                          <div>
                            <Label className="text-sm text-muted-foreground">מאמן:</Label>
                            <p className="text-sm font-medium">{meeting.coaches.full_name}</p>
                          </div>
                        )}
                        
                        {meeting.notes && (
                          <div>
                            <Label className="text-sm text-muted-foreground">הערות:</Label>
                            <p className="text-sm">{meeting.notes}</p>
                          </div>
                        )}
                        
                        {meeting.meeting_type === 'zoom' && (
                          <Button className="w-full mt-2" variant="outline">
                            <Video className="h-4 w-4 mr-2" />
                            הצטרף לפגישת זום
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {filteredPastMeetings.length === 0 ? (
              <Card className="text-center p-8 bg-white shadow-md">
                <CardContent className="pt-6">
                  <p className="text-xl text-gray-500">אין פגישות קודמות</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredPastMeetings.map((meeting) => (
                  <Card key={meeting.id} className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            {meeting.meeting_type === 'zoom' ? (
                              <Video className="h-5 w-5 text-blue-500" />
                            ) : (
                              <MapPin className="h-5 w-5 text-emerald-500" />
                            )}
                            {meeting.meeting_type === 'zoom' ? 'פגישת זום' : 'פגישה פרונטלית'}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            {new Date(meeting.meeting_date).toLocaleDateString('he-IL')}
                            <span className="mx-1">•</span>
                            <Clock className="h-4 w-4 text-muted-foreground ml-1" />
                            {meeting.meeting_time.slice(0, 5)}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {meeting.location && (
                          <div>
                            <Label className="text-sm text-muted-foreground">מיקום:</Label>
                            <p className="text-sm font-medium">{meeting.location}</p>
                          </div>
                        )}
                        
                        {meeting.coaches?.full_name && (
                          <div>
                            <Label className="text-sm text-muted-foreground">מאמן:</Label>
                            <p className="text-sm font-medium">{meeting.coaches.full_name}</p>
                          </div>
                        )}
                        
                        {meeting.meeting_logs && meeting.meeting_logs.length > 0 && (
                          <div className="pt-3 border-t mt-3">
                            <h3 className="font-medium text-lg mb-2">סיכום הפגישה</h3>
                            {meeting.meeting_logs[0].summary && (
                              <div className="mb-2">
                                <Label className="text-sm text-muted-foreground">סיכום:</Label>
                                <p className="text-sm whitespace-pre-line">{meeting.meeting_logs[0].summary}</p>
                              </div>
                            )}
                            {meeting.meeting_logs[0].achievements && (
                              <div className="mb-2">
                                <Label className="text-sm text-muted-foreground">הישגים:</Label>
                                <p className="text-sm">{meeting.meeting_logs[0].achievements}</p>
                              </div>
                            )}
                            {meeting.meeting_logs[0].next_steps && (
                              <div>
                                <Label className="text-sm text-muted-foreground">צעדים הבאים:</Label>
                                <p className="text-sm">{meeting.meeting_logs[0].next_steps}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PlayerMeetings;
