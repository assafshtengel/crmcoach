import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SessionSummaryForm } from "@/components/session/SessionSummaryForm";
import { supabase } from "@/lib/supabase";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { isPast } from 'date-fns';
import { FileText, AlertCircle, FileEdit } from 'lucide-react';

interface Session {
  id: string;
  session_date: string;
  session_time: string;
  location: string | null;
  notes: string | null;
  player: {
    full_name: string;
  };
  has_summary: boolean;
}

const DashboardCoach = () => {
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUpcomingSessions();
  }, []);

  const fetchUpcomingSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: sessionsData, error } = await supabase
        .from('sessions')
        .select(`
          id,
          session_date,
          session_time,
          location,
          notes,
          player:players!inner(full_name),
          session_summaries (id)
        `)
        .eq('coach_id', user.id);

      if (error) throw error;

      const sessions = sessionsData?.map(session => ({
        id: session.id,
        session_date: session.session_date,
        session_time: session.session_time,
        location: session.location,
        notes: session.notes,
        player: {
          full_name: session.player?.full_name || 'Unknown Player'
        },
        has_summary: session.session_summaries?.length > 0
      })) || [];

      setUpcomingSessions(sessions);
    } catch (error: any) {
      toast.error('Failed to load sessions.');
      console.error("Error fetching sessions:", error);
    }
  };

  const handleSaveSessionSummary = async (sessionId: string, data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/auth');
        return;
      }

      const { error } = await supabase
        .from('session_summaries')
        .insert([
          {
            session_id: sessionId,
            coach_id: user.id,
            summary_text: data.summary_text,
            achieved_goals: [data.achieved_goals],
            future_goals: [data.future_goals],
            additional_notes: data.additional_notes,
            progress_rating: data.progress_rating,
            next_session_focus: data.next_session_focus
          }
        ]);

      if (error) throw error;

      toast.success('Session summary saved successfully!');
      fetchUpcomingSessions();
    } catch (error: any) {
      toast.error('Failed to save session summary.');
      console.error("Error saving session summary:", error);
    }
  };

  const renderSessionCard = (session: Session) => {
    return (
      <Card key={session.id} className="transition-all duration-300 hover:shadow-lg">
        <CardHeader className="pb-2">
          <h3 className="font-semibold text-[#2C3E50]">{session.player.full_name}</h3>
          <p className="text-sm text-gray-500">{session.session_date} | {session.session_time}</p>
        </CardHeader>
        <CardContent className="pt-0">
          <span className="text-sm text-gray-500">{session.location || 'No location specified'}</span>
          <p className="text-sm mt-2">{session.notes || 'No notes provided'}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Welcome to Your Coaching Dashboard
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Here's an overview of your upcoming sessions and player progress.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">מפגשים מתוכננים</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingSessions
              .filter(session => !isPast(new Date(session.session_date)))
              .map(session => renderSessionCard(session))
              .filter(Boolean)}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">מפגשים שהתקיימו</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingSessions
              .filter(session => isPast(new Date(session.session_date)))
              .map(session => (
                <Card 
                  key={session.id} 
                  className={`transition-all duration-300 ${
                    session.has_summary 
                      ? 'bg-green-50 hover:bg-green-100/80' 
                      : 'bg-red-50 hover:bg-red-100/80'
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-[#2C3E50]">
                          {session.player.full_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {session.session_date} | {session.session_time}
                        </p>
                      </div>
                      <div>
                        {session.has_summary ? (
                          <div className="flex items-center text-green-600 text-sm font-medium">
                            <FileText className="h-4 w-4 mr-1" />
                            יש סיכום
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600 text-sm font-medium">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            חסר סיכום
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {session.location || 'לא צוין מיקום'}
                      </span>
                      {!session.has_summary && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <FileEdit className="h-4 w-4 mr-1" />
                              הוסף סיכום
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
                                onSubmit={(data) => handleSaveSessionSummary(session.id, data)}
                                onCancel={() => document.querySelector<HTMLButtonElement>('[aria-label="Close"]')?.click()}
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCoach;
