
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tool } from "@/types/tool";
import { BookOpen } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ToolsTabProps {
  tools: Tool[];
  selectedTools: string[];
  loading: boolean;
  setSelectedTools: React.Dispatch<React.SetStateAction<string[]>>;
}

export function ToolsTab({ tools, selectedTools, loading, setSelectedTools }: ToolsTabProps) {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);

  const toggleTool = (toolId: string, event: React.MouseEvent) => {
    // Prevent any default behavior or event propagation
    event.preventDefault();
    event.stopPropagation();
    
    setSelectedTools(prev => 
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const handleToolClick = (tool: Tool) => {
    setActiveTool(prev => prev?.id === tool.id ? null : tool);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">בחר כלים שהשתמשת בהם במפגש זה</h3>
            <p className="text-muted-foreground text-sm">
              בחר את הכלים בהם השתמשת במהלך המפגש. אם חסר כלי ברשימה, תוכל להוסיף אותו ב
              <Button 
                variant="link" 
                className="px-1 h-auto" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open('/tool-management', '_blank');
                }}
              >
                ניהול כלים
              </Button>
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-10">טוען...</div>
          ) : tools.length === 0 ? (
            <div className="text-center py-10 border rounded-md">
              <p className="text-muted-foreground mb-2">טרם הוגדרו כלים במערכת</p>
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open('/tool-management', '_blank');
                }}
              >
                הוסף כלים
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {tools.map((tool) => (
                <div 
                  key={tool.id} 
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedTools.includes(tool.id) 
                      ? 'bg-primary/10 border-primary' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleToolClick(tool)}
                >
                  <div className="flex items-start">
                    <Checkbox
                      checked={selectedTools.includes(tool.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTools(prev => [...prev, tool.id]);
                        } else {
                          setSelectedTools(prev => prev.filter(id => id !== tool.id));
                        }
                      }}
                      className="mr-2 mt-1"
                      id={`tool-${tool.id}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={`tool-${tool.id}`} 
                        className="font-medium cursor-pointer flex-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {tool.name}
                      </label>
                      <p className="text-muted-foreground text-sm mt-1">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {activeTool && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>{activeTool.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">תיאור</h4>
                <p className="text-sm">{activeTool.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTools.length > 0 && !activeTool && (
        <Alert className="bg-primary/5 border-primary/20">
          <AlertDescription className="text-sm">
            נבחרו {selectedTools.length} כלים. לחץ על כלי כדי לראות את פרטיו המלאים.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
