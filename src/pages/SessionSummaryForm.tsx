import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Tool {
  id: string;
  name: string;
}

interface SessionSummaryFormProps {
  sessionId?: string;
}

const SessionSummaryForm: React.FC<SessionSummaryFormProps> = ({ sessionId }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [player, setPlayer] = useState<any>(null);
  const [summary, setSummary] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [newTool, setNewTool] = useState('');
  const [sessionId2, setSessionId2] = useState<string>(sessionId || id || '');

  useEffect(() => {
    if (sessionId2) {
      fetchSessionData();
    }
    fetchTools();
  }, [sessionId2]);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          players(*)
        `)
        .eq('id', sessionId2)
        .single();

      if (error) {
        throw error;
      }

      setSession(data);
      setPlayer(data.players);
      
      // Check if there's an existing summary for this session
      const { data: summaryData, error: summaryError } = await supabase
        .from('session_summaries')
        .select('summary, tools')
        .eq('session_id', sessionId2)
        .single();

      if (summaryData) {
        setSummary(summaryData.summary || '');
        
        // Fix the typing issue here by ensuring tools is treated as an array
        if (summaryData.tools) {
          // Ensure tools is properly cast as an array of the correct type
          const toolsArray = Array.isArray(summaryData.tools) 
            ? summaryData.tools as { id: string; name: string }[] 
            : [];
          
          setSelectedTools(toolsArray.map(tool => tool.id));
        }
      }
    } catch (error) {
      console.error('Error fetching session data:', error);
      toast.error('שגיאה בטעינת נתוני המפגש');
    } finally {
      setLoading(false);
    }
  };

  const fetchTools = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }
      
      const { data, error } = await supabase
        .from('mental_tools')
        .select('*')
        .eq('coach_id', user.id);

      if (error) {
        throw error;
      }

      setTools(data || []);
    } catch (error) {
      console.error('Error fetching tools:', error);
      toast.error('שגיאה בטעינת רשימת הכלים');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
  
    try {
      const { data: { user } } = await supabase.auth.getUser();
  
      if (!user) {
        navigate('/auth');
        return;
      }
  
      // Prepare the tools data to be saved
      const toolsToSave = selectedTools.map(toolId => {
        const tool = tools.find(t => t.id === toolId);
        return tool ? { id: tool.id, name: tool.name } : null;
      }).filter(tool => tool !== null);
  
      const { error } = await supabase
        .from('session_summaries')
        .upsert([
          {
            session_id: sessionId2,
            coach_id: user.id,
            summary: summary,
            tools: toolsToSave,
          },
        ], { onConflict: 'session_id' });
  
      if (error) {
        throw error;
      }
  
      toast.success('סיכום המפגש נשמר בהצלחה!');
      navigate('/all-meeting-summaries');
    } catch (error) {
      console.error('Error submitting session summary:', error);
      toast.error('שגיאה בשמירת סיכום המפגש');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToolSelect = (toolId: string) => {
    setSelectedTools(prev => {
      if (prev.includes(toolId)) {
        return prev.filter(id => id !== toolId);
      } else {
        return [...prev, toolId];
      }
    });
  };

  const handleCreateTool = async () => {
    if (!newTool.trim()) {
      toast.error('שם הכלי לא יכול להיות ריק');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('mental_tools')
        .insert([{ coach_id: user.id, name: newTool }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setTools(prevTools => [...prevTools, data]);
      setSelectedTools(prevSelectedTools => [...prevSelectedTools, data.id]);
      setNewTool('');
      toast.success('הכלי נוצר בהצלחה!');
    } catch (error) {
      console.error('Error creating tool:', error);
      toast.error('שגיאה ביצירת הכלי');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">טוען נתונים...</div>;
  }

  if (!session || !player) {
    return <div className="min-h-screen flex items-center justify-center">המפגש לא נמצא</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">סיכום מפגש</h1>
      <div className="mb-4">
        <strong>שחקן:</strong> {player?.full_name}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="summary">תקציר המפגש:</Label>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="סכם את עיקרי המפגש..."
            className="w-full"
          />
        </div>

        <div>
          <Label>כלים מנטליים שהשתמשו בהם:</Label>
          <div className="flex flex-wrap gap-2">
            {tools.map(tool => (
              <div key={tool.id} className="flex items-center space-x-2">
                <Input
                  type="checkbox"
                  id={`tool-${tool.id}`}
                  checked={selectedTools.includes(tool.id)}
                  onChange={() => handleToolSelect(tool.id)}
                  className="h-4 w-4"
                />
                <Label htmlFor={`tool-${tool.id}`} className="cursor-pointer">{tool.name}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="new-tool">כלי חדש:</Label>
          <div className="flex gap-2">
            <Input
              type="text"
              id="new-tool"
              placeholder="שם הכלי"
              value={newTool}
              onChange={(e) => setNewTool(e.target.value)}
            />
            <Button type="button" onClick={handleCreateTool} variant="secondary">
              צור כלי
            </Button>
          </div>
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? 'שומר...' : 'שמור סיכום'}
        </Button>
      </form>
    </div>
  );
};

export default SessionSummaryForm;
