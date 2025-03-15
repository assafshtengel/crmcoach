
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabase } from '@/lib/supabase';
import { formSchema, PlayerFormValues, sportFields } from '@/components/new-player/PlayerFormSchema';
import { PlayerPersonalInfo } from '@/components/new-player/PlayerPersonalInfo';
import { PlayerClubInfo } from '@/components/new-player/PlayerClubInfo';
import { PlayerParentInfo } from '@/components/new-player/PlayerParentInfo';
import { PlayerAdditionalInfo } from '@/components/new-player/PlayerAdditionalInfo';
import { ImageUpload } from '@/components/new-player/ImageUpload';

const EditPlayerForm = () => {
  const navigate = useNavigate();
  const { playerId } = useParams<{ playerId: string }>();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [initialSportField, setInitialSportField] = useState('');
  const [initialOtherSportField, setInitialOtherSportField] = useState('');
  const [playerData, setPlayerData] = useState<any>(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!playerId) {
        toast({
          variant: "destructive",
          title: "שגיאה",
          description: "לא נמצאו פרטי שחקן לעריכה",
        });
        navigate('/players-list');
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerId)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          toast({
            variant: "destructive",
            title: "שגיאה",
            description: "לא נמצאו פרטי שחקן לעריכה",
          });
          navigate('/players-list');
          return;
        }

        setPlayerData(data);
        
        if (data.profile_image) {
          setPreviewUrl(data.profile_image);
        }
        
        // Handle sport field initialization
        const sportFieldValue = data?.sport_field || '';
        const isKnownSport = sportFields.some(sport => sport.value === sportFieldValue || sport.label === sportFieldValue);
        
        if (isKnownSport) {
          // If it's a known sport, set it directly
          const matchingSport = sportFields.find(sport => 
            sport.value === sportFieldValue || sport.label === sportFieldValue
          );
          setInitialSportField(matchingSport?.value || 'football');
        } else if (sportFieldValue) {
          // If it's not a known sport but has a value, set it as "other"
          setInitialSportField('other');
          setInitialOtherSportField(sportFieldValue);
        } else {
          // Default to empty
          setInitialSportField('');
        }

      } catch (error: any) {
        console.error('Error fetching player:', error);
        toast({
          variant: "destructive",
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת פרטי השחקן",
        });
        navigate('/players-list');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerId, navigate, toast]);

  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      playerEmail: '',
      playerPhone: '',
      birthDate: '',
      city: '',
      club: '',
      yearGroup: '',
      injuries: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      notes: '',
      sportField: '',
      otherSportField: ''
    },
  });
  
  // Update form values when player data is loaded
  useEffect(() => {
    if (playerData) {
      // Split full name into first and last name
      const nameParts = playerData.full_name?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      form.reset({
        firstName,
        lastName,
        playerEmail: playerData.email || '',
        playerPhone: playerData.phone || '',
        birthDate: playerData.birthdate || '',
        city: playerData.city || '',
        club: playerData.club || '',
        yearGroup: playerData.year_group || '',
        injuries: playerData.injuries || '',
        parentName: playerData.parent_name || '',
        parentPhone: playerData.parent_phone || '',
        parentEmail: playerData.parent_email || '',
        notes: playerData.notes || '',
        sportField: initialSportField,
        otherSportField: initialOtherSportField
      });
    }
  }, [playerData, form, initialSportField, initialOtherSportField]);

  const handleImageUpload = (file: File) => {
    setProfileImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleImageRemove = () => {
    setProfileImage(null);
    setPreviewUrl('');
  };

  const uploadProfileImage = async (playerId: string, file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${playerId}/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('player-avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('player-avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload profile image');
    }
  };

  const updatePlayer = async (values: PlayerFormValues, imageUrl?: string) => {
    if (!playerId) return;

    // Determine the final sport field value
    const finalSportField = values.sportField === 'other' && values.otherSportField
      ? values.otherSportField
      : values.sportField === 'other'
        ? 'אחר'
        : values.sportField;

    const updateData = {
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
      // Remove the position field that doesn't exist in the database
      ...(imageUrl && { profile_image: imageUrl })
    };

    const { error } = await supabase
      .from('players')
      .update(updateData)
      .eq('id', playerId);

    if (error) throw error;
  };

  async function onSubmit(values: PlayerFormValues) {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      let imageUrl: string | undefined;
      if (profileImage) {
        try {
          imageUrl = await uploadProfileImage(playerId!, profileImage);
        } catch (error) {
          console.error('Error uploading image:', error);
          toast({
            variant: "destructive",
            title: "שגיאה בהעלאת התמונה",
            description: "לא הצלחנו להעלות את התמונה החדשה. השחקן יישמר עם התמונה הקיימת.",
          });
        }
      }

      await updatePlayer(values, imageUrl);

      toast({
        title: "השחקן עודכן בהצלחה!",
        description: "פרטי השחקן עודכנו בהצלחה.",
      });

      navigate(`/player-profile/${playerId}`);

    } catch (error: any) {
      console.error('Error updating player:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בעדכון השחקן",
        description: error.message || "אירעה שגיאה בעדכון פרטי השחקן. אנא נסה שוב.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-gray-600">טוען פרטי שחקן...</div>
      </div>
    );
  }

  if (!playerData) {
    return null;
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
        </div>

        <div className="mb-6 animate-in fade-in-50 duration-500">
          <h1 className="text-2xl font-bold text-gray-900">עריכת פרטי שחקן</h1>
          <p className="text-gray-600">עדכן את פרטי השחקן כאן</p>
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
              {isSubmitting ? 'שומר שינויים...' : 'שמור שינויים'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditPlayerForm;
