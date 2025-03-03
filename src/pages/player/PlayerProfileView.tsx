
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, User, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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

const PlayerProfileView = () => {
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);

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
        const { data: sessions, error: sessionsError } = await supabase
          .from('sessions')
          .select('*, coaches(full_name)')
          .eq('player_id', playerId)
          .gte('session_date', now.toISOString().split('T')[0])
          .order('session_date', { ascending: true })
          .limit(5);
          
        if (sessionsError) throw sessionsError;
        setUpcomingSessions(sessions || []);
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
            variant="default"
            className="flex flex-col items-center px-6 py-4 h-auto min-w-[100px]"
          >
            <User className="h-6 w-6 mb-2" />
            <span>פרופיל</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center px-6 py-4 h-auto min-w-[100px]"
            onClick={() => {}}
          >
            <Calendar className="h-6 w-6 mb-2" />
            <span>אימונים</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center px-6 py-4 h-auto min-w-[100px]"
            onClick={() => {}}
          >
            <FileText className="h-6 w-6 mb-2" />
            <span>סיכומים</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Header Card */}
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

          {/* Upcoming Sessions Card */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">האימונים הקרובים שלי</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <p className="font-medium">{formatDate(session.session_date)}</p>
                        <p className="text-gray-500">{formatTime(session.session_time)}</p>
                        {session.location && <p className="text-gray-700">מיקום: {session.location}</p>}
                      </div>
                      <div>
                        <p className="text-gray-700">מאמן: {session.coaches?.full_name || "לא צוין"}</p>
                        {session.notes && <p className="text-gray-500 mt-2">הערות: {session.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">אין אימונים מתוכננים בקרוב</p>
                </div>
              )}
            </CardContent>
          </Card>

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
      </div>
    </div>
  );
};

export default PlayerProfileView;
