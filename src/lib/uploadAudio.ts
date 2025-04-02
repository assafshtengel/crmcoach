
import { supabaseClient } from '@/lib/supabaseClient';

export async function uploadAudio(audioBlob: Blob, path: string) {
  // Define bucket names
  const bucketName = 'meeting_summaries_audio';
  const backupBucketName = 'public';
  
  console.log(`Attempting to upload audio file: ${path}`);
  
  if (!audioBlob) {
    throw new Error("No audio blob provided for upload");
  }
  
  try {
    // Check if user is authenticated first
    const { data: session } = await supabaseClient.auth.getSession();
    if (!session.session) {
      throw new Error("Authentication required to upload audio files");
    }

    // Attempt to get the user role to enforce coach-only access
    let isCoach = false;
    try {
      const { data: userRoles } = await supabaseClient
        .from('user_roles')
        .select('role')
        .eq('user_id', session.session.user.id)
        .single();
      
      isCoach = userRoles?.role === 'coach';
      
      if (!isCoach) {
        throw new Error("Coach role required to upload audio files");
      }
    } catch (roleCheckError) {
      console.warn("Could not verify user role:", roleCheckError);
      // RLS policies will enforce access control, but we'll check first
      if (!roleCheckError.message?.includes("single row")) {
        throw new Error("Permission verification failed");
      }
    }

    const file = new File([audioBlob], path, { type: 'audio/webm' });
    
    // Determine which bucket to use
    let targetBucket = bucketName;
    
    try {
      // Check if primary bucket exists
      const { data: bucketData, error: bucketError } = await supabaseClient.storage
        .getBucket(bucketName);
      
      if (bucketError) {
        console.log(`Bucket ${bucketName} not found, using ${backupBucketName} instead`);
        targetBucket = backupBucketName;
      }
    } catch (bucketCheckError) {
      console.log(`Error checking bucket ${bucketName}, using ${backupBucketName} instead:`, bucketCheckError);
      targetBucket = backupBucketName;
    }
    
    console.log(`Using storage bucket: ${targetBucket}`);
    
    // Set upload folder path - ensure it's within the allowed folder structure
    const userId = session.session.user.id;
    const folderPath = `audio_summaries/${userId}`;
    const filePath = `${folderPath}/${path}`;
    
    // Upload the file
    const { data, error } = await supabaseClient.storage
      .from(targetBucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      
      // Provide more specific error messages
      if (error.message?.includes('permission') || error.message?.includes('not authorized')) {
        throw new Error("Access denied: You don't have permission to upload audio files");
      }
      
      throw error;
    }
    
    // Get the URL for the uploaded file
    const { data: urlData } = supabaseClient.storage
      .from(targetBucket)
      .getPublicUrl(filePath);
    
    console.log("Upload successful, URL:", urlData?.publicUrl);
    
    return urlData?.publicUrl || null;
  } catch (err) {
    console.error("Upload function error:", err);
    
    // Provide user-friendly error messages
    if (err.message?.includes('permission') || err.message?.includes('not authorized') || 
        err.message?.includes('Coach role required')) {
      throw new Error("Access denied: You don't have permission to upload audio files. Coach role required.");
    }
    
    throw err;
  }
}
