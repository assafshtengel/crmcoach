import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Question } from '@/types/questionnaire';
import { Loader2, Send, ArrowLeft } from 'lucide-react';

interface QuestionnaireFormProps {
  id?: string;
}

interface AssignedQuestionnaire {
  id: string;
  questionnaire_id: string;
  coach_id: string;
  player_id: string;
  template_id: string;
  status: string;
  assigned_at: string;
  questionnaire?: {
    title: string;
    questions: Question[];
  };
}

const PlayerQuestionnaireForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<AssignedQuestionnaire | null>(null);
  const [answers, setAnswers] = useState<Record<string, { answer?: string; rating?: number }>>({});
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [playerIdFromAuth, setPlayerIdFromAuth] = useState<string | null>(null);

  useEffect(() => {
    checkPlayerAuth();
  }, [id, navigate, toast]);

  const checkPlayerAuth = async () => {
    try {
      setIsLoading(true);
      setSessionError(null);
      
      // First try Supabase auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      // If we have a Supabase authenticated user
      if (user && !authError) {
        console.log("Found authenticated user:", user.id);
        
        // Verify this user exists in the players table
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
          
        if (playerData) {
          console.log("User authenticated and found in players table:", playerData.id);
          setPlayerIdFromAuth(user.id);
          if (id) {
            await fetchQuestionnaire(id, user.id);
          } else {
            setSessionError("לא נמצא מזהה שאלון");
          }
          return;
        } else {
          console.log("User authenticated but not found in players table:", playerError);
        }
      } else {
        console.log("No Supabase authenticated user found, checking legacy auth");
      }
      
      // Fallback to legacy player session
      const playerSession = localStorage.getItem('playerSession');
      
      if (playerSession) {
        try {
          const playerData = JSON.parse(playerSession);
          console.log("Using legacy player session:", playerData.id);
          
          if (playerData.id) {
            setPlayerIdFromAuth(playerData.id);
            if (id) {
              await fetchQuestionnaire(id, playerData.id);
            } else {
              setSessionError("לא נמצא מזהה שאלון");
            }
            return;
          }
        } catch (parseError) {
          console.error("Error parsing player session:", parseError);
          setSessionError("יש להתחבר תחילה כדי למלא את השאלון");
        }
      } else {
        setSessionError("יש להתחבר תחילה כדי למלא את השאלון");
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setSessionError("אירעה שגיאה בעת בדיקת המשתמש המחובר");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuestionnaire = async (questionnaireId: string, playerId: string) => {
    try {
      console.log(`Fetching questionnaire ${questionnaireId} for player ${playerId}`);
      
      // First, check if this questionnaire is assigned to this player
      const { data: assignedData, error: assignedError } = await supabase
        .from('assigned_questionnaires')
        .select(`
          *,
          questionnaire:questionnaire_id (
            title,
            questions
          )
        `)
        .eq('id', questionnaireId)
        .eq('player_id', playerId)
        .maybeSingle();
        
      if (assignedError) {
        console.error("Error checking assigned questionnaire:", assignedError);
        setSessionError("השאלון אינו זמין או שאין לך הרשאה לצפות בו");
        return;
      }
      
      if (!assignedData) {
        console.log("Questionnaire not assigned to this player, checking if available for anyone");
        
        // Try to get the questionnaire without player filtering
        const { data, error } = await supabase
          .from('assigned_questionnaires')
          .select(`
            *,
            questionnaire:questionnaire_id (
              title,
              questions
            )
          `)
          .eq('id', questionnaireId)
          .eq('status', 'pending')
          .single();

        if (error || !data) {
          console.error("Error fetching questionnaire or not found:", error);
          setSessionError("השאלון אינו זמין או שכבר מולא");
          return;
        }
        
        console.log("Questionnaire found, but checking permissions");
        
        // Check if this questionnaire is assigned to this player
        if (data.player_id !== playerId) {
          console.log("Questionnaire is not assigned to this player");
          setSessionError("אין לך הרשאה לצפות בשאלון זה");
          return;
        }
        
        setQuestionnaire(data);
      } else {
        // Questionnaire is properly assigned to this player
        console.log("Questionnaire found and assigned to this player");
        setQuestionnaire(assignedData);
      }
      
      // Initialize answers
      const initialAnswers: Record<string, { answer?: string; rating?: number }> = {};
      assignedData?.questionnaire?.questions.forEach((q: Question) => {
        initialAnswers[q.id] = { 
          answer: q.type === 'open' ? '' : undefined,
          rating: q.type === 'closed' ? 5 : undefined
        };
      });
      
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error fetching questionnaire:', error);
      setSessionError("אירעה שגיאה בעת טעינת השאלון");
    }
  };

  const handleOpenQuestionChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], answer: value }
    }));
  };

  const handleClosedQuestionChange = (questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], rating: value }
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!questionnaire) {
        toast({
          title: "שגיאה",
          description: "לא נמצאו נתוני שאלון",
          variant: "destructive",
        });
        return;
      }
      
      setIsSaving(true);
      
      // Determine player ID - either from Supabase auth or from legacy auth
      let playerId = playerIdFromAuth;
      
      if (!playerId) {
        const playerSession = localStorage.getItem('playerSession');
        if (playerSession) {
          const playerData = JSON.parse(playerSession);
          playerId = playerData.id;
        }
      }
      
      if (!playerId) {
        toast({
          title: "שגיאת התחברות",
          description: "עליך להתחבר לפני שליחת השאלון",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
      
      console.log("Submitting answer with player ID:", playerId);
      
      const unansweredQuestions = questionnaire.questionnaire?.questions.filter((q: Question) => {
        if (q.type === 'open' && (!answers[q.id]?.answer || answers[q.id]?.answer === '')) {
          return true;
        }
        if (q.type === 'closed' && answers[q.id]?.rating === undefined) {
          return true;
        }
        return false;
      });
      
      if (unansweredQuestions && unansweredQuestions.length > 0) {
        toast({
          title: "נא למלא את כל השאלות",
          description: "יש למלא את כל השאלות בשאלון לפני השליחה",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
      
      if (!questionnaire.id || !questionnaire.questionnaire_id || !questionnaire.coach_id) {
        toast({
          title: "שגיאה בנתוני השאלון",
          description: "חסרים פרטים הכרחיים בשאלון",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
      
      const { error: insertError } = await supabase
        .from('questionnaire_answers')
        .insert({
          assigned_questionnaire_id: questionnaire.id,
          player_id: playerId,
          questionnaire_id: questionnaire.questionnaire_id,
          coach_id: questionnaire.coach_id,
          answers: answers,
          status: 'answered',
          submitted_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error("Error submitting questionnaire:", insertError);
        throw insertError;
      }
      
      const { error: updateError } = await supabase
        .from('assigned_questionnaires')
        .update({ status: 'answered' })
        .eq('id', questionnaire.id);
      
      if (updateError) {
        console.error("Error updating questionnaire status:", updateError);
        throw updateError;
      }
      
      toast({
        title: "השאלון נשלח בהצלחה!",
        description: "תודה על מילוי השאלון",
      });
      
      navigate('/player/questionnaires');
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      toast({
        title: "שגיאה בשליחת השאלון",
        description: "אירעה שגיאה בעת שליחת השאלון, אנא נסה שוב",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center" dir="rtl">
        <Card className="w-full max-w-3xl">
          <CardContent className="text-center py-8">
            <p className="text-lg text-gray-500 mb-4">{sessionError}</p>
            <Button 
              className="mt-4"
              onClick={() => navigate('/player-auth')}
            >
              התחבר למערכת
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!questionnaire || !questionnaire.questionnaire) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center" dir="rtl">
        <Card className="w-full max-w-3xl">
          <CardContent className="text-center py-8">
            <p className="text-lg text-gray-500">השאלון אינו זמין או שכבר מולא</p>
            <Button 
              className="mt-4"
              onClick={() => navigate('/player/questionnaires')}
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              חזרה לשאלונים שלי
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-6" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate('/player/questionnaires')}
        >
          <ArrowLeft className="h-4 w-4 ml-2" />
          חזרה לשאלונים שלי
        </Button>
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl sm:text-2xl">{questionnaire?.questionnaire?.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">נא לענות על כל השאלות הבאות:</p>
            
            <div className="space-y-8">
              {questionnaire?.questionnaire?.questions.map((question: Question, index: number) => (
                <div key={question.id} className="border-b pb-4 last:border-0">
                  <p className="text-lg font-medium mb-3">
                    {index + 1}. {question.question_text}
                  </p>
                  
                  {question.type === 'open' ? (
                    <div>
                      <Label htmlFor={`question-${question.id}`} className="sr-only">
                        {question.question_text}
                      </Label>
                      <Textarea
                        id={`question-${question.id}`}
                        placeholder="הכנס את תשובתך כאן"
                        rows={4}
                        value={answers[question.id]?.answer || ''}
                        onChange={(e) => handleOpenQuestionChange(question.id, e.target.value)}
                        className="w-full mt-2"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 sm:grid-cols-11 gap-1 pt-2 text-center" dir="rtl">
                        <span className="text-sm text-gray-500">גבוה</span>
                        {[...Array(9)].map((_, i) => (
                          <span key={i} className="text-sm text-gray-400 hidden sm:block">
                            {10 - i}
                          </span>
                        ))}
                        <span className="text-sm text-gray-500">נמוך</span>
                      </div>
                      
                      <div className="py-2">
                        <div className="flex items-center gap-4">
                          <Label className="w-12 text-sm text-gray-500">10</Label>
                          <Slider
                            dir="ltr"
                            id={`slider-${question.id}`}
                            min={1}
                            max={10}
                            step={1}
                            value={[answers[question.id]?.rating || 5]}
                            onValueChange={([value]) => handleClosedQuestionChange(question.id, value)}
                          />
                          <Label className="w-12 text-sm text-gray-500">1</Label>
                        </div>
                      </div>
                      
                      <div className="pt-1 text-center">
                        <span className="text-sm font-medium">
                          הערכה: {answers[question.id]?.rating || 5}/10
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="pt-4 flex justify-center">
            <Button 
              size="lg" 
              onClick={handleSubmit} 
              disabled={isSaving}
              className="w-full md:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  שולח...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 ml-2" />
                  שלח שאלון
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PlayerQuestionnaireForm;
