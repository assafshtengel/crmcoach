
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
        onAutoClose: () => {
          if (navigateAfterSave) {
            // Navigate to all meeting summaries page after exporting
            navigate('/all-meeting-summaries');
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
    }
  };

  return (
    <div className="space-y-2 mt-6">
      <div className="grid grid-cols-2 gap-2">
        <Button 
          type="button" 
          onClick={handleSave}
          variant="green"
          disabled={isSaving}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'שומר...' : 'שמור סיכום'}
        </Button>

        <Button 
          type="button"
          onClick={handleExportPDF}
          variant="gray"
          disabled={isSaving}
        >
          <FileDown className="mr-2 h-4 w-4" />
          שמור וייצא PDF
        </Button>
      </div>
    </div>
  );
}
