import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Circle, Plus, PlusCircle, ArrowLeft, Trash2, Edit } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Goal, Milestone, PlayerGoal } from '@/types/goal';
import { toast } from 'sonner';
import { Progress } from "@/components/ui/progress";

const PlayerGoals = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("short-term");
  const [shortTermGoals, setShortTermGoals] = useState<Goal[]>([]);
  const [longTermGoals, setLongTermGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [isEditGoalOpen, setIsEditGoalOpen] = useState(false);
  const [isEditMilestoneOpen, setIsEditMilestoneOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [formError, setFormError] = useState('');
  const [playerGoalId, setPlayerGoalId] = useState<string | null>(null);

  // Form values for goal
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [goalCriteria, setGoalCriteria] = useState('');

  // Form values for milestone
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDescription, setMilestoneDescription] = useState('');
  const [milestoneDueDate, setMilestoneDueDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const playerSessionStr = localStorage.getItem('playerSession');
      
      if (!playerSessionStr) {
        navigate('/player-auth');
        return;
      }
      
      const playerSession = JSON.parse(playerSessionStr);
      const playerId = playerSession.id;
      
      try {
        setIsLoading(true);
        
        // Fetch player's goals from player_goals table
        const { data: playerGoalsData, error: playerGoalsError } = await supabase
          .from('player_goals')
          .select('*')
          .eq('player_id', playerId)
          .single();
        
        if (playerGoalsError && playerGoalsError.code !== 'PGRST116') {
          throw playerGoalsError;
        }
        
        if (playerGoalsData) {
          setPlayerGoalId(playerGoalsData.id);

          // Parse JSON data from the playerGoalsData
          const shortGoals = typeof playerGoalsData.short_term_goals === 'string' 
            ? JSON.parse(playerGoalsData.short_term_goals) 
            : Array.isArray(playerGoalsData.short_term_goals) 
              ? playerGoalsData.short_term_goals 
              : [];
          
          const longGoals = typeof playerGoalsData.long_term_goals === 'string' 
            ? JSON.parse(playerGoalsData.long_term_goals) 
            : Array.isArray(playerGoalsData.long_term_goals) 
              ? playerGoalsData.long_term_goals 
              : [];
          
          // Add progress properties if they don't exist
          const shortGoalsWithProgress = shortGoals.map((goal: any) => ({
            ...goal,
            progress: goal.progress || 0
          }));
          
          const longGoalsWithProgress = longGoals.map((goal: any) => ({
            ...goal,
            progress: goal.progress || 0
          }));

          setShortTermGoals(shortGoalsWithProgress);
          setLongTermGoals(longGoalsWithProgress);
          
          // Fetch all milestones for any goals
          const goalIds = [
            ...shortGoalsWithProgress.map((g: any) => g.id), 
            ...longGoalsWithProgress.map((g: any) => g.id)
          ].filter(Boolean);
          
          if (goalIds.length > 0) {
            const { data: milestonesData, error: milestonesError } = await supabase
              .from('goal_milestones')
              .select('*')
              .in('goal_id', goalIds);
            
            if (milestonesError) throw milestonesError;
            
            if (milestonesData) {
              setMilestones(milestonesData);
            }
          }
        } else {
          // Create a new player_goals record if none exists
          const { data: newPlayerGoals, error: createError } = await supabase
            .from('player_goals')
            .insert({
              player_id: playerId,
              short_term_goals: [],
              long_term_goals: []
            })
            .select()
            .single();
          
          if (createError) throw createError;
          
          if (newPlayerGoals) {
            setPlayerGoalId(newPlayerGoals.id);
            setShortTermGoals([]);
            setLongTermGoals([]);
          }
        }
      } catch (error) {
        console.error('Error fetching goals:', error);
        toast.error('שגיאה בטעינת המטרות');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  const handleAddGoal = async () => {
    if (!goalTitle) {
      setFormError('נא למלא כותרת');
      return;
    }
    
    try {
      const newGoal: Goal = {
        id: crypto.randomUUID(),
        title: goalTitle,
        description: goalDescription || undefined,
        target_date: goalDate || undefined,
        success_criteria: goalCriteria || undefined,
        is_completed: false,
        progress: 0,
        created_at: new Date().toISOString()
      };
      
      let updatedShortTermGoals = [...shortTermGoals];
      let updatedLongTermGoals = [...longTermGoals];
      
      if (activeTab === 'short-term') {
        updatedShortTermGoals = [...shortTermGoals, newGoal];
      } else {
        updatedLongTermGoals = [...longTermGoals, newGoal];
      }
      
      const { error } = await supabase
        .from('player_goals')
        .update({
          short_term_goals: updatedShortTermGoals,
          long_term_goals: updatedLongTermGoals
        })
        .eq('id', playerGoalId);
      
      if (error) throw error;
      
      if (activeTab === 'short-term') {
        setShortTermGoals(updatedShortTermGoals);
      } else {
        setLongTermGoals(updatedLongTermGoals);
      }
      
      resetGoalForm();
      setIsAddGoalOpen(false);
      toast.success('המטרה נוספה בהצלחה');
      
    } catch (error) {
      console.error('Error adding goal:', error);
      toast.error('שגיאה בהוספת המטרה');
    }
  };

  const handleEditGoal = async () => {
    if (!selectedGoal || !goalTitle) {
      setFormError('נא למלא כותרת');
      return;
    }
    
    try {
      const updatedGoal: Goal = {
        ...selectedGoal,
        title: goalTitle,
        description: goalDescription || undefined,
        target_date: goalDate || undefined,
        success_criteria: goalCriteria || undefined,
      };
      
      let updatedShortTermGoals = [...shortTermGoals];
      let updatedLongTermGoals = [...longTermGoals];
      
      if (activeTab === 'short-term') {
        updatedShortTermGoals = shortTermGoals.map(g => 
          g.id === selectedGoal.id ? updatedGoal : g
        );
      } else {
        updatedLongTermGoals = longTermGoals.map(g => 
          g.id === selectedGoal.id ? updatedGoal : g
        );
      }
      
      const { error } = await supabase
        .from('player_goals')
        .update({
          short_term_goals: updatedShortTermGoals,
          long_term_goals: updatedLongTermGoals
        })
        .eq('id', playerGoalId);
      
      if (error) throw error;
      
      if (activeTab === 'short-term') {
        setShortTermGoals(updatedShortTermGoals);
      } else {
        setLongTermGoals(updatedLongTermGoals);
      }
      
      resetGoalForm();
      setIsEditGoalOpen(false);
      toast.success('המטרה עודכנה בהצלחה');
      
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('שגיאה בעדכון המטרה');
    }
  };

  const handleDeleteGoal = async (goalId: string | undefined) => {
    if (!goalId) return;
    
    try {
      // Delete all milestones associated with this goal
      await supabase
        .from('goal_milestones')
        .delete()
        .eq('goal_id', goalId);
      
      let updatedShortTermGoals = [...shortTermGoals];
      let updatedLongTermGoals = [...longTermGoals];
      
      if (activeTab === 'short-term') {
        updatedShortTermGoals = shortTermGoals.filter(g => g.id !== goalId);
      } else {
        updatedLongTermGoals = longTermGoals.filter(g => g.id !== goalId);
      }
      
      const { error } = await supabase
        .from('player_goals')
        .update({
          short_term_goals: updatedShortTermGoals,
          long_term_goals: updatedLongTermGoals
        })
        .eq('id', playerGoalId);
      
      if (error) throw error;
      
      if (activeTab === 'short-term') {
        setShortTermGoals(updatedShortTermGoals);
      } else {
        setLongTermGoals(updatedLongTermGoals);
      }
      
      // Also remove milestones associated with this goal
      setMilestones(prev => prev.filter(m => m.goal_id !== goalId));
      
      toast.success('המטרה נמחקה בהצלחה');
      
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('שגיאה במחיקת המטרה');
    }
  };

  const handleAddMilestone = async () => {
    if (!selectedGoal || !milestoneTitle) {
      setFormError('נא למלא כותרת');
      return;
    }
    
    try {
      const newMilestone: Milestone = {
        goal_id: selectedGoal.id || '',
        title: milestoneTitle,
        description: milestoneDescription || undefined,
        due_date: milestoneDueDate || undefined,
        is_completed: false,
      };
      
      const { data, error } = await supabase
        .from('goal_milestones')
        .insert(newMilestone)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        setMilestones(prev => [...prev, data]);
      }
      
      resetMilestoneForm();
      setIsAddMilestoneOpen(false);
      toast.success('אבן הדרך נוספה בהצלחה');
      
      // Update goal progress
      updateGoalProgress(selectedGoal.id);
      
    } catch (error) {
      console.error('Error adding milestone:', error);
      toast.error('שגיאה בהוספת אבן הדרך');
    }
  };

  const handleEditMilestone = async () => {
    if (!selectedMilestone || !milestoneTitle) {
      setFormError('נא למלא כותרת');
      return;
    }
    
    try {
      const updatedMilestone: Milestone = {
        ...selectedMilestone,
        title: milestoneTitle,
        description: milestoneDescription || undefined,
        due_date: milestoneDueDate || undefined,
      };
      
      const { error } = await supabase
        .from('goal_milestones')
        .update(updatedMilestone)
        .eq('id', selectedMilestone.id);
      
      if (error) throw error;
      
      setMilestones(prev => 
        prev.map(m => m.id === selectedMilestone.id ? updatedMilestone : m)
      );
      
      resetMilestoneForm();
      setIsEditMilestoneOpen(false);
      toast.success('אבן הדרך עודכנה בהצלחה');
      
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast.error('שגיאה בעדכון אבן הדרך');
    }
  };

  const handleDeleteMilestone = async (milestoneId: string | undefined) => {
    if (!milestoneId) return;
    
    try {
      const milestoneToDelete = milestones.find(m => m.id === milestoneId);
      
      const { error } = await supabase
        .from('goal_milestones')
        .delete()
        .eq('id', milestoneId);
      
      if (error) throw error;
      
      setMilestones(prev => prev.filter(m => m.id !== milestoneId));
      toast.success('אבן הדרך נמחקה בהצלחה');
      
      // Update goal progress if we know which goal this milestone belonged to
      if (milestoneToDelete?.goal_id) {
        updateGoalProgress(milestoneToDelete.goal_id);
      }
      
    } catch (error) {
      console.error('Error deleting milestone:', error);
      toast.error('שגיאה במחיקת אבן הדרך');
    }
  };

  const handleToggleMilestoneCompletion = async (milestone: Milestone) => {
    try {
      const updatedMilestone = {
        ...milestone,
        is_completed: !milestone.is_completed
      };
      
      const { error } = await supabase
        .from('goal_milestones')
        .update(updatedMilestone)
        .eq('id', milestone.id);
      
      if (error) throw error;
      
      setMilestones(prev => 
        prev.map(m => m.id === milestone.id ? updatedMilestone : m)
      );
      
      // Update goal progress
      updateGoalProgress(milestone.goal_id);
      
    } catch (error) {
      console.error('Error toggling milestone completion:', error);
      toast.error('שגיאה בעדכון סטטוס אבן הדרך');
    }
  };

  const updateGoalProgress = async (goalId: string | undefined) => {
    if (!goalId) return;
    
    const goalMilestones = milestones.filter(m => m.goal_id === goalId);
    
    if (goalMilestones.length === 0) return;
    
    const completedCount = goalMilestones.filter(m => m.is_completed).length;
    const progress = Math.round((completedCount / goalMilestones.length) * 100);
    
    try {
      // Find the goal in either short or long term goals
      let goalFound = false;
      
      // Check short term goals
      let updatedShortTermGoals = [...shortTermGoals];
      for (let i = 0; i < updatedShortTermGoals.length; i++) {
        if (updatedShortTermGoals[i].id === goalId) {
          updatedShortTermGoals[i] = {
            ...updatedShortTermGoals[i],
            progress
          };
          goalFound = true;
          break;
        }
      }
      
      // Check long term goals if not found
      let updatedLongTermGoals = [...longTermGoals];
      if (!goalFound) {
        for (let i = 0; i < updatedLongTermGoals.length; i++) {
          if (updatedLongTermGoals[i].id === goalId) {
            updatedLongTermGoals[i] = {
              ...updatedLongTermGoals[i],
              progress
            };
            goalFound = true;
            break;
          }
        }
      }
      
      if (goalFound) {
        const { error } = await supabase
          .from('player_goals')
          .update({
            short_term_goals: updatedShortTermGoals,
            long_term_goals: updatedLongTermGoals
          })
          .eq('id', playerGoalId);
        
        if (error) throw error;
        
        setShortTermGoals(updatedShortTermGoals);
        setLongTermGoals(updatedLongTermGoals);
      }
      
    } catch (error) {
      console.error('Error updating goal progress:', error);
      toast.error('שגיאה בעדכון התקדמות המטרה');
    }
  };

  const resetGoalForm = () => {
    setGoalTitle('');
    setGoalDescription('');
    setGoalDate('');
    setGoalCriteria('');
    setFormError('');
  };

  const resetMilestoneForm = () => {
    setMilestoneTitle('');
    setMilestoneDescription('');
    setMilestoneDueDate('');
    setFormError('');
  };

  const editGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setGoalTitle(goal.title || '');
    setGoalDescription(goal.description || '');
    setGoalDate(goal.target_date || '');
    setGoalCriteria(goal.success_criteria || '');
    setIsEditGoalOpen(true);
  };

  const editMilestone = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setMilestoneTitle(milestone.title || '');
    setMilestoneDescription(milestone.description || '');
    setMilestoneDueDate(milestone.due_date || '');
    setIsEditMilestoneOpen(true);
  };

  const getGoalMilestones = (goalId: string | undefined) => {
    if (!goalId) return [];
    return milestones.filter(m => m.goal_id === goalId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/player/profile')} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            חזרה
          </Button>
          <h1 className="text-2xl font-bold">המטרות שלי</h1>
        </div>

        <Tabs defaultValue="short-term" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="short-term">מטרות לטווח קצר</TabsTrigger>
            <TabsTrigger value="long-term">מטרות לטווח ארוך</TabsTrigger>
          </TabsList>
          
          <TabsContent value="short-term" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">מטרות לטווח קצר</CardTitle>
                <Button variant="outline" size="sm" onClick={() => {
                  resetGoalForm();
                  setIsAddGoalOpen(true);
                }}>
                  <PlusCircle className="h-4 w-4 mr-1" />
                  הוסף מטרה חדשה
                </Button>
              </CardHeader>
              <CardContent>
                {shortTermGoals.length === 0 ? (
                  <div className="text-center p-8 bg-muted/20 rounded-lg border border-dashed">
                    <p className="text-muted-foreground">אין מטרות לטווח קצר עדיין</p>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => {
                        resetGoalForm();
                        setIsAddGoalOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      הוסף מטרה ראשונה
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {shortTermGoals.map(goal => (
                      <Card key={goal.id} className="mb-4 overflow-hidden">
                        <div className="border-b p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <h3 className="font-medium text-lg">{goal.title}</h3>
                              {goal.description && <p className="text-muted-foreground text-sm">{goal.description}</p>}
                              {goal.target_date && (
                                <div className="flex items-center text-muted-foreground text-xs">
                                  <span>תאריך יעד: {format(new Date(goal.target_date), 'dd/MM/yyyy', { locale: he })}</span>
                                </div>
                              )}
                              {goal.success_criteria && (
                                <div className="mt-2">
                                  <span className="text-xs font-medium">קריטריון להצלחה:</span>
                                  <p className="text-sm">{goal.success_criteria}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => editGoal(goal)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                onClick={() => handleDeleteGoal(goal.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span>התקדמות</span>
                              <span>{goal.progress}%</span>
                            </div>
                            <Progress value={goal.progress} className="h-2" />
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gray-50">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-medium">אבני דרך</h4>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => {
                                setSelectedGoal(goal);
                                resetMilestoneForm();
                                setIsAddMilestoneOpen(true);
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              הוסף אבן דרך
                            </Button>
                          </div>
                          
                          {getGoalMilestones(goal.id).length === 0 ? (
                            <p className="text-muted-foreground text-sm text-center py-2">אין אבני דרך עדיין</p>
                          ) : (
                            <ul className="space-y-2">
                              {getGoalMilestones(goal.id).map(milestone => (
                                <li key={milestone.id} className="flex items-start justify-between bg-white p-2 rounded border text-sm">
                                  <div className="flex items-start gap-2">
                                    <button
                                      onClick={() => handleToggleMilestoneCompletion(milestone)}
                                      className="mt-0.5 flex-shrink-0"
                                    >
                                      {milestone.is_completed ? (
                                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                                      ) : (
                                        <Circle className="h-4 w-4 text-gray-300" />
                                      )}
                                    </button>
                                    <div>
                                      <div className={`font-medium ${milestone.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                        {milestone.title}
                                      </div>
                                      {milestone.description && (
                                        <p className={`text-xs mt-1 ${milestone.is_completed ? 'line-through text-muted-foreground' : 'text-gray-600'}`}>
                                          {milestone.description}
                                        </p>
                                      )}
                                      {milestone.due_date && (
                                        <p className="text-xs text-gray-400 mt-1">
                                          תאריך יעד: {format(new Date(milestone.due_date), 'dd/MM/yyyy', { locale: he })}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => editMilestone(milestone)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="h-6 w-6 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                      onClick={() => handleDeleteMilestone(milestone.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="long-term" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">מטרות לטווח ארוך</CardTitle>
                <Button variant="outline" size="sm" onClick={() => {
                  resetGoalForm();
                  setIsAddGoalOpen(true);
                }}>
                  <PlusCircle className="h-4 w-4 mr-1" />
                  הוסף מטרה חדשה
                </Button>
              </CardHeader>
              <CardContent>
                {longTermGoals.length === 0 ? (
                  <div className="text-center p-8 bg-muted/20 rounded-lg border border-dashed">
                    <p className="text-muted-foreground">אין מטרות לטווח ארוך עדיין</p>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => {
                        resetGoalForm();
                        setIsAddGoalOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      הוסף מטרה ראשונה
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {longTermGoals.map(goal => (
                      <Card key={goal.id} className="mb-4 overflow-hidden">
                        <div className="border-b p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <h3 className="font-medium text-lg">{goal.title}</h3>
                              {goal.description && <p className="text-muted-foreground text-sm">{goal.description}</p>}
                              {goal.target_date && (
                                <div className="flex items-center text-muted-foreground text-xs">
                                  <span>תאריך יעד: {format(new Date(goal.target_date), 'dd/MM/yyyy', { locale: he })}</span>
                                </div>
                              )}
                              {goal.success_criteria && (
                                <div className="mt-2">
                                  <span className="text-xs font-medium">קריטריון להצלחה:</span>
                                  <p className="text-sm">{goal.success_criteria}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => editGoal(goal)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                onClick={() => handleDeleteGoal(goal.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span>התקדמות</span>
                              <span>{goal.progress}%</span>
                            </div>
                            <Progress value={goal.progress} className="h-2" />
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gray-50">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-medium">אבני דרך</h4>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => {
                                setSelectedGoal(goal);
                                resetMilestoneForm();
                                setIsAddMilestoneOpen(true);
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              הוסף אבן דרך
                            </Button>
                          </div>
                          
                          {getGoalMilestones(goal.id).length === 0 ? (
                            <p className="text-muted-foreground text-sm text-center py-2">אין אבני דרך עדיין</p>
                          ) : (
                            <ul className="space-y-2">
                              {getGoalMilestones(goal.id).map(milestone => (
                                <li key={milestone.id} className="flex items-start justify-between bg-white p-2 rounded border text-sm">
                                  <div className="flex items-start gap-2">
                                    <button
                                      onClick={() => handleToggleMilestoneCompletion(milestone)}
                                      className="mt-0.5 flex-shrink-0"
                                    >
                                      {milestone.is_completed ? (
                                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                                      ) : (
                                        <Circle className="h-4 w-4 text-gray-300" />
                                      )}
                                    </button>
                                    <div>
                                      <div className={`font-medium ${milestone.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                        {milestone.title}
                                      </div>
                                      {milestone.description && (
                                        <p className={`text-xs mt-1 ${milestone.is_completed ? 'line-through text-muted-foreground' : 'text-gray-600'}`}>
                                          {milestone.description}
                                        </p>
                                      )}
                                      {milestone.due_date && (
                                        <p className="text-xs text-gray-400 mt-1">
                                          תאריך יעד: {format(new Date(milestone.due_date), 'dd/MM/yyyy', { locale: he })}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => editMilestone(milestone)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="h-6 w-6 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                      onClick={() => handleDeleteMilestone(milestone.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Goal Dialog */}
      <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>הוספת מטרה חדשה</DialogTitle>
            <DialogDescription>
              הגדר מטרה חדשה ל{activeTab === 'short-term' ? 'טווח קצר' : 'טווח ארוך'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">כותרת המטרה*</Label>
              <Input
                id="title"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">תיאור</Label>
              <Textarea
                id="description"
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                placeholder="תאר את המטרה בכמה מילים"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">תאריך יעד</Label>
              <Input
                id="date"
                type="date"
                value={goalDate}
                onChange={(e) => setGoalDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="criteria">קריטריון להצלחה</Label>
              <Textarea
                id="criteria"
                value={goalCriteria}
                onChange={(e) => setGoalCriteria(e.target.value)}
                placeholder="כיצד תדע שהשגת את המטרה?"
              />
            </div>
            {formError && <p className="text-destructive text-sm">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddGoalOpen(false)}>ביטול</Button>
            <Button onClick={handleAddGoal}>הוסף מטרה</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={isEditGoalOpen} onOpenChange={setIsEditGoalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>עריכת מטרה</DialogTitle>
            <DialogDescription>
              עדכן את פרטי המטרה
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-title">כותרת המטרה*</Label>
              <Input
                id="edit-title"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">תיאור</Label>
              <Textarea
                id="edit-description"
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                placeholder="תאר את המטרה בכמה מילים"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">תאריך יעד</Label>
              <Input
                id="edit-date"
                type="date"
                value={goalDate}
                onChange={(e) => setGoalDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-criteria">קריטריון להצלחה</Label>
              <Textarea
                id="edit-criteria"
                value={goalCriteria}
                onChange={(e) => setGoalCriteria(e.target.value)}
                placeholder="כיצד תדע שהשגת את המטרה?"
              />
            </div>
            {formError && <p className="text-destructive text-sm">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditGoalOpen(false)}>ביטול</Button>
            <Button onClick={handleEditGoal}>שמור שינויים</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Milestone Dialog */}
      <Dialog open={isAddMilestoneOpen} onOpenChange={setIsAddMilestoneOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>הוספת אבן דרך</DialogTitle>
            <DialogDescription>
              הוסף אבן דרך למטרה: {selectedGoal?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="milestone-title">כותרת אבן הדרך*</Label>
              <Input
                id="milestone-title"
                value={milestoneTitle}
                onChange={(e) => setMilestoneTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="milestone-description">תיאור</Label>
              <Textarea
                id="milestone-description"
                value={milestoneDescription}
                onChange={(e) => setMilestoneDescription(e.target.value)}
                placeholder="תאר את אבן הדרך בכמה מילים"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="milestone-date">תאריך יעד</Label>
              <Input
                id="milestone-date"
                type="date"
                value={milestoneDueDate}
                onChange={(e) => setMilestoneDueDate(e.target.value)}
              />
            </div>
            {formError && <p className="text-destructive text-sm">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMilestoneOpen(false)}>ביטול</Button>
            <Button onClick={handleAddMilestone}>הוסף אבן דרך</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Milestone Dialog */}
      <Dialog open={isEditMilestoneOpen} onOpenChange={setIsEditMilestoneOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>עריכת אבן דרך</DialogTitle>
            <DialogDescription>
              עדכן את פרטי אבן הדרך
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-milestone-title">כותרת אבן הדרך*</Label>
              <Input
                id="edit-milestone-title"
                value={milestoneTitle}
                onChange={(e) => setMilestoneTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-milestone-description">תיאור</Label>
              <Textarea
                id="edit-milestone-description"
                value={milestoneDescription}
                onChange={(e) => setMilestoneDescription(e.target.value)}
                placeholder="תאר את אבן הדרך בכמה מילים"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-milestone-date">תאריך יעד</Label>
              <Input
                id="edit-milestone-date"
                type="date"
                value={milestoneDueDate}
                onChange={(e) => setMilestoneDueDate(e.target.value)}
              />
            </div>
            {formError && <p className="text-destructive text-sm">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMilestoneOpen(false)}>ביטול</Button>
            <Button onClick={handleEditMilestone}>שמור שינויים</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlayerGoals;
