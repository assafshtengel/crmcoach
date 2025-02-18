
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { usePlayers } from '@/contexts/PlayersContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SessionFormData {
  date: string;
  time: string;
  playerId: string;
  description: string;
}

const EditSessionForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { players, updateSession } = usePlayers();
  const [formData, setFormData] = useState<SessionFormData>({
    date: '',
    time: '',
    playerId: '',
    description: ''
  });

  useEffect(() => {
    const session = location.state?.session;
    if (session) {
      setFormData({
        date: session.date,
        time: session.time,
        playerId: session.playerId,
        description: session.description
      });
    } else {
      navigate('/sessions-list');
    }
  }, [location.state, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const session = location.state?.session;
    if (session) {
      const selectedPlayer = players.find(p => p.id === formData.playerId);
      const updatedSession = {
        ...formData,
        playerName: selectedPlayer?.name || session.playerName
      };
      
      updateSession(session.id, updatedSession);
      toast.success('המפגש עודכן בהצלחה!');
      navigate('/sessions-list');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlayerSelect = (value: string) => {
    setFormData(prev => ({ ...prev, playerId: value }));
  };

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
                <Label htmlFor="date">תאריך</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">שעה</Label>
                <Input
                  id="time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="player">בחר שחקן</Label>
                {players.length > 0 ? (
                  <Select
                    name="playerId"
                    value={formData.playerId}
                    onValueChange={handlePlayerSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר שחקן" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="playerName"
                    name="playerId"
                    placeholder="הכנס שם שחקן"
                    value={formData.playerId}
                    onChange={handleInputChange}
                    readOnly
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">תיאור המפגש</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="תאר את מטרת המפגש..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => navigate(-1)}
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
