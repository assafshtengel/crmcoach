
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { ArrowRight, Pencil, Settings, Activity } from 'lucide-react';

export default function PlayerProfile() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchPlayer = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerId)
          .single();

        if (error) {
          throw error;
        }

        setPlayer(data);
      } catch (error: any) {
        console.error('Error fetching player:', error);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      fetchPlayer();
    }
  }, [playerId, navigate, toast]);

  const handleOpenSettings = () => {
    // Implement the settings logic here
    console.log('Opening settings...');
  };

  const handleDeletePlayer = async () => {
    try {
      // Delete the player from the database
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Player deleted successfully.',
      });
      navigate('/players-list'); // Redirect to the players list page
    } catch (error: any) {
      console.error('Error deleting player:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setOpenDialog(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : player ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowRight className="h-4 w-4 mr-2" />
                חזרה
              </Button>
              <h1 className="text-3xl font-bold">פרופיל שחקן: {player.full_name}</h1>
              <div className="flex gap-2">
                <Button onClick={() => navigate(`/edit-player/${playerId}`)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  ערוך פרופיל
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Profile Card */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>פרטי שחקן</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>שם מלא:</strong> {player.full_name}</p>
                    <p><strong>אימייל:</strong> {player.email}</p>
                    {player.phone && <p><strong>טלפון:</strong> {player.phone}</p>}
                    {player.birthdate && <p><strong>תאריך לידה:</strong> {player.birthdate}</p>}
                    {player.city && <p><strong>עיר:</strong> {player.city}</p>}
                    {player.club && <p><strong>קבוצה:</strong> {player.club}</p>}
                    {player.year_group && <p><strong>שנתון:</strong> {player.year_group}</p>}
                    {player.sport_field && <p><strong>תחום ספורט:</strong> {player.sport_field}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Actions/Stats Cards */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Settings Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      הגדרות
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      נהל את הגדרות השחקן ופרטי חשבון
                    </p>
                    <Button className="w-full" onClick={handleOpenSettings}>
                      פתח הגדרות
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Game Summaries Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      סיכומי משחק
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      צפה בסיכומי המשחק האישיים של השחקן
                    </p>
                    <Button 
                      className="w-full" 
                      onClick={() => navigate(`/player-game-summaries/${playerId}`)}
                    >
                      צפה בסיכומי משחק
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Tabs defaultValue="sessions" className="w-full">
              <TabsList>
                <TabsTrigger value="sessions">פגישות</TabsTrigger>
                <TabsTrigger value="goals">מטרות</TabsTrigger>
                <TabsTrigger value="evaluation">הערכות</TabsTrigger>
              </TabsList>
              <TabsContent value="sessions">
                <p>רשימת פגישות תופיע כאן</p>
              </TabsContent>
              <TabsContent value="goals">
                <p>רשימת מטרות תופיע כאן</p>
              </TabsContent>
              <TabsContent value="evaluation">
                <p>רשימת הערכות תופיע כאן</p>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">שחקן לא נמצא</h2>
            <p className="text-muted-foreground mt-2">השחקן המבוקש אינו קיים או שאין לך גישה אליו</p>
            <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
              חזרה
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו היא בלתי הפיכה. האם אתה בטוח שברצונך למחוק שחקן זה?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenDialog(false)}>
              ביטול
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlayer} className="bg-red-500 hover:bg-red-600 text-white">
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
