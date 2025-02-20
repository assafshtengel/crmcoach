
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';

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
  const [showSuccessDialog, setShowSuccessDialog] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      // קבלת ה-ID של המאמן המחובר
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast({
          variant: "destructive",
          title: "שגיאה",
          description: "לא נמצא משתמש מחובר. אנא התחבר מחדש.",
        });
        navigate('/auth');
        return;
      }

      // בדיקה אם השחקן כבר קיים במערכת
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('id')
        .eq('email', values.playerEmail)
        .single();

      if (existingPlayer) {
        toast({
          variant: "destructive",
          title: "שגיאה",
          description: "שחקן עם כתובת האימייל הזו כבר קיים במערכת.",
        });
        return;
      }

      // יצירת סיסמה זמנית
      const temporaryPassword = Math.random().toString(36).slice(-8);

      // יצירת חשבון משתמש חדש לשחקן
      const { data: newUser, error: signUpError } = await supabase.auth.signUp({
        email: values.playerEmail,
        password: temporaryPassword,
        options: {
          data: {
            full_name: `${values.firstName} ${values.lastName}`,
            role: 'player'
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          toast({
            variant: "destructive",
            title: "שגיאה",
            description: "כתובת האימייל כבר רשומה במערכת.",
          });
          return;
        }
        throw signUpError;
      }

      if (!newUser.user) {
        throw new Error("Failed to create user account");
      }

      // בדיקה אם המאמן קיים
      const { data: coach, error: coachError } = await supabase
        .from('coaches')
        .select('id')
        .eq('id', user.id)
        .single();

      if (coachError && !coachError.message.includes('No rows found')) {
        throw coachError;
      }

      // אם המאמן לא קיים, ניצור אותו
      if (!coach) {
        const { error: createCoachError } = await supabase
          .from('coaches')
          .insert([{
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown'
          }]);

        if (createCoachError) {
          console.error('Error creating coach:', createCoachError);
          if (createCoachError.message.includes('violates row-level security')) {
            // נמשיך למרות השגיאה כי ייתכן שהמאמן כבר קיים
            console.log('Coach might already exist, continuing...');
          } else {
            throw createCoachError;
          }
        }
      }

      // שמירת השחקן בטבלת players
      const { error: insertError } = await supabase
        .from('players')
        .insert([{
          id: newUser.user.id,
          coach_id: user.id,
          full_name: `${values.firstName} ${values.lastName}`,
          email: values.playerEmail,
          phone: values.playerPhone,
          notes: `
            תאריך לידה: ${values.birthDate}
            עיר: ${values.city}
            מועדון: ${values.club}
            שנתון: ${values.yearGroup}
            פציעות: ${values.injuries || 'אין'}
            פרטי הורה:
            שם: ${values.parentName}
            טלפון: ${values.parentPhone}
            אימייל: ${values.parentEmail}
            הערות נוספות: ${values.notes || 'אין'}
          `
        }]);

      if (insertError) {
        throw insertError;
      }

      // שליחת אימייל עם פרטי ההתחברות
      const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          email: values.playerEmail,
          password: temporaryPassword,
          playerName: `${values.firstName} ${values.lastName}`,
          coachName: user.user_metadata?.full_name || 'המאמן שלך'
        }
      });

      if (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // נמשיך למרות השגיאה בשליחת המייל
      }

      // הצגת הודעת הצלחה והעברה לדף הדשבורד
      toast({
        title: "השחקן נוצר בהצלחה!",
        description: "נשלח מייל לשחקן עם פרטי ההתחברות שלו.",
      });

      setShowSuccessDialog(true);
      setTimeout(() => {
        setShowSuccessDialog(false);
        navigate('/coach-dashboard');
      }, 1500);

    } catch (error: any) {
      console.error('Error creating player:', error);
      toast({
        variant: "destructive",
        title: "שגיאה ביצירת השחקן",
        description: typeof error === 'string' ? error : error.message || "אירעה שגיאה ביצירת חשבון השחקן. אנא נסה שוב.",
      });
    } finally {
      setIsSubmitting(false);
    }
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

            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'שומר...' : 'שמור פרטי שחקן'}
            </Button>
          </form>
        </Form>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle>פרטי השחקן נשמרו בהצלחה!</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewPlayerForm;
