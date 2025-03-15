
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
        // Remove position reference here as well
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

// Add a new function to create players with the current user as coach
export const createPlayer = async (playerData: PlayerFormValues) => {
  try {
    // Get current user session to use their ID as coach_id
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData.session?.user?.id;
    
    if (!currentUserId) {
      throw new Error("אין משתמש מחובר. יש להתחבר כדי ליצור שחקן חדש.");
    }

    // Check if the user exists in the coaches table
    const { data: coachData, error: coachError } = await supabase
      .from('coaches')
      .select('id')
      .eq('id', currentUserId)
      .single();

    if (coachError || !coachData) {
      console.error('Error checking coach:', coachError);
      // If coach doesn't exist, create a new coach entry
      const { error: insertCoachError } = await supabase
        .from('coaches')
        .insert({
          id: currentUserId,
          email: sessionData.session?.user?.email || '',
          full_name: sessionData.session?.user?.user_metadata?.full_name || 'מאמן'
        });

      if (insertCoachError) {
        console.error('Error creating coach:', insertCoachError);
        throw new Error("לא ניתן ליצור שחקן עקב בעיה ברישום מאמן. נא לפנות לתמיכה.");
      }
    }

    const finalSportField = playerData.sportField === 'other' && playerData.otherSportField
      ? playerData.otherSportField
      : playerData.sportField === 'other'
        ? 'אחר'
        : playerData.sportField;

    const { data, error } = await supabase
      .from('players')
      .insert({
        full_name: `${playerData.firstName} ${playerData.lastName}`,
        email: playerData.playerEmail,
        phone: playerData.playerPhone,
        birthdate: playerData.birthDate,
        city: playerData.city,
        club: playerData.club,
        year_group: playerData.yearGroup,
        injuries: playerData.injuries,
        parent_name: playerData.parentName,
        parent_phone: playerData.parentPhone,
        parent_email: playerData.parentEmail,
        notes: playerData.notes,
        sport_field: finalSportField,
        coach_id: currentUserId,
        registration_timestamp: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Supabase error creating player:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error creating player:', error);
    throw error;
  }
};
