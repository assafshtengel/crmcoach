
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Save, Trash2 } from 'lucide-react';
import { Question, QuestionnaireTemplate } from '@/types/questionnaire';
import { Separator } from '@/components/ui/separator';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

interface EditQuestionnaireDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: QuestionnaireTemplate | null;
  onSave: (template: Partial<QuestionnaireTemplate>) => Promise<void>;
  isNewTemplate?: boolean;
}

const EditQuestionnaireDialog: React.FC<EditQuestionnaireDialogProps> = ({
  open,
  onOpenChange,
  template,
  onSave,
  isNewTemplate = false
}) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (template) {
      setTitle(template.title);
      setQuestions(template.questions);
    } else {
      setTitle('');
      setQuestions([]);
    }
  }, [template]);

  const handleAddQuestion = (type: 'open' | 'closed') => {
    const newId = uuidv4();
    const newQuestion: Question = {
      id: newId,
      type: type,
      question_text: type === 'open' ? 'שאלה פתוחה חדשה' : 'דירוג חדש (1-10)'
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleQuestionTextChange = (id: string, text: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, question_text: text } : q
    ));
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "יש להזין כותרת לשאלון"
      });
      return;
    }

    if (questions.length === 0) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "יש להוסיף לפחות שאלה אחת לשאלון"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        title,
        questions,
        ...(template && !isNewTemplate ? { id: template.id } : {}),
        ...(template ? { type: template.type } : {})
      });
      
      toast({
        title: "השאלון נשמר בהצלחה",
        description: isNewTemplate ? "הגרסה האישית של השאלון נוצרה בהצלחה." : "השינויים נשמרו בהצלחה."
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בשמירת השאלון",
        description: "אירעה שגיאה בעת שמירת השאלון. נסה שנית."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isNewTemplate ? 'יצירת גרסה אישית מותאמת' : 'עריכת שאלון'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">כותרת השאלון</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="הזן כותרת לשאלון"
            />
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">שאלות</h3>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleAddQuestion('closed')}
                  type="button"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  הוסף שאלת דירוג
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleAddQuestion('open')}
                  type="button"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  הוסף שאלה פתוחה
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <div 
                  key={question.id} 
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative"
                >
                  <div className="flex justify-between items-start">
                    <Label className="font-medium mb-2 block">
                      שאלה {index + 1} ({question.type === 'open' ? 'פתוחה' : 'דירוג'})
                    </Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveQuestion(question.id)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Textarea
                    value={question.question_text}
                    onChange={(e) => handleQuestionTextChange(question.id, e.target.value)}
                    className="mt-1"
                    rows={2}
                  />

                  {question.type === 'closed' && (
                    <div className="mt-2 text-sm text-gray-500">
                      * שאלת דירוג תציג סולם מ-1 עד 10 למענה
                    </div>
                  )}
                </div>
              ))}

              {questions.length === 0 && (
                <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">אין עדיין שאלות. לחץ על "הוסף שאלה" כדי להתחיל.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>טוען...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                שמור שאלון
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuestionnaireDialog;
