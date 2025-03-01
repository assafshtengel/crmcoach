import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { positions } from '@/components/new-player/PlayerFormSchema';

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

const PublicRegistrationForm = () => {
  const navigate = useNavigate();
  const { linkId } = useParams();
  const { toast } = useToast();
  const [linkData, setLinkData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      birthDate: "",
      city: "",
      club: "",
      yearGroup: "",
      injuries: "",
      parentName: "",
      parentPhone: "",
      parentEmail: "",
      notes: "",
      position: ""
    },
  });

  useEffect(() => {
    const fetchLinkData = async () => {
      if (!linkId) {
        toast({
          variant: "destructive",
          title: "שגיאה",
          description: "קישור לא תקין",
        });
        navigate('/');
        return;
      }

      try {
        console.log("Fetching link data for ID:", linkId);
        const { data: linkData, error: linkError } = await supabase
          .from('registration_links')
          .select(`
            *,
            coach:coaches(id, full_name, email)
          `)
          .eq('id', linkId)
          .eq('is_active', true)
          .single();

        if (linkError || !linkData) {
          console.error("Error fetching link:", linkError);
          throw new Error('הקישור לא נמצא או שאינו פעיל');
        }

        if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
          throw new Error('הקישור פג תוקף');
        }

        console.log("Link data loaded:", linkData);
        setLinkData(linkData);
      } catch (error) {
        console.error("Error in useEffect:", error);
        toast({
          variant: "destructive",
          title: "שגיאה",
          description: error.message || "אירעה שגיאה בטעינת הטופס",
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkData();
  }, [linkId, navigate, toast]);

  const onSubmit = async (values: FormValues) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      console.log("Form submitted with values:", values);

      if (!linkData || !linkData.coach || !linkData.coach.id) {
        console.error("Missing coach data:", linkData);
        throw new Error('מידע המאמן חסר');
      }

      const playerData = {
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
      };

      console.log("Inserting player data for coach ID:", linkData.coach.id);
      const { data, error } = await supabase
        .from('players')
        .insert([playerData])
        .select();

      console.log("Player insert response:", data, "Error:", error);

      if (error) {
        throw error;
      }

      const notificationMessage = `שחקן חדש נרשם: ${values.firstName} ${values.lastName}`;
      await supabase
        .from('notifications')
        .insert([
          {
            coach_id: linkData.coach.id,
            message: notificationMessage,
            type: 'new_player'
          }
        ]);

      toast({
        title: "נרשמת בהצלחה!",
        description: "פרטיך נשלחו למאמן בהצלחה.",
      });

      setShowSuccessDialog(true);

    } catch (error) {
      console.error('Error in form submission:', error);
      toast({
        variant: "destructive",
        title: "שגיאה ברישום",
        description: error.error_description || error.message || "אירעה שגיאה ברישום. אנא נסה שוב.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseWindow = () => {
    try {
      window.close();
    } catch (error) {
      console.log("Could not close window automatically");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="py-6 px-4 sm:px-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <h1 className="text-xl sm:text-2xl font-semibold">
            רישום לאימון עם {linkData?.coach?.full_name}
          </h1>
          {linkData?.custom_message && (
            <p className="mt-2 text-white/90">{linkData.custom_message}</p>
          )}
        </div>
        <div className="px-4 py-6 sm:p-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">פרטים אישיים</h2>
                  <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    <div>
                      <Label htmlFor="firstName">שם פרטי</Label>
                      <Input 
                        id="firstName" 
                        className="mt-1" 
                        {...form.register("firstName")} 
                      />
                      {form.formState.errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">שם משפחה</Label>
                      <Input 
                        id="lastName" 
                        className="mt-1" 
                        {...form.register("lastName")} 
                      />
                      {form.formState.errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.lastName.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">אימייל</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        className="mt-1" 
                        {...form.register("email")} 
                      />
                      {form.formState.errors.email && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">טלפון</Label>
                      <Input 
                        id="phone" 
                        className="mt-1" 
                        {...form.register("phone")} 
                      />
                      {form.formState.errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="birthDate">תאריך לידה</Label>
                      <Input 
                        id="birthDate" 
                        placeholder="DD/MM/YYYY" 
                        className="mt-1" 
                        {...form.register("birthDate")} 
                      />
                      {form.formState.errors.birthDate && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.birthDate.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="city">עיר מגורים</Label>
                      <Input 
                        id="city" 
                        className="mt-1" 
                        {...form.register("city")} 
                      />
                      {form.formState.errors.city && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.city.message}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-medium text-gray-900">פרטי כדורגל</h2>
                  <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    <div>
                      <Label htmlFor="position">עמדה במגרש</Label>
                      <Select 
                        onValueChange={(value) => form.setValue("position", value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="בחר עמדה" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((position) => (
                            <SelectItem key={position.value} value={position.value}>
                              {position.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.position && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.position.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="club">מועדון/קבוצה</Label>
                      <Input 
                        id="club" 
                        className="mt-1" 
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
                        {...form.register("injuries")} 
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-medium text-gray-900">פרטי הורה (לשחקנים מתחת לגיל 18)</h2>
                  <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    <div>
                      <Label htmlFor="parentName">שם מלא</Label>
                      <Input 
                        id="parentName" 
                        className="mt-1" 
                        {...form.register("parentName")} 
                      />
                      {form.formState.errors.parentName && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.parentName.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="parentPhone">טלפון</Label>
                      <Input 
                        id="parentPhone" 
                        className="mt-1" 
                        {...form.register("parentPhone")} 
                      />
                      {form.formState.errors.parentPhone && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.parentPhone.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="parentEmail">אימייל</Label>
                      <Input 
                        id="parentEmail" 
                        type="email" 
                        className="mt-1" 
                        {...form.register("parentEmail")} 
                      />
                      {form.formState.errors.parentEmail && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.parentEmail.message}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes">הערות נוספות (אופציונלי)</Label>
                  <Textarea 
                    id="notes" 
                    className="mt-1" 
                    {...form.register("notes")} 
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "רושם..." : "שלח פרטים"}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">הרישום הושלם בהצלחה!</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="mb-4">
              תודה שנרשמת לאימון. המאמן {linkData?.coach?.full_name} יצור איתך קשר בקרוב.
            </p>
            <Button
              onClick={handleCloseWindow}
              className="mt-2"
            >
              סגור חלון
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicRegistrationForm;
