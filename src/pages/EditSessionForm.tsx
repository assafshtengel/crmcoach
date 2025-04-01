import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { SessionSummaryForm } from '@/components/session/SessionSummaryForm';

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

const EditSessionForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [needsSummary, setNeedsSummary] = useState(false);
  const [forceEnable, setForceEnable] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

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
    };

    fetchPlayers();
  }, [navigate]);

  useEffect(() => {
    const fetchSession = async (id: string) => {
      const { data: sessionData, error } = await supabase
        .from('sessions')
        .select(`
          session_date,
          session_time,
          notes,
          player_id,
          location,
          meeting_type
        `)
        .eq('id', id)
        .single();

      if (error) {
        toast.error('שגיאה בטעינת פרטי המפגש');
        navigate('/sessions-list');
        return;
      }

      if (sessionData) {
        setSession(sessionData);
        setFormData({
          session_date: sessionData.session_date,
          session_time: sessionData.session_time,
          player_id: sessionData.player_id,
          notes: sessionData.notes || '',
          location: sessionData.location || '',
          meeting_type: sessionData.meeting_type || 'in_person'
        });
      }
      setIsLoading(false);
    };

    const state = location.state as { sessionId?: string; needsSummary?: boolean; forceEnable?: boolean } | null;
    
    if (state?.sessionId) {
      setSessionId(state.sessionId);
      setNeedsSummary(state.needsSummary || false);
      setForceEnable(state.forceEnable || false);
      fetchSession(state.sessionId);
    } else {
      navigate('/');
    }
  }, [navigate, location]);

  const onSubmitSummary = async (data: any) => {
    if (!sessionId) return;
    
    try {
      console.log("Saving session summary with player ID:", formData.player_id);
      console.log("Summary data:", data);
      console.log("chen ", formData)
      const { error } = await supabase
        .from('session_summaries')
        .insert({
          session_id: sessionId,
          coach_id: (await supabase.auth.getUser()).data.user?.id,
          player_id: formData.player_id,
          summary_text: data.summary_text,
          achieved_goals: data.achieved_goals.split('\n').filter(Boolean),
          future_goals: data.future_goals.split('\n').filter(Boolean),
          progress_rating: data.progress_rating,
          next_session_focus: data.next_session_focus,
          additional_notes: data.additional_notes || null,
          tools_used: data.tools_used || [],
          audio_url: data.audio_url || null
        });

      if (error) throw error;

      const playerName = players.find(p => p.id === formData.player_id)?.full_name;
      toast.success(`סיכום המפגש עם ${playerName} נשמר בהצלחה!`);
      
      await supabase
        .from('sessions')
        .update({ has_summary: true })
        .eq('id', sessionId);
        
      navigate('/all-meeting-summaries');
      
    } catch (error: any) {
      console.error('Error submitting summary:', error);
      toast.error('שגיאה בשמירת סיכום המפגש');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          session_date: formData.session_date,
          session_time: formData.session_time,
          player_id: formData.player_id,
          notes: formData.notes,
          location: formData.location,
          meeting_type: formData.meeting_type
        })
        .eq('id', sessionId);

      if (error) throw error;

      const playerName = players.find(p => p.id === formData.player_id)?.full_name;
      const meetingTypeText = formData.meeting_type === 'in_person' ? 'פרונטלי' : 'בזום';
      toast.success(`המפגש ${meetingTypeText} עם ${playerName} עודכן בהצלחה!`);
      navigate('/sessions-list');
    } catch (error) {
      toast.error('שגיאה בעדכון המפגש');
      console.error('Error updating session:', error);
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

  if (isLoading) {
    return (
      <div className="text-center py-8">
        טוען...
      </div>
    );
  }

  if (needsSummary) {
    return (
      <SessionSummaryForm
        sessionId={sessionId || ''}
        playerName={players.find(p => p.id === formData.player_id)?.full_name || ''}
        sessionDate={formData.session_date}
        playerId={formData.player_id}
        onSubmit={onSubmitSummary}
        onCancel={() => navigate('/sessions-list')}
        forceEnable={forceEnable}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-md mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">עריכת מפגש</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="session_date">תאריך</Label>
                <Input
                  id="session_date"
                  name="session_date"
                  type="date"
                  value={formData.session_date}
                  onChange={handleInputChange}
                  required
                  dir="ltr"
                />
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="player">בחר שחקן</Label>
                <Select
                  value={formData.player_id}
                  onValueChange={handlePlayerSelect}
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
                  onClick={() => navigate('/sessions-list')}
                >
                  ביטול
                </Button>
                <Button type="submit">שמור שינויים</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditSessionForm;
