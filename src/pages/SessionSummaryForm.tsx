import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ChevronRight, Home, Save } from 'lucide-react';

const SessionSummaryForm = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    summary_text: '',
    progress_rating: 5,
    achieved_goals: [''],
    future_goals: [''],
    next_session_focus: '',
    additional_notes: '',
    tools_used: [] as {id: string, name: string}[]
  });

  useEffect(() => {
    fetchSessionDetails();
    checkExistingSummary();
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      if (sessionData) {
        setSession(sessionData);
        
        // Fetch player details
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .select('*')
          .eq('id', sessionData.player_id)
          .single();

        if (playerError) throw playerError;
        setPlayer(playerData);
      }
    } catch (error: any) {
      toast.error('שגיאה בטעינת פרטי המפגש');
      console.error('Error fetching session details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingSummary = async () => {
    try {
      const { data, error } = await supabase
        .from('session_summaries')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Existing summary found, populate the form
        setFormData({
          summary_text: data.summary_text || '',
          progress_rating: data.progress_rating || 5,
          achieved_goals: data.achieved_goals?.length ? data.achieved_goals : [''],
          future_goals: data.future_goals?.length ? data.future_goals : [''],
          next_session_focus: data.next_session_focus || '',
          additional_notes: data.additional_notes || '',
          tools_used: data.tools_used || []
        });
      }
    } catch (error) {
      console.error('Error checking for existing summary:', error);
    }
  };

  const handleAddGoal = (type: 'achieved_goals' | 'future_goals') => {
    setFormData({
      ...formData,
      [type]: [...formData[type], '']
    });
  };

  const handleRemoveGoal = (type: 'achieved_goals' | 'future_goals', index: number) => {
    setFormData({
      ...formData,
      [type]: formData[type].filter((_, i) => i !== index)
    });
  };

  const handleGoalChange = (type: 'achieved_goals' | 'future_goals', index: number, value: string) => {
    const newGoals = [...formData[type]];
    newGoals[index] = value;
    setFormData({
      ...formData,
      [type]: newGoals
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.summary_text) {
      toast.error('אנא הוסף סיכום למפגש');
      return;
    }
    
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('לא נמצא משתמש מחובר');
        navigate('/auth');
        return;
      }
      
      // Filter out empty goals
      const filteredAchievedGoals = formData.achieved_goals.filter(goal => goal.trim() !== '');
      const filteredFutureGoals = formData.future_goals.filter(goal => goal.trim() !== '');
      
      const summaryData = {
        coach_id: user.id,
        session_id: sessionId,
        summary_text: formData.summary_text,
        progress_rating: formData.progress_rating,
        achieved_goals: filteredAchievedGoals,
        future_goals: filteredFutureGoals,
        next_session_focus: formData.next_session_focus,
        additional_notes: formData.additional_notes,
        tools_used: formData.tools_used
      };
      
      // Check if summary exists
      const { data: existingSummary } = await supabase
        .from('session_summaries')
        .select('id')
        .eq('session_id', sessionId)
        .single();
      
      let result;
      
      if (existingSummary) {
        // Update existing summary
        result = await supabase
          .from('session_summaries')
          .update(summaryData)
          .eq('id', existingSummary.id);
      } else {
        // Create new summary
        result = await supabase
          .from('session_summaries')
          .insert([summaryData]);
      }
      
      if (result.error) throw result.error;
      
      toast.success('סיכום המפגש נשמר בהצלחה');
      navigate(`/session-details/${sessionId}`);
    } catch (error: any) {
      toast.error('שגיאה בשמירת סיכום המפגש');
      console.error('Error saving session summary:', error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!session || !player) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-500">המפגש המבוקש לא נמצא</p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => navigate('/sessions-list')}>חזרה לרשימת המפגשים</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            title="חזור לדף הקודם"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
            title="חזור לדשבורד"
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>סיכום מפגש עם {player.full_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="summary">סיכום המפגש</Label>
                <Textarea
                  id="summary"
                  placeholder="תאר את מהלך המפגש..."
                  className="h-32"
                  value={formData.summary_text}
                  onChange={(e) => setFormData({...formData, summary_text: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label>דירוג התקדמות</Label>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500 mr-2">1</span>
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.progress_rating}
                    onChange={(e) => setFormData({...formData, progress_rating: parseInt(e.target.value)})}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-500 ml-2">10</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>יעדים שהושגו</Label>
                  <div className="space-y-2 mt-2">
                    {formData.achieved_goals.map((goal, index) => (
                      <div key={`achieved-${index}`} className="flex gap-2">
                        <Input
                          value={goal}
                          onChange={(e) => handleGoalChange('achieved_goals', index, e.target.value)}
                          placeholder="תאר יעד שהושג במפגש..."
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemoveGoal('achieved_goals', index)}
                          disabled={formData.achieved_goals.length === 1}
                        >
                          -
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => handleAddGoal('achieved_goals')}
                    >
                      + הוסף יעד שהושג
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label>יעדים להמשך</Label>
                  <div className="space-y-2 mt-2">
                    {formData.future_goals.map((goal, index) => (
                      <div key={`future-${index}`} className="flex gap-2">
                        <Input
                          value={goal}
                          onChange={(e) => handleGoalChange('future_goals', index, e.target.value)}
                          placeholder="תאר יעד להמשך..."
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemoveGoal('future_goals', index)}
                          disabled={formData.future_goals.length === 1}
                        >
                          -
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => handleAddGoal('future_goals')}
                    >
                      + הוסף יעד להמשך
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="next_focus">נושא למפגש הבא</Label>
                <Input
                  id="next_focus"
                  placeholder="מה יהיה הפוקוס של המפגש הבא?"
                  value={formData.next_session_focus}
                  onChange={(e) => setFormData({...formData, next_session_focus: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="notes">הערות נוספות</Label>
                <Textarea
                  id="notes"
                  placeholder="הערות נוספות על המפגש..."
                  className="h-24"
                  value={formData.additional_notes}
                  onChange={(e) => setFormData({...formData, additional_notes: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/session-details/${sessionId}`)}
                >
                  ביטול
                </Button>
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'שומר...' : 'שמור סיכום'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SessionSummaryForm;
