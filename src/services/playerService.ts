
import { supabase } from '@/integrations/supabase/client';
import { PlayerFormValues } from '@/components/new-player/PlayerFormSchema';

export const createPlayer = async (values: PlayerFormValues, coachId: string) => {
  // יצירת סיסמה זמנית
  const temporaryPassword = Math.random().toString(36).slice(-8);

  // יצירת חשבון משתמש חדש לשחקן באמצעות signUp רגיל
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: values.playerEmail.toLowerCase(),
    password: temporaryPassword,
    options: {
      data: {
        full_name: `${values.firstName} ${values.lastName}`,
        role: 'player'
      }
    }
  });

  if (signUpError) {
    throw signUpError;
  }

  if (!authData.user) {
    throw new Error("Failed to create user account");
  }

  // שמירת השחקן בטבלת players
  const { error: insertError } = await supabase
    .from('players')
    .insert([{
      id: authData.user.id,
      coach_id: coachId,
      full_name: `${values.firstName} ${values.lastName}`,
      email: values.playerEmail.toLowerCase(),
      phone: values.playerPhone,
      position: values.position,
      notes: `
        תאריך לידה: ${values.birthDate}
        עיר: ${values.city}
        מועדון: ${values.club}
        שנתון: ${values.yearGroup}
        פציעות: ${values.injuries || 'אין'}
        פרטי הורה:
        שם: ${values.parentName}
        טלפון: ${values.parentPhone}
        אימייל: ${values.parentEmail}
        הערות נוספות: ${values.notes || 'אין'}
      `
    }]);

  if (insertError) {
    throw insertError;
  }

  // עדכון תפקיד המשתמש
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert([{
      id: authData.user.id,
      role: 'player'
    }]);

  if (roleError) {
    console.error('Error setting user role:', roleError);
  }

  // שליחת אימייל עם פרטי ההתחברות
  const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
    body: {
      email: values.playerEmail,
      password: temporaryPassword,
      playerName: `${values.firstName} ${values.lastName}`,
      coachName: 'המאמן שלך'
    }
  });

  return { emailError, playerData: authData.user };
};
