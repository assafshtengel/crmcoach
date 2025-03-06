
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, X, FileText, PanelRight, Settings } from "lucide-react";

interface FormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  onSaveDraft?: () => void;
  onExportPDF?: () => void;
  onAdvancedSettings?: () => void;
  isSaving?: boolean;
}

export function FormActions({ 
  onCancel, 
  onSubmit, 
  onSaveDraft, 
  onExportPDF, 
  onAdvancedSettings,
  isSaving = false
}: FormActionsProps) {
  return (
    <div className="space-y-2 mt-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Button 
          type="button" 
          onClick={onCancel}
          variant="yellow"
        >
          <X className="mr-2 h-4 w-4" />
          ביטול
        </Button>
        
        <Button 
          type="button"
          onClick={onSaveDraft}
          variant="blue"
          disabled={isSaving}
        >
          <FileText className="mr-2 h-4 w-4" />
          שמור טיוטה
        </Button>
        
        <Button 
          type="button" 
          onClick={onSubmit}
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
          <PanelRight className="mr-2 h-4 w-4" />
          שמור וייצא PDF
        </Button>
      </div>
      
      <Button 
        type="button"
        variant="purple"
        onClick={onAdvancedSettings}
        disabled={isSaving}
        className="w-full"
      >
        <Settings className="mr-2 h-4 w-4" />
        הגדרות מתקדמות
      </Button>
    </div>
  );
}
