
import { supabase } from '@/lib/supabase';

export const getImageUrl = async (bucket: string, path: string): Promise<string> => {
  if (!path) {
    return '';
  }
  
  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } catch (error) {
    console.error('Failed to get image URL:', error);
    return '';
  }
};
