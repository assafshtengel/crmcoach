
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface ClubInfoProps {
  form: UseFormReturn<FormValues>;
}

export const ClubInfo = ({ form }: ClubInfoProps) => {
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900">פרטי מועדון</h2>
      <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
        <div>
          <Label htmlFor="club">מועדון/קבוצה</Label>
          <Input 
            id="club" 
            className="mt-1"
            placeholder="הכנס שם מועדון או קבוצה" 
            {...form.register("club")} 
          />
          {form.formState.errors.club && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.club.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="yearGroup">שנתון</Label>
          <Input 
            id="yearGroup" 
            className="mt-1"
            placeholder="הכנס שנתון" 
            {...form.register("yearGroup")} 
          />
          {form.formState.errors.yearGroup && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.yearGroup.message}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="injuries">פציעות קודמות (אופציונלי)</Label>
          <Textarea 
            id="injuries" 
            className="mt-1"
            placeholder="פרט פציעות קודמות אם ישנן" 
            {...form.register("injuries")} 
          />
        </div>
      </div>
    </div>
  );
};
