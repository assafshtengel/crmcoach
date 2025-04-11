
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from 'date-fns';
import { Loader2, FileText, Calendar, User, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useScreenSize } from '@/hooks/use-screen-size';
import { AssignedQuestionnaire } from '@/types/questionnaire';

const PlayerQuestionnaires = () => {
  const [questionnaires, setQuestionnaires] = useState<AssignedQuestionnaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDesktop } = useScreenSize();

  useEffect(() => {
    const checkPlayerAuth = async () => {
      try {
        setIsLoading(true);
        
        // Try with Supabase auth first
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (user && !authError) {
          console.log("Found authenticated user:", user.id);
          
          // Check if user exists in players table
          const { data: playerData, error: playerError } = await supabase
            .from('players')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();
            
          if (playerData) {
            console.log("User found in players table:", playerData.id);
            await fetchQuestionnaires(user.id);
            return;
          } else {
            console.log("User not found in players table:", playerError);
          }
        }
        
        // Fallback to legacy player session
        const playerSession = localStorage.getItem('playerSession');
        
        if (!playerSession) {
          console.log("No player session found, redirecting to login");
          toast({
            title: "יש להתחבר תחילה",
            description: "עליך להתחבר למערכת כדי לצפות בשאלונים שלך",
            variant: "destructive",
          });
          navigate('/player-auth');
          return;
        }
        
        try {
          const playerData = JSON.parse(playerSession);
          if (!playerData.id) {
            throw new Error("Invalid player session data");
          }
          
          console.log("Using legacy player session:", playerData.id);
          await fetchQuestionnaires(playerData.id);
        } catch (parseError) {
          console.error("Error parsing player session:", parseError);
          toast({
            title: "שגיאה באימות",
            description: "אירעה שגיאה בעת אימות המשתמש המחובר",
            variant: "destructive",
          });
          navigate('/player-auth');
        }
      } catch (error) {
        console.error('Error checking player auth:', error);
        toast({
          title: "שגיאה באימות",
          description: "אירעה שגיאה בעת בדיקת המשתמש המחובר",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkPlayerAuth();
  }, [navigate, toast]);

  const fetchQuestionnaires = async (playerId: string) => {
    try {
      console.log(`Fetching questionnaires for player ${playerId}`);
      
      // Load all questionnaires assigned to the player that are still in "pending" status
      const { data, error } = await supabase
        .from('assigned_questionnaires')
        .select(`
          *,
          coach:coach_id(full_name),
          questionnaire:questionnaire_id(title)
        `)
        .eq('player_id', playerId)
        .eq('status', 'pending');

      if (error) {
        throw error;
      }

      console.log('Fetched questionnaires for player:', data);
      
      if (data) {
        setQuestionnaires(data);
      }
    } catch (error) {
      console.error('Error fetching questionnaires:', error);
      toast({
        title: "שגיאה בטעינת השאלונים",
        description: "אירעה שגיאה בעת טעינת השאלונים המשויכים לך",
        variant: "destructive",
      });
    }
  };

  const handleAnswerNow = (questionnaireId: string) => {
    // Navigate to the questionnaire form page
    navigate(`/player/questionnaire/${questionnaireId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">השאלונים שלי</h1>
        <p className="text-gray-600 mb-6">כאן תוכל לראות את כל השאלונים שהמאמן שייך אליך</p>

        <Separator className="my-6" />

        {questionnaires.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questionnaires.map((questionnaire) => (
              <Card key={questionnaire.id} className="overflow-hidden h-full flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {questionnaire.questionnaire?.title || "שאלון"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex flex-col space-y-2 flex-1">
                    {questionnaire.coach && (
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span>מאמן: {questionnaire.coach.full_name}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>תאריך שיוך: {format(new Date(questionnaire.assigned_at), 'dd/MM/yyyy')}</span>
                    </div>
                    <div className="mt-auto pt-4">
                      <Button 
                        onClick={() => handleAnswerNow(questionnaire.id)}
                        className="w-full"
                      >
                        ענה עכשיו 
                        <ArrowRight className="h-4 w-4 mr-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gray-50 border-dashed">
            <CardContent className="text-center p-8">
              <p className="text-gray-500">
                לא נמצאו שאלונים
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PlayerQuestionnaires;
