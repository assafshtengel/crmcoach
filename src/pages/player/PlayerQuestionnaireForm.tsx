
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
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

const PlayerQuestionnaireForm: React.FC<QuestionnaireFormProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<AssignedQuestionnaire | null>(null);
  const [answers, setAnswers] = useState<Record<string, { answer?: string; rating?: number }>>({});

  useEffect(() => {
    const checkPlayerAuth = async () => {
      try {
        const playerSession = localStorage.getItem('playerSession');
        
        if (!playerSession) {
          toast({
            title: "יש להתחבר תחילה",
            description: "עליך להתחבר למערכת כדי למלא את השאלון",
            variant: "destructive",
          });
          navigate('/player-auth');
          return;
        }
        
        if (id) {
          await fetchQuestionnaire(id);
        } else {
          toast({
            title: "שגיאה בטעינת השאלון",
            description: "לא נמצא מזהה שאלון",
            variant: "destructive",
          });
          navigate('/player/questionnaires');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        toast({
          title: "שגיאה באימות",
          description: "אירעה שגיאה בעת בדיקת המשתמש המחובר",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    checkPlayerAuth();
  }, [id, navigate, toast]);

  const fetchQuestionnaire = async (questionnaireId: string) => {
    try {
      setIsLoading(true);
      
      // Fetch the assigned questionnaire
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

      if (error) {
        throw error;
      }

      if (!data) {
        toast({
          title: "שאלון לא נמצא",
          description: "השאלון אינו זמין או שכבר מולא",
          variant: "destructive",
        });
        navigate('/player/questionnaires');
        return;
      }

      setQuestionnaire(data);
      
      // Initialize answers object
      const initialAnswers: Record<string, { answer?: string; rating?: number }> = {};
      data.questionnaire?.questions.forEach((q: Question) => {
        initialAnswers[q.id] = { 
          answer: q.type === 'open' ? '' : undefined,
          rating: q.type === 'closed' ? 5 : undefined
        };
      });
      
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error fetching questionnaire:', error);
      toast({
        title: "שגיאה בטעינת השאלון",
        description: "אירעה שגיאה בעת טעינת השאלון, אנא נסה שוב",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      if (!questionnaire) return;
      
      setIsSaving(true);
      
      // Validate all questions are answered
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
      
      // Extract player data
      const playerSession = localStorage.getItem('playerSession');
      if (!playerSession) throw new Error('Player not authenticated');
      const playerData = JSON.parse(playerSession);
      
      // Insert answer to the questionnaire_answers table
      const { error: insertError } = await supabase
        .from('questionnaire_answers')
        .insert({
          assigned_questionnaire_id: questionnaire.id,
          player_id: playerData.id,
          questionnaire_id: questionnaire.questionnaire_id,
          coach_id: questionnaire.coach_id,
          answers: answers,
        });
      
      if (insertError) throw insertError;
      
      // Update the status of the original assigned questionnaire
      const { error: updateError } = await supabase
        .from('assigned_questionnaires')
        .update({ status: 'answered' })
        .eq('id', questionnaire.id);
      
      if (updateError) throw updateError;
      
      toast({
        title: "השאלון נשלח בהצלחה!",
        description: "תודה על מילוי השאלון",
      });
      
      // Navigate back to the questionnaires list
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
                      <div className="grid grid-cols-3 sm:grid-cols-11 gap-1 pt-2 text-center">
                        <span className="text-sm text-gray-500">נמוך</span>
                        {[...Array(9)].map((_, i) => (
                          <span key={i} className="text-sm text-gray-400 hidden sm:block">
                            {i + 1}
                          </span>
                        ))}
                        <span className="text-sm text-gray-500">גבוה</span>
                      </div>
                      
                      <div className="py-2">
                        <div className="flex items-center gap-4">
                          <Label className="w-12 text-sm text-gray-500">1</Label>
                          <Slider
                            id={`slider-${question.id}`}
                            min={1}
                            max={10}
                            step={1}
                            value={[answers[question.id]?.rating || 5]}
                            onValueChange={([value]) => handleClosedQuestionChange(question.id, value)}
                          />
                          <Label className="w-12 text-sm text-gray-500">10</Label>
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
