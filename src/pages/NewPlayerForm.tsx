
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { formSchema, PlayerFormValues, sportFields } from '@/components/new-player/PlayerFormSchema';
import { PlayerPersonalInfo } from '@/components/new-player/PlayerPersonalInfo';
import { PlayerClubInfo } from '@/components/new-player/PlayerClubInfo';
import { PlayerParentInfo } from '@/components/new-player/PlayerParentInfo';
import { PlayerAdditionalInfo } from '@/components/new-player/PlayerAdditionalInfo';
import { ImageUpload } from '@/components/new-player/ImageUpload';
import { createPlayer } from '@/services/playerService';
import { supabase } from '@/lib/supabase';

const NewPlayerForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

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
      otherSportField: '',
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

  async function onSubmit(values: PlayerFormValues) {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // First create the player
      const playerResult = await createPlayer(values);
      
      if (!playerResult || playerResult.length === 0) {
        throw new Error('Failed to create player');
      }

      const newPlayerId = playerResult[0].id;

      // Upload profile image if one was selected
      if (profileImage) {
        try {
          const imageUrl = await uploadProfileImage(newPlayerId, profileImage);
          
          // Update the player with the profile image URL
          const { error: updateError } = await supabase
            .from('players')
            .update({ profile_image: imageUrl })
            .eq('id', newPlayerId);

          if (updateError) {
            console.error('Error updating player with image URL:', updateError);
          }
        } catch (imageError) {
          console.error('Error processing image:', imageError);
          // Not failing the whole operation if just the image upload fails
        }
      }

      toast({
        title: "השחקן נוצר בהצלחה!",
        description: "פרטי השחקן נשמרו במערכת.",
      });

      navigate('/players-list');

    } catch (error: any) {
      console.error('Error creating player:', error);
      toast({
        variant: "destructive",
        title: "שגיאה ביצירת שחקן",
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
        </div>

        <div className="mb-6 animate-in fade-in-50 duration-500">
          <h1 className="text-2xl font-bold text-gray-900">יצירת שחקן חדש</h1>
          <p className="text-gray-600">מלא את פרטי השחקן החדש כאן</p>
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
              {isSubmitting ? 'יוצר שחקן...' : 'צור שחקן'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default NewPlayerForm;
