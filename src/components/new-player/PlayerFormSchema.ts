
import * as z from "zod";

export const formSchema = z.object({
  firstName: z.string().min(2, "שם פרטי חייב להכיל לפחות 2 תווים"),
  lastName: z.string().min(2, "שם משפחה חייב להכיל לפחות 2 תווים"),
  playerEmail: z.string().email("אנא הכנס כתובת אימייל תקינה"),
  playerPhone: z.string()
    .refine((val) => {
      const digitsOnly = val.replace(/-/g, '');
      return /^\d{10}$/.test(digitsOnly);
    }, "אנא הכנס מספר טלפון בן 10 ספרות"),
  birthDate: z.string().regex(/^(0?[1-9]|[12][0-9]|3[01])[-/](0?[1-9]|1[012])[-/]\d{4}$/, "אנא הכנס תאריך בפורמט DD/MM/YYYY או DD-MM-YYYY"),
  city: z.string().min(2, "עיר חייבת להכיל לפחות 2 תווים"),
  club: z.string().min(2, "שם המועדון חייב להכיל לפחות 2 תווים"),
  yearGroup: z.string().min(4, "אנא הכנס שנתון תקין"),
  injuries: z.string().optional(),
  parentName: z.string().min(2, "שם ההורה חייב להכיל לפחות 2 תווים"),
  parentPhone: z.string()
    .refine((val) => {
      const digitsOnly = val.replace(/-/g, '');
      return /^\d{10}$/.test(digitsOnly);
    }, "אנא הכנס מספר טלפון בן 10 ספרות"),
  parentEmail: z.string().email("אנא הכנס כתובת אימייל תקינה"),
  notes: z.string().optional(),
  sportField: z.string().min(1, "אנא בחר ענף ספורט"),
  otherSportField: z.string().optional(),
}).refine(
  (data) => {
    if (data.sportField === 'other') {
      return data.otherSportField && data.otherSportField.length >= 2;
    }
    return true;
  },
  {
    message: "אנא הזן ענף ספורט",
    path: ["otherSportField"],
  }
);

export type PlayerFormValues = z.infer<typeof formSchema>;

export const sportFields = [
  { value: "football", label: "כדורגל" },
  { value: "basketball", label: "כדורסל" },
  { value: "tennis", label: "טניס" },
  { value: "swimming", label: "שחייה" },
  { value: "athletics", label: "אתלטיקה" },
  { value: "other", label: "אחר" }
];
