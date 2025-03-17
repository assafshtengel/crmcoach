
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Film, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { UpcomingSession } from "@/components/dashboard/types";

interface StatsCardsProps {
  totalPlayers: number;
  upcomingSessions: number;
  totalReminders: number;
  upcomingSessionsList: UpcomingSession[];
  onNavigateEdit: (sessionId: string) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalPlayers,
  upcomingSessions,
  totalReminders,
  upcomingSessionsList,
  onNavigateEdit
}) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#27AE60]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">שחקנים פעילים</CardTitle>
          <Users className="h-5 w-5 text-[#27AE60]" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#2C3E50]">{totalPlayers}</div>
          <p className="text-sm text-gray-500 mb-3">רשומים במערכת</p>
          <Button 
            variant="outline" 
            className="w-full border-[#27AE60] text-[#27AE60] hover:bg-[#27AE60]/10"
            onClick={() => navigate('/players-list')}
          >
            <Users className="h-4 w-4 mr-2" />
            צפה ברשימת השחקנים
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#3498DB]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">מפגשים קרובים</CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 text-[#3498DB] border-[#3498DB] hover:bg-[#3498DB]/10"
              onClick={() => navigate('/new-session')}
            >
              <Plus className="h-4 w-4" />
              הוסף מפגש
            </Button>
            <Calendar className="h-5 w-5 text-[#3498DB]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#2C3E50]">{upcomingSessions}</div>
          <p className="text-sm text-gray-500 mb-2">בשבוע הקרוב ({upcomingSessions} מפגשים)</p>
          
          {upcomingSessionsList.length > 0 && (
            <Collapsible className="mt-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full flex items-center justify-center text-[#3498DB]">
                  הצג רשימת מפגשים
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-2 mt-2 max-h-[200px] overflow-y-auto pr-1">
                  {upcomingSessionsList.map((session) => (
                    <div 
                      key={session.id} 
                      className="p-2 rounded-md bg-gray-50 flex justify-between items-center text-sm hover:bg-gray-100 cursor-pointer"
                      onClick={() => onNavigateEdit(session.id)}
                    >
                      <div>
                        <p className="font-medium">{session.player.full_name}</p>
                        <p className="text-gray-500 text-xs">{session.session_date} | {session.session_time}</p>
                      </div>
                      <div className="flex items-center">
                        {session.location && (
                          <span className="text-xs text-gray-500 ml-2">{session.location}</span>
                        )}
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#F1C40F] cursor-pointer"
        onClick={() => navigate('/tool-management?tab=videos')}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">סרטוני וידאו</CardTitle>
          <Film className="h-5 w-5 text-[#F1C40F]" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#2C3E50]">{totalReminders}</div>
          <p className="text-sm text-gray-500">סרטונים זמינים</p>
        </CardContent>
      </Card>
    </div>
  );
};
