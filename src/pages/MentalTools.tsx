import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Plus, Edit, Video, Save, X, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Tool {
  id: string;
  name: string;
  description: string;
  learned: string;
  key_points: string[];
  implementation: string;
  video_url?: string;
  user_id: string;
}

const MentalTools = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTool, setNewTool] = useState<Omit<Tool, 'id' | 'user_id'>>({
    name: "",
    description: "",
    learned: "",
    key_points: [],
    implementation: "",
    video_url: ""
  });

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data, error } = await supabase
        .from('mental_tools')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching tools:', error);
        toast({
          title: "שגיאה בטעינת הכלים",
          description: "אנא נסה שוב מאוחר יותר",
          variant: "destructive"
        });
        return;
      }

      setTools(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast({
          title: "לא מחובר",
          description: "יש להתחבר כדי לשמור הכלים",
          variant: "destructive"
        });
        return;
      }

      if (editingTool) {
        const { error } = await supabase
          .from('mental_tools')
          .update({
            name: editingTool.name,
            description: editingTool.description,
            learned: editingTool.learned,
            key_points: editingTool.key_points,
            implementation: editingTool.implementation,
            video_url: editingTool.video_url
          })
          .eq('id', editingTool.id);

        if (error) {
          console.error('Error updating tool:', error);
          toast({
            title: "שגיאה בעדכון הכלי",
            description: "אנא נסה שוב מאוחר יותר",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "הכלי עודכן בהצלחה",
          description: `הכלי ${editingTool.name} עודכן`
        });
      } else {
        if (!newTool.name || !newTool.description || !newTool.learned || !newTool.implementation) {
          toast({
            title: "שגיאה",
            description: "יש למלא את כל השדות החובה",
            variant: "destructive"
          });
          return;
        }

        const { error } = await supabase
          .from('mental_tools')
          .insert({
            name: newTool.name,
            description: newTool.description,
            learned: newTool.learned,
            key_points: newTool.key_points,
            implementation: newTool.implementation,
            video_url: newTool.video_url,
            user_id: session.session.user.id
          });

        if (error) {
          console.error('Error adding tool:', error);
          toast({
            title: "שגיאה בהוספת הכלי",
            description: "אנא נסה שוב מאוחר יותר",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "הכלי נוסף בהצלחה",
          description: `הכלי ${newTool.name} נוסף למאגר הכלים`
        });
      }

      await fetchTools();

      setIsDialogOpen(false);
      setEditingTool(null);
      setNewTool({
        name: "",
        description: "",
        learned: "",
        key_points: [],
        implementation: "",
        video_url: ""
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת הכלי",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (tool: Tool) => {
    setEditingTool({
      ...tool,
      key_points: [...tool.key_points]
    });
    setIsDialogOpen(true);
  };

  const handleNewTool = () => {
    setEditingTool(null);
    setNewTool({
      name: "",
      description: "",
      learned: "",
      key_points: [],
      implementation: "",
      video_url: ""
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">
      <p>טוען...</p>
    </div>;
  }

  return <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            כלים מנטליים
          </h1>
          <Button variant="outline" size="icon" onClick={handleNewTool}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-6">
          {tools.map(tool => <Card key={tool.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-primary font-extrabold px-[59px] py-0 my-[4px] mx-0 text-3xl">{tool.name}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(tool)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="bg-zinc-200 hover:bg-zinc-100">
                <p className="text-gray-600 mb-4 font-extrabold">{tool.description}</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">תאריך לימוד: {tool.learned}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">נקודות מפתח:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {tool.key_points.map((point, idx) => <li key={idx} className="bg-zinc-50 rounded-sm">{point}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">יישום:</h4>
                    <p className="text-gray-600 font-bold">{tool.implementation}</p>
                  </div>
                  {tool.video_url && <div>
                      <h4 className="font-medium mb-2">סרטון הדרכה:</h4>
                      <Button variant="outline" className="flex items-center gap-2" onClick={() => window.open(tool.video_url, '_blank')}>
                        <Video className="h-4 w-4" />
                        צפה בסרטון
                      </Button>
                    </div>}
                </div>
              </CardContent>
            </Card>)}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTool ? "עריכת כלי" : "הוספת כלי חדש"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">שם הכלי</Label>
                <Input id="name" value={editingTool ? editingTool.name : newTool.name} onChange={e => editingTool ? setEditingTool({
                ...editingTool,
                name: e.target.value
              }) : setNewTool({
                ...newTool,
                name: e.target.value
              })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">תיאור הכלי</Label>
                <Textarea id="description" value={editingTool ? editingTool.description : newTool.description} onChange={e => editingTool ? setEditingTool({
                ...editingTool,
                description: e.target.value
              }) : setNewTool({
                ...newTool,
                description: e.target.value
              })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="learned">תאריך לימוד</Label>
                <Input id="learned" value={editingTool ? editingTool.learned : newTool.learned} onChange={e => editingTool ? setEditingTool({
                ...editingTool,
                learned: e.target.value
              }) : setNewTool({
                ...newTool,
                learned: e.target.value
              })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="key_points">נקודות מפתח (כל נקודה בשורה חדשה)</Label>
                <Textarea id="key_points" value={editingTool ? editingTool.key_points.join('\n') : newTool.key_points?.join('\n')} onChange={e => {
                const points = e.target.value.split('\n').filter(point => point.trim() !== '');
                editingTool ? setEditingTool({
                  ...editingTool,
                  key_points: points
                }) : setNewTool({
                  ...newTool,
                  key_points: points
                });
              }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="implementation">יישום</Label>
                <Textarea id="implementation" value={editingTool ? editingTool.implementation : newTool.implementation} onChange={e => editingTool ? setEditingTool({
                ...editingTool,
                implementation: e.target.value
              }) : setNewTool({
                ...newTool,
                implementation: e.target.value
              })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="video_url">קישור לסרטון</Label>
                <Input id="video_url" type="url" placeholder="הכנס קישור לסרטון YouTube או Vimeo" value={editingTool ? editingTool.video_url : newTool.video_url} onChange={e => editingTool ? setEditingTool({
                ...editingTool,
                video_url: e.target.value
              }) : setNewTool({
                ...newTool,
                video_url: e.target.value
              })} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave}>
                {editingTool ? "עדכן" : "הוסף"} כלי
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>;
};

export default MentalTools;
