
import { supabaseClient } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export async function uploadAudio(audioBlob: Blob, path: string) {
  // Define bucket names
  const bucketName = 'meeting_summaries_audio';
  const backupBucketName = 'public';
  
  console.log(`Attempting to upload audio file: ${path}`);
  console.log(`Audio blob size: ${audioBlob.size} bytes`);
  
  if (!audioBlob) {
    toast.error('No audio blob provided for upload');
    throw new Error("No audio blob provided for upload");
  }
  
  try {
    // Check if user is authenticated first
    const { data: session } = await supabaseClient.auth.getSession();
    if (!session.session) {
      toast.error('Authentication required to upload audio files');
      throw new Error("Authentication required to upload audio files");
    }

    console.log("User authenticated:", session.session.user.id);

    // Check user role (existing code)
    let isCoach = false;
    try {
      const { data: userRoles } = await supabaseClient
        .from('user_roles')
        .select('role')
        .eq('user_id', session.session.user.id)
        .single();
      
      isCoach = userRoles?.role === 'coach';
      
      console.log("User role check:", userRoles?.role, "Is coach:", isCoach);
      
      if (!isCoach) {
        toast.error('Coach role required to upload audio files');
        throw new Error("Coach role required to upload audio files");
      }
    } catch (roleCheckError) {
      console.error("Could not verify user role:", roleCheckError);
      if (!roleCheckError.message?.includes("single row")) {
        toast.error('Permission verification failed');
        throw new Error("Permission verification failed");
      }
    }

    const file = new File([audioBlob], path, { type: 'audio/webm' });
    console.log("Created File object:", file.name, "size:", file.size, "type:", file.type);
    
    // Check if the bucket exists
    let targetBucket = bucketName;
    
    try {
      console.log(`Checking if bucket ${bucketName} exists...`);
      const { data: bucketData, error: bucketError } = await supabaseClient.storage
        .getBucket(bucketName);
      
      if (bucketError) {
        console.error(`Bucket ${bucketName} not found, using ${backupBucketName} instead. Error:`, bucketError);
        targetBucket = backupBucketName;
      } else {
        console.log(`Bucket ${bucketName} found:`, bucketData);
      }
    } catch (bucketCheckError) {
      console.error(`Error checking bucket ${bucketName}, using ${backupBucketName} instead:`, bucketCheckError);
      targetBucket = backupBucketName;
    }
    
    console.log(`Using storage bucket: ${targetBucket}`);
    
    // Set upload folder path - ensure it's within the allowed folder structure
    const userId = session.session.user.id;
    const folderPath = `audio_summaries/${userId}`;
    const filePath = `${folderPath}/${path}`;
    
    console.log(`Uploading audio file to: ${targetBucket}/${filePath}`);
    
    // Upload the file
    const { data, error } = await supabaseClient.storage
      .from(targetBucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      toast.error(`Failed to upload audio file: ${error.message}`);
      
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
    toast.success('Audio file uploaded successfully');
    
    return urlData?.publicUrl || null;
  } catch (err) {
    console.error("Full upload function error:", err);
    
    // Provide user-friendly error messages
    if (err.message?.includes('permission') || err.message?.includes('not authorized') || 
        err.message?.includes('Coach role required')) {
      toast.error('Access denied: Coach role required');
      throw new Error("Access denied: You don't have permission to upload audio files. Coach role required.");
    }
    
    toast.error(`Failed to upload audio file: ${err.message}`);
    throw err;
  }
}
