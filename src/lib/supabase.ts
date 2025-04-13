
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Supabase project URL and anon key
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

// Define LandingPage type for components that were using it from supabaseClient.ts
export type LandingPage = {
  id: string;
  coach_id: string;
  title: string;
  subtitle?: string;
  subtitle_id?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  main_reason?: string;
  advantages?: string[];
  advantages_ids?: string[];
  work_steps?: string[];
  cta_text?: string;
  cta_id?: string;
  profile_image_path?: string | null;
  bg_color?: string;
  accent_color?: string;
  button_color?: string;
  is_dark_text?: boolean;
  is_published?: boolean;
  created_at?: string;
  styles?: any;
};

// Expose Supabase client globally during development
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
}
