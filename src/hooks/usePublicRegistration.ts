import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { formSchema, FormValues } from "@/components/public-registration/types";

export const usePublicRegistration = () => {
  const navigate = useNavigate();
  const { linkId } = useParams();
  const { toast } = useToast();
  const [linkData, setLinkData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState({ title: "", message: "", isError: false });
  const [showOtherSportField, setShowOtherSportField] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  
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
        showFeedback("שגיאה", "קישור לא תקין", true);
        navigate('/');
        return;
      }

      try {
        console.log("Fetching registration link data for ID:", linkId);
        
        // Since we're using this function for public registration without coach authentication,
        // we want to fetch data using the anon key without requiring coach auth
        const { data: link, error: linkError } = await supabase
          .from('registration_links')
          .select(`
            id, 
            is_active, 
            coach_id, 
            custom_message,
            coach:coach_id (full_name)
          `)
          .eq('id', linkId)
          .maybeSingle();

        if (linkError) {
          console.error("Error fetching link data:", linkError);
          throw linkError;
        }
        
        if (!link) {
          console.error("Link not found for ID:", linkId);
          throw new Error('הקישור לא נמצא');
        }

        if (!link.is_active) {
          console.error("Link is not active:", linkId);
          throw new Error('קישור זה אינו פעיל יותר');
        }

        // Make sure we have at least the coach_id for later form submission
        if (!link.coach_id) {
          console.error("Link has no coach_id:", linkId);
          throw new Error('הקישור לא תקין - נא לפנות למנהל המערכת');
        }

        console.log("Link data fetched successfully:", link);
        setLinkData(link);
      } catch (error: any) {
        console.error("Error in fetchLinkData:", error);
        showFeedback("שגיאה", error.message || "אירעה שגיאה בטעינת הטופס", true);
        // Stay on the page and don't navigate away
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkData();
  }, [linkId, navigate]);

  const generatePassword = (length: number = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const showFeedback = (title: string, message: string, isError: boolean = false) => {
    setFeedbackMessage({
      title,
      message,
      isError
    });
    setShowFeedbackDialog(true);
    
    toast({
      variant: isError ? "destructive" : "default",
      title: title,
      description: message,
    });
  };

  const handleSportFieldChange = (value: string) => {
    console.log("Sport field changed to:", value);
    form.setValue('sportField', value);
    setShowOtherSportField(value === 'other');
    
    if (value !== 'other') {
      form.setValue('otherSportField', '');
    }
  };

  const handleCloseWindow = () => {
    try {
      window.close();
    } catch (error) {
      console.log("Could not close window automatically");
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (isSubmitting) return;

    console.log("Submitting form with values:", values);
    setIsSubmitting(true);

    try {
      if (!linkData) {
        throw new Error('מידע הקישור חסר');
      }

      if (!values.sportField) {
        throw new Error('יש לבחור ענף ספורט');
      }

      const finalSportField = values.sportField === 'other' && values.otherSportField
        ? values.otherSportField
        : values.sportField === 'other'
          ? 'אחר'
          : values.sportField;

      const password = generatePassword(10);
      setGeneratedPassword(password);

      const playerData = {
        coach_id: linkData.coach_id,
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
        registration_timestamp: values.registrationTimestamp,
        password: password
      };

      console.log("Inserting player data for coach ID:", linkData.coach_id);
      console.log("Registration link ID:", linkId);
      
      const { data, error } = await supabase
        .from('players')
        .insert([playerData])
        .select();

      if (error) {
        console.error("Database error details:", JSON.stringify(error, null, 2));
        
        if (error.code === '23505') {
          throw new Error("כתובת האימייל כבר קיימת במערכת");
        } else {
          throw new Error(error.message || "שגיאה בשמירת הנתונים");
        }
      }

      if (!data || data.length === 0) {
        throw new Error("שגיאה בשמירת הנתונים - לא התקבל אישור מהשרת");
      }

      const notificationMessage = `שחקן חדש נרשם: ${values.firstName} ${values.lastName}`;
      
      // Try to create notification but don't fail if it doesn't work
      try {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([
            {
              coach_id: linkData.coach_id,
              message: notificationMessage,
              type: 'new_player'
            }
          ]);
          
        if (notificationError) {
          console.error("Error creating notification:", notificationError);
        }
      } catch (notifyError) {
        console.error("Error trying to create notification:", notifyError);
        // Continue with success flow even if notification fails
      }

      showFeedback(
        "נרשמת בהצלחה!",
        "תודה על הרישום! פרטיך נשלחו למאמן בהצלחה.",
        false
      );

      setTimeout(() => {
        setShowSuccessDialog(true);
      }, 2000);
      
    } catch (error: any) {
      console.error('Error in form submission:', error);
      showFeedback(
        "שגיאה ברישום",
        error.message || "אירעה שגיאה ברישום. אנא נסה שוב.",
        true
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    linkData,
    isLoading,
    isSubmitting,
    showSuccessDialog,
    setShowSuccessDialog,
    showFeedbackDialog,
    setShowFeedbackDialog,
    feedbackMessage,
    showOtherSportField,
    handleSportFieldChange,
    handleCloseWindow,
    onSubmit,
    generatedPassword
  };
};
