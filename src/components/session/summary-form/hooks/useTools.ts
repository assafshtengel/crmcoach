
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/tool';

export function useTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTools() {
      try {
        setLoading(true);
        
        // Get the current user (coach)
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError('לא נמצא משתמש מחובר');
          return;
        }
        
        // Fetch tools from coach_tools table
        const { data, error } = await supabase
          .from('coach_tools')
          .select('*')
          .eq('coach_id', user.id);
          
        if (error) {
          throw error;
        }
        
        setTools(data || []);
      } catch (err: any) {
        console.error('Error fetching tools:', err);
        setError(err.message || 'שגיאה בטעינת רשימת הכלים');
      } finally {
        setLoading(false);
      }
    }

    fetchTools();
  }, []);

  return { tools, loading, error };
}
