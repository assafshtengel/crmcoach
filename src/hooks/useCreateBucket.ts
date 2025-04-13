
import { useState } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';

export function useCreateBucket() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createBucket = async (bucketName: string) => {
    setIsCreating(true);
    setError(null);
    
    try {
      console.log(`Creating bucket: ${bucketName}`);
      const { data, error } = await supabaseClient.storage.createBucket(bucketName, {
        public: true
      });
      
      if (error) {
        console.error("Error creating bucket:", error);
        throw error;
      }
      
      console.log("Bucket created successfully:", data);
      return data;
    } catch (err) {
      console.error("Failed to create bucket:", err);
      setError(err instanceof Error ? err : new Error('Failed to create bucket'));
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  return { createBucket, isCreating, error };
}
