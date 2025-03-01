
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

interface SummaryTabProps {
  form: UseFormReturn<{
    summary_text: string;
    achieved_goals: string;
    future_goals: string;
    additional_notes: string;
    progress_rating: number;
    next_session_focus: string;
  }>;
}

export function SummaryTab({ form }: SummaryTabProps) {
  return (
    <div className="space-y-4 pt-4">
      <FormField
        control={form.control}
        name="summary_text"
        render={({ field }) => (
          <FormItem>
            <FormLabel>סיכום המפגש</FormLabel>
            <FormControl>
              <Textarea placeholder="תאר את המפגש..." {...field} className="h-24 resize-none" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="achieved_goals"
        render={({ field }) => (
          <FormItem>
            <FormLabel>מטרות שהושגו</FormLabel>
            <FormControl>
              <Textarea placeholder="פרט את המטרות שהושגו במפגש..." {...field} className="h-20 resize-none" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="future_goals"
        render={({ field }) => (
          <FormItem>
            <FormLabel>מטרות להמשך</FormLabel>
            <FormControl>
              <Textarea placeholder="הגדר מטרות להמשך..." {...field} className="h-20 resize-none" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="progress_rating"
        render={({ field }) => (
          <FormItem>
            <FormLabel>דירוג התקדמות (1-5)</FormLabel>
            <FormControl>
              <Slider
                min={1}
                max={5}
                step={1}
                value={[field.value]}
                onValueChange={([value]) => field.onChange(value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="next_session_focus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>מיקוד למפגש הבא</FormLabel>
            <FormControl>
              <Textarea placeholder="על מה נתמקד במפגש הבא..." {...field} className="h-20 resize-none" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="additional_notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>הערות נוספות</FormLabel>
            <FormControl>
              <Textarea placeholder="הערות נוספות..." {...field} className="h-20 resize-none" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
