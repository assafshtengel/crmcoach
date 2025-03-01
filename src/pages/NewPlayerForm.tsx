
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { formSchema, PlayerFormValues } from '@/components/new-player/PlayerFormSchema';
import { PlayerPersonalInfo } from '@/components/new-player/PlayerPersonalInfo';
import { PlayerClubInfo } from '@/components/new-player/PlayerClubInfo';
import { PlayerParentInfo } from '@/components/new-player/PlayerParentInfo';
import { PlayerAdditionalInfo } from '@/components/new-player/PlayerAdditionalInfo';
import { ImageUpload } from '@/components/new-player/ImageUpload';
import { format } from 'date-fns';

const NewPlayerForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showSuccessDialog, setShowSuccessDialog] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [profileImage, setProfileImage] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string>('');

  // Format current date and time in a user-friendly format
  const currentDateTime = format(new Date(), 'dd/MM/yyyy HH:mm');

  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      playerEmail: "",
      playerPhone: "",
      birthDate: "",
      city: "",
      club: "",
      yearGroup: "נערים ב'",
      injuries: "",
      parentName: "",
      parentPhone: "",
      parentEmail: "",
      notes: "",
      sportField: "",
      otherSportField: "",
      registrationTimestamp: currentDateTime,
    },
  });

  const handleImageUpload = (file: File) => {
    setProfileImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleImageRemove = () => {
    setProfileImage(null);
    setPreviewUrl('');
  };

  const uploadProfileImage = async (userId: string, file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('player-avatars')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('player-avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error in uploadProfileImage:', error);
      throw new Error('Failed to upload profile image');
    }
  };

  const createPlayer = async (userId: string, values: PlayerFormValues, imageUrl: string = '') => {
    console.log('Creating player with values:', values); // Debug log
    
    // Determine the final sport field value
    const finalSportField = values.sportField === 'other' && values.otherSportField
      ? values.otherSportField
      : values.sportField === 'other'
        ? 'אחר'
        : values.sportField;
    
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .insert([
        {
          coach_id: userId,
          full_name: `${values.firstName} ${values.lastName}`,
          email: values.playerEmail,
          phone: values.playerPhone,
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
          profile_image: imageUrl,
          registration_timestamp: values.registrationTimestamp
        }
      ])
      .select()
      .single();

    if (playerError) {
      console.error('Error creating player:', playerError);
      throw playerError;
    }

    return playerData;
  };

  async function onSubmit(values: PlayerFormValues) {
    console.log('Form submitted with values:', values); // Debug log
    
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

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

      let profileImageUrl = '';
      if (profileImage) {
        try {
          profileImageUrl = await uploadProfileImage(user.id, profileImage);
        } catch (error) {
          console.error('Error uploading image:', error); // Debug log
          toast({
            variant: "destructive",
            title: "שגיאה בהעלאת התמונה",
            description: "לא הצלחנו להעלות את התמונה. השחקן יישמר ללא תמונת פרופיל.",
          });
        }
      }

      const playerData = await createPlayer(user.id, values, profileImageUrl);
      console.log('Player created successfully:', playerData); // Debug log

      toast({
        title: "השחקן נוצר בהצלחה!",
        description: "השחקן נוסף לרשימת השחקנים שלך.",
      });

      setShowSuccessDialog(true);
      setTimeout(() => {
        setShowSuccessDialog(false);
        navigate('/');
      }, 1500);

    } catch (error: any) {
      console.error('Error in form submission:', error);
      toast({
        variant: "destructive",
        title: "שגיאה ביצירת השחקן",
        description: error.message || "אירעה שגיאה ביצירת השחקן. אנא נסה שוב.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-2xl mx-auto p-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            title="חזור לדף הקודם"
            className="hover:scale-105 transition-transform"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
            title="חזור לדשבורד"
            className="hover:scale-105 transition-transform"
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-6 animate-in fade-in-50 duration-500">
          <h1 className="text-2xl font-bold text-gray-900">רישום שחקן חדש</h1>
          <p className="text-gray-600">אנא מלא את כל הפרטים הנדרשים</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm animate-in fade-in-50 duration-500">
              <h2 className="text-lg font-semibold mb-4">תמונת פרופיל</h2>
              <ImageUpload
                onImageUpload={handleImageUpload}
                onImageRemove={handleImageRemove}
                previewUrl={previewUrl}
              />
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm animate-in fade-in-50 duration-500">
              <h2 className="text-lg font-semibold mb-4">פרטים אישיים</h2>
              <PlayerPersonalInfo form={form} />
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm animate-in fade-in-50 duration-500">
              <PlayerClubInfo form={form} />
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm animate-in fade-in-50 duration-500">
              <PlayerAdditionalInfo form={form} />
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm animate-in fade-in-50 duration-500">
              <PlayerParentInfo form={form} />
            </div>

            <Button 
              type="submit" 
              className="w-full font-medium text-base py-3"
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
