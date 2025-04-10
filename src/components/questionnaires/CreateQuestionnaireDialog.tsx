
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, X, Save, Trash2 } from 'lucide-react';
import { Question, QuestionnaireTemplate } from '@/types/questionnaire';
import { Separator } from '@/components/ui/separator';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface CreateQuestionnaireDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateCreated?: (template: QuestionnaireTemplate) => void; // Add this prop
}

const CreateQuestionnaireDialog: React.FC<CreateQuestionnaireDialogProps> = ({
  open,
  onOpenChange,
  onTemplateCreated
}) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [type, setType] = useState('custom');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleReset = () => {
    setTitle('');
    setQuestions([]);
    setType('custom');
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
      
      // Get the current user's auth session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user) {
        toast({
          title: "יש להתחבר תחילה",
          description: "עליך להתחבר למערכת כדי ליצור שאלונים",
          variant: "destructive",
        });
        return;
      }
      
      // Create a new questionnaire template
      const newTemplate: Partial<QuestionnaireTemplate> = {
        coach_id: session.user.id,
        title,
        type,
        questions,
        is_system_template: false
      };
      
      const { data, error } = await supabase
        .from('questionnaire_templates')
        .insert(newTemplate)
        .select()
        .single();
        
      if (error) {
        console.error('Error creating template:', error);
        throw error;
      }
      
      toast({
        title: "השאלון נוצר בהצלחה",
        description: "השאלון המותאם האישי נוצר בהצלחה וזמין לשימוש."
      });
      
      // Reset the form and close the dialog
      handleReset();
      onOpenChange(false);
      
      // Call the onTemplateCreated callback if provided
      if (onTemplateCreated && data) {
        onTemplateCreated(data as QuestionnaireTemplate);
      } else {
        // Reload the page if callback not provided (fallback behavior)
        window.location.reload();
      }
      
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        variant: "destructive",
        title: "שגיאה ביצירת השאלון",
        description: "אירעה שגיאה בעת יצירת השאלון. נסה שנית."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">יצירת שאלון מותאם אישי חדש</DialogTitle>
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

          <div className="space-y-2">
            <Label htmlFor="type">סוג השאלון</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type">
                <SelectValue placeholder="בחר סוג שאלון" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">מותאם אישית</SelectItem>
                <SelectItem value="day_opening">פתיחת יום</SelectItem>
                <SelectItem value="day_summary">סיכום יום</SelectItem>
                <SelectItem value="post_game">אחרי משחק</SelectItem>
                <SelectItem value="mental_prep">מוכנות מנטלית</SelectItem>
                <SelectItem value="personal_goals">מטרות אישיות</SelectItem>
                <SelectItem value="motivation">מוטיבציה ולחץ</SelectItem>
                <SelectItem value="season_end">סיום עונה</SelectItem>
                <SelectItem value="team_communication">תקשורת קבוצתית</SelectItem>
              </SelectContent>
            </Select>
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
                  <Plus className="h-4 w-4 ml-2" />
                  הוסף שאלת דירוג
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleAddQuestion('open')}
                  type="button"
                >
                  <Plus className="h-4 w-4 ml-2" />
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
                <Save className="h-4 w-4 ml-2" />
                צור שאלון
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuestionnaireDialog;
