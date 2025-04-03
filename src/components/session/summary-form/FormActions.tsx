
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, FileDown, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

interface FormActionsProps {
  onSubmit: () => void;
  onExportPDF?: () => void;
  isSaving?: boolean;
  navigateAfterSave?: boolean;
}

export function FormActions({
  onSubmit,
  onExportPDF,
  isSaving = false,
  navigateAfterSave = true
}: FormActionsProps) {
  const navigate = useNavigate();
  const [showReturnDialog, setShowReturnDialog] = useState(false);

  const handleSave = () => {
    onSubmit();

    // Display a successful toast notification
    toast.success("סיכום המפגש נשמר בהצלחה", {
      position: "top-center",
      duration: 1500,
      onAutoClose: () => {
        if (navigateAfterSave) {
          // Navigate to all meeting summaries page after saving
          navigate('/all-meeting-summaries');
          console.log("Navigating to /all-meeting-summaries after save");
        }
      },
      style: {
        fontSize: '1.1rem',
        padding: '16px',
        backgroundColor: '#ecfdf5',
        border: '1px solid #10b981',
        color: '#065f46'
      }
    });
  };

  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF();

      // Display a successful toast for PDF export
      toast.success("הסיכום יוצא ל-PDF בהצלחה", {
        position: "top-center",
        duration: 1500,
        style: {
          fontSize: '1.1rem',
          padding: '16px',
          backgroundColor: '#ecfdf5',
          border: '1px solid #10b981',
          color: '#065f46'
        }
      });
      
      // Show the return to home dialog after PDF export
      setShowReturnDialog(true);
    }
  };

  const handleReturnToHome = () => {
    // Close the dialog and navigate to home page
    setShowReturnDialog(false);
    // Navigate to root path (home)
    navigate('/');
    console.log("Navigating to root path (home) after user clicked 'return to home'");
  };

  return (
    <div className="space-y-2 mt-6">
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" onClick={handleExportPDF} variant="gray" disabled={isSaving} className="bg-emerald-950 hover:bg-emerald-800 font-medium px-[35px] my-0 mx-0 py-[29px] text-right">
          <FileDown className="mr-2 h-4 w-4" />
          שמור וייצא PDF
        </Button>
      </div>

      {/* Return to home dialog */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-xl text-center">הייצוא הושלם בהצלחה</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-lg mb-6">הסיכום יוצא ל-PDF ונשמר בהצלחה</p>
            
            <Button 
              onClick={handleReturnToHome} 
              className="bg-emerald-700 hover:bg-emerald-600 py-6 px-8 w-full text-lg flex items-center justify-center gap-2"
            >
              <Home className="h-5 w-5" />
              לחזרה לדף הבית - לחץ כאן
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
