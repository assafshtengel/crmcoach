import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { X } from "lucide-react";

interface EditResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  study: Study | null;
  onSave: (updatedStudy: Study) => void;
}

interface Study {
  id: number;
  title: string;
  institution: string;
  abstract: string;
  field: string;
  hasRating?: boolean;
  rating?: number;
  iconType: "brain" | "chart" | "microscope" | "document";
  fullContent: React.ReactNode;
}

export const EditResearchModal: React.FC<EditResearchModalProps> = ({
  isOpen,
  onClose,
  study,
  onSave
}) => {
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(true);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [editedStudy, setEditedStudy] = useState<Study | null>(null);
  const [fullContentText, setFullContentText] = useState("");

  // Reset state when modal opens with a new study
  React.useEffect(() => {
    if (study) {
      setEditedStudy({ ...study });
      // Convert ReactNode to string for editing
      // This is a simplification - in a real app you'd need a more robust approach
      setFullContentText("");
    }
    setIsCodeDialogOpen(true);
    setCode("");
    setCodeError(false);
  }, [study, isOpen]);

  const handleCodeSubmit = () => {
    if (code === "1976") {
      setIsCodeDialogOpen(false);
      setCodeError(false);
    } else {
      setCodeError(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!editedStudy) return;
    
    setEditedStudy({
      ...editedStudy,
      [name]: value
    });
  };

  const handleSave = () => {
    if (!editedStudy) return;
    
    // Here you would typically convert the fullContentText back to ReactNode
    // For simplicity, we're keeping the original fullContent
    onSave(editedStudy);
    onClose();
  };

  if (!study) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl" dir="rtl">
        {isCodeDialogOpen ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold mb-4">הזן קוד כדי לערוך מחקר</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="securityCode">קוד אבטחה:</Label>
                <Input
                  id="securityCode"
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                {codeError && <p className="text-red-500 text-sm">קוד שגוי, נסה שוב.</p>}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>ביטול</Button>
                <Button onClick={handleCodeSubmit}>אישור</Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">עריכת מחקר</DialogTitle>
              <button 
                className="absolute left-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100" 
                onClick={onClose}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">סגור</span>
              </button>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">כותרת:</Label>
                <Input
                  id="title"
                  name="title"
                  value={editedStudy?.title || ""}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="field">תחום:</Label>
                <Input
                  id="field"
                  name="field"
                  value={editedStudy?.field || ""}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="institution">מוסד:</Label>
                <Input
                  id="institution"
                  name="institution"
                  value={editedStudy?.institution || ""}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="abstract">תקציר:</Label>
                <Textarea
                  id="abstract"
                  name="abstract"
                  value={editedStudy?.abstract || ""}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="iconType">סוג אייקון:</Label>
                <select
                  id="iconType"
                  name="iconType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right"
                  value={editedStudy?.iconType || "brain"}
                  onChange={(e) => {
                    if (!editedStudy) return;
                    setEditedStudy({
                      ...editedStudy,
                      iconType: e.target.value as "brain" | "chart" | "microscope" | "document"
                    });
                  }}
                >
                  <option value="brain">מוח</option>
                  <option value="chart">תרשים</option>
                  <option value="microscope">מיקרוסקופ</option>
                  <option value="document">מסמך</option>
                </select>
              </div>
              
              {/* Note: Editing fullContent is complex as it's a ReactNode
                  In a real application, you might use a rich text editor
                  For this example, we're keeping it simple */}
              <div className="space-y-2">
                <Label htmlFor="fullContent">הערה: עריכת תוכן מלא זמינה רק בממשק המנהל המלא</Label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>ביטול</Button>
              <Button onClick={handleSave}>שמור שינויים</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
