
import * as z from "zod";

export const formSchema = z.object({
  summary_text: z.string().min(1, "נדרש למלא סיכום"),
  achieved_goals: z.union([
    z.string(),
    z.array(z.string())
  ]).transform(val => typeof val === 'string' ? val : val.join('\n')),
  future_goals: z.union([
    z.string(),
    z.array(z.string())
  ]).transform(val => typeof val === 'string' ? val : val.join('\n')),
  additional_notes: z.string().optional(),
  progress_rating: z.number().min(1).max(5),
  next_session_focus: z.string(),
  player_id: z.string()
});

export type FormValues = z.infer<typeof formSchema>;
