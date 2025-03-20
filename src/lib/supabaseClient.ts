
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://hntgzgrlyfhojcaofbjv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudGd6Z3JseWZob2pjYW9mYmp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzMjY2NTYsImV4cCI6MjA1NDkwMjY1Nn0.InXLUXMCNHzBYxOEY_97y1Csm_uBeGyUsiNWlAQoHus";

// Define types for the landing_pages table
export type LandingPage = {
  id: string;
  coach_id: string;
  title: string;
  subtitle: string;
  subtitle_id?: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  main_reason: string;
  advantages: string[];
  advantages_ids?: string[];
  work_steps: string[];
  cta_text: string;
  cta_id?: string;
  profile_image_path?: string | null;
  bg_color: string;
  accent_color: string;
  button_color: string;
  is_dark_text: boolean;
  is_published: boolean;
  created_at?: string;
  styles?: any;
};

// Create a single client instance to avoid multiple instance warnings
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export { supabaseClient };
