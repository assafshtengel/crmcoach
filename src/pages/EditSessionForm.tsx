
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

interface Player {
  id: string;
  full_name: string;
}

interface SessionFormData {
  session_date: string;
  session_time: string;
  player_id: string;
  notes: string;
}

const EditSessionForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = location.state?.sessionId;
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<SessionFormData>({
    session_date: '',
    session_time: '',
    player_id: '',
    notes: ''
  });

  // Fetch players
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

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) {
        navigate('/sessions-list');
        return;
      }

      const { data: sessionData, error } = await supabase
        .from('sessions')
        .select(`
          session_date,
          session_time,
          notes,
          player_id
        `)
        .eq('id', sessionId)
        .single();

      if (error) {
        toast.error('שגיאה בטעינת פרטי המפגש');
        navigate('/sessions-list');
        return;
      }

      if (sessionData) {
        setFormData({
          session_date: sessionData.session_date,
          session_time: sessionData.session_time,
          player_id: sessionData.player_id,
          notes: sessionData.notes || ''
        });
      }
      setIsLoading(false);
    };

    fetchSession();
  }, [sessionId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          session_date: formData.session_date,
          session_time: formData.session_time,
          player_id: formData.player_id,
          notes: formData.notes
        })
        .eq('id', sessionId);

      if (error) throw error;

      const playerName = players.find(p => p.id === formData.player_id)?.full_name;
      toast.success(`המפגש עם ${playerName} עודכן בהצלחה!`);
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
