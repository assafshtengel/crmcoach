
import { supabase } from '@/lib/supabase';

export function getImageUrl(imagePath: string | null, bucket: string = 'landing-pages') {
  if (!imagePath) return null;
  
  // Check if it's a full URL already (e.g. starts with http or https)
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  try {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(imagePath);
      
    return data.publicUrl;
  } catch (error) {
    console.error("Error getting public URL:", error);
    return null;
  }
}
