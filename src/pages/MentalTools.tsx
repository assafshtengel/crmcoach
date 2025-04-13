import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription, 
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowRight, Edit, Trash2, PlusCircle, Book } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface MentalTool {
  id: string;
  title: string;
  description: string;
  content: string;
  coach_id: string;
}

const MentalTools = () => {
  const [tools, setTools] = useState<MentalTool[]>([]);
  const [newTool, setNewTool] = useState({ title: '', description: '', content: '' });
  const [editingToolId, setEditingToolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mental_tools')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching mental tools:", error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת הכלים המנטליים",
          variant: "destructive",
        });
      } else {
        setTools(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTool(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateTool = async () => {
    if (!newTool.title || !newTool.description || !newTool.content) {
      toast({
        title: "אזהרה",
        description: "יש למלא את כל השדות",
        variant: "warning",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('mental_tools')
        .insert([{ ...newTool, coach_id: user.id }])
        .select();

      if (error) {
        console.error("Error creating mental tool:", error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה ביצירת הכלי המנטלי",
          variant: "destructive",
        });
      } else {
        setTools([...tools, ...(data || [])]);
        setNewTool({ title: '', description: '', content: '' });
        toast({
          title: "הצלחה",
          description: "הכלי המנטלי נוצר בהצלחה",
        });
      }
    } catch (error: any) {
      console.error("Error during tool creation:", error);
      toast({
        title: "שגיאה",
        description: error.message || "אירעה שגיאה לא צפויה",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTool = async (id: string, updatedTool: Partial<MentalTool>) => {
    try {
      const { data, error } = await supabase
        .from('mental_tools')
        .update(updatedTool)
        .eq('id', id)
        .select();

      if (error) {
        console.error("Error updating mental tool:", error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בעדכון הכלי המנטלי",
          variant: "destructive",
        });
      } else {
        setTools(tools.map(tool => (tool.id === id ? { ...tool, ...updatedTool } : tool)));
        setEditingToolId(null);
        toast({
          title: "הצלחה",
          description: "הכלי המנטלי עודכן בהצלחה",
        });
      }
    } catch (error) {
      console.error("Error during tool update:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה לא צפויה",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTool = async (id: string) => {
    try {
      const { error } = await supabase
        .from('mental_tools')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting mental tool:", error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה במחיקת הכלי המנטלי",
          variant: "destructive",
        });
      } else {
        setTools(tools.filter(tool => tool.id !== id));
        toast({
          title: "הצלחה",
          description: "הכלי המנטלי נמחק בהצלחה",
        });
      }
    } catch (error) {
      console.error("Error during tool deletion:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה לא צפויה",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">כלים מנטליים</h1>

      {/* Create New Tool Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>צור כלי מנטלי חדש</CardTitle>
          <CardDescription>הוסף כלי חדש לספרייה שלך</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">כותרת</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={newTool.title}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">תיאור</Label>
            <Input
              type="text"
              id="description"
              name="description"
              value={newTool.description}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">תוכן</Label>
            <Textarea
              id="content"
              name="content"
              value={newTool.content}
              onChange={handleInputChange}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCreateTool}>צור כלי</Button>
        </CardFooter>
      </Card>

      {/* List of Existing Tools */}
      <div className="grid gap-4">
        {loading ? (
          <p>טוען כלים...</p>
        ) : (
          tools.map(tool => (
            <Card key={tool.id}>
              <CardHeader>
                <CardTitle>{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {editingToolId === tool.id ? (
                  <Textarea
                    defaultValue={tool.content}
                    onBlur={(e) => handleUpdateTool(tool.id, { content: e.target.value })}
                    className="w-full"
                  />
                ) : (
                  <p>{tool.content}</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {editingToolId === tool.id ? (
                  <Button variant="secondary" onClick={() => setEditingToolId(null)}>
                    בטל
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => setEditingToolId(tool.id)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      ערוך
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteTool(tool.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      מחק
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MentalTools;
