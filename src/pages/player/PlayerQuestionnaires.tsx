
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from 'date-fns';
import { Loader2, FileText, Calendar, User, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AssignedQuestionnaire {
  id: string;
  questionnaire_id: string;
  coach_id: string;
  assigned_at: string;
  status: string;
  template_id: string;
  coach?: {
    full_name: string;
  };
  questionnaire_title?: string;
}

const PlayerQuestionnaires = () => {
  const [questionnaires, setQuestionnaires] = useState<AssignedQuestionnaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkPlayerAuth = async () => {
      try {
        setIsLoading(true);
        
        // בדיקה אם השחקן מחובר
        const playerSession = localStorage.getItem('playerSession');
        
        if (!playerSession) {
          toast({
            title: "יש להתחבר תחילה",
            description: "עליך להתחבר למערכת כדי לצפות בשאלונים שלך",
            variant: "destructive",
          });
          navigate('/player-auth');
          return;
        }
        
        const playerData = JSON.parse(playerSession);
        
        // טעינת השאלונים המשויכים לשחקן
        await fetchQuestionnaires(playerData.id);
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
      // טעינת כל השאלונים המשויכים לשחקן שעדיין במצב "ממתין"
      const { data, error } = await supabase
        .from('assigned_questionnaires')
        .select(`
          *,
          coach:coach_id(full_name)
        `)
        .eq('player_id', playerId)
        .eq('status', 'pending');

      if (error) {
        throw error;
      }

      if (data) {
        // הוספת כותרות השאלונים מהתבניות
        // כאן אנחנו משתמשים בנתונים שכבר קיימים בקוד כדי להציג את הכותרות
        const questionnairesWithTitles = data.map(q => {
          // בפועל, כותרת השאלון תילקח מהמערכת לפי ה-ID
          // כרגע נוסיף כותרת כללית
          return {
            ...q,
            questionnaire_title: `שאלון ${q.questionnaire_id}`
          };
        });
        
        setQuestionnaires(questionnairesWithTitles);
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
          <div className="grid gap-4">
            {questionnaires.map((questionnaire) => (
              <Card key={questionnaire.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {questionnaire.questionnaire_title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
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
                    <div className="mt-4">
                      <Button 
                        onClick={() => handleAnswerNow(questionnaire.id)}
                        className="w-full sm:w-auto"
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
                אין לך שאלונים חדשים לענות עליהם כרגע.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PlayerQuestionnaires;
