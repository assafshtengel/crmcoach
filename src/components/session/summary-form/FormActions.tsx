
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, X, FileText, PanelRight, Settings } from "lucide-react";

interface FormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
}

export function FormActions({ onCancel, onSubmit }: FormActionsProps) {
  return (
    <div className="space-y-2 mt-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Button 
          type="button" 
          onClick={onCancel}
          className="bg-yellow-400 hover:bg-yellow-500 text-white"
        >
          <X className="mr-2 h-4 w-4" />
          ביטול
        </Button>
        
        <Button 
          type="button"
          className="bg-blue-400 hover:bg-blue-500 text-white"
        >
          <FileText className="mr-2 h-4 w-4" />
          שמור טיוטה
        </Button>
        
        <Button 
          type="button" 
          onClick={onSubmit}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          <Save className="mr-2 h-4 w-4" />
          שמור סיכום
        </Button>

        <Button 
          type="button"
          className="bg-gray-700 hover:bg-gray-800 text-white"
        >
          <PanelRight className="mr-2 h-4 w-4" />
          שמור וייצא PDF
        </Button>
      </div>
      
      <Button 
        type="button"
        className="w-full bg-purple-500 hover:bg-purple-600 text-white"
      >
        <Settings className="mr-2 h-4 w-4" />
        הגדרות מתקדמות
      </Button>
    </div>
  );
}
