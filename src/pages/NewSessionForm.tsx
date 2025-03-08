import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Home } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
interface Player {
  id: string;
  full_name: string;
}
interface SessionFormData {
  player_id: string;
  session_date: string;
  session_time: string;
  location: string;
  notes: string;
}
const NewSessionForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [formData, setFormData] = useState<SessionFormData>({
    player_id: '',
    session_date: '',
    session_time: '',
    location: '',
    notes: ''
  });
  useEffect(() => {
    fetchPlayers();
  }, []);
  const fetchPlayers = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      const {
        data,
        error
      } = await supabase.from('players').select('id, full_name').eq('coach_id', user.id);
      if (error) throw error;
      setPlayers(data || []);
    } catch (error: any) {
      toast.error('שגיאה בטעינת רשימת השחקנים');
      console.error('Error fetching players:', error);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.player_id || !formData.session_date || !formData.session_time || !formData.location) {
      toast.error('נא למלא את כל שדות החובה');
      return;
    }
    setLoading(true);
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error('לא נמצא משתמש מחובר');
        navigate('/auth');
        return;
      }
      const selectedPlayer = players.find(p => p.id === formData.player_id);
      const {
        error: sessionError
      } = await supabase.from('sessions').insert({
        coach_id: user.id,
        player_id: formData.player_id,
        session_date: formData.session_date,
        session_time: formData.session_time,
        location: formData.location,
        notes: formData.notes
      });
      if (sessionError) throw sessionError;

      // Create notification for new session
      const {
        error: notificationError
      } = await supabase.from('notifications').insert({
        coach_id: user.id,
        type: 'new_session',
        message: `נקבע מפגש חדש עם ${selectedPlayer?.full_name} בתאריך ${formData.session_date}`
      });
      if (notificationError) throw notificationError;
      toast.success(`המפגש עם ${selectedPlayer?.full_name} נקבע בהצלחה ל-${formData.session_date} בשעה ${formData.session_time}!`);
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'אירעה שגיאה בקביעת המפגש');
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-md mx-auto px-4 bg-zinc-300">
        <div className="flex justify-end mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate('/')} title="חזרה לדף הראשי">
            <Home className="h-4 w-4" />
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-[D4EDDA] bg-[#d3f0da]">
            <CardTitle className="text-2xl font-bold text-center">קביעת מפגש חדש</CardTitle>
          </CardHeader>
          <CardContent className="bg-[#bfdfc7]">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="player">בחר שחקן</Label>
                <Select value={formData.player_id} onValueChange={value => setFormData(prev => ({
                ...prev,
                player_id: value
              }))}>
                  <SelectTrigger className="bg-zinc-400">
                    <SelectValue placeholder="בחר שחקן" />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map(player => <SelectItem key={player.id} value={player.id}>
                        {player.full_name}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session_date">תאריך</Label>
                <Input id="session_date" name="session_date" type="date" value={formData.session_date} onChange={e => setFormData(prev => ({
                ...prev,
                session_date: e.target.value
              }))} required dir="ltr" />
              </div>

              <div className="space-y-2 text-[007BFF] text-[#eceff1] bg-[007BFF] bg-[#1078ed]">
                <Label htmlFor="session_time">שעה</Label>
                <Input id="session_time" name="session_time" type="time" value={formData.session_time} onChange={e => setFormData(prev => ({
                ...prev,
                session_time: e.target.value
              }))} required dir="ltr" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">מיקום</Label>
                <Input id="location" name="location" type="text" value={formData.location} onChange={e => setFormData(prev => ({
                ...prev,
                location: e.target.value
              }))} placeholder="הכנס את מיקום המפגש" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">הערות</Label>
                <Textarea id="notes" name="notes" value={formData.notes} onChange={e => setFormData(prev => ({
                ...prev,
                notes: e.target.value
              }))} placeholder="הערות על המפגש..." className="h-24" />
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <Button variant="outline" type="button" onClick={() => navigate(-1)}>
                  ביטול
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'שומר...' : 'שמירה'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default NewSessionForm;