
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
import { Pencil, Save, X, Edit } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AssignQuestionnaireDialog from './AssignQuestionnaireDialog';
import EditQuestionnaireDialog from './EditQuestionnaireDialog';

interface QuestionnaireAccordionProps {
  template: QuestionnaireTemplate;
}

const QuestionnaireAccordion: React.FC<QuestionnaireAccordionProps> = ({ template }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestions, setEditedQuestions] = useState<Question[]>(template.questions);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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
              {!template.is_system_template && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditDialogOpen(true);
                    }}
                    className="mr-4 bg-blue-50 hover:bg-blue-100 border-blue-200"
                  >
                    <Edit className="h-4 w-4 ml-2 text-blue-600" />
                    <span className="text-blue-600">ערוך</span>
                  </Button>
                </div>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6">
            <div className="space-y-6">
              {!template.is_system_template && (
                <div className="bg-blue-50 p-3 rounded-md border border-blue-200 flex items-center justify-between mb-4">
                  <span className="text-blue-700 font-medium">הגדרות שאלון</span>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => setIsEditDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="h-4 w-4 ml-2" />
                    ערוך שאלון
                  </Button>
                </div>
              )}

              {openQuestions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-md flex items-center justify-between">
                    <span>שאלות פתוחות</span>
                    {!template.is_system_template && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setIsEditDialogOpen(true)}
                              className="text-blue-600"
                            >
                              <Pencil className="h-4 w-4 ml-1" />
                              ערוך
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>ערוך את שאלות השאלון</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </h3>
                  <div className="space-y-4">
                    {openQuestions.map((question) => (
                      <div key={question.id} className="space-y-2">
                        {isEditing ? (
                          <Textarea
                            value={question.question_text}
                            onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                            className="w-full min-h-[100px]"
                            dir="rtl"
                          />
                        ) : (
                          <div className="bg-gray-50 p-3 rounded-md border border-gray-200 relative group">
                            <p className="text-right pr-8">{question.question_text}</p>
                            {!template.is_system_template && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditDialogOpen(true)}
                                className="absolute top-1 right-1 text-blue-600"
                              >
                                <Pencil className="h-3.5 w-3.5" />
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
                  <h3 className="font-semibold text-md flex items-center justify-between">
                    <span>שאלות סגורות</span>
                    {!template.is_system_template && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setIsEditDialogOpen(true)}
                              className="text-blue-600"
                            >
                              <Pencil className="h-4 w-4 ml-1" />
                              ערוך
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>ערוך את שאלות השאלון</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </h3>
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
                          <div className="bg-gray-50 p-3 rounded-md border border-gray-200 relative group">
                            <Label className="text-right block pr-8">{question.question_text}</Label>
                            {!template.is_system_template && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditDialogOpen(true)}
                                className="absolute top-1 right-1 text-blue-600"
                              >
                                <Pencil className="h-3.5 w-3.5" />
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
                  <div className="flex flex-wrap gap-3">
                    {!template.is_system_template && (
                      <Button 
                        variant="default" 
                        onClick={() => setIsEditDialogOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit className="h-4 w-4 ml-2" />
                        <span>ערוך שאלון</span>
                      </Button>
                    )}
                    <Button onClick={() => setIsAssignDialogOpen(true)}>
                      שייך את השאלון לשחקן
                    </Button>
                  </div>
                </div>
              )}

              <AssignQuestionnaireDialog
                open={isAssignDialogOpen}
                onOpenChange={setIsAssignDialogOpen}
                template={template}
                onAssign={handleAssignQuestionnaire}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {!template.is_system_template && (
        <EditQuestionnaireDialog 
          open={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen}
          template={template}
          onSave={async (updatedTemplate) => {
            try {
              const { error } = await supabase
                .from('questionnaire_templates')
                .update({ 
                  title: updatedTemplate.title,
                  questions: updatedTemplate.questions,
                  updated_at: new Date().toISOString()
                })
                .eq('id', template.id);
              
              if (error) throw error;
              
              toast({
                title: "השאלון עודכן בהצלחה",
                description: "השינויים נשמרו בהצלחה"
              });
            } catch (error) {
              console.error('Error updating template:', error);
              toast({
                title: "שגיאה בעדכון השאלון",
                description: "אירעה שגיאה בעת שמירת השינויים",
                variant: "destructive"
              });
            }
          }}
          isNewTemplate={false}
        />
      )}
    </Card>
  );
};

export default QuestionnaireAccordion;
