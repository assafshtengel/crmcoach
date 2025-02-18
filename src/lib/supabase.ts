
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hntgzgrlyfhojcaofbjv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudGd6Z3JseWZob2pjYW9mYmp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkyOTI4MDAsImV4cCI6MjAyNDg2ODgwMH0.7kIJDHqM2SxC_Zs6cXR1LFLYwQq9PeJnqwGaGUe6GYg';

export const supabase = createClient(supabaseUrl, supabaseKey);
