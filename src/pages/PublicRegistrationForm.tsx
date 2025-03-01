
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { formSchema, FormValues } from "@/components/public-registration/types";
import { PlayerForm } from "@/components/public-registration/PlayerForm";
import { ClubInfo } from "@/components/public-registration/ClubInfo";
import { ParentInfo } from "@/components/public-registration/ParentInfo";
import { NotesSection } from "@/components/public-registration/NotesSection";
import { SuccessDialog } from "@/components/public-registration/SuccessDialog";
import { FormHeader } from "@/components/public-registration/FormHeader";
import { LoadingSpinner } from "@/components/public-registration/LoadingSpinner";

const PublicRegistrationForm = () => {
  const navigate = useNavigate();
  const { linkId } = useParams();
  const { toast } = useToast();
  const [linkData, setLinkData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showOtherSportField, setShowOtherSportField] = useState(false);
  
  const currentDateTime = format(new Date(), 'dd/MM/yyyy HH:mm');

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
      sportField: "",
      otherSportField: "",
      registrationTimestamp: currentDateTime
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
      } catch (error: any) {
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

      const finalSportField = values.sportField === 'other' && values.otherSportField
        ? values.otherSportField
        : values.sportField === 'other'
          ? 'אחר'
          : values.sportField;

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
        sport_field: finalSportField,
        registration_link_id: linkId,
        registration_timestamp: values.registrationTimestamp
      };

      console.log("Inserting player data for coach ID:", linkData.coach.id);
      
      // מוסיף ניסיון נוסף בשיטת UPSERT כדי להתמודד עם מצבים של כישלון שמירה
      const { data, error } = await supabase
        .from('players')
        .upsert([playerData], { 
          onConflict: 'email,coach_id',
          ignoreDuplicates: false 
        })
        .select();

      console.log("Player insert response:", data, "Error:", error);

      if (error) {
        // לוג מפורט יותר של השגיאה
        console.error("Database error details:", JSON.stringify(error, null, 2));
        throw error;
      }

      // שולח התראה למאמן רק אם השמירה הצליחה
      if (data && data.length > 0) {
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
      } else {
        throw new Error("הנתונים נשלחו אך לא התקבל אישור מהשרת");
      }
    } catch (error: any) {
      console.error('Error in form submission:', error);
      
      // טיפול בשגיאות ספציפיות
      let errorMessage = "אירעה שגיאה ברישום. אנא נסה שוב.";
      
      if (error.code === '23505') {
        errorMessage = "כתובת האימייל כבר קיימת במערכת";
      } else if (error.code === '23503') {
        errorMessage = "שגיאה בקישור למאמן, אנא צור קשר עם המאמן";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "שגיאה ברישום",
        description: errorMessage,
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

  const handleSportFieldChange = (value: string) => {
    form.setValue('sportField', value);
    setShowOtherSportField(value === 'other');
    if (value !== 'other') {
      form.setValue('otherSportField', '');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <FormHeader 
          coachName={linkData?.coach?.full_name} 
          customMessage={linkData?.custom_message} 
        />

        <div className="px-4 py-6 sm:p-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-6">
                <PlayerForm 
                  form={form} 
                  showOtherSportField={showOtherSportField} 
                  handleSportFieldChange={handleSportFieldChange} 
                />
                
                <ClubInfo form={form} />
                
                <ParentInfo form={form} />
                
                <NotesSection form={form} />
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

      <SuccessDialog 
        showSuccessDialog={showSuccessDialog} 
        setShowSuccessDialog={setShowSuccessDialog} 
        coachName={linkData?.coach?.full_name} 
        handleCloseWindow={handleCloseWindow} 
      />
    </div>
  );
};

export default PublicRegistrationForm;
