import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Plus, Edit, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Tool {
  id: number;
  name: string;
  description: string;
  learned: string;
  key_points: string[];
  implementation: string;
  videoUrl?: string;
}

const MentalTools = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  
  const [tools, setTools] = useState<Tool[]>([
    {
      id: 1,
      name: "NEXT",
      description: "כלי לשיפור המיקוד והריכוז במשחק. מתמקד בהכנה המנטלית לנקודה הבאה.",
      learned: "14.2.25",
      key_points: [
        "מחיאת כף מיד אחרי סיום נקודה",
        "מיקוד בנקודה הבאה",
        "שחרור המתח מהנקודה הקודמת"
      ],
      implementation: "ליישם בכל משחק ובכל נקודה, במיוחד אחרי נקודות קשות"
    }
  ]);

  const [newTool, setNewTool] = useState<Partial<Tool>>({
    name: "",
    description: "",
    learned: "",
    key_points: [],
    implementation: "",
    videoUrl: ""
  });

  const handleSave = () => {
    if (editingTool) {
      setTools(tools.map(tool => 
        tool.id === editingTool.id ? { ...editingTool } : tool
      ));
      toast({
        title: "הכלי עודכן בהצלחה",
        description: `הכלי ${editingTool.name} עודכן`,
      });
    } else {
      const newId = Math.max(...tools.map(t => t.id), 0) + 1;
      const toolToAdd = {
        ...newTool,
        id: newId,
        key_points: newTool.key_points?.toString().split('\n').filter(point => point.trim() !== '') || []
      } as Tool;
      
      setTools([...tools, toolToAdd]);
      toast({
        title: "הכלי נוסף בהצלחה",
        description: `הכלי ${newTool.name} נוסף למאגר הכלים`,
      });
    }
    
    setIsDialogOpen(false);
    setEditingTool(null);
    setNewTool({
      name: "",
      description: "",
      learned: "",
      key_points: [],
      implementation: "",
      videoUrl: ""
    });
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
      videoUrl: ""
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
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
          {tools.map((tool) => (
            <Card key={tool.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl text-primary">{tool.name}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(tool)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{tool.description}</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">תאריך לימוד: {tool.learned}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">נקודות מפתח:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {tool.key_points.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">יישום:</h4>
                    <p className="text-gray-600">{tool.implementation}</p>
                  </div>
                  {tool.videoUrl && (
                    <div>
                      <h4 className="font-medium mb-2">סרטון הדרכה:</h4>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={() => window.open(tool.videoUrl, '_blank')}
                      >
                        <Video className="h-4 w-4" />
                        צפה בסרטון
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTool ? "עריכת כלי" : "הוספת כלי חדש"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">שם הכלי</Label>
                <Input
                  id="name"
                  value={editingTool ? editingTool.name : newTool.name}
                  onChange={(e) => editingTool 
                    ? setEditingTool({ ...editingTool, name: e.target.value })
                    : setNewTool({ ...newTool, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">תיאור הכלי</Label>
                <Textarea
                  id="description"
                  value={editingTool ? editingTool.description : newTool.description}
                  onChange={(e) => editingTool
                    ? setEditingTool({ ...editingTool, description: e.target.value })
                    : setNewTool({ ...newTool, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="learned">תאריך לימוד</Label>
                <Input
                  id="learned"
                  value={editingTool ? editingTool.learned : newTool.learned}
                  onChange={(e) => editingTool
                    ? setEditingTool({ ...editingTool, learned: e.target.value })
                    : setNewTool({ ...newTool, learned: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="key_points">נקודות מפתח (כל נקודה בשורה חדשה)</Label>
                <Textarea
                  id="key_points"
                  value={editingTool 
                    ? editingTool.key_points.join('\n')
                    : newTool.key_points?.join('\n')
                  }
                  onChange={(e) => {
                    const points = e.target.value.split('\n').filter(point => point.trim() !== '');
                    editingTool
                      ? setEditingTool({ ...editingTool, key_points: points })
                      : setNewTool({ ...newTool, key_points: points });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="implementation">יישום</Label>
                <Textarea
                  id="implementation"
                  value={editingTool ? editingTool.implementation : newTool.implementation}
                  onChange={(e) => editingTool
                    ? setEditingTool({ ...editingTool, implementation: e.target.value })
                    : setNewTool({ ...newTool, implementation: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoUrl">קישור לסרטון</Label>
                <Input
                  id="videoUrl"
                  type="url"
                  placeholder="הכנס קישור לסרטון YouTube או Vimeo"
                  value={editingTool ? editingTool.videoUrl : newTool.videoUrl}
                  onChange={(e) => editingTool
                    ? setEditingTool({ ...editingTool, videoUrl: e.target.value })
                    : setNewTool({ ...newTool, videoUrl: e.target.value })
                  }
                />
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
    </div>
  );
};

export default MentalTools;
