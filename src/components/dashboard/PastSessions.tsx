
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SessionSummaryForm } from '@/components/session/SessionSummaryForm';
import { FileEdit, FileText, AlertCircle, Check } from 'lucide-react';
import { UpcomingSession } from '@/types/dashboard';

interface PastSessionsProps {
  sessionsToSummarize: UpcomingSession[];
  summarizedSessions: UpcomingSession[];
  onSaveSessionSummary: (sessionId: string, data: any) => Promise<void>;
  onViewSummary: (playerId: string, playerName: string) => Promise<void>;
}

export function PastSessions({
  sessionsToSummarize,
  summarizedSessions,
  onSaveSessionSummary,
  onViewSummary
}: PastSessionsProps) {
  const [activeTab, setActiveTab] = useState("summarize");

  const renderSessionCard = (session: UpcomingSession, needsSummary: boolean) => {
    return (
      <Card 
        key={session.id} 
        className={`bg-gray-50 hover:bg-white transition-all duration-300 ${
          needsSummary ? 'border-l-4 border-l-red-500 shadow-red-200' : 
                      'border-l-4 border-l-green-500 shadow-green-200'
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-[#2C3E50]">{session.player.full_name}</h3>
              <p className="text-sm text-gray-500">
                {session.session_date} | {session.session_time}
              </p>
            </div>
            <div>
              {needsSummary ? (
                <div className="flex items-center text-red-600 text-sm font-medium">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  חסר סיכום
                </div>
              ) : (
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <Check className="h-4 w-4 mr-1" />
                  מסוכמים
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{session.location || 'לא צוין מיקום'}</span>
            <div className="flex gap-2">
              {needsSummary ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center">
                      <FileEdit className="h-4 w-4 mr-1" />
                      סכם מפגש
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>סיכום מפגש</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      <SessionSummaryForm
                        sessionId={session.id}
                        playerName={session.player.full_name}
                        sessionDate={session.session_date}
                        onSubmit={(data) => onSaveSessionSummary(session.id, data)}
                        onCancel={() => document.querySelector<HTMLButtonElement>('[aria-label="Close"]')?.click()}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center"
                  onClick={() => session.player.id 
                    ? onViewSummary(session.player.id, session.player.full_name) 
                    : null}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  צפה בסיכום
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">מפגשים אחרונים</h2>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="summarize">לסיכום ({sessionsToSummarize.length})</TabsTrigger>
          <TabsTrigger value="summarized">מסוכמים ({summarizedSessions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="summarize" className="space-y-3">
          {sessionsToSummarize.length === 0 ? (
            <p className="text-gray-500 text-center py-4">אין מפגשים הממתינים לסיכום</p>
          ) : (
            sessionsToSummarize.map(session => renderSessionCard(session, true))
          )}
        </TabsContent>

        <TabsContent value="summarized" className="space-y-3">
          {summarizedSessions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">אין מפגשים מסוכמים</p>
          ) : (
            summarizedSessions.map(session => renderSessionCard(session, false))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
