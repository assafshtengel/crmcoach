
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";
import { he } from 'date-fns/locale';

const formSchema = z.object({
  summary_text: z.string().min(1, "נדרש למלא סיכום"),
  achieved_goals: z.string(),
  future_goals: z.string(),
  additional_notes: z.string().optional(),
  progress_rating: z.number().min(1).max(5),
  next_session_focus: z.string()
});

interface SessionSummaryFormProps {
  sessionId: string;
  playerName: string;
  sessionDate: string;
  onSubmit: (data: z.infer<typeof formSchema>) => Promise<void>;
  onCancel: () => void;
}

export function SessionSummaryForm({ sessionId, playerName, sessionDate, onSubmit, onCancel }: SessionSummaryFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      summary_text: "",
      achieved_goals: "",
      future_goals: "",
      additional_notes: "",
      progress_rating: 3,
      next_session_focus: ""
    }
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    await onSubmit(data);
  };

  const formattedDate = format(new Date(sessionDate), 'dd/MM/yyyy', { locale: he });

  return (
    <Form {...form}>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold mb-2">{playerName}</h2>
        <p className="text-gray-600">{formattedDate}</p>
      </div>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="summary_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>סיכום המפגש</FormLabel>
              <FormControl>
                <Textarea placeholder="תאר את המפגש..." {...field} className="h-32" />
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
                <Textarea placeholder="פרט את המטרות שהושגו במפגש..." {...field} />
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
                <Textarea placeholder="הגדר מטרות להמשך..." {...field} />
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
                <Textarea placeholder="על מה נתמקד במפגש הבא..." {...field} />
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
                <Textarea placeholder="הערות נוספות..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 rtl:space-x-reverse">
          <Button variant="outline" type="button" onClick={onCancel}>
            ביטול
          </Button>
          <Button type="submit">
            שמירת סיכום
          </Button>
        </div>
      </form>
    </Form>
  );
}
