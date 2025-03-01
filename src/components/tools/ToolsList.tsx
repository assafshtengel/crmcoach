
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tool } from '@/types/tool';

export function ToolsList() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [newToolName, setNewToolName] = useState('');
  const [newToolDescription, setNewToolDescription] = useState('');
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<Tool | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTools();
  }, []);

  async function fetchTools() {
    try {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data, error } = await supabase
        .from('coach_tools')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setTools(data as Tool[]);
      }
    } catch (error) {
      console.error('Error fetching tools:', error);
      toast({
        title: "שגיאה בטעינת הכלים",
        description: "נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function addTool() {
    if (!newToolName.trim() || !newToolDescription.trim()) {
      toast({
        title: "שדות חובה",
        description: "יש למלא שם וגם תיאור לכלי",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast({
          title: "שגיאה בהוספת הכלי",
          description: "יש להתחבר למערכת",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('coach_tools')
        .insert([
          {
            name: newToolName,
            description: newToolDescription,
            coach_id: session.session.user.id
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      if (data) {
        setTools([...data as Tool[], ...tools]);
        setNewToolName('');
        setNewToolDescription('');
        toast({
          title: "הכלי נוסף בהצלחה",
          description: "הכלי זמין כעת לשימוש בסיכומי אימון",
        });
      }
    } catch (error) {
      console.error('Error adding tool:', error);
      toast({
        title: "שגיאה בהוספת הכלי",
        description: "נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  }

  async function updateTool(id: string) {
    if (!editName.trim() || !editDescription.trim()) {
      toast({
        title: "שדות חובה",
        description: "יש למלא שם וגם תיאור לכלי",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('coach_tools')
        .update({
          name: editName,
          description: editDescription,
        })
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      if (data) {
        setTools(tools.map(tool => tool.id === id ? data[0] as Tool : tool));
        setEditMode(null);
        toast({
          title: "הכלי עודכן בהצלחה",
        });
      }
    } catch (error) {
      console.error('Error updating tool:', error);
      toast({
        title: "שגיאה בעדכון הכלי",
        description: "נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  }

  async function deleteTool(id: string) {
    try {
      const { error } = await supabase
        .from('coach_tools')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setTools(tools.filter(tool => tool.id !== id));
      setDeleteDialogOpen(false);
      setToolToDelete(null);
      toast({
        title: "הכלי נמחק בהצלחה",
      });
    } catch (error) {
      console.error('Error deleting tool:', error);
      toast({
        title: "שגיאה במחיקת הכלי",
        description: "נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  }

  function startEdit(tool: Tool) {
    setEditMode(tool.id);
    setEditName(tool.name);
    setEditDescription(tool.description);
  }

  function cancelEdit() {
    setEditMode(null);
    setEditName('');
    setEditDescription('');
  }

  function openDeleteDialog(tool: Tool) {
    setToolToDelete(tool);
    setDeleteDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="tools" dir="rtl">
        <TabsList className="mb-4">
          <TabsTrigger value="tools">רשימת הכלים</TabsTrigger>
          <TabsTrigger value="add">הוספת כלי חדש</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center py-10">טוען...</div>
              ) : tools.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p>טרם נוספו כלים למערכת</p>
                  <Button 
                    variant="link" 
                    onClick={() => {
                      const tabTrigger = document.querySelector('[data-value="add"]');
                      if (tabTrigger) {
                        (tabTrigger as HTMLElement).click();
                      }
                    }}
                  >
                    הוסף כלי ראשון
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[50vh]">
                  <div className="space-y-4 p-1">
                    {tools.map((tool) => (
                      <Card key={tool.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          {editMode === tool.id ? (
                            <div className="space-y-4">
                              <div>
                                <label htmlFor="editName" className="block text-sm font-medium mb-1">
                                  שם הכלי
                                </label>
                                <Input
                                  id="editName"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-full"
                                />
                              </div>
                              <div>
                                <label htmlFor="editDescription" className="block text-sm font-medium mb-1">
                                  תיאור הכלי
                                </label>
                                <Textarea
                                  id="editDescription"
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  rows={4}
                                  className="w-full"
                                />
                              </div>
                              <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                                <Button variant="outline" onClick={cancelEdit}>
                                  ביטול
                                </Button>
                                <Button onClick={() => updateTool(tool.id)}>
                                  <Save className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                                  שמירה
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-semibold">{tool.name}</h3>
                                <div className="flex space-x-2 rtl:space-x-reverse">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => startEdit(tool)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openDeleteDialog(tool)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-muted-foreground whitespace-pre-wrap">
                                {tool.description}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="add">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label htmlFor="newToolName" className="block text-sm font-medium mb-1">
                  שם הכלי
                </label>
                <Input
                  id="newToolName"
                  value={newToolName}
                  onChange={(e) => setNewToolName(e.target.value)}
                  placeholder="הזן שם לכלי"
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="newToolDescription" className="block text-sm font-medium mb-1">
                  תיאור הכלי
                </label>
                <Textarea
                  id="newToolDescription"
                  value={newToolDescription}
                  onChange={(e) => setNewToolDescription(e.target.value)}
                  placeholder="תאר כיצד ומתי להשתמש בכלי זה"
                  rows={6}
                  className="w-full"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={addTool}>
                  <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  הוסף כלי
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>האם למחוק את הכלי?</DialogTitle>
            <DialogDescription>
              פעולה זו תמחק את הכלי &quot;{toolToDelete?.name}&quot; לצמיתות.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              ביטול
            </Button>
            <Button
              variant="destructive"
              onClick={() => toolToDelete && deleteTool(toolToDelete.id)}
            >
              מחק
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
