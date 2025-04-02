
import { supabaseClient } from '@/lib/supabaseClient';

export async function uploadAudio(audioBlob: Blob, path: string) {
  // נבדוק תחילה אם הבאקט הייעודי קיים, אם לא - נשתמש בדלי "public" כגיבוי
  const bucketName = 'meeting_summaries_audio';
  const backupBucketName = 'public';
  
  console.log(`Attempting to upload audio file: ${path}`);
  
  if (!audioBlob) {
    throw new Error("No audio blob provided for upload");
  }
  
  try {
    const file = new File([audioBlob], path, { type: 'audio/webm' });
    
    // בדיקה אם הבאקט קיים
    const { data: buckets, error: bucketsError } = await supabaseClient.storage
      .getBuckets();
      
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    const targetBucket = bucketExists ? bucketName : backupBucketName;
    
    console.log(`Using storage bucket: ${targetBucket}`);
    
    // העלאת הקובץ לבאקט המתאים
    const { data, error } = await supabaseClient.storage
      .from(targetBucket)
      .upload(`audio_summaries/${path}`, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      throw error;
    }
    
    // קבלת הURL הציבורי
    const { data: urlData } = supabaseClient.storage
      .from(targetBucket)
      .getPublicUrl(`audio_summaries/${path}`);
    
    console.log("Upload successful, URL:", urlData?.publicUrl);
    
    return urlData?.publicUrl || null;
  } catch (err) {
    console.error("Upload function error:", err);
    throw err;
  }
}
