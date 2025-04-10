
import React from 'react';
import PlayerRegistration from '@/components/player/PlayerRegistration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PlayerDashboard = () => {
  return (
    <div className="container mx-auto p-4">
      {/* This component runs in the background, ensuring a player record exists */}
      <PlayerRegistration />
      
      <h1 className="text-3xl font-bold mb-6">Dashboard שחקן</h1>
      
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
  );
};

export default PlayerDashboard;
