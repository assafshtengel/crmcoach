
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
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
        .order('name', { ascending: true });

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

  async function getToolsByIds(toolIds: string[]) {
    if (!toolIds || toolIds.length === 0) return [];
    
    try {
      const { data, error } = await supabase
        .from('coach_tools')
        .select('*')
        .in('id', toolIds);

      if (error) {
        console.error('Error fetching tools by IDs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching tools by IDs:', error);
      return [];
    }
  }

  return {
    tools,
    selectedTools,
    setSelectedTools,
    getToolsByIds,
    loading
  };
}
