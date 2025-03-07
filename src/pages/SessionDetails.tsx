
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ChevronRight, Home, FileEdit, Trash2, FileText } from 'lucide-react';
import { format } from 'date-fns';

const SessionDetails = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      if (sessionData) {
        setSession(sessionData);
        
        // Fetch player details
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .select('*')
          .eq('id', sessionData.player_id)
          .single();

        if (playerError) throw playerError;
        setPlayer(playerData);
      }
    } catch (error: any) {
      toast.error('שגיאה בטעינת פרטי המפגש');
      console.error('Error fetching session details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את המפגש הזה?')) return;

    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      toast.success('המפגש נמחק בהצלחה');
      navigate('/sessions-list');
    } catch (error: any) {
      toast.error('שגיאה במחיקת המפגש');
      console.error('Error deleting session:', error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!session || !player) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-500">המפגש המבוקש לא נמצא</p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => navigate('/sessions-list')}>חזרה לרשימת המפגשים</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              title="חזור לדף הקודם"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/')}
              title="חזור לדשבורד"
            >
              <Home className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/edit-session/${sessionId}`)}
            >
              <FileEdit className="h-4 w-4 mr-2" />
              ערוך מפגש
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSession}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              מחק מפגש
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>פרטי מפגש</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/session-summary/${sessionId}`)}
              >
                <FileText className="h-4 w-4 mr-2" />
                סיכום מפגש
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">שם השחקן</h3>
                <p className="text-lg font-medium">{player.full_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">תאריך</h3>
                <p className="text-lg font-medium">{session.session_date ? new Date(session.session_date).toLocaleDateString('he-IL') : '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">שעה</h3>
                <p className="text-lg font-medium">{session.session_time || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">מיקום</h3>
                <p className="text-lg font-medium">{session.location || '-'}</p>
              </div>
            </div>
            
            <div className="pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">הערות</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="whitespace-pre-wrap">{session.notes || 'אין הערות'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SessionDetails;
