
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideosTab } from '@/components/player/VideosTab';
import { AssignedQuestionnairesSection } from '@/components/player/AssignedQuestionnairesSection';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Mail, Phone } from 'lucide-react';

const PlayerProfileView = () => {
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlayerProfile = async () => {
      try {
        setLoading(true);
        const playerId = localStorage.getItem('playerSession')
          ? JSON.parse(localStorage.getItem('playerSession')!).id
          : null;

        console.log("Player profile - playerSession ID:", playerId);

        if (!playerId) {
          navigate('/player-auth');
          return;
        }

        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerId)
          .single();

        if (error) {
          console.error("Error fetching player profile:", error);
          navigate('/player-auth');
          return;
        }

        console.log("Player profile data loaded:", data);
        setPlayer(data);
      } catch (error) {
        console.error("Unexpected error:", error);
        navigate('/player-auth');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-page">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-page">
        <Card className="max-w-md w-full p-8">
          <CardHeader>
            <CardTitle className="text-lg">שגיאה</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              לא הצלחנו לטעון את הפרופיל שלך. אנא נסה שוב מאוחר יותר.
            </p>
            <Button onClick={() => navigate('/player-auth')} className="w-full mt-4">
              חזרה לדף התחברות
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log("Rendering player profile for:", player.id);
  
  // Log questionnaires tab rendering before the return statement
  if (player?.id) {
    console.log("Preparing to render questionnaires tab with player ID:", player.id);
  }
  
  return (
    <div className="min-h-screen bg-page">
      <header className="w-full bg-primary text-white py-6 mb-8 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">פרופיל שחקן</h1>
        </div>
      </header>
      
      <div className="container mx-auto px-4 pb-12">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={player?.profile_image} />
                <AvatarFallback>{player?.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{player?.full_name}</h2>
                <p className="text-gray-500">{player?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{player?.email}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{player?.phone}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      
        <div className="grid grid-cols-1 gap-6 mt-6">
          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="videos">סרטונים</TabsTrigger>
              <TabsTrigger value="questionnaires">שאלונים</TabsTrigger>
            </TabsList>
            
            <TabsContent value="videos" className="space-y-6">
              <VideosTab playerId={player?.id} coachId={player?.coach_id} />
            </TabsContent>
            
            <TabsContent value="questionnaires" className="space-y-6">
              <AssignedQuestionnairesSection playerId={player?.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfileView;
