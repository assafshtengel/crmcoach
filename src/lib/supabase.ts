
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
        storage: typeof window !== 'undefined' ? localStorage : null,
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: typeof window !== 'undefined',
      }
    });
  }
  return supabaseInstance;
};

// For backward compatibility, also export as supabase
export const supabase = getSupabase();
