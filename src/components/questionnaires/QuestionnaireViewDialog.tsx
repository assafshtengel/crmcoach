
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/lib/supabase';
import { Question } from '@/types/questionnaire';
import { useToast } from '@/components/ui/use-toast';

interface QuestionnaireViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionnaire: {
    id: string;
    player_id: string;
    questionnaire_id: string;
    answers: Record<string, { answer?: string; rating?: number }>;
    player_name: string;
    questionnaire_title: string;
    template_type: string;
    submitted_at: string;
  };
}

const QuestionnaireViewDialog: React.FC<QuestionnaireViewDialogProps> = ({
  open,
  onOpenChange,
  questionnaire
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadQuestionnaireTemplate = async () => {
      if (!questionnaire || !open) return;

      try {
        setLoading(true);
        
        // Fetch the questionnaire template to get the original questions
        const { data, error } = await supabase
          .from('questionnaire_templates')
          .select('questions')
          .eq('id', questionnaire.questionnaire_id)
          .single();

        if (error) {
          console.error('Error fetching questionnaire template:', error);
          toast({
            title: "שגיאה בטעינת השאלון",
            description: "אירעה שגיאה בעת טעינת פרטי השאלון",
            variant: "destructive",
          });
          return;
        }

        if (data && data.questions) {
          setQuestions(data.questions);
        }
      } catch (error) {
        console.error('Error loading questionnaire template:', error);
        toast({
          title: "שגיאה בטעינת השאלון",
          description: "אירעה שגיאה בעת טעינת פרטי השאלון",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadQuestionnaireTemplate();
  }, [questionnaire, open, toast]);

  // Translate question type to Hebrew
  const getQuestionTypeHebrew = (type: string) => {
    return type === 'open' ? 'שאלה פתוחה' : 'דירוג';
  };

  // Translate template type to Hebrew
  const getTemplateTypeHebrew = (type: string) => {
    switch (type) {
      case 'custom': return 'מותאם אישית';
      case 'day_opening': return 'פתיחת יום';
      case 'day_summary': return 'סיכום יום';
      case 'post_game': return 'אחרי משחק';
      case 'mental_prep': return 'מוכנות מנטלית';
      case 'personal_goals': return 'מטרות אישיות';
      case 'motivation': return 'מוטיבציה ולחץ';
      case 'season_end': return 'סיום עונה';
      case 'team_communication': return 'תקשורת קבוצתית';
      default: return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">תשובות לשאלון: {questionnaire.questionnaire_title}</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Header details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">שם השחקן</p>
                <p className="font-medium">{questionnaire.player_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">תאריך הגשה</p>
                <p className="font-medium">{new Date(questionnaire.submitted_at).toLocaleDateString('he-IL')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">סוג השאלון</p>
                <Badge variant="outline">
                  {getTemplateTypeHebrew(questionnaire.template_type)}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Questions and answers */}
          {loading ? (
            <div className="text-center p-4">טוען שאלות...</div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => {
                const answer = questionnaire.answers[question.id];
                
                return (
                  <Card key={question.id} className="border border-gray-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">
                        שאלה {index + 1}: {question.question_text}
                      </CardTitle>
                      <CardDescription>
                        {getQuestionTypeHebrew(question.type)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {question.type === 'open' ? (
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="whitespace-pre-line">{answer?.answer || 'לא ניתנה תשובה'}</p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-4">
                              <div 
                                className="bg-primary h-4 rounded-full" 
                                style={{ width: `${answer?.rating ? (answer.rating / 10) * 100 : 0}%` }}
                              ></div>
                            </div>
                            <span className="ml-4 font-bold">
                              {answer?.rating || 0}/10
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            סגור
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionnaireViewDialog;
