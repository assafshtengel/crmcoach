
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";
import { Copy, Check, Key } from 'lucide-react';

const PlayerFile = () => {
  const { playerId } = useParams();
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerId)
          .single();

        if (error) throw error;
        setPlayer(data);
      } catch (error) {
        console.error('Error fetching player data:', error);
        toast.error('שגיאה בטעינת נתוני השחקן');
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      fetchPlayerData();
    }
  }, [playerId]);

  const generatePassword = () => {
    // Generate a simple password - 6 characters with letters and numbers
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 6; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const savePassword = async (password: string) => {
    try {
      const { error } = await supabase
        .from('players')
        .update({ password })
        .eq('id', playerId);

      if (error) throw error;
      
      // Update the local state with the new password
      setPlayer(prev => ({ ...prev, password }));
      toast.success('הסיסמה נשמרה בהצלחה');
    } catch (error) {
      console.error('Error saving password:', error);
      toast.error('שגיאה בשמירת הסיסמה');
    }
  };

  const createPassword = async () => {
    const newPassword = generatePassword();
    await savePassword(newPassword);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(field);
    setTimeout(() => setCopySuccess(null), 2000);
    toast.success('הועתק ללוח');
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>פרטי התחברות</CardTitle>
              <CardDescription>פרטי ההתחברות של השחקן לאזור האישי</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">שם משתמש</p>
                  <p className="font-medium">{player?.email}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(player?.email, 'username')}
                >
                  {copySuccess === 'username' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">סיסמה</p>
                  <p className="font-medium">{player?.password || 'לא הוגדרה סיסמה'}</p>
                </div>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  {!player?.password ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={createPassword}
                    >
                      <Key className="h-4 w-4 mr-1" /> יצירת סיסמה
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(player?.password, 'password')}
                    >
                      {copySuccess === 'password' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  השחקן יכול להיכנס למערכת דרך הקישור: <span className="font-medium">/player-auth</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>תיק שחקן</CardTitle>
              <CardDescription>סקירה כללית של פרטי השחקן</CardDescription>
            </CardHeader>
            <CardContent>
              {player ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">שם מלא:</p>
                    <p>{player.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">אימייל:</p>
                    <p>{player.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">טלפון:</p>
                    <p>{player.phone || 'לא הוגדר'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">תאריך לידה:</p>
                    <p>{player.birthdate || 'לא הוגדר'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">מועדון:</p>
                    <p>{player.club || 'לא הוגדר'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">עיר:</p>
                    <p>{player.city || 'לא הוגדר'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">תחום ספורט:</p>
                    <p>{player.sport_field || 'לא הוגדר'}</p>
                  </div>
                  {player.parent_name && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">שם ההורה:</p>
                      <p>{player.parent_name}</p>
                    </div>
                  )}
                  {player.parent_phone && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">טלפון ההורה:</p>
                      <p>{player.parent_phone}</p>
                    </div>
                  )}
                  {player.parent_email && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">אימייל ההורה:</p>
                      <p>{player.parent_email}</p>
                    </div>
                  )}
                  {player.year_group && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">קבוצת גיל:</p>
                      <p>{player.year_group}</p>
                    </div>
                  )}
                  {player.injuries && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">פציעות:</p>
                      <p>{player.injuries}</p>
                    </div>
                  )}
                  {player.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">הערות:</p>
                      <p>{player.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p>לא נמצאו נתונים עבור שחקן זה.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PlayerFile;
