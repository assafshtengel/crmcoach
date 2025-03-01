
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface NotesSectionProps {
  form: UseFormReturn<FormValues>;
}

export const NotesSection = ({ form }: NotesSectionProps) => {
  return (
    <div>
      <Label htmlFor="notes">הערות נוספות (אופציונלי)</Label>
      <Textarea 
        id="notes" 
        className="mt-1"
        placeholder="הוסף הערות נוספות אם יש" 
        {...form.register("notes")} 
      />
    </div>
  );
};
