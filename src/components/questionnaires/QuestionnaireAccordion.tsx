import React, { useState } from 'react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Question, QuestionnaireTemplate } from '@/types/questionnaire';
import { Pencil, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import AssignQuestionnaireDialog from './AssignQuestionnaireDialog';
import EditQuestionModal from './EditQuestionModal';

interface QuestionnaireAccordionProps {
  template: QuestionnaireTemplate;
}

const QuestionnaireAccordion: React.FC<QuestionnaireAccordionProps> = ({ template }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestions, setEditedQuestions] = useState<Question[]>(template.questions);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editQuestionDialogOpen, setEditQuestionDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const { toast } = useToast();

  const openQuestions = editedQuestions.filter(q => q.type === 'open');
  const closedQuestions = editedQuestions.filter(q => q.type === 'closed');

  const handleQuestionChange = (id: string, newText: string) => {
    setEditedQuestions(questions =>
      questions.map(q =>
        q.id === id ? { ...q, question_text: newText } : q
      )
    );
  };

  const handleEditQuestion = (question: Question) => {
    setCurrentQuestion(question);
    setEditQuestionDialogOpen(true);
  };

  const handleSaveQuestionEdit = async (id: string, newText: string) => {
    // Update the local state
    handleQuestionChange(id, newText);
    
    // If this is not a system template, save the changes to the database
    if (!template.is_system_template) {
      try {
        const updatedQuestions = editedQuestions.map(q => 
          q.id === id ? { ...q, question_text: newText } : q
        );
        
        const { error } = await supabase
          .from('questionnaire_templates')
          .update({ 
            questions: updatedQuestions,
            updated_at: new Date().toISOString()
          })
          .eq('id', template.id);
          
        if (error) {
          throw error;
        }
        
        toast({
          title: "השאלה נשמרה",
          description: "השינויים בשאלה נשמרו בהצלחה."
        });
      } catch (error) {
        console.error('Error saving question:', error);
        toast({
          variant: "destructive",
          title: "שגיאה בשמירה",
          description: "אירעה שגיאה בעת שמירת השאלה. נסה שנית."
        });
      }
    }
  };

  const handleSave = async () => {
    // Only save if this is a custom (non-system) template
    if (!template.is_system_template) {
      try {
        const { error } = await supabase
          .from('questionnaire_templates')
          .update({ 
            questions: editedQuestions,
            updated_at: new Date().toISOString()
          })
          .eq('id', template.id);
          
        if (error) {
          throw error;
        }
        
        toast({
          title: "השינויים נשמרו",
          description: "השינויים בשאלון נשמרו בהצלחה."
        });
      } catch (error) {
        console.error('Error saving changes:', error);
        toast({
          variant: "destructive",
          title: "שגיאה בשמירה",
          description: "אירעה שגיאה בעת שמירת השינויים. נסה שנית."
        });
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedQuestions(template.questions);
    setIsEditing(false);
  };

  const handleAssignQuestionnaire = async (templateId: string, playerId: string) => {
    try {
      // Get the current user's auth session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user) {
        toast({
          title: "יש להתחבר תחילה",
          description: "עליך להתחבר למערכת כדי לשייך שאלונים",
          variant: "destructive",
        });
        return;
      }

      const coachId = session.user.id;
      
      // Create a questionnaire instance from the template
      const { data: questionnaire, error: questionnaireError } = await supabase
        .from('questionnaires')
        .insert({
          coach_id: coachId,
          player_id: playerId,
          template_id: templateId,
          title: template.title,
          type: template.type,
          questions: template.questions,
          is_completed: false
        })
        .select('id')
        .single();

      if (questionnaireError) {
        console.error('Error creating questionnaire:', questionnaireError);
        throw questionnaireError;
      }

      // Create a record in the assigned_questionnaires table
      const { error } = await supabase
        .from('assigned_questionnaires')
        .insert({
          coach_id: coachId,
          player_id: playerId,
          questionnaire_id: questionnaire.id,
          template_id: template.is_system_template ? templateId : template.parent_template_id || templateId,
          status: 'pending'
        });

      if (error) {
        console.error('Error assigning questionnaire:', error);
        throw error;
      }

      toast({
        title: "השאלון שויך בהצלחה",
        description: "השאלון שויך לשחקן בהצלחה."
      });

    } catch (error: any) {
      console.error('Failed to assign questionnaire:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בשיוך השאלון",
        description: error.message || "אירעה שגיאה בעת שיוך השאלון. נסה שנית."
      });
    }
  };

  const canEdit = !template.is_system_template;

  return (
    <Card className="mb-4 overflow-hidden">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={template.id} className="border-0">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex-1 flex items-center justify-between pl-4">
              <span className="font-bold text-lg">{template.title}</span>
              {!isEditing && !template.is_system_template && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="mr-4"
                >
                  <Pencil className="h-4 w-4 ml-2" />
                  ערוך
                </Button>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6">
            <div className="space-y-6">
              {openQuestions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-md">שאלות פתוחות</h3>
                  <div className="space-y-4">
                    {openQuestions.map((question) => (
                      <div key={question.id} className="space-y-2 relative">
                        {isEditing ? (
                          <Textarea
                            value={question.question_text}
                            onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                            className="w-full min-h-[100px]"
                            dir="rtl"
                          />
                        ) : (
                          <div className="group flex justify-between items-start">
                            <p className="text-right flex-1">{question.question_text}</p>
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-70 hover:opacity-100 ml-2"
                                onClick={() => handleEditQuestion(question)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {closedQuestions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-md">שאלות סגורות</h3>
                  <div className="space-y-6">
                    {closedQuestions.map((question) => (
                      <div key={question.id} className="space-y-3">
                        {isEditing ? (
                          <Input
                            value={question.question_text}
                            onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                            className="w-full"
                            dir="rtl"
                          />
                        ) : (
                          <div className="flex justify-between items-center">
                            <Label className="text-right block flex-1">{question.question_text}</Label>
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-70 hover:opacity-100 ml-2"
                                onClick={() => handleEditQuestion(question)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                        <div className="pr-2 pl-2">
                          <Slider
                            defaultValue={[5]}
                            max={10}
                            min={1}
                            step={1}
                            disabled={true}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 px-2">
                          <span>10</span>
                          <span>1</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 ml-2" />
                    בטל
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 ml-2" />
                    שמור שינויים
                  </Button>
                </div>
              )}

              {!isEditing && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-md mb-3">הקצאת שאלון לשחקן</h3>
                  <Button onClick={() => setIsAssignDialogOpen(true)}>
                    שייך את השאלון לשחקן
                  </Button>
                </div>
              )}

              <AssignQuestionnaireDialog
                open={isAssignDialogOpen}
                onOpenChange={setIsAssignDialogOpen}
                template={template}
                onAssign={handleAssignQuestionnaire}
              />
              
              <EditQuestionModal
                open={editQuestionDialogOpen}
                onOpenChange={setEditQuestionDialogOpen}
                question={currentQuestion}
                onSave={handleSaveQuestionEdit}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

export default QuestionnaireAccordion;
