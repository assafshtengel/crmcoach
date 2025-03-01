
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
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
          <FormField
            control={form.control}
            name="club"
            render={({ field }) => (
              <FormItem>
                <FormLabel>מועדון/קבוצה</FormLabel>
                <FormControl>
                  <Input 
                    className="mt-1"
                    placeholder="הכנס שם מועדון או קבוצה" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            control={form.control}
            name="yearGroup"
            render={({ field }) => (
              <FormItem>
                <FormLabel>שנתון</FormLabel>
                <FormControl>
                  <Input 
                    className="mt-1"
                    placeholder="הכנס שנתון" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="sm:col-span-2">
          <FormField
            control={form.control}
            name="injuries"
            render={({ field }) => (
              <FormItem>
                <FormLabel>פציעות קודמות (אופציונלי)</FormLabel>
                <FormControl>
                  <Textarea 
                    className="mt-1"
                    placeholder="פרט פציעות קודמות אם ישנן" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};
