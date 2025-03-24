
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tool } from "@/types/tool";

export function useTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTools();
  }, []);

  async function fetchTools() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coach_tools')
        .select('*')
        .order('name', { ascending: true }) as { data: Tool[] | null; error: any };

      if (error) {
        throw error;
      }

      if (data) {
        setTools(data);
      }
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  }

  return {
    tools,
    selectedTools,
    setSelectedTools,
    loading
  };
}
