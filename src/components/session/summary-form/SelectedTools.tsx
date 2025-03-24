
import React, { useState, useEffect } from "react";
import { Tag } from "lucide-react";
import { Tool } from "@/types/tool";
import { Badge } from "@/components/ui/badge";
import { useTools } from "./hooks/useTools";

interface SelectedToolsProps {
  toolIds: string[];
}

export function SelectedTools({ toolIds }: SelectedToolsProps) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const { getToolsByIds } = useTools();

  useEffect(() => {
    async function loadTools() {
      if (!toolIds || toolIds.length === 0) return;
      
      setLoading(true);
      const fetchedTools = await getToolsByIds(toolIds);
      setTools(fetchedTools);
      setLoading(false);
    }

    loadTools();
  }, [toolIds]);

  if (!toolIds || toolIds.length === 0) {
    return null;
  }

  return (
    <div className="p-4 rounded-lg bg-purple-50 border border-purple-100 mb-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-[#8B5CF6] mb-3 flex items-center">
        <Tag className="mr-2 h-5 w-5" />
        הכלים המנטליים שנבחרו למפגש
      </h3>
      
      {loading ? (
        <div className="text-sm text-gray-500">טוען...</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => (
            <Badge 
              key={tool.id} 
              className="py-1.5 px-3 bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-200"
            >
              {tool.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
