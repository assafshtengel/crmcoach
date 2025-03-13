
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowRight, Save, SmilePlus } from "lucide-react";
import { MentalStateFormValues } from "@/types/mentalState";

export default function DailyMentalState() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formCompleted, setFormCompleted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formValues, setFormValues] = useState<MentalStateFormValues>({
    feeling_score: 5,
    motivation_level: 5,
    mental_fatigue_level: 5,
    improvement_focus: "",
    has_concerns: false,
    concerns_details: ""
  });

  useEffect(() => {
    const checkTodaySubmission = async () => {
      try {
        setLoading(true);
        const playerSessionStr = localStorage.getItem('playerSession');
        
        if (!playerSessionStr) {
          navigate('/player-auth');
          return;
        }
        
        const playerSession = JSON.parse(playerSessionStr);
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('player_mental_states')
          .select('id')
          .eq('player_id', playerSession.id)
          .gte('created_at', `${today}T00:00:00`)
          .lt('created_at', `${today}T23:59:59`)
          .limit(1);
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          setFormCompleted(true);
        }
      } catch (error: any) {
        console.error('Error checking submission:', error);
        toast({
          variant: "destructive",
          title: "שגיאה בבדיקת טופס",
          description: error.message || "אירעה שגיאה בטעינת הנתונים"
        });
      } finally {
        setLoading(false);
      }
    };
    
    checkTodaySubmission();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const playerSessionStr = localStorage.getItem('playerSession');
      
      if (!playerSessionStr) {
        navigate('/player-auth');
        return;
      }
      
      const playerSession = JSON.parse(playerSessionStr);
      
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('coach_id')
        .eq('id', playerSession.id)
        .single();
        
      if (playerError) {
        throw playerError;
      }
      
      const { error } = await supabase
        .from('player_mental_states')
        .insert({
          player_id: playerSession.id,
          coach_id: playerData.coach_id,
          feeling_score: formValues.feeling_score,
          motivation_level: formValues.motivation_level,
          mental_fatigue_level: formValues.mental_fatigue_level,
          improvement_focus: formValues.improvement_focus,
          has_concerns: formValues.has_concerns,
          concerns_details: formValues.concerns_details
        });
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "הטופס נשלח בהצלחה",
        description: "תודה על מילוי שאלון המצב היומי"
      });
      
      setFormCompleted(true);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בשליחת הטופס",
        description: error.message || "אירעה שגיאה בשליחת הטופס"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getFeelingEmoji = (score: number) => {
    if (score <= 3) return "😟";
    if (score <= 6) return "😐";
    return "😄";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (formCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">תודה על מילוי הטופס!</CardTitle>
              <CardDescription>
                מילאת את שאלון המצב המנטלי היומי שלך בהצלחה.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-center text-muted-foreground">
                תוכל למלא טופס חדש מחר. המאמן שלך יוכל לראות את התשובות שלך.
              </p>
              <Button onClick={() => navigate('/player/profile')} className="mt-4">
                חזרה לפרופיל
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate('/player/profile')}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-center">
            שאלון מצב מנטלי יומי
          </h1>
          <div className="w-9"></div> {/* Spacer for alignment */}
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SmilePlus className="h-5 w-5" />
              איך אתה מרגיש היום?
            </CardTitle>
            <CardDescription>
              מלא את הטופס כדי לשתף את המאמן במצבך המנטלי
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="flex justify-between mb-2">
                    <span>איך אני מרגיש היום?</span>
                    <span className="text-xl">{getFeelingEmoji(formValues.feeling_score)} {formValues.feeling_score}/10</span>
                  </Label>
                  <Slider
                    value={[formValues.feeling_score]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => setFormValues({ ...formValues, feeling_score: value[0] })}
                    className="py-4"
                  />
                </div>

                <div>
                  <Label className="flex justify-between mb-2">
                    <span>רמת מוטיבציה</span>
                    <span>{formValues.motivation_level}/10</span>
                  </Label>
                  <Slider
                    value={[formValues.motivation_level]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => setFormValues({ ...formValues, motivation_level: value[0] })}
                    className="py-4"
                  />
                </div>

                <div>
                  <Label className="flex justify-between mb-2">
                    <span>רמת עייפות מנטלית</span>
                    <span>{formValues.mental_fatigue_level}/10</span>
                  </Label>
                  <Slider
                    value={[formValues.mental_fatigue_level]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => setFormValues({ ...formValues, mental_fatigue_level: value[0] })}
                    className="py-4"
                  />
                </div>

                <div>
                  <Label htmlFor="improvement_focus" className="mb-2 block">
                    מה אני רוצה לשפר היום?
                  </Label>
                  <Textarea
                    id="improvement_focus"
                    value={formValues.improvement_focus}
                    onChange={(e) => setFormValues({ ...formValues, improvement_focus: e.target.value })}
                    placeholder="מה היית רוצה לשפר היום?"
                    className="resize-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="has_concerns">האם יש משהו שמדאיג אותי כרגע?</Label>
                    <Switch
                      id="has_concerns"
                      checked={formValues.has_concerns}
                      onCheckedChange={(checked) => setFormValues({ ...formValues, has_concerns: checked })}
                    />
                  </div>
                  
                  {formValues.has_concerns && (
                    <Textarea
                      value={formValues.concerns_details}
                      onChange={(e) => setFormValues({ ...formValues, concerns_details: e.target.value })}
                      placeholder="פרט מה מדאיג אותך..."
                      className="resize-none mt-2"
                    />
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 mr-2"></div>
                    שולח...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="mr-2 h-4 w-4" />
                    שלח את הטופס
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
