
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ChevronRight, Loader2, Pencil, ScrollText, User, Home, Phone, Copy, Link, CheckCircle, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

interface PlayerProfile {
  full_name: string;
  email: string;
  phone: string;
  birthdate: string;
  city: string;
  club: string;
  year_group: string;
  position: string;
  injuries?: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
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
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [profileUrl, setProfileUrl] = useState('');

  useEffect(() => {
    fetchPlayerProfile();

    // Generate profile URL based on current window location
    const baseUrl = window.location.origin;
    setProfileUrl(`${baseUrl}/player-profile/${playerId}`);
  }, [playerId]);

  const fetchPlayerProfile = async () => {
    try {
      if (!playerId) {
        toast.error('מזהה שחקן חסר');
        return;
      }

      console.log('Fetching player with ID:', playerId);

      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      if (data) {
        console.log('Player data received:', data);
        setPlayer(data as PlayerProfile);
      } else {
        console.log('No player data found');
        toast.error('לא נמצאו נתוני שחקן');
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

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedField(field);
        toast.success('הועתק ללוח');
        
        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setCopiedField(null);
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast.error('שגיאה בהעתקה');
      });
  };

  const viewAsPlayer = () => {
    // This would normally navigate to a player-view version of the profile
    // For now, we'll just show a toast notification
    toast('צפייה בתצוגת שחקן תהיה זמינה בקרוב', {
      description: 'פיתוח תכונה זו בתהליך'
    });
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
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 mb-6 border border-indigo-100">
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
              <h1 className="text-2xl font-bold text-indigo-950">{player.full_name}</h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={viewAsPlayer}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                צפה כשחקן
              </Button>
              <Button
                onClick={handleEdit}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <Pencil className="h-4 w-4" />
                ערוך פרטים
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Access Details Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-indigo-100">
            <CardHeader className="border-b border-indigo-100">
              <CardTitle className="text-xl flex items-center gap-2 text-indigo-950">
                <Link className="h-5 w-5 text-indigo-600" />
                פרטי גישה
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-medium text-indigo-900">מזהה שחקן</Label>
                  <div className="flex items-center gap-2">
                    <Input value={playerId} readOnly className="bg-gray-50 font-mono text-sm" />
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => copyToClipboard(playerId || '', 'playerId')}
                      className="flex-shrink-0"
                    >
                      {copiedField === 'playerId' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium text-indigo-900">קישור לפרופיל</Label>
                  <div className="flex items-center gap-2">
                    <Input value={profileUrl} readOnly className="bg-gray-50 font-mono text-xs" dir="ltr" />
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => copyToClipboard(profileUrl, 'profileUrl')}
                      className="flex-shrink-0"
                    >
                      {copiedField === 'profileUrl' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium text-indigo-900">אימייל</Label>
                  <div className="flex items-center gap-2">
                    <Input value={player.email} readOnly className="bg-gray-50 font-mono text-sm" dir="ltr" />
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => copyToClipboard(player.email, 'email')}
                      className="flex-shrink-0"
                    >
                      {copiedField === 'email' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Alert className="bg-blue-50 border-blue-200 mt-4">
                  <AlertDescription className="text-blue-800 text-sm">
                    הערה: בעתיד השחקנים יוכלו להתחבר ולעדכן את הפרופיל שלהם באופן עצמאי.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-indigo-100">
            <CardHeader className="border-b border-indigo-100">
              <CardTitle className="text-xl flex items-center gap-2 text-indigo-950">
                <User className="h-5 w-5 text-indigo-600" />
                פרטים אישיים
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-indigo-50/50 rounded-lg mb-6">
                <div>
                  <Label className="font-medium text-indigo-900">שם מלא</Label>
                  <p className="mt-1 text-lg">{player.full_name}</p>
                </div>
                <div>
                  <Label className="font-medium text-indigo-900">אימייל</Label>
                  <p className="mt-1 text-lg" dir="ltr">{player.email}</p>
                </div>
                <div>
                  <Label className="font-medium text-indigo-900">טלפון</Label>
                  <p className="mt-1 text-lg" dir="ltr">{player.phone}</p>
                </div>
                <div>
                  <Label className="font-medium text-indigo-900">עמדה</Label>
                  <p className="mt-1 text-lg">
                    {positionLabels[player.position] || player.position}
                  </p>
                </div>
                <div>
                  <Label className="font-medium text-indigo-900">תאריך לידה</Label>
                  <p className="mt-1 text-lg">{player.birthdate}</p>
                </div>
              </div>

              <div className="border-t border-indigo-100 pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-indigo-950">
                  <Home className="h-5 w-5 text-indigo-600" />
                  פרטי מועדון
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-indigo-50/50 rounded-lg">
                  <div>
                    <Label className="font-medium text-indigo-900">עיר</Label>
                    <p className="mt-1 text-lg">{player.city}</p>
                  </div>
                  <div>
                    <Label className="font-medium text-indigo-900">מועדון</Label>
                    <p className="mt-1 text-lg">{player.club}</p>
                  </div>
                  <div>
                    <Label className="font-medium text-indigo-900">שנתון</Label>
                    <p className="mt-1 text-lg">{player.year_group}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-indigo-100">
            <CardHeader className="border-b border-indigo-100">
              <CardTitle className="text-xl flex items-center gap-2 text-indigo-950">
                <Phone className="h-5 w-5 text-indigo-600" />
                פרטי הורה
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4 p-4 bg-indigo-50/50 rounded-lg">
                <div>
                  <Label className="font-medium text-indigo-900">שם ההורה</Label>
                  <p className="mt-1 text-lg">{player.parent_name}</p>
                </div>
                <div>
                  <Label className="font-medium text-indigo-900">טלפון הורה</Label>
                  <p className="mt-1 text-lg" dir="ltr">{player.parent_phone}</p>
                </div>
                <div>
                  <Label className="font-medium text-indigo-900">אימייל הורה</Label>
                  <p className="mt-1 text-lg" dir="ltr">{player.parent_email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {(player.injuries || player.notes) && (
            <Card className="lg:col-span-3 bg-white/80 backdrop-blur-sm border-indigo-100">
              <CardHeader className="border-b border-indigo-100">
                <CardTitle className="text-xl flex items-center gap-2 text-indigo-950">
                  <ScrollText className="h-5 w-5 text-indigo-600" />
                  מידע נוסף
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {player.injuries && (
                  <div className="p-4 bg-indigo-50/50 rounded-lg">
                    <Label className="font-medium text-indigo-900">פציעות עבר</Label>
                    <p className="mt-2 text-lg">
                      {player.injuries}
                    </p>
                  </div>
                )}
                {player.notes && (
                  <div className="p-4 bg-indigo-50/50 rounded-lg">
                    <Label className="font-medium text-indigo-900">הערות נוספות</Label>
                    <p className="mt-2 text-lg">
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
