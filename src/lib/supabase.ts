
import { createClient } from '@supabase/supabase-js';

// Access Supabase URL and anon key directly
const supabaseUrl = 'https://uvtqnqiwwnlbyjwdtlxf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dHFucWl3d25sYnlqd2R0bHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg5NDE3MzEsImV4cCI6MjAyNDUxNzczMX0.zX7LNYQ8ZMBFKwejTxmLaORl8T7QiUfaqP7DQVeBOBo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
