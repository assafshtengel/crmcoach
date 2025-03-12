
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format } from "date-fns";
import { Brain, CheckCircle, AlertTriangle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const DailyMentalState = () => {
  const [playerData, setPlayerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [alreadyFilledToday, setAlreadyFilledToday] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  // Form state
  const [mentalState, setMentalState] = useState({
    feeling_score: 7,
    motivation_level: 7,
    mental_fatigue_level: 5,
    has_concerns: false,
    concerns_details: "",
    improvement_focus: "",
  });

  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        const playerSessionStr = localStorage.getItem('playerSession');
        
        if (!playerSessionStr) {
          navigate('/player-auth');
          return;
        }
        
        const playerSession = JSON.parse(playerSessionStr);
        
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerSession.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        setPlayerData(data);
        
        // Check if player has already filled out the form today
        const today = new Date().toISOString().split('T')[0];
        
        const { data: todayEntry, error: checkError } = await supabase
          .from('player_mental_states')
          .select('id')
          .eq('player_id', playerSession.id)
          .gte('created_at', `${today}T00:00:00`)
          .lt('created_at', `${today}T23:59:59`)
          .limit(1);
          
        if (checkError) {
          console.error('Error checking today\'s entry:', checkError);
        } else {
          setAlreadyFilledToday(todayEntry && todayEntry.length > 0);
        }
      } catch (error: any) {
        console.error('Error loading player data:', error);
        toast.error(error.message || "אירעה שגיאה בטעינת נתוני השחקן");
      } finally {
        setLoading(false);
      }
    };
    
    loadPlayerData();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerData?.id) {
      toast.error("לא ניתן למצוא את פרטי השחקן");
      return;
    }

    try {
      setSubmitting(true);
      
      const { data, error } = await supabase
        .from('player_mental_states')
        .insert({
          player_id: playerData.id,
          coach_id: playerData.coach_id,
          feeling_score: mentalState.feeling_score,
          motivation_level: mentalState.motivation_level,
          mental_fatigue_level: mentalState.mental_fatigue_level,
          has_concerns: mentalState.has_concerns,
          concerns_details: mentalState.concerns_details,
          improvement_focus: mentalState.improvement_focus,
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("השאלון היומי הוגש בהצלחה!");
      setAlreadyFilledToday(true);
    } catch (error: any) {
      console.error('Error submitting mental state:', error);
      toast.error(error.message || "אירעה שגיאה בשמירת השאלון");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToProfile = () => {
    navigate('/player-profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">לא נמצאו נתוני שחקן</h2>
          <Button onClick={() => navigate('/player-auth')} className="mt-4">
            חזרה לדף התחברות
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button variant="outline" onClick={handleBackToProfile}>
            חזרה לפרופיל
          </Button>
          <h1 className="text-3xl font-bold text-center flex items-center gap-2">
            <Brain className="h-8 w-8" />
            מצב מנטלי יומי
          </h1>
          <div className="w-28"></div> {/* Spacer for alignment */}
        </div>

        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle>שאלון מצב מנטלי יומי</CardTitle>
            <CardDescription>
              עזור למאמן שלך להבין את המצב המנטלי שלך היום
            </CardDescription>
          </CardHeader>
          <CardContent>
            {alreadyFilledToday ? (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <div className="bg-green-100 rounded-full p-4 mb-4">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="text-xl font-medium mb-2">השאלון היומי כבר הוגש היום</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  תודה על מילוי השאלון היומי! המאמן שלך יוכל לראות את התשובות שלך ולהתאים את האימון בהתאם.
                </p>
                <Button onClick={handleBackToProfile}>
                  חזרה לפרופיל
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="feeling_score">איך אתה מרגיש היום בסולם של 1-10?</Label>
                    <span className={
                      mentalState.feeling_score >= 8 ? "text-green-500" :
                      mentalState.feeling_score >= 6 ? "text-blue-500" :
                      mentalState.feeling_score >= 4 ? "text-yellow-500" :
                      "text-red-500"
                    }>
                      {mentalState.feeling_score}/10
                    </span>
                  </div>
                  <Slider
                    id="feeling_score"
                    value={[mentalState.feeling_score]}
                    max={10}
                    step={1}
                    onValueChange={(value) => setMentalState({...mentalState, feeling_score: value[0]})}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>נמוך</span>
                    <span>גבוה</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="motivation_level">רמת המוטיבציה שלך היום?</Label>
                    <span className={
                      mentalState.motivation_level >= 8 ? "text-green-500" :
                      mentalState.motivation_level >= 6 ? "text-blue-500" :
                      mentalState.motivation_level >= 4 ? "text-yellow-500" :
                      "text-red-500"
                    }>
                      {mentalState.motivation_level}/10
                    </span>
                  </div>
                  <Slider
                    id="motivation_level"
                    value={[mentalState.motivation_level]}
                    max={10}
                    step={1}
                    onValueChange={(value) => setMentalState({...mentalState, motivation_level: value[0]})}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>נמוך</span>
                    <span>גבוה</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="mental_fatigue_level">רמת העייפות המנטלית שלך?</Label>
                    <span className={
                      mentalState.mental_fatigue_level > 7 ? "text-red-500" :
                      mentalState.mental_fatigue_level > 4 ? "text-yellow-500" :
                      "text-green-500"
                    }>
                      {mentalState.mental_fatigue_level}/10
                    </span>
                  </div>
                  <Slider
                    id="mental_fatigue_level"
                    value={[mentalState.mental_fatigue_level]}
                    max={10}
                    step={1}
                    onValueChange={(value) => setMentalState({...mentalState, mental_fatigue_level: value[0]})}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>רענן</span>
                    <span>עייף</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={mentalState.has_concerns}
                      onChange={(e) => setMentalState({...mentalState, has_concerns: e.target.checked})}
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    האם יש משהו שמטריד אותך היום?
                  </Label>
                  
                  {mentalState.has_concerns && (
                    <div className="pt-4 pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <Label htmlFor="concerns_details">פרט את מה שמטריד אותך:</Label>
                      </div>
                      <Textarea
                        id="concerns_details"
                        value={mentalState.concerns_details}
                        onChange={(e) => setMentalState({...mentalState, concerns_details: e.target.value})}
                        placeholder="תאר את מה שמטריד אותך כדי שהמאמן יוכל לעזור"
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="h-5 w-5 text-blue-500" />
                    <Label htmlFor="improvement_focus">על מה אתה רוצה להתמקד בשיפור היום?</Label>
                  </div>
                  <Textarea
                    id="improvement_focus"
                    value={mentalState.improvement_focus}
                    onChange={(e) => setMentalState({...mentalState, improvement_focus: e.target.value})}
                    placeholder="תאר תחום או מיומנות שהיית רוצה להתמקד בשיפור היום"
                  />
                </div>

                <CardFooter className="px-0 pt-4 pb-0">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={submitting}
                  >
                    {submitting ? "שולח..." : "שלח שאלון"}
                  </Button>
                </CardFooter>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>למה חשוב למלא את השאלון היומי?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2 mt-1">
                <Brain className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">מודעות עצמית</h3>
                <p className="text-sm text-muted-foreground">
                  מילוי השאלון היומי עוזר לך להיות יותר מודע למצב המנטלי שלך ולזהות דפוסים.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-full p-2 mt-1">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">אימון מותאם אישית</h3>
                <p className="text-sm text-muted-foreground">
                  המאמן שלך יכול להתאים את האימון בהתאם למצב המנטלי היומי שלך.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 rounded-full p-2 mt-1">
                <MessageCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">תקשורת טובה יותר</h3>
                <p className="text-sm text-muted-foreground">
                  השאלון מאפשר תקשורת שוטפת עם המאמן גם בימים שאין אימון משותף.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DailyMentalState;
