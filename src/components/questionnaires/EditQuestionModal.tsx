
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Question } from '@/types/questionnaire';
import { Save, X } from 'lucide-react';

interface EditQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: Question | null;
  onSave: (id: string, newText: string) => void;
}

const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  open,
  onOpenChange,
  question,
  onSave
}) => {
  const [questionText, setQuestionText] = useState('');

  // Update the local state when the question changes
  React.useEffect(() => {
    if (question) {
      setQuestionText(question.question_text);
    }
  }, [question]);

  const handleSave = () => {
    if (question && questionText.trim()) {
      onSave(question.id, questionText);
      onOpenChange(false);
    }
  };

  const isOpenQuestion = question?.type === 'open';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">
            עריכת {isOpenQuestion ? 'שאלה פתוחה' : 'שאלת דירוג'}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-2">
            {isOpenQuestion ? (
              <Textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="הזן טקסט לשאלה"
                className="min-h-[100px]"
                dir="rtl"
              />
            ) : (
              <Input
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="הזן טקסט לשאלה"
                dir="rtl"
              />
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 ml-2" />
            בטל
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 ml-2" />
            שמור
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuestionModal;
