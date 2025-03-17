import { supabase } from "@/lib/supabase";
import { PlayerFormValues } from "@/components/new-player/PlayerFormSchema";

export const updatePlayer = async (
  playerId: string,
  {
    firstName,
    lastName,
    playerEmail,
    playerPhone,
    birthDate,
    city,
    club,
    yearGroup,
    injuries,
    parentName,
    parentEmail,
    parentPhone,
    notes,
    sportField,
    otherSportField,
  }: Partial<PlayerFormValues>
) => {
  try {
    const finalSportField = sportField === 'other' && otherSportField
      ? otherSportField
      : sportField === 'other'
        ? 'אחר'
        : sportField;
        
    const { data, error } = await supabase
      .from('players')
      .update({
        full_name: firstName && lastName ? `${firstName} ${lastName}` : undefined,
        email: playerEmail,
        phone: playerPhone,
        birthdate: birthDate,
        city,
        club,
        year_group: yearGroup,
        injuries,
        parent_name: parentName,
        parent_phone: parentPhone,
        parent_email: parentEmail,
        notes,
        sport_field: finalSportField,
      })
      .eq('id', playerId)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating player:', error);
    throw error;
  }
};
