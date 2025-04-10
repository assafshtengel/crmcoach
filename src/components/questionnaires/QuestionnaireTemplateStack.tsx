
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
import { useToast } from "@/hooks/use-toast";
import AssignQuestionnaireDialog from './AssignQuestionnaireDialog';
import EditQuestionModal from './EditQuestionModal';
import EditQuestionnaireDialog from './EditQuestionnaireDialog';

interface QuestionnaireTemplateStackProps {
  templates: QuestionnaireTemplate[];
  onTemplateCreated?: (template: QuestionnaireTemplate) => void;
}

const QuestionnaireTemplateStack: React.FC<QuestionnaireTemplateStackProps> = ({ 
  templates,
  onTemplateCreated 
}) => {
  const [isEditingTemplate, setIsEditingTemplate] = useState<string | null>(null);
  const [editedQuestions, setEditedQuestions] = useState<{ [key: string]: Question[] }>({});
  const [assignDialogOpenFor, setAssignDialogOpenFor] = useState<string | null>(null);
  const [editQuestionDialogOpen, setEditQuestionDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<{ question: Question, templateId: string } | null>(null);
  const [templateEditDialogOpen, setTemplateEditDialogOpen] = useState<string | null>(null);
  const [localTemplates, setLocalTemplates] = useState<QuestionnaireTemplate[]>(templates);
  const { toast } = useToast();

  // Update local templates state when props change
  React.useEffect(() => {
    setLocalTemplates(templates);
  }, [templates]);

  const handleQuestionChange = (templateId: string, questionId: string, newText: string) => {
    setEditedQuestions(prev => {
      const updatedQuestions = [...(prev[templateId] || templates.find(t => t.id === templateId)?.questions || [])];
      const questionIndex = updatedQuestions.findIndex(q => q.id === questionId);
      
      if (questionIndex !== -1) {
        updatedQuestions[questionIndex] = { 
          ...updatedQuestions[questionIndex], 
          question_text: newText 
        };
      }
      
      return {
        ...prev,
        [templateId]: updatedQuestions
      };
    });
  };

  const handleEditQuestion = (question: Question, templateId: string) => {
    setCurrentQuestion({ question, templateId });
    setEditQuestionDialogOpen(true);
  };

  const handleSaveQuestionEdit = async (questionId: string, newText: string) => {
    if (!currentQuestion || !currentQuestion.templateId) return;
    
    const templateId = currentQuestion.templateId;
    handleQuestionChange(templateId, questionId, newText);
    
    const template = localTemplates.find(t => t.id === templateId);
    if (!template || template.is_system_template) return;
    
    try {
      const updatedQuestions = (editedQuestions[templateId] || [...template.questions]).map(q => 
        q.id === questionId ? { ...q, question_text: newText } : q
      );
      
      const { data, error } = await supabase
        .from('questionnaire_templates')
        .update({ 
          questions: updatedQuestions,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .select();
        
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('No template was updated');
      }
      
      // Update local state with the updated template
      setLocalTemplates(prev => prev.map(t => 
        t.id === templateId ? { ...t, questions: updatedQuestions } : t
      ));
      
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
  };

  const handleSaveTemplate = async (templateId: string) => {
    const template = localTemplates.find(t => t.id === templateId);
    if (!template || template.is_system_template) return;
    
    try {
      const { data, error } = await supabase
        .from('questionnaire_templates')
        .update({ 
          questions: editedQuestions[templateId] || template.questions,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error('No template was updated');
      }
      
      // Update local state with the updated template
      setLocalTemplates(prev => prev.map(t => 
        t.id === templateId ? { ...t, questions: data.questions } : t
      ));
      
      toast({
        title: "השינויים נשמרו",
        description: "השינויים בשאלון נשמרו בהצלחה."
      });
      
      setIsEditingTemplate(null);
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בשמירה",
        description: "אירעה שגיאה בעת שמירת השינויים. נסה שנית."
      });
    }
  };

  const handleCancel = (templateId: string) => {
    setEditedQuestions(prev => ({
      ...prev,
      [templateId]: undefined
    }));
    setIsEditingTemplate(null);
  };

  const handleEditTemplateClick = (templateId: string) => {
    setTemplateEditDialogOpen(templateId);
  };

  const handleSaveTemplateEdit = async (templateId: string, updatedTemplate: Partial<QuestionnaireTemplate>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const template = localTemplates.find(t => t.id === templateId);
      
      if (!session || !template) {
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
          updated_at: now
        };
        
        const { data, error } = await supabase
          .from('questionnaire_templates')
          .insert([newTemplate])
          .select()
          .single();
          
        if (error) {
          throw error;
        }
        
        if (!data) {
          throw new Error('Failed to create new template');
        }
        
        // Add the new template to local state
        setLocalTemplates(prev => [data, ...prev]);
        
        if (onTemplateCreated && data) {
          onTemplateCreated(data);
        }
        
        toast({
          title: "שאלון חדש נוצר",
          description: "גרסה אישית של השאלון נוצרה בהצלחה"
        });
      } 
      else {
        const { data, error } = await supabase
          .from('questionnaire_templates')
          .update({ 
            title: updatedTemplate.title,
            questions: updatedTemplate.questions,
            updated_at: now
          })
          .eq('id', templateId)
          .eq('coach_id', session.user.id)  // Ensure the coach can only update their templates
          .select()
          .single();
          
        if (error) {
          throw error;
        }
        
        if (!data) {
          throw new Error('No template was updated. It might not belong to you.');
        }
        
        // Update local state with the updated template
        setLocalTemplates(prev => prev.map(t => 
          t.id === templateId ? { ...t, ...data } : t
        ));
        
        toast({
          title: "השאלון עודכן",
          description: "השאלון עודכן בהצלחה"
        });
      }
      
      setTemplateEditDialogOpen(null);
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
      const template = localTemplates.find(t => t.id === templateId);
      if (!template) return;
      
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
          template_id: templateId,
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
      
      setAssignDialogOpenFor(null);
    } catch (error: any) {
      console.error('Failed to assign questionnaire:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בשיוך השאלון",
        description: error.message || "אירעה שגיאה בעת שיוך השאלון. נסה שנית."
      });
    }
  };

  const getQuestionsForTemplate = (template: QuestionnaireTemplate) => {
    return isEditingTemplate === template.id && editedQuestions[template.id] 
      ? editedQuestions[template.id] 
      : template.questions;
  };

  return (
    <>
      {localTemplates.map(template => {
        const questions = getQuestionsForTemplate(template);
        const openQuestions = questions?.filter(q => q.type === 'open') || [];
        const closedQuestions = questions?.filter(q => q.type === 'closed') || [];
        const isEditing = isEditingTemplate === template.id;
        
        return (
          <Card key={template.id} className="mb-4 overflow-hidden">
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
                            setIsEditingTemplate(template.id);
                          } else {
                            handleEditTemplateClick(template.id);
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
                                  onChange={(e) => handleQuestionChange(template.id, question.id, e.target.value)}
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
                                      onClick={() => handleEditQuestion(question, template.id)}
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
                                  onChange={(e) => handleQuestionChange(template.id, question.id, e.target.value)}
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
                                      onClick={() => handleEditQuestion(question, template.id)}
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
                        <Button variant="outline" onClick={() => handleCancel(template.id)}>
                          <X className="h-4 w-4 ml-2" />
                          בטל
                        </Button>
                        <Button onClick={() => handleSaveTemplate(template.id)}>
                          <Save className="h-4 w-4 ml-2" />
                          שמור שינויים
                        </Button>
                      </div>
                    )}

                    {!isEditing && (
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <h3 className="font-semibold text-md mb-3">הקצאת שאלון לשחקן</h3>
                        <Button onClick={() => setAssignDialogOpenFor(template.id)}>
                          שייך את השאלון לשחקן
                        </Button>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        );
      })}

      {/* Modals and Dialogs */}
      {assignDialogOpenFor && (
        <AssignQuestionnaireDialog
          open={!!assignDialogOpenFor}
          onOpenChange={(open) => !open && setAssignDialogOpenFor(null)}
          template={localTemplates.find(t => t.id === assignDialogOpenFor)!}
          onAssign={handleAssignQuestionnaire}
        />
      )}
      
      <EditQuestionModal
        open={editQuestionDialogOpen}
        onOpenChange={setEditQuestionDialogOpen}
        question={currentQuestion?.question || null}
        onSave={handleSaveQuestionEdit}
      />
      
      {templateEditDialogOpen && (
        <EditQuestionnaireDialog
          open={!!templateEditDialogOpen}
          onOpenChange={(open) => !open && setTemplateEditDialogOpen(null)}
          template={localTemplates.find(t => t.id === templateEditDialogOpen)!}
          onSave={(updatedTemplate) => handleSaveTemplateEdit(templateEditDialogOpen, updatedTemplate)}
          isNewTemplate={localTemplates.find(t => t.id === templateEditDialogOpen)?.is_system_template || false}
        />
      )}
    </>
  );
};

export default QuestionnaireTemplateStack;
