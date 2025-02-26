
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

const NewPlayerForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showSuccessDialog, setShowSuccessDialog] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

  async function onSubmit(values: PlayerFormValues) {
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

      // Create the player record
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .insert([
          {
            coach_id: user.id,
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
            position: values.position
          }
        ])
        .select()
        .single();

      if (playerError) throw playerError;

      toast({
        title: "השחקן נוצר בהצלחה!",
        description: "השחקן נוסף לרשימת השחקנים שלך.",
      });

      setShowSuccessDialog(true);
      setTimeout(() => {
        setShowSuccessDialog(false);
        navigate('/players-list');
      }, 1500);

    } catch (error: any) {
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
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            title="חזור לדף הקודם"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
            title="חזור לדשבורד"
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">רישום שחקן חדש</h1>
          <p className="text-gray-600">אנא מלא את כל הפרטים הנדרשים</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <PlayerPersonalInfo form={form} />
            <PlayerClubInfo form={form} />
            <PlayerAdditionalInfo form={form} />
            <PlayerParentInfo form={form} />

            <Button 
              type="submit" 
              className="w-full"
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
