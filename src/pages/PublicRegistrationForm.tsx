
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  firstName: z.string().min(2, "שם פרטי חייב להכיל לפחות 2 תווים"),
  lastName: z.string().min(2, "שם משפחה חייב להכיל לפחות 2 תווים"),
  email: z.string().email("אנא הכנס כתובת אימייל תקינה"),
  phone: z.string()
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
  position: z.string().min(1, "אנא בחר עמדה")
});

type FormValues = z.infer<typeof formSchema>;

interface LinkData {
  id: string;
  coach_id: string;
  created_at: string;
  custom_message: string | null;
  expires_at: string | null;
  is_active: boolean;
  coach: {
    id: string;
    full_name: string;
  };
}

const positions = [
  { value: "goalkeeper", label: "שוער" },
  { value: "defender", label: "בלם" },
  { value: "fullback", label: "מגן" },
  { value: "midfielder", label: "קשר" },
  { value: "winger", label: "כנף" },
  { value: "striker", label: "חלוץ" }
];

const PublicRegistrationForm = () => {
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [linkData, setLinkData] = useState<LinkData | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      birthDate: '',
      city: '',
      club: '',
      yearGroup: '',
      injuries: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      notes: '',
      position: ''
    }
  });

  useEffect(() => {
    const verifyLink = async () => {
      if (!linkId) {
        setErrorMessage('קישור לא חוקי');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('registration_links')
          .select('*, coach:coaches(id, full_name)')
          .eq('id', linkId)
          .single();

        if (error || !data) {
          throw new Error('קישור לא נמצא או שהוא לא תקף');
        }

        // Check if link is active
        if (!data.is_active) {
          throw new Error('קישור זה אינו פעיל יותר');
        }

        // Check if link has expired
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          throw new Error('תוקף הקישור פג');
        }

        // The database might not have the max_registrations column yet if the SQL hasn't been run
        // So we'll check registrations count differently
        const { count, error: countError } = await supabase
          .from('players')
          .select('*', { count: 'exact', head: true })
          .eq('registration_link_id', linkId);

        if (countError) throw countError;
        
        setLinkData(data as LinkData);
        setLoading(false);
      } catch (error: any) {
        console.error('Error verifying registration link:', error);
        setErrorMessage(error.message || 'קישור לא תקף');
        setLoading(false);
      }
    };

    verifyLink();
  }, [linkId]);

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      if (!linkData || !linkData.coach) {
        throw new Error('מידע המאמן חסר');
      }

      const { data, error } = await supabase
        .from('players')
        .insert([
          {
            coach_id: linkData.coach.id,
            full_name: `${values.firstName} ${values.lastName}`,
            email: values.email,
            phone: values.phone,
            birthdate: values.birthDate,
            city: values.city,
            club: values.club,
            year_group: values.yearGroup,
            injuries: values.injuries,
            parent_name: values.parentName,
            parent_phone: values.parentPhone,
            parent_email: values.parentEmail,
            notes: values.notes,
            position: values.position,
            registration_link_id: linkId
          }
        ])
        .select();

      if (error) throw error;

      // Send notification to coach
      await supabase
        .from('notifications')
        .insert([{
          coach_id: linkData.coach.id,
          type: 'new_player',
          message: `נרשם שחקן חדש: ${values.firstName} ${values.lastName}`
        }]);

      setRegistrationComplete(true);
      setLoading(false);

    } catch (error: any) {
      console.error('Error submitting registration:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בהרשמה",
        description: error.message || "אירעה שגיאה בעת שמירת הנתונים. אנא נסה שוב."
      });
      setLoading(false);
    }
  };

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-red-600">שגיאה</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">{errorMessage}</p>
            <Button onClick={() => navigate('/')}>חזרה לדף הבית</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">טוען טופס הרשמה...</p>
        </div>
      </div>
    );
  }

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-center text-2xl">ההרשמה הושלמה בהצלחה!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6">תודה שנרשמת! פרטיך נשמרו במערכת והמאמן יצור איתך קשר בהקדם.</p>
            <Button onClick={() => navigate('/')}>חזרה לדף הבית</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 py-10">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center border-b pb-6">
            <CardTitle className="text-2xl">טופס הרשמת שחקן חדש</CardTitle>
            <CardDescription>
              {linkData?.coach?.full_name && (
                <p className="mt-2">הרשמה למאמן: {linkData.coach.full_name}</p>
              )}
              {linkData?.custom_message && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg text-blue-800 border border-blue-100">
                  {linkData.custom_message}
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-lg mb-4">פרטים אישיים</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>שם פרטי *</FormLabel>
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
                          <FormLabel>שם משפחה *</FormLabel>
                          <FormControl>
                            <Input placeholder="ישראלי" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>אימייל *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="example@gmail.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>טלפון *</FormLabel>
                          <FormControl>
                            <Input placeholder="050-0000000" {...field} />
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
                          <FormLabel>תאריך לידה *</FormLabel>
                          <FormControl>
                            <Input placeholder="DD/MM/YYYY" {...field} />
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
                          <FormLabel>עיר *</FormLabel>
                          <FormControl>
                            <Input placeholder="תל אביב" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-lg mb-4">פרטי כדורגל</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="club"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>מועדון *</FormLabel>
                          <FormControl>
                            <Input placeholder="שם המועדון" {...field} />
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
                          <FormLabel>שנתון *</FormLabel>
                          <FormControl>
                            <Input placeholder="לדוגמה: 2010" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>עמדה *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="בחר עמדה" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {positions.map((position) => (
                                <SelectItem key={position.value} value={position.value}>
                                  {position.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="injuries"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>פציעות (אם יש)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="פרט אם יש פציעות קודמות או נוכחיות" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-lg mb-4">פרטי הורה</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="parentName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>שם ההורה *</FormLabel>
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
                          <FormLabel>טלפון הורה *</FormLabel>
                          <FormControl>
                            <Input placeholder="050-0000000" {...field} />
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
                          <FormLabel>אימייל הורה *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="parent@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-lg mb-4">פרטים נוספים</h3>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>הערות נוספות</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="כל מידע נוסף שתרצו לשתף עם המאמן" 
                            {...field} 
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        שומר נתונים...
                      </>
                    ) : (
                      'שלח טופס'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicRegistrationForm;
