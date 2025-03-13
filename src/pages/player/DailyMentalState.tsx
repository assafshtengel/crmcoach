
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, LineChart, Heart, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const DailyMentalState = () => {
  const navigate = useNavigate();
  const [feelingScore, setFeelingScore] = useState<number>(5);
  const [motivationLevel, setMotivationLevel] = useState<number>(5);
  const [mentalFatigueLevel, setMentalFatigueLevel] = useState<number>(5);
  const [hasConcerns, setHasConcerns] = useState<boolean>(false);
  const [concernsDetails, setConcernsDetails] = useState<string>("");
  const [improvementFocus, setImprovementFocus] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const playerSessionStr = localStorage.getItem('playerSession');
      
      if (!playerSessionStr) {
        navigate('/player-auth');
        return;
      }
      
      const playerSession = JSON.parse(playerSessionStr);

      const { error } = await supabase
        .from('player_mental_states')
        .insert({
          player_id: playerSession.id,
          feeling_score: feelingScore,
          motivation_level: motivationLevel,
          mental_fatigue_level: mentalFatigueLevel,
          has_concerns: hasConcerns,
          concerns_details: concernsDetails,
          improvement_focus: improvementFocus
        });

      if (error) throw error;
      
      toast.success("המידע נשמר בהצלחה");
      // Reset form
      setFeelingScore(5);
      setMotivationLevel(5);
      setMentalFatigueLevel(5);
      setHasConcerns(false);
      setConcernsDetails("");
      setImprovementFocus("");
    } catch (error: any) {
      console.error("Error submitting mental state:", error);
      toast.error(error.message || "אירעה שגיאה בשמירת המידע");
    } finally {
      setSubmitting(false);
    }
  };

  const getSliderColor = (value: number) => {
    if (value <= 3) return "bg-red-500";
    if (value <= 6) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/player-profile')}
            className="ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">מצב תיעול יומי</h1>
        </div>

        <Card className="mb-6 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">מלא את השאלון היומי</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-medium">איך אתה מרגיש היום?</Label>
                    <div className="bg-primary-50 text-primary rounded-full px-3 py-1 text-sm font-medium">
                      {feelingScore}/10
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Heart className="h-5 w-5 text-pink-500" />
                    <div className="flex-1">
                      <Slider
                        value={[feelingScore]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={(value) => setFeelingScore(value[0])}
                        className="my-2"
                      />
                    </div>
                    <div className="min-w-10">
                      <Progress
                        value={feelingScore * 10}
                        className={`h-2 ${getSliderColor(feelingScore)}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-medium">רמת המוטיבציה שלך</Label>
                    <div className="bg-primary-50 text-primary rounded-full px-3 py-1 text-sm font-medium">
                      {motivationLevel}/10
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <div className="flex-1">
                      <Slider
                        value={[motivationLevel]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={(value) => setMotivationLevel(value[0])}
                        className="my-2"
                      />
                    </div>
                    <div className="min-w-10">
                      <Progress
                        value={motivationLevel * 10}
                        className={`h-2 ${getSliderColor(motivationLevel)}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-medium">רמת העייפות המנטלית</Label>
                    <div className="bg-primary-50 text-primary rounded-full px-3 py-1 text-sm font-medium">
                      {mentalFatigueLevel}/10
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <LineChart className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <Slider
                        value={[mentalFatigueLevel]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={(value) => setMentalFatigueLevel(value[0])}
                        className="my-2"
                      />
                    </div>
                    <div className="min-w-10">
                      <Progress
                        value={mentalFatigueLevel * 10}
                        className={`h-2 ${getSliderColor(mentalFatigueLevel)}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <Label className="text-base font-medium inline-flex gap-2 items-center">
                    <input
                      type="checkbox"
                      checked={hasConcerns}
                      onChange={(e) => setHasConcerns(e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    האם יש לך חששות או דאגות שמשפיעות על המצב המנטלי שלך?
                  </Label>
                  
                  {hasConcerns && (
                    <div className="mt-2">
                      <Textarea
                        placeholder="פרט את החששות או הדאגות שלך..."
                        value={concernsDetails}
                        onChange={(e) => setConcernsDetails(e.target.value)}
                        className="min-h-24"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">על מה הייתי רוצה להתמקד בשיפור המנטלי היום</Label>
                  <Textarea
                    placeholder="תאר מה הייתי רוצה לשפר..."
                    value={improvementFocus}
                    onChange={(e) => setImprovementFocus(e.target.value)}
                    className="min-h-24"
                  />
                </div>
              </div>

              <div className="mt-6">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? "שומר..." : "שלח עדכון יומי"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              ההיסטוריה שלי
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Button 
              variant="outline" 
              onClick={() => navigate('/player/mental-state-history')}
              className="px-6"
            >
              צפה בהיסטוריית המצב המנטלי שלי
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DailyMentalState;
