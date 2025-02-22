
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ChevronRight, Loader2, Pencil, ScrollText } from 'lucide-react';
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
    navigate('/edit-player', { state: { playerId, playerData: player } });
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
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/players-list')}
                className="shrink-0"
              >
                <ChevronRight className="h-4 w-4 ml-2" />
                חזרה לרשימת השחקנים
              </Button>
              <h1 className="text-2xl font-bold">{player.full_name}</h1>
            </div>
            <Button
              onClick={handleEdit}
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              ערוך פרטים
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <Card className="lg:col-span-2">
            <CardHeader className="border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <ScrollText className="h-5 w-5" />
                פרטים אישיים
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="font-medium text-gray-600">שם מלא</Label>
                  <p className="mt-1 text-lg">{player.full_name}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-600">תאריך לידה</Label>
                  <p className="mt-1 text-lg">{player.birthDate}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-600">אימייל</Label>
                  <p className="mt-1 text-lg" dir="ltr">{player.email}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-600">טלפון</Label>
                  <p className="mt-1 text-lg" dir="ltr">{player.phone}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-600">עמדה</Label>
                  <p className="mt-1 text-lg">
                    {positionLabels[player.position] || player.position}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">פרטי מועדון</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="font-medium text-gray-600">עיר</Label>
                    <p className="mt-1 text-lg">{player.city}</p>
                  </div>
                  <div>
                    <Label className="font-medium text-gray-600">מועדון</Label>
                    <p className="mt-1 text-lg">{player.club}</p>
                  </div>
                  <div>
                    <Label className="font-medium text-gray-600">שנתון</Label>
                    <p className="mt-1 text-lg">{player.yearGroup}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parent Info Card */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-xl">פרטי הורה</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label className="font-medium text-gray-600">שם ההורה</Label>
                <p className="mt-1 text-lg">{player.parentName}</p>
              </div>
              <div>
                <Label className="font-medium text-gray-600">טלפון הורה</Label>
                <p className="mt-1 text-lg" dir="ltr">{player.parentPhone}</p>
              </div>
              <div>
                <Label className="font-medium text-gray-600">אימייל הורה</Label>
                <p className="mt-1 text-lg" dir="ltr">{player.parentEmail}</p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info Card */}
          {(player.injuries || player.notes) && (
            <Card className="lg:col-span-3">
              <CardHeader className="border-b">
                <CardTitle className="text-xl">מידע נוסף</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {player.injuries && (
                  <div>
                    <Label className="font-medium text-gray-600">פציעות עבר</Label>
                    <p className="mt-2 text-lg p-4 bg-gray-50 rounded-lg">
                      {player.injuries}
                    </p>
                  </div>
                )}
                {player.notes && (
                  <div>
                    <Label className="font-medium text-gray-600">הערות נוספות</Label>
                    <p className="mt-2 text-lg p-4 bg-gray-50 rounded-lg">
                      {player.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;
