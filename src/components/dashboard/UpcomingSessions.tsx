
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SessionSummaryForm } from '@/components/session/SessionSummaryForm';
import { Send, Check, FileEdit, Clock, AlertCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { isSameDay, isPast } from 'date-fns';
import { UpcomingSession } from '@/types/dashboard';

interface UpcomingSessionsProps {
  sessions: UpcomingSession[];
  onSendReminder: (sessionId: string) => Promise<void>;
  onSaveSessionSummary: (sessionId: string, data: any) => Promise<void>;
  onViewSummary: (playerId: string, playerName: string) => Promise<void>;
}

export function UpcomingSessions({
  sessions,
  onSendReminder,
  onSaveSessionSummary,
  onViewSummary
}: UpcomingSessionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderSessionCard = (session: UpcomingSession) => {
    const sessionDate = new Date(session.session_date);
    const isToday = isSameDay(sessionDate, new Date());
    const isPastSession = isPast(sessionDate);
    const hasNoSummary = isPastSession && !session.has_summary;

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
              {!session.has_summary && (
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
    <Collapsible 
      open={isExpanded} 
      onOpenChange={setIsExpanded}
      className="bg-white rounded-lg shadow p-4"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">המפגשים הקרובים</h2>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 mr-2" />
            ) : (
              <ChevronDown className="h-4 w-4 mr-2" />
            )}
            {isExpanded ? 'הסתר' : 'הצג הכל'}
          </Button>
        </CollapsibleTrigger>
      </div>

      {sessions.length === 0 ? (
        <p className="text-gray-500 text-center py-4">אין מפגשים מתוכננים לשבוע הקרוב</p>
      ) : (
        <div className="space-y-3">
          {/* Always show first 3 sessions */}
          {sessions.slice(0, 3).map(renderSessionCard)}
          
          {/* Show remaining sessions when expanded */}
          <CollapsibleContent className="space-y-3 mt-3">
            {sessions.slice(3).map(renderSessionCard)}
          </CollapsibleContent>
        </div>
      )}
    </Collapsible>
  );
}
