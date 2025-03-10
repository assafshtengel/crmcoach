
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./schemaValidation";

interface SummaryTabProps {
  form: UseFormReturn<FormValues>;
}

export function SummaryTab({
  form
}: SummaryTabProps) {
  return <div className="space-y-4 pt-4">
      <FormField control={form.control} name="summary_text" render={({
      field
    }) => <FormItem>
            <FormLabel className="text-center w-full block">סיכום המפגש</FormLabel>
            <FormControl>
              <Textarea placeholder="תאר את המפגש..." {...field} className="h-24 resize-none" />
            </FormControl>
            <FormMessage />
          </FormItem>} />

      <FormField control={form.control} name="achieved_goals" render={({
      field
    }) => <FormItem>
            <FormLabel className="text-center w-full block">מטרות שהושגו</FormLabel>
            <FormControl>
              <Textarea placeholder="פרט את המטרות שהושגו במפגש..." {...field} className="h-20 resize-none" />
            </FormControl>
            <FormMessage />
          </FormItem>} />

      <FormField control={form.control} name="future_goals" render={({
      field
    }) => <FormItem>
            <FormLabel className="text-center w-full block">מטרות להמשך</FormLabel>
            <FormControl>
              <Textarea placeholder="הגדר מטרות להמשך..." {...field} className="h-20 resize-none" />
            </FormControl>
            <FormMessage />
          </FormItem>} />

      <FormField control={form.control} name="progress_rating" render={({
      field
    }) => <FormItem>
            <FormLabel className="text-center w-full block">דירוג התקדמות (1-5)</FormLabel>
            <FormControl>
              <Slider min={1} max={5} step={1} value={[field.value]} onValueChange={([value]) => field.onChange(value)} />
            </FormControl>
            <FormMessage />
          </FormItem>} />

      <FormField control={form.control} name="next_session_focus" render={({
      field
    }) => <FormItem>
            <FormLabel className="text-center w-full block">מיקוד למפגש הבא</FormLabel>
            <FormControl>
              <Textarea placeholder="על מה נתמקד במפגש הבא..." {...field} className="h-20 resize-none" />
            </FormControl>
            <FormMessage />
          </FormItem>} />

      <FormField control={form.control} name="additional_notes" render={({
      field
    }) => <FormItem>
            <FormLabel className="text-center w-full block">הערות נוספות</FormLabel>
            <FormControl>
              <Textarea placeholder="הערות נוספות..." {...field} className="h-20 resize-none" />
            </FormControl>
            <FormMessage />
          </FormItem>} />
    </div>;
}
