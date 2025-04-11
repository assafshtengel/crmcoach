
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const supabaseUrl = 'https://hntgzgrlyfhojcaofbjv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudGd6Z3JseWZob2pjYW9mYmp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzMjY2NTYsImV4cCI6MjA1NDkwMjY1Nn0.InXLUXMCNHzBYxOEY_97y1Csm_uBeGyUsiNWlAQoHus';

// Create a singleton instance to avoid multiple client warnings
let supabaseInstance = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  }
  return supabaseInstance;
};

// Helper function to ensure a user record exists in the 'users' table
export const ensureUserInUsersTable = async (userId: string) => {
  if (!userId) {
    console.error('Cannot insert user to users table: No user ID provided');
    return false;
  }

  const supabase = getSupabase();

  try {
    // Check if the user already exists in the users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking if user exists in users table:', checkError);
      return false;
    }

    // If the user doesn't exist, insert them
    if (!existingUser) {
      const { error: insertError } = await supabase
        .from('users')
        .insert([{ id: userId }]);

      if (insertError) {
        console.error('Error inserting user into users table:', insertError);
        return false;
      }
      
      console.log('Successfully created user record in users table:', userId);
      return true;
    } else {
      console.log('User record already exists in users table:', userId);
      return true;
    }
  } catch (error) {
    console.error('Unexpected error ensuring user in users table:', error);
    return false;
  }
};

// For backward compatibility, also export as supabase
export const supabase = getSupabase();
