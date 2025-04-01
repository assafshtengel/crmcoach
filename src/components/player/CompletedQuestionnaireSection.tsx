import React, { useState, useEffect } from 'react';
import { Calendar, ClipboardList, User, Eye } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Question } from '@/types/questionnaire';

interface CompletedQuestionnairesSectionProps {
  playerId: string;
}

interface CompletedQuestionnaire {
  id: string;
  player_id: string;
  questionnaire_id: string;
  coach_id: string;
  answers: Record<string, { answer?: string; rating?: number }>;
  submitted_at: string;
  assigned_questionnaire?: {
    id: string;
    template_id: string;
  };
  questionnaire?: {
    title: string;
    type: string;
  };
  coach?: {
    full_name: string;
  };
}

interface QuestionnaireDetails {
  title: string;
  questions: Question[];
  type: string;
}

const CompletedQuestionnairesSection: React.FC<CompletedQuestionnairesSectionProps> = ({ playerId }) => {
  const [questionnaires, setQuestionnaires] = useState<CompletedQuestionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<CompletedQuestionnaire | null>(null);
  const [questionnaireDetails, setQuestionnaireDetails] = useState<QuestionnaireDetails | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchCompletedQuestionnaires();
  }, []);

  useEffect(() => {
    if (selectedQuestionnaire && isDetailsOpen) {
      fetchQuestionnaireDetails(selectedQuestionnaire.assigned_questionnaire?.template_id || selectedQuestionnaire.questionnaire_id);
    }
  }, [selectedQuestionnaire, isDetailsOpen]);

  const fetchCompletedQuestionnaires = async () => {
    try {
      setLoading(true);
      
      // Get the currently authenticated user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting authenticated user:', userError);
        toast.error('שגיאה באימות', {
          description: 'אירעה שגיאה בעת אימות המשתמש. אנא התחבר מחדש.',
        });
        setQuestionnaires([]);
        return;
      }
      
      const userId = userData?.user?.id;
      
      if (!userId) {
        console.error('No authenticated user found');
        toast.error('משתמש לא מחובר', {
          description: 'אנא התחבר כדי לצפות בשאלונים שלך.',
        });
        setQuestionnaires([]);
        return;
      }
      
      // Updated query to use the authenticated user's ID
      const { data, error } = await supabase
        .from('questionnaire_answers')
        .select(`
          *,
          assigned_questionnaire:assigned_questionnaire_id(
            id,
            template_id
          ),
          questionnaire:questionnaire_id(
            title,
            type
          ),
          coach:coach_id(
            full_name
          )
        `)
        .eq('player_id', userId)
        .eq('status', 'answered')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching completed questionnaires:', error);
        toast.error('שגיאה בטעינת שאלונים שהושלמו', {
          description: error.message || 'לא ניתן היה לטעון את השאלונים שהושלמו. אנא נסה שוב מאוחר יותר.',
        });
        // Set an empty array to prevent breaking the UI
        setQuestionnaires([]);
        return;
      }
      
      setQuestionnaires(data || []);
    } catch (err) {
      console.error('Unexpected error in fetchCompletedQuestionnaires:', err);
      toast.error('שגיאה בלתי צפויה', {
        description: 'אירעה שגיאה בעת טעינת השאלונים שהושלמו. אנא נסה שוב.',
      });
      setQuestionnaires([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionnaireDetails = async (templateId: string) => {
    try {
      setDetailsLoading(true);
      
      const { data, error } = await supabase
        .from('questionnaire_templates')
        .select('title, questions, type')
        .eq('id', templateId)
        .single();

      if (error) {
        console.error('Error fetching questionnaire details:', error);
        toast.error('שגיאה בטעינת פרטי השאלון', {
          description: 'לא ניתן היה לטעון את פרטי השאלון. אנא נסה שוב מאוחר יותר.',
        });
        return;
      }

      setQuestionnaireDetails(data);
    } catch (err) {
      console.error('Unexpected error in fetchQuestionnaireDetails:', err);
      toast.error('שגיאה בלתי צפויה', {
        description: 'אירעה שגיאה בעת טעינת פרטי השאלון. אנא נסה שוב.',
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleOpenDetails = (questionnaire: CompletedQuestionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setIsDetailsOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: he });
    } catch (error) {
      return 'תאריך לא תקין';
    }
  };

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

  if (loading) {
    return (
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-[#F2FCE2]/50 to-[#E5DEFF]/50 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardList className="h-5 w-5 text-primary" />
            שאלונים שמילאתי
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-5 w-1/2 mb-2" />
                <Skeleton className="h-5 w-1/3 mb-3" />
                <div className="flex justify-end">
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (questionnaires.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-[#F2FCE2]/50 to-[#E5DEFF]/50 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardList className="h-5 w-5 text-primary" />
            שאלונים שמילאתי
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">עדיין לא מילאת שאלונים</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-[#F2FCE2]/50 to-[#E5DEFF]/50 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardList className="h-5 w-5 text-primary" />
            שאלונים שמילאתי
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-4">
            {questionnaires.map((questionnaire) => (
              <div 
                key={questionnaire.id} 
                className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all p-4"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{questionnaire.questionnaire?.title}</h3>
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                        הושלם
                      </Badge>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-500 space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>המאמן: {questionnaire.coach?.full_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(questionnaire.submitted_at)} (לפני {formatDistanceToNow(new Date(questionnaire.submitted_at), { 
                            addSuffix: false, 
                            locale: he 
                          })})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Button 
                      onClick={() => handleOpenDetails(questionnaire)}
                      variant="outline"
                      className="text-primary border-primary/20 bg-primary/5 gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      צפה בתשובות
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Questionnaire Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {questionnaireDetails?.title || selectedQuestionnaire?.questionnaire?.title || 'פרטי שאלון'}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-6">
            {/* Header details */}
            {selectedQuestionnaire && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">סוג השאלון</p>
                    <Badge variant="outline">
                      {getTemplateTypeHebrew(questionnaireDetails?.type || selectedQuestionnaire.questionnaire?.type || '')}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">תאריך הגשה</p>
                    <p className="font-medium">{formatDate(selectedQuestionnaire.submitted_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">המאמן</p>
                    <p className="font-medium">{selectedQuestionnaire.coach?.full_name}</p>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Questions and answers */}
            {detailsLoading ? (
              <div className="text-center p-4">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p>טוען את פרטי השאלון...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questionnaireDetails?.questions.map((question, index) => {
                  const answer = selectedQuestionnaire?.answers[question.id];
                  
                  return (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="mb-2">
                        <h3 className="text-lg font-medium">
                          שאלה {index + 1}: {question.question_text}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {getQuestionTypeHebrew(question.type)}
                        </p>
                      </div>
                      
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setIsDetailsOpen(false)}>
              סגור
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CompletedQuestionnairesSection;
