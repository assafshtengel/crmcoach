
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const phoneRegex = /^[\d-]{10,12}$/;  // מאפשר מספרים ומקפים, באורך של 10-12 תווים

const dateRegex = /^(0?[1-9]|[12][0-9]|3[01])[-/](0?[1-9]|1[012])[-/]\d{4}$/;

const formSchema = z.object({
  firstName: z.string().min(2, "שם פרטי חייב להכיל לפחות 2 תווים"),
  lastName: z.string().min(2, "שם משפחה חייב להכיל לפחות 2 תווים"),
  playerEmail: z.string().email("אנא הכנס כתובת אימייל תקינה"),
  playerPhone: z.string()
    .refine((val) => {
      // מסיר את המקפים ובודק שיש בדיוק 10 ספרות
      const digitsOnly = val.replace(/-/g, '');
      return /^\d{10}$/.test(digitsOnly);
    }, "אנא הכנס מספר טלפון בן 10 ספרות"),
  birthDate: z.string().regex(dateRegex, "אנא הכנס תאריך בפורמט DD/MM/YYYY או DD-MM-YYYY"),
  city: z.string().min(2, "עיר חייבת להכיל לפחות 2 תווים"),
  club: z.string().min(2, "שם המועדון חייב להכיל לפחות 2 תווים"),
  yearGroup: z.string().min(4, "אנא הכנס שנתון תקין"),
  injuries: z.string().optional(),
  parentName: z.string().min(2, "שם ההורה חייב להכיל לפחות 2 תווים"),
  parentPhone: z.string()
    .refine((val) => {
      // מסיר את המקפים ובודק שיש בדיוק 10 ספרות
      const digitsOnly = val.replace(/-/g, '');
      return /^\d{10}$/.test(digitsOnly);
    }, "אנא הכנס מספר טלפון בן 10 ספרות"),
  parentEmail: z.string().email("אנא הכנס כתובת אימייל תקינה"),
  notes: z.string().optional(),
});

const NewPlayerForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      playerEmail: "",
      playerPhone: "",
      birthDate: "",
      city: "",
      club: "",
      yearGroup: "",
      injuries: "",
      parentName: "",
      parentPhone: "",
      parentEmail: "",
      notes: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "פרטי השחקן נשמרו בהצלחה",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">
            {JSON.stringify(values, null, 2)}
          </code>
        </pre>
      ),
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            title="חזור לדף הקודם"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
            title="חזור לדשבורד"
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">רישום שחקן חדש</h1>
          <p className="text-gray-600">אנא מלא את כל הפרטים הנדרשים</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שם פרטי</FormLabel>
                    <FormControl>
                      <Input placeholder="ישראל" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שם משפחה</FormLabel>
                    <FormControl>
                      <Input placeholder="ישראלי" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="playerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>אימייל שחקן</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="example@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="playerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>טלפון שחקן</FormLabel>
                    <FormControl>
                      <Input placeholder="(000) 000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>תאריך לידה</FormLabel>
                    <FormControl>
                      <Input placeholder="DD-MM-YYYY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>עיר מגורים</FormLabel>
                    <FormControl>
                      <Input placeholder="תל אביב" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="club"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>מועדון</FormLabel>
                    <FormControl>
                      <Input placeholder="הפועל/מכבי" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yearGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שנתון</FormLabel>
                    <FormControl>
                      <Input placeholder="2010" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="injuries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>פציעות עבר</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="פרט את פציעות העבר של השחקן"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="parentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שם ההורה</FormLabel>
                    <FormControl>
                      <Input placeholder="שם מלא" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>טלפון הורה</FormLabel>
                    <FormControl>
                      <Input placeholder="(000) 000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>אימייל הורה</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="example@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>הערות נוספות</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="הוסף הערות נוספות על השחקן"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">שמור פרטי שחקן</Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default NewPlayerForm;
