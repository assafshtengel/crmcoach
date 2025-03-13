
import { supabase } from "@/lib/supabase";

export interface Tool {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  created_at?: string;
}

export async function getTools(): Promise<Tool[]> {
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching tools:', error);
    throw new Error(error.message);
  }
  
  return data || [];
}

export async function createTool(tool: Omit<Tool, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabase
    .from('tools')
    .insert([tool]);
  
  if (error) {
    console.error('Error creating tool:', error);
    throw new Error(error.message);
  }
}

export async function deleteTool(toolId: string): Promise<void> {
  const { error } = await supabase
    .from('tools')
    .delete()
    .eq('id', toolId);
  
  if (error) {
    console.error('Error deleting tool:', error);
    throw new Error(error.message);
  }
}
