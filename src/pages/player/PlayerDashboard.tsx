
import React, { useEffect } from 'react';
import PlayerRegistration from '@/components/player/PlayerRegistration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const PlayerDashboard = () => {
  const { isLoading, isAuthenticated, isPlayer } = useAuth();

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

  // Only render dashboard content if authenticated as player
  return (isAuthenticated && isPlayer) ? (
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
  ) : null; // Return null if not authenticated or not a player (redirect is handled in AuthGuard)
};

export default PlayerDashboard;
