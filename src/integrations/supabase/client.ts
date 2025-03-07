
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://hntgzgrlyfhojcaofbjv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudGd6Z3JseWZob2pjYW9mYmp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzMjY2NTYsImV4cCI6MjA1NDkwMjY1Nn0.InXLUXMCNHzBYxOEY_97y1Csm_uBeGyUsiNWlAQoHus";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Define the Goal type that matches our database structure
export interface Goal {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  success_criteria: string | null;
  completed: boolean;
  type: 'long-term' | 'short-term' | 'immediate';
  user_id: string;
  category: 'physical' | 'mental' | 'academic' | null;
  status: 'new' | 'in-progress' | 'achieved';
  created_at?: string;
}
