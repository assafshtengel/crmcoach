
import { supabaseClient } from '@/lib/supabaseClient';

export async function uploadAudio(audioBlob: Blob, path: string) {
  console.log(`Uploading audio to meeting_summaries_audio/${path}`);
  
  if (!audioBlob) {
    throw new Error("No audio blob provided for upload");
  }
  
  try {
    const file = new File([audioBlob], path, { type: 'audio/webm' });
    
    const { data, error } = await supabaseClient.storage
      .from('meeting_summaries_audio')
      .upload(path, file);

    if (error) {
      console.error("Supabase storage upload error:", error);
      throw error;
    }
    
    // Get the public URL for the uploaded file
    const { data: urlData } = supabaseClient.storage
      .from('meeting_summaries_audio')
      .getPublicUrl(path);
    
    console.log("Upload successful, URL:", urlData?.publicUrl);
    return urlData?.publicUrl;
  } catch (err) {
    console.error("Upload function error:", err);
    throw err;
  }
}
