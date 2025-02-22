
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ChevronRight, Loader2, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface PlayerProfile {
  full_name: string;
  email: string;
  phone: string;
  birthDate: string;
  city: string;
  club: string;
  yearGroup: string;
  position: string;
  injuries?: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  notes?: string;
}

const positionLabels: Record<string, string> = {
  goalkeeper: "שוער",
  defender: "בלם",
  fullback: "מגן",
  midfielder: "קשר",
  winger: "כנף",
  striker: "חלוץ"
};

const PlayerProfile = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<PlayerProfile | null>(null);

  useEffect(() => {
    fetchPlayerProfile();
  }, [playerId]);

  const fetchPlayerProfile = async () => {
    try {
      if (!playerId) return;

      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setPlayer(data as PlayerProfile);
      }
    } catch (error) {
      console.error('Error fetching player profile:', error);
      toast.error('שגיאה בטעינת פרטי השחקן');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate('/edit-player', { state: { playerId } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">לא נמצא שחקן</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/players-list')}
          >
            <ChevronRight className="h-4 w-4 ml-2" />
            חזרה לרשימת השחקנים
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/players-list')}
          >
            <ChevronRight className="h-4 w-4 ml-2" />
            חזרה לרשימת השחקנים
          </Button>
          <Button
            onClick={handleEdit}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            ערוך פרטים
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">פרופיל שחקן: {player.full_name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* פרטים אישיים */}
            <section>
              <h3 className="text-lg font-semibold mb-4">פרטים אישיים</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="font-medium">שם מלא</Label>
                  <p className="mt-1">{player.full_name}</p>
                </div>
                <div>
                  <Label className="font-medium">תאריך לידה</Label>
                  <p className="mt-1">{player.birthDate}</p>
                </div>
                <div>
                  <Label className="font-medium">אימייל</Label>
                  <p className="mt-1" dir="ltr">{player.email}</p>
                </div>
                <div>
                  <Label className="font-medium">טלפון</Label>
                  <p className="mt-1" dir="ltr">{player.phone}</p>
                </div>
                <div>
                  <Label className="font-medium">עמדה</Label>
                  <p className="mt-1">{positionLabels[player.position] || player.position}</p>
                </div>
              </div>
            </section>

            {/* פרטי מועדון */}
            <section>
              <h3 className="text-lg font-semibold mb-4">פרטי מועדון</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="font-medium">עיר</Label>
                  <p className="mt-1">{player.city}</p>
                </div>
                <div>
                  <Label className="font-medium">מועדון</Label>
                  <p className="mt-1">{player.club}</p>
                </div>
                <div>
                  <Label className="font-medium">שנתון</Label>
                  <p className="mt-1">{player.yearGroup}</p>
                </div>
              </div>
            </section>

            {/* פרטי הורה */}
            <section>
              <h3 className="text-lg font-semibold mb-4">פרטי הורה</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="font-medium">שם ההורה</Label>
                  <p className="mt-1">{player.parentName}</p>
                </div>
                <div>
                  <Label className="font-medium">טלפון הורה</Label>
                  <p className="mt-1" dir="ltr">{player.parentPhone}</p>
                </div>
                <div>
                  <Label className="font-medium">אימייל הורה</Label>
                  <p className="mt-1" dir="ltr">{player.parentEmail}</p>
                </div>
              </div>
            </section>

            {/* מידע נוסף */}
            {(player.injuries || player.notes) && (
              <section>
                <h3 className="text-lg font-semibold mb-4">מידע נוסף</h3>
                <div className="space-y-4">
                  {player.injuries && (
                    <div>
                      <Label className="font-medium">פציעות עבר</Label>
                      <p className="mt-1 whitespace-pre-wrap">{player.injuries}</p>
                    </div>
                  )}
                  {player.notes && (
                    <div>
                      <Label className="font-medium">הערות נוספות</Label>
                      <p className="mt-1 whitespace-pre-wrap">{player.notes}</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlayerProfile;
