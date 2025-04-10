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
import EditQuestionnaireDialog from './EditQuestionnaireDialog';

interface QuestionnaireAccordionProps {
  template: QuestionnaireTemplate;
  onTemplateCreated?: (template: QuestionnaireTemplate) => void;
}

const QuestionnaireAccordion: React.FC<QuestionnaireAccordionProps> = ({ 
  template,
  onTemplateCreated 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestions, setEditedQuestions] = useState<Question[]>(template.questions);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editQuestionDialogOpen, setEditQuestionDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isTemplateEditDialogOpen, setIsTemplateEditDialogOpen] = useState(false);
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
    handleQuestionChange(id, newText);
    
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

  const handleEditTemplateClick = () => {
    setIsTemplateEditDialogOpen(true);
  };

  const handleSaveTemplate = async (updatedTemplate: Partial<QuestionnaireTemplate>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "יש להתחבר תחילה",
          description: "עליך להתחבר למערכת כדי לערוך שאלונים",
        });
        return;
      }

      const now = new Date().toISOString();
      
      if (template.is_system_template) {
        const newTemplate = {
          title: updatedTemplate.title || template.title,
          questions: updatedTemplate.questions || template.questions,
          type: updatedTemplate.type || template.type,
          is_system_template: false,
          coach_id: session.user.id,
          created_at: now,
          updated_at: now,
          parent_template_id: template.id
        };
        
        const { data, error } = await supabase
          .from('questionnaire_templates')
          .insert([newTemplate])
          .select()
          .single();
          
        if (error) {
          throw error;
        }
        
        if (onTemplateCreated && data) {
          onTemplateCreated(data);
        }
        
        toast({
          title: "שאלון חדש נוצר",
          description: "גרסה אישית של השאלון נוצרה בהצלחה"
        });
      } 
      else {
        const { error } = await supabase
          .from('questionnaire_templates')
          .update({ 
            title: updatedTemplate.title,
            questions: updatedTemplate.questions,
            updated_at: now
          })
          .eq('id', template.id);
          
        if (error) {
          throw error;
        }
        
        toast({
          title: "השאלון עודכן",
          description: "השאלון עודכן בהצלחה"
        });
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בשמירה",
        description: "אירעה שגיאה בעת שמירת השאלון. נסה שנית."
      });
    }
  };

  const handleAssignQuestionnaire = async (templateId: string, playerId: string) => {
    try {
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

  return (
    <Card className="mb-4 overflow-hidden">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={template.id} className="border-0">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex-1 flex items-center justify-between pl-4">
              <span className="font-bold text-lg">{template.title}</span>
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!template.is_system_template) {
                      setIsEditing(true);
                    } else {
                      handleEditTemplateClick();
                    }
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
                            {!template.is_system_template && (
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
                            {!template.is_system_template && (
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
                            dir="rtl"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 px-2">
                          <span>1</span>
                          <span>10</span>
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
              
              <EditQuestionnaireDialog
                open={isTemplateEditDialogOpen}
                onOpenChange={setIsTemplateEditDialogOpen}
                template={template}
                onSave={handleSaveTemplate}
                isNewTemplate={template.is_system_template}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

export default QuestionnaireAccordion;
