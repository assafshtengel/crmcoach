
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideosTab } from '@/components/player/VideosTab';
import AssignedQuestionnairesSection from '@/components/player/AssignedQuestionnairesSection';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Bell } from 'lucide-react';

const PlayerProfileView = () => {
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlayerProfile = async () => {
      try {
        setLoading(true);
        
        // Get the authenticated user from Supabase
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.error("Authentication error:", authError);
          navigate('/player-auth');
          return;
        }

        console.log("Player profile - authenticated user ID:", user.id);

        // Fetch player data from players table
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching player profile:", error);
          navigate('/player-auth');
          return;
        }

        console.log("Player profile data loaded:", data);
        setPlayer(data);
        
        // Fetch unread notifications count
        fetchUnreadNotificationsCount(user.id);
      } catch (error) {
        console.error("Unexpected error:", error);
        navigate('/player-auth');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerProfile();
  }, [navigate]);
  
  const fetchUnreadNotificationsCount = async (playerId: string) => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('player_id', playerId)
        .eq('is_read', false);
        
      if (error) {
        console.error("Error fetching notification count:", error);
        return;
      }
      
      setUnreadCount(count || 0);
    } catch (error) {
      console.error("Error fetching unread notifications count:", error);
    }
  };

  const handleWatchVideo = async (videoId: string) => {
    console.log("Video watched in player profile view:", videoId);
    
    // וידוא שיש לנו ID שחקן
    if (!player?.id) {
      console.error("Missing player ID when trying to mark video as watched");
      return;
    }
    
    try {
      // בדיקה האם כבר קיימת רשומה עבור הסרטון הזה
      const { data, error } = await supabase
        .from('player_videos')
        .select('*')
        .eq('player_id', player.id)
        .eq('video_id', videoId)
        .maybeSingle();
      
      if (error) {
        console.error("Error checking player_videos:", error);
        return;
      }
      
      // אם קיימת רשומה, נעדכן אותה כנצפתה
      if (data) {
        const { error: updateError } = await supabase
          .from('player_videos')
          .update({ 
            watched: true,
            watched_at: new Date().toISOString()
          })
          .eq('id', data.id);
          
        if (updateError) {
          console.error("Error updating player_video as watched:", updateError);
        } else {
          console.log("Successfully marked video as watched (existing record)");
        }
      }
      // אם לא קיימת רשומה, ניצור אחת חדשה
      else {
        const { error: insertError } = await supabase
          .from('player_videos')
          .insert([{
            player_id: player.id,
            video_id: videoId,
            watched: true,
            watched_at: new Date().toISOString(),
            assigned_by: player.coach_id
          }]);
          
        if (insertError) {
          console.error("Error creating new player_video record:", insertError);
        } else {
          console.log("Successfully created and marked video as watched (new record)");
        }
      }
    } catch (error) {
      console.error("Unexpected error marking video as watched:", error);
    }
  };

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
  console.log("Player coach_id:", player.coach_id);
  
  // Log questionnaires tab rendering before the return statement
  if (player?.id) {
    console.log("Preparing to render questionnaires tab with player ID:", player.id);
    console.log("Preparing to render videos tab with player ID:", player.id, "and coach ID:", player.coach_id);
  }
  
  return (
    <div className="min-h-screen bg-page">
      <header className="w-full bg-primary text-white py-6 mb-8 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">פרופיל שחקן</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/player/notifications')} 
            className="relative text-white hover:bg-primary-light"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{unreadCount}</span>
            )}
          </Button>
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
              <VideosTab 
                playerId={player?.id} 
                coachId={player?.coach_id} 
                onWatchVideo={handleWatchVideo}
              />
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
