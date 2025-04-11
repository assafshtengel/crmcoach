
import { useState, useEffect } from 'react';
import { supabase, ensureUserInUsersTable } from '@/lib/supabase';
import { Player } from '@/types/player';

/**
 * A hook that ensures a player record exists for the currently authenticated user.
 * It checks if there is a record in the "players" table where "id" equals auth.uid().
 * If no player exists, it inserts a new row.
 * 
 * @returns Object containing status information about the player registration process
 */
export function usePlayerRegistration() {
  const [isLoading, setIsLoading] = useState(true);
  const [player, setPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isNewPlayer, setIsNewPlayer] = useState(false);

  useEffect(() => {
    const registerPlayer = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Step 1: Get the currently logged-in user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.error("Authentication error:", authError?.message || "User not logged in");
          setError("User not authenticated");
          setIsLoading(false);
          return;
        }
        
        console.log("Successfully retrieved authenticated user:", user.id);

        // Step 2: Ensure the user exists in the users table
        await ensureUserInUsersTable(user.id);

        // Step 3: Check if there is a record in the "players" table
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (playerError) {
          console.error("Error checking for player:", playerError);
          setError(playerError.message);
          setIsLoading(false);
          return;
        }

        // Step 4: If no player exists, insert a new row
        if (!playerData) {
          console.log("No player record found. Creating new player with ID:", user.id);
          
          // Insert a new player record with minimal information
          const { data: newPlayer, error: insertError } = await supabase
            .from('players')
            .insert({ 
              id: user.id, 
              email: user.email || '',
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'New Player'
            })
            .select()
            .single();
          
          if (insertError) {
            console.error("Error creating player record:", insertError);
            setError(insertError.message);
            setIsLoading(false);
            return;
          }
          
          console.log("Successfully created new player record:", newPlayer);
          setPlayer(newPlayer as Player);
          setIsNewPlayer(true);
        } else {
          console.log("Player record already exists:", playerData);
          setPlayer(playerData as Player);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Unexpected error in player registration:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setIsLoading(false);
      }
    };

    registerPlayer();
  }, []);

  return { player, isLoading, error, isNewPlayer };
}
