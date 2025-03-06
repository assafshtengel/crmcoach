
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  User, 
  Calendar, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MapPin,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Player {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  birthdate: string;
  city: string;
  club: string;
  year_group: string;
  injuries: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  notes: string;
  sport_field: string;
  profile_image: string;
}

interface Session {
  id: string;
  session_date: string;
  session_time: string;
  location: string | null;
  notes: string | null;
  coaches: {
    full_name: string;
  };
  has_summary: boolean;
  session_summary?: {
    id: string;
    summary_text: string;
    achieved_goals: string[] | null;
    future_goals: string[] | null;
    progress_rating: number | null;
    next_session_focus: string | null;
    additional_notes: string | null;
    tools_used: any[] | null;
  } | null;
}

type TimeFilter = 'all' | 'upcoming' | 'past' | 'week' | 'month';

const PlayerProfileView = () => {
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [pastSessions, setPastSessions] = useState<Session[]>([]);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);
        
        // Get player session from localStorage
        const playerSession = localStorage.getItem('playerSession');
        
        if (!playerSession) {
          throw new Error("אין פרטי התחברות לשחקן");
        }

        const playerData = JSON.parse(playerSession);
        const playerId = playerData.id;
        
        // Fetch player details
        const { data: playerDetails, error: playerError } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerId)
          .single();

        if (playerError) throw playerError;
        if (!playerDetails) throw new Error("לא נמצאו פרטי שחקן");
        
        setPlayer(playerDetails);
        
        // Fetch upcoming sessions for the player
        const now = new Date();
        const { data: upcomingSessionsData, error: upcomingSessionsError } = await supabase
          .from('sessions')
          .select(`
            *, 
            coaches(full_name),
            has_summary:session_summaries(id)
          `)
          .eq('player_id', playerId)
          .gte('session_date', now.toISOString().split('T')[0])
          .order('session_date', { ascending: true });
          
        if (upcomingSessionsError) throw upcomingSessionsError;
        
        // Format has_summary boolean
        const formattedUpcomingSessions = (upcomingSessionsData || []).map(session => ({
          ...session,
          has_summary: session.has_summary && session.has_summary.length > 0
        }));
        
        setUpcomingSessions(formattedUpcomingSessions);
        
        // Fetch past sessions for the player
        const { data: pastSessionsData, error: pastSessionsError } = await supabase
          .from('sessions')
          .select(`
            *, 
            coaches(full_name),
            has_summary:session_summaries(id),
            session_summary:session_summaries(
              id,
              summary_text,
              achieved_goals,
              future_goals,
              progress_rating,
              next_session_focus,
              additional_notes,
              tools_used
            )
          `)
          .eq('player_id', playerId)
          .lt('session_date', now.toISOString().split('T')[0])
          .order('session_date', { ascending: false });
          
        if (pastSessionsError) throw pastSessionsError;
        
        // Format has_summary boolean
        const formattedPastSessions = (pastSessionsData || []).map(session => ({
          ...session,
          has_summary: session.has_summary && session.has_summary.length > 0
        }));
        
        setPastSessions(formattedPastSessions);
        
      } catch (err: any) {
        console.error("Error fetching player data:", err);
        setError(err.message);
        toast.error("שגיאה בטעינת פרטי השחקן");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('playerSession');
    navigate('/player-auth');
    toast.success("התנתקת בהצלחה");
  };

  const toggleSession = (sessionId: string) => {
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null);
    } else {
      setExpandedSessionId(sessionId);
    }
  };

  const filterSessionsByTime = (sessions: Session[], filter: TimeFilter): Session[] => {
    const now = new Date();
    
    switch (filter) {
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAhead = new Date();
        weekAhead.setDate(weekAhead.getDate() + 7);
        return sessions.filter(session => {
          const sessionDate = new Date(session.session_date);
          return sessionDate >= weekAgo && sessionDate <= weekAhead;
        });
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const monthAhead = new Date();
        monthAhead.setMonth(monthAhead.getMonth() + 1);
        return sessions.filter(session => {
          const sessionDate = new Date(session.session_date);
          return sessionDate >= monthAgo && sessionDate <= monthAhead;
        });
      case 'upcoming':
        return sessions.filter(session => new Date(session.session_date) >= now);
      case 'past':
        return sessions.filter(session => new Date(session.session_date) < now);
      case 'all':
      default:
        return sessions;
    }
  };

  const getFilteredUpcomingSessions = () => {
    return filterSessionsByTime(upcomingSessions, timeFilter);
  };

  const getFilteredPastSessions = () => {
    return filterSessionsByTime(pastSessions, timeFilter);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">שגיאה בטעינת פרטי השחקן</p>
          <p>{error || "לא נמצאו פרטים"}</p>
          <Button 
            onClick={() => navigate('/player-auth')}
            className="mt-4"
            variant="outline"
          >
            חזרה לדף ההתחברות
          </Button>
        </div>
      </div>
    );
  }

  const profileImageUrl = player.profile_image || 'https://via.placeholder.com/150';

  // Format date to display in Hebrew format
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('he-IL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  // Format time to display in Hebrew format
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Extract HH:MM from HH:MM:SS
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="w-full bg-[#1A1F2C] text-white py-6 mb-8 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">הפרופיל שלי</h1>
          <Button variant="outline" onClick={handleLogout} className="text-white border-white hover:bg-white/10">
            התנתק
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 pb-12">
        <div className="flex mb-6 overflow-x-auto pb-2 justify-center gap-4">
          <Button
            variant="outline"
            className="flex flex-col items-center px-6 py-4 h-auto min-w-[100px]"
            onClick={() => {}}
          >
            <Home className="h-6 w-6 mb-2" />
            <span>ראשי</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center px-6 py-4 h-auto min-w-[100px]"
            onClick={() => setActiveTab('profile')}
          >
            <User className="h-6 w-6 mb-2" />
            <span>פרופיל</span>
          </Button>
          <Button
            variant="default"
            className="flex flex-col items-center px-6 py-4 h-auto min-w-[100px]"
            onClick={() => setActiveTab('upcoming')}
          >
            <Calendar className="h-6 w-6 mb-2" />
            <span>אימונים</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center px-6 py-4 h-auto min-w-[100px]"
            onClick={() => setActiveTab('past')}
          >
            <FileText className="h-6 w-6 mb-2" />
            <span>סיכומים</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Header Card - Always visible */}
          <Card className="lg:col-span-3">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                <div className="w-24 h-24 relative shrink-0 rounded-full overflow-hidden">
                  <img 
                    src={profileImageUrl} 
                    alt={player.full_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/150?text=' + encodeURIComponent(player.full_name);
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{player.full_name}</h2>
                  <p className="text-gray-500">{player.sport_field || "לא צוין ענף ספורטיבי"}</p>
                  <p className="text-gray-700 mt-1">
                    {player.club && player.year_group ? (
                      <span>
                        {player.club} • {player.year_group}
                      </span>
                    ) : player.club ? (
                      <span>{player.club}</span>
                    ) : player.year_group ? (
                      <span>{player.year_group}</span>
                    ) : (
                      <span>לא צוין מועדון/קבוצת גיל</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filter controls */}
          <div className="lg:col-span-3 flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">
              {activeTab === 'upcoming' ? 'האימונים הקרובים שלי' : 
               activeTab === 'past' ? 'סיכומי האימונים הקודמים' : 'הפרופיל שלי'}
            </h3>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select 
                value={timeFilter} 
                onValueChange={(value) => setTimeFilter(value as TimeFilter)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="סנן לפי זמן" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל האימונים</SelectItem>
                  <SelectItem value="upcoming">אימונים עתידיים</SelectItem>
                  <SelectItem value="past">אימונים קודמים</SelectItem>
                  <SelectItem value="week">שבוע אחרון/הבא</SelectItem>
                  <SelectItem value="month">חודש אחרון/הבא</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'upcoming' && (
              <Card>
                <CardContent className="p-6">
                  {getFilteredUpcomingSessions().length > 0 ? (
                    <div className="space-y-4">
                      {getFilteredUpcomingSessions().map((session) => (
                        <Collapsible 
                          key={session.id} 
                          open={expandedSessionId === session.id}
                          onOpenChange={() => toggleSession(session.id)}
                          className="border rounded-lg overflow-hidden"
                        >
                          <div className="p-4 bg-white flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-lg">{formatDate(session.session_date)}</p>
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    {expandedSessionId === session.id ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                </CollapsibleTrigger>
                              </div>
                              <p className="text-gray-500">{formatTime(session.session_time)}</p>
                              <div className="flex items-center mt-1 gap-2">
                                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                  <Clock className="h-3 w-3 mr-1" />
                                  עתידי
                                </Badge>
                                <p className="text-gray-700">מאמן: {session.coaches?.full_name || "לא צוין"}</p>
                              </div>
                            </div>
                          </div>
                          <CollapsibleContent>
                            <div className="p-4 pt-0 border-t">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  {session.location && (
                                    <div className="flex items-start mt-2">
                                      <MapPin className="h-4 w-4 mt-1 mr-1 text-gray-500" />
                                      <p className="text-gray-700">מיקום: {session.location}</p>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  {session.notes && (
                                    <div className="mt-2">
                                      <p className="font-medium text-sm text-gray-700">הערות:</p>
                                      <p className="text-gray-600 mt-1">{session.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">אין אימונים מתוכננים בקרוב</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'past' && (
              <Card>
                <CardContent className="p-6">
                  {getFilteredPastSessions().length > 0 ? (
                    <div className="space-y-4">
                      {getFilteredPastSessions().map((session) => (
                        <Collapsible 
                          key={session.id} 
                          open={expandedSessionId === session.id}
                          onOpenChange={() => toggleSession(session.id)}
                          className="border rounded-lg overflow-hidden"
                        >
                          <div className="p-4 bg-white flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-lg">{formatDate(session.session_date)}</p>
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    {expandedSessionId === session.id ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                </CollapsibleTrigger>
                              </div>
                              <p className="text-gray-500">{formatTime(session.session_time)}</p>
                              <div className="flex items-center mt-1 gap-2">
                                {session.has_summary ? (
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    יש סיכום
                                  </Badge>
                                ) : (
                                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    אין סיכום
                                  </Badge>
                                )}
                                <p className="text-gray-700">מאמן: {session.coaches?.full_name || "לא צוין"}</p>
                              </div>
                            </div>
                          </div>
                          <CollapsibleContent>
                            <div className="p-4 pt-0 border-t">
                              <div className="grid grid-cols-1 gap-4">
                                {session.location && (
                                  <div className="flex items-start mt-2">
                                    <MapPin className="h-4 w-4 mt-1 mr-1 text-gray-500" />
                                    <p className="text-gray-700">מיקום: {session.location}</p>
                                  </div>
                                )}
                                
                                {session.has_summary && session.session_summary ? (
                                  <div className="mt-2 bg-gray-50 p-4 rounded-md">
                                    <h4 className="font-medium text-lg mb-2">סיכום האימון</h4>
                                    <p className="text-gray-700 whitespace-pre-wrap mb-4">{session.session_summary.summary_text}</p>
                                    
                                    {session.session_summary.achieved_goals && session.session_summary.achieved_goals.length > 0 && (
                                      <div className="mb-3">
                                        <h5 className="font-medium text-sm text-gray-700 mb-1">מטרות שהושגו:</h5>
                                        <ul className="list-disc list-inside">
                                          {session.session_summary.achieved_goals.map((goal, index) => (
                                            <li key={index} className="text-gray-600">{goal}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    
                                    {session.session_summary.future_goals && session.session_summary.future_goals.length > 0 && (
                                      <div className="mb-3">
                                        <h5 className="font-medium text-sm text-gray-700 mb-1">מטרות להמשך:</h5>
                                        <ul className="list-disc list-inside">
                                          {session.session_summary.future_goals.map((goal, index) => (
                                            <li key={index} className="text-gray-600">{goal}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    
                                    {session.session_summary.next_session_focus && (
                                      <div className="mb-3">
                                        <h5 className="font-medium text-sm text-gray-700 mb-1">פוקוס לאימון הבא:</h5>
                                        <p className="text-gray-600">{session.session_summary.next_session_focus}</p>
                                      </div>
                                    )}
                                    
                                    {session.session_summary.additional_notes && (
                                      <div className="mb-3">
                                        <h5 className="font-medium text-sm text-gray-700 mb-1">הערות נוספות:</h5>
                                        <p className="text-gray-600">{session.session_summary.additional_notes}</p>
                                      </div>
                                    )}
                                  </div>
                                ) : session.notes ? (
                                  <div className="mt-2">
                                    <p className="font-medium text-sm text-gray-700">הערות:</p>
                                    <p className="text-gray-600 mt-1">{session.notes}</p>
                                  </div>
                                ) : (
                                  <div className="text-center py-2">
                                    <p className="text-gray-500">אין סיכום אימון זמין</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">אין אימונים קודמים להצגה</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Personal Info Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">פרטים אישיים</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <dl className="grid grid-cols-1 gap-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-700">שם מלא</dt>
                        <dd>{player.full_name}</dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-gray-700">כתובת אימייל</dt>
                        <dd dir="ltr" className="font-mono text-sm">{player.email}</dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-gray-700">מספר טלפון</dt>
                        <dd dir="ltr" className="font-mono text-sm">{player.phone || "-"}</dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-gray-700">תאריך לידה</dt>
                        <dd>{player.birthdate || "-"}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
                
                {/* Club Info Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">פרטי מועדון</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <dl className="grid grid-cols-1 gap-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-700">עיר</dt>
                        <dd>{player.city || "-"}</dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-gray-700">מועדון</dt>
                        <dd>{player.club || "-"}</dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-gray-700">שכבת גיל</dt>
                        <dd>{player.year_group || "-"}</dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-gray-700">ענף ספורט</dt>
                        <dd>{player.sport_field || "-"}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">פרטי הורים</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <dl className="grid grid-cols-1 gap-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-700">שם הורה</dt>
                        <dd>{player.parent_name || "-"}</dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-gray-700">טלפון הורה</dt>
                        <dd dir="ltr" className="font-mono text-sm">{player.parent_phone || "-"}</dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-gray-700">אימייל הורה</dt>
                        <dd dir="ltr" className="font-mono text-sm">{player.parent_email || "-"}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
                
                <Card className="lg:col-span-3">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">מידע נוסף</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">פציעות</h3>
                        <p className="whitespace-pre-wrap bg-gray-50 p-3 rounded-md min-h-24">
                          {player.injuries || "לא צוינו פציעות"}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">הערות</h3>
                        <p className="whitespace-pre-wrap bg-gray-50 p-3 rounded-md min-h-24">
                          {player.notes || "אין הערות"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfileView;
