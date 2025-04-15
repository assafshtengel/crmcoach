
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerRegistration from '@/components/player/PlayerRegistration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSessionExpiry } from '@/hooks/useSessionExpiry';

const PlayerDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleLogout } = useSessionExpiry();

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
            navigate('/player-auth');
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

  const onLogout = async () => {
    try {
      await handleLogout("התנתקת מהמערכת בהצלחה");
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "שגיאה בהתנתקות",
        description: "אירעה שגיאה בתהליך ההתנתקות. אנא נסה שוב.",
        variant: "destructive",
      });
    }
  };

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
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">דשבורד שחקן</h1>
        <Button 
          onClick={onLogout} 
          variant="outline" 
          className="flex gap-2 items-center"
        >
          <LogOut className="h-4 w-4" />
          התנתק
        </Button>
      </div>
      
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
