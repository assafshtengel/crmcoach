import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, FileDown, Printer } from 'lucide-react';
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
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const EditPlayerForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPdfExporting, setIsPdfExporting] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [initialSportField, setInitialSportField] = useState('');
  const [initialOtherSportField, setInitialOtherSportField] = useState('');
  const [loading, setLoading] = useState(true);
  const [playerData, setPlayerData] = useState<any>(null);

  const locationState = location.state || {};
  const playerId = params.playerId || locationState.playerId;
  const initialPlayerData = locationState.playerData;

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (initialPlayerData) {
        setPlayerData(initialPlayerData);
        setLoading(false);
        return;
      }

      if (playerId) {
        try {
          const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq('id', playerId)
            .single();

          if (error) {
            throw error;
          }

          if (data) {
            setPlayerData(data);
          } else {
            throw new Error('לא נמצאו נתוני שחקן');
          }
        } catch (error: any) {
          console.error('Error fetching player data:', error);
          toast({
            variant: "destructive",
            title: "שגיאה",
            description: "לא הצלחנו לשלוף את נתוני השחקן",
          });
          navigate('/players-list');
        } finally {
          setLoading(false);
        }
      } else {
        toast({
          variant: "destructive",
          title: "שגיאה",
          description: "לא נמצאו פרטי שחקן לעריכה",
        });
        navigate('/players-list');
      }
    };

    fetchPlayerData();
  }, [initialPlayerData, playerId, navigate, toast]);

  useEffect(() => {
    if (!playerData) {
      return;
    }
    
    if (playerData.profile_image) {
      setPreviewUrl(playerData.profile_image);
    }
    
    const sportFieldValue = playerData?.sport_field || '';
    const isKnownSport = sportFields.some(sport => sport.value === sportFieldValue || sport.label === sportFieldValue);
    
    if (isKnownSport) {
      const matchingSport = sportFields.find(sport => 
        sport.value === sportFieldValue || sport.label === sportFieldValue
      );
      setInitialSportField(matchingSport?.value || 'football');
    } else if (sportFieldValue) {
      setInitialSportField('other');
      setInitialOtherSportField(sportFieldValue);
    } else {
      setInitialSportField('');
    }
  }, [playerData]);

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
  
  useEffect(() => {
    if (playerData) {
      const fullNameParts = playerData.full_name ? playerData.full_name.split(' ') : ['', ''];
      
      form.reset({
        firstName: fullNameParts[0] || '',
        lastName: fullNameParts.slice(1).join(' ') || '',
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
  }, [playerData, initialSportField, initialOtherSportField, form]);
  
  useEffect(() => {
    if (initialSportField) {
      form.setValue('sportField', initialSportField);
    }
    if (initialOtherSportField) {
      form.setValue('otherSportField', initialOtherSportField);
    }
  }, [initialSportField, initialOtherSportField, form]);

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
    if (!playerData?.id) return;

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
      ...(imageUrl && { profile_image: imageUrl })
    };

    const { error } = await supabase
      .from('players')
      .update(updateData)
      .eq('id', playerData.id);

    if (error) throw error;
  };

  const handleExportToPdf = async () => {
    try {
      setIsPdfExporting(true);
      const element = document.getElementById('player-form-content');
      if (!element) {
        throw new Error("Element not found");
      }

      const currentDate = new Date();
      const dateStr = currentDate.toISOString().split('T')[0];
      const playerName = `${playerData?.full_name || 'player'}`.replace(/\s+/g, '_');
      
      toast({
        title: "מכין PDF",
        description: "מייצר קובץ PDF, אנא המתן...",
      });

      const originalStyle = element.style.cssText;
      element.style.backgroundColor = 'white';
      element.style.padding = '20px';

      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      element.style.cssText = originalStyle;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`פרטי_שחקן_${playerName}_${dateStr}.pdf`);

      toast({
        title: "הייצוא הושלם בהצלחה",
        description: "קובץ ה-PDF נוצר ונשמר",
      });
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בייצוא",
        description: "לא ניתן היה לייצא את הנתונים ל-PDF",
      });
    } finally {
      setIsPdfExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  async function onSubmit(values: PlayerFormValues) {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      let imageUrl: string | undefined;
      if (profileImage) {
        try {
          imageUrl = await uploadProfileImage(playerData.id, profileImage);
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

      navigate(`/player-profile/${playerData.id}`);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!playerData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-2xl mx-auto p-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            title="חזור לדף הקודם"
            className="hover:scale-105 transition-transform"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportToPdf}
              disabled={isPdfExporting}
              className="flex items-center gap-1 transition-all hover:bg-primary hover:text-white"
            >
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-1 transition-all hover:bg-primary hover:text-white"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">הדפסה</span>
            </Button>
          </div>
        </div>

        <div className="mb-6 animate-in fade-in-50 duration-500">
          <h1 className="text-2xl font-bold text-gray-900">עריכת פרטי שחקן</h1>
          <p className="text-gray-600">עדכן את פרטי השחקן כאן</p>
        </div>
        
        <div id="player-form-content">
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
    </div>
  );
};

export default EditPlayerForm;
