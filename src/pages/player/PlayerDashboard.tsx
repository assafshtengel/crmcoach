
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerRegistration from '@/components/player/PlayerRegistration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const PlayerDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error("Authentication error:", error?.message);
          toast({
            title: "שגיאת התחברות",
            description: "נראה שאתה לא מחובר, אנא התחבר שוב.",
            variant: "destructive",
          });
          
          // Redirect to login page after showing toast
          setTimeout(() => {
            navigate('/auth');
          }, 1500);
          
          return;
        }
        
        // User is authenticated
        console.log("User authenticated:", user.id);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Unexpected error during auth check:", error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בעת בדיקת הרשאות. אנא נסה שוב.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">טוען...</p>
        </div>
      </div>
    );
  }

  // Only render dashboard content if authenticated
  return isAuthenticated ? (
    <div className="container mx-auto p-4 direction-rtl">
      {/* This component runs in the background, ensuring a player record exists */}
      <PlayerRegistration />
      
      <h1 className="text-3xl font-bold mb-6">דשבורד שחקן</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>פרופיל</CardTitle>
          </CardHeader>
          <CardContent>
            <p>צפה ועדכן את פרטי הפרופיל שלך</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>שאלונים</CardTitle>
          </CardHeader>
          <CardContent>
            <p>שאלונים למילוי והערכה</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>תקציר פעילות</CardTitle>
          </CardHeader>
          <CardContent>
            <p>סיכומי פגישות ופעילויות אחרונות</p>
          </CardContent>
        </Card>
      </div>
    </div>
  ) : null; // Return null if not authenticated (redirect is already happening)
};

export default PlayerDashboard;
