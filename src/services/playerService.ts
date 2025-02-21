
import { supabase } from '@/integrations/supabase/client';
import { PlayerFormValues } from '@/components/new-player/PlayerFormSchema';

export const createPlayer = async (values: PlayerFormValues, coachId: string) => {
  try {
    // בדיקה אם השחקן כבר קיים במערכת
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id')
      .eq('email', values.playerEmail.toLowerCase())
      .single();

    if (existingPlayer) {
      throw new Error('שחקן עם כתובת האימייל הזו כבר קיים במערכת');
    }

    // שמירת השחקן בטבלת players
    const { data: playerData, error: insertError } = await supabase
      .from('players')
      .insert([{
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
      }])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return { playerData };

  } catch (error: any) {
    throw error;
  }
};
