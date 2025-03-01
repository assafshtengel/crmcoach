
import React from "react";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
}

export function FormActions({ onCancel, onSubmit }: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-4 pt-4 border-t">
      <Button variant="outline" type="button" onClick={onCancel}>
        ביטול
      </Button>
      <Button 
        type="button" 
        onClick={onSubmit}
      >
        שמירת סיכום
      </Button>
    </div>
  );
}
