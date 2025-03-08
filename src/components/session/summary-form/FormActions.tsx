
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, FileDown } from "lucide-react";

interface FormActionsProps {
  onSubmit: () => void;
  onExportPDF?: () => void;
  isSaving?: boolean;
}

export function FormActions({ 
  onSubmit, 
  onExportPDF,
  isSaving = false
}: FormActionsProps) {
  return (
    <div className="space-y-2 mt-6">
      <div className="grid grid-cols-2 gap-2">
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
          <FileDown className="mr-2 h-4 w-4" />
          שמור וייצא PDF
        </Button>
      </div>
    </div>
  );
}
