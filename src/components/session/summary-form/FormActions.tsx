
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    // The navigation will happen after the submission is complete
    // via the FeedbackDialog's onClose handler in SessionSummaryForm
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
          onClick={onExportPDF}
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
