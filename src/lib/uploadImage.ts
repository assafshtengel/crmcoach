
import { supabase } from '@/lib/supabase';

export async function uploadImage(file: File, bucket: string, path: string) {
  console.log(`Uploading image to ${bucket}/${path}`);
  
  if (!file) {
    throw new Error("No file provided for upload");
  }
  
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);

    if (error) {
      console.error("Supabase storage upload error:", error);
      throw error;
    }
    
    console.log("Upload successful, data:", data);
    return data;
  } catch (err) {
    console.error("Upload function error:", err);
    throw err;
  }
}
