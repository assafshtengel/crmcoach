
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpcomingSession } from "./types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SessionSummaryForm } from "@/components/session/SessionSummaryForm";
import { Button } from "@/components/ui/button";
import { FileEdit, FileText, Calendar, Check } from 'lucide-react';
import { format, isPast, isSameDay } from 'date-fns';
import { Clock, AlertCircle } from 'lucide-react';
import { Send } from 'lucide-react';

interface SessionsTabProps {
  pastSessionsToSummarize: UpcomingSession[];
  summarizedSessions: UpcomingSession[];
  upcomingSessions: UpcomingSession[];
  activeTab: string;
  onTabChange: (value: string) => void;
  onSaveSessionSummary: (sessionId: string, data: any) => Promise<void>;
  onSendReminder: (sessionId: string) => Promise<void>;
  onViewSummary: (playerId: string, playerName: string) => Promise<void>;
}

export const SessionsTab: React.FC<SessionsTabProps> = ({
  pastSessionsToSummarize,
  summarizedSessions,
  upcomingSessions,
  activeTab,
  onTabChange,
  onSaveSessionSummary,
  onSendReminder,
  onViewSummary
}) => {
  const renderSessionCard = (session: UpcomingSession, showSummaryButton: boolean = true) => {
    const sessionDate = new Date(session.session_date);
    const isToday = isSameDay(sessionDate, new Date());
    const isPastSession = isPast(sessionDate);
    const hasNoSummary = isPastSession && !session.has_summary;

    if (isPastSession && session.has_summary && !showSummaryButton) {
      return null;
    }

    return (
      <Card 
        key={session.id} 
        className={`bg-gray-50 hover:bg-white transition-all duration-300 ${
          isToday ? 'border-l-4 border-l-blue-500 shadow-blue-200' :
          hasNoSummary ? 'border-l-4 border-l-red-500 shadow-red-200' :
          session.has_summary ? 'border-l-4 border-l-green-500 shadow-green-200' :
          'border'
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
              {isToday && (
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  <Clock className="h-4 w-4 mr-1" />
                  היום
                </div>
              )}
              {hasNoSummary && (
                <div className="flex items-center text-red-600 text-sm font-medium">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  חסר סיכום
                </div>
              )}
              {session.has_summary && (
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <Check className="h-4 w-4 mr-1" />
                  סוכם
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{session.location || 'לא צוין מיקום'}</span>
            <div className="flex gap-2">
              {!session.reminder_sent && !isPastSession ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSendReminder(session.id)}
                  className="text-[#27AE60] hover:text-[#219A52]"
                >
                  <Send className="h-4 w-4 mr-1" />
                  שלח תזכורת
                </Button>
              ) : !isPastSession ? (
                <span className="text-sm text-[#27AE60] flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  נשלחה תזכורת
                </span>
              ) : null}
              {showSummaryButton && !session.has_summary && (
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
                        forceEnable={!isPastSession}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              {session.has_summary && (
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
    <Card className="bg-white/90 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold text-[#2C3E50]">מפגשים אחרונים</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="unsummarized" className="w-full" value={activeTab} onValueChange={onTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="unsummarized">ממתינים לסיכום ({pastSessionsToSummarize.length})</TabsTrigger>
            <TabsTrigger value="summarized">מסוכמים ({summarizedSessions.length})</TabsTrigger>
            <TabsTrigger value="upcoming">מפגשים קרובים ({upcomingSessions.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="unsummarized" className="mt-0">
            <div className="space-y-4">
              {pastSessionsToSummarize.length > 0 ? (
                pastSessionsToSummarize.map(session => renderSessionCard(session))
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <Check className="h-10 w-10 text-green-500 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-gray-800">הכל מסוכם!</h3>
                  <p className="text-gray-500 mt-1">כל המפגשים שלך מסוכמים</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="summarized" className="mt-0">
            <div className="space-y-4">
              {summarizedSessions.length > 0 ? (
                summarizedSessions.map(session => renderSessionCard(session, true))
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-gray-800">אין סיכומים</h3>
                  <p className="text-gray-500 mt-1">לא נמצאו מפגשים מסוכמים</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="upcoming" className="mt-0">
            <div className="space-y-4">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map(session => renderSessionCard(session))
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-gray-800">אין מפגשים קרובים</h3>
                  <p className="text-gray-500 mt-1">לא נמצאו מפגשים מתוכננים בשבוע הקרוב</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
