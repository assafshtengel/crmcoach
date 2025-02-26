
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

const NewPlayerForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showSuccessDialog, setShowSuccessDialog] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [profileImage, setProfileImage] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string>('');

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
      yearGroup: "",
      injuries: "",
      parentName: "",
      parentPhone: "",
      parentEmail: "",
      notes: "",
      position: ""
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

  // פונקציה חדשה לטיפול בהעלאת תמונה
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

  // פונקציה חדשה ליצירת שחקן
  const createPlayer = async (userId: string, values: PlayerFormValues, imageUrl: string = '') => {
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .insert([
        {
          coach_id: userId,
          full_name: `${values.firstName} ${values.lastName}`,
          email: values.playerEmail,
          phone: values.playerPhone,
          birth_date: values.birthDate,
          city: values.city,
          club: values.club,
          year_group: values.yearGroup,
          injuries: values.injuries,
          parent_name: values.parentName,
          parent_phone: values.parentPhone,
          parent_email: values.parentEmail,
          notes: values.notes,
          position: values.position,
          profile_image: imageUrl
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
    if (isSubmitting) return; // מניעת שליחות כפולות

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

      // קודם נטפל בתמונה אם יש
      let profileImageUrl = '';
      if (profileImage) {
        try {
          profileImageUrl = await uploadProfileImage(user.id, profileImage);
        } catch (error) {
          toast({
            variant: "destructive",
            title: "שגיאה בהעלאת התמונה",
            description: "לא הצלחנו להעלות את התמונה. השחקן יישמר ללא תמונת פרופיל.",
          });
        }
      }

      // אחר כך ניצור את השחקן
      await createPlayer(user.id, values, profileImageUrl);

      // נציג הודעת הצלחה
      toast({
        title: "השחקן נוצר בהצלחה!",
        description: "השחקן נוסף לרשימת השחקנים שלך.",
      });

      // נציג דיאלוג הצלחה ונווט לדף הבית
      setShowSuccessDialog(true);
      const timeoutId = setTimeout(() => {
        setShowSuccessDialog(false);
        navigate('/');
      }, 1000);

      // ניקוי הטיימר אם הקומפוננטה מתפרקת
      return () => clearTimeout(timeoutId);

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
