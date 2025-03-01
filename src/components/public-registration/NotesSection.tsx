
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface NotesSectionProps {
  form: UseFormReturn<FormValues>;
}

export const NotesSection = ({ form }: NotesSectionProps) => {
  return (
    <div>
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>הערות נוספות (אופציונלי)</FormLabel>
            <FormControl>
              <Textarea 
                className="mt-1"
                placeholder="הוסף הערות נוספות אם יש" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
