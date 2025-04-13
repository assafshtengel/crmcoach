import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from '@/lib/supabase';
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
  const [createdPlayerId, setCreatedPlayerId] = React.useState<string>('');
  const [generatedPassword, setGeneratedPassword] = React.useState<string>('');

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
      yearGroup: "",
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

  const generatePassword = (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    toast({
      title: "הסיסמה הועתקה",
      description: "הסיסמה הועתקה ללוח",
    });
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

  const createAuthUser = async (email: string, password: string, firstName: string, lastName: string): Promise<string> => {
    try {
      const response = await fetch('https://hntgzgrlyfhojcaofbjv.supabase.co/functions/v1/create-player-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token)}`,
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (errorData.code === 'user-already-exists') {
          throw new Error('משתמש עם כתובת דוא"ל זו כבר קיים במערכת');
        }
        
        throw new Error(errorData.error || 'שגיאה ביצירת משתמש');
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Error creating auth user:', error);
      throw error;
    }
  };

  const createPlayer = async (userId: string, values: PlayerFormValues, imageUrl: string = '') => {
    console.log('Creating player with values:', values);

    const finalSportField = values.sportField === 'other' && values.otherSportField
      ? values.otherSportField
      : values.sportField === 'other'
        ? 'אחר'
        : values.sportField;
    
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .insert([
        {
          id: userId,
          coach_id: (await supabase.auth.getUser()).data.user?.id,
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
          password: generatedPassword,
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
    console.log('Form submitted with values:', values);

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

      const password = generatePassword(10);
      setGeneratedPassword(password);
      
      try {
        const userId = await createAuthUser(
          values.playerEmail,
          password,
          values.firstName,
          values.lastName
        );
        
        let profileImageUrl = '';
        if (profileImage) {
          try {
            profileImageUrl = await uploadProfileImage(userId, profileImage);
          } catch (error) {
            console.error('Error uploading image:', error);
            toast({
              variant: "destructive",
              title: "שגיאה בהעלאת התמונה",
              description: "לא הצלחנו להעלות את התמונה. השחקן יישמר ללא תמונת פרופיל.",
            });
          }
        }
        
        const playerData = await createPlayer(userId, values, profileImageUrl);
        console.log('Player created successfully:', playerData);

        setCreatedPlayerId(playerData.id);

        toast({
          title: "השחקן נוצר בהצלחה!",
          description: "השחקן נוסף לרשימת השחקנים שלך.",
        });

        setShowSuccessDialog(true);
      } catch (error: any) {
        console.error('Error in user creation:', error);
        toast({
          variant: "destructive",
          title: "שגיאה ביצירת משתמש",
          description: error.message || "שגיאה ביצירת חשבון המשתמש. אנא נסה שוב.",
        });
        throw error;
      }

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
          <div className="my-4">
            <p className="text-sm text-gray-600">
              השחקן נוסף בהצלחה לרשימת השחקנים שלך.
            </p>
            <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-sm font-semibold">סיסמה זמנית לשחקן:</p>
              <div className="flex items-center justify-center mt-2">
                <code className="bg-gray-100 px-3 py-1 rounded text-primary">{generatedPassword}</code>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleCopyPassword}
                  className="ml-2 h-8 w-8"
                  title="העתק סיסמה"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                שמור את הסיסמה הזו. השחקן יוכל להתחבר עם הסיסמה הזו והדוא"ל שסופק.
              </p>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={() => {
                setShowSuccessDialog(false);
                navigate('/');
              }}
              className="flex-1"
            >
              חזרה לדף הבית
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setShowSuccessDialog(false);
                navigate('/players-list');
              }}
              className="flex-1"
            >
              לרשימת השחקנים
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewPlayerForm;
