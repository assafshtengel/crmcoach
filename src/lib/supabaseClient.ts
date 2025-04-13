
import { supabase as supabaseInstance } from '@/lib/supabase';

// Re-export the client from the central location
export const supabaseClient = supabaseInstance;

// Export the custom types that were previously defined here
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
