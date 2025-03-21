
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Save, ClipboardCheck, Loader2 } from "lucide-react";
import { useScreenSize } from "@/hooks/use-screen-size";

interface PlayerData {
  id: string;
  full_name: string;
  profile_image?: string;
}

interface GameEvaluation {
  id?: string;
  player_id: string;
  game_date: string;
  opponent: string;
  performance_rating: number;
  mental_state: number;
  physical_condition: number;
  technical_execution: number;
  tactical_awareness: number;
  key_strengths: string;
  areas_to_improve: string;
  notes: string;
  created_at?: string;
}

const PlayerGameEvaluation = () => {
  const navigate = useNavigate();
  const { playerId } = useParams();
  const { isMobile } = useScreenSize();
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [evaluation, setEvaluation] = useState<GameEvaluation>({
    player_id: playerId || "",
    game_date: new Date().toISOString().split('T')[0],
    opponent: "",
    performance_rating: 3,
    mental_state: 5,
    physical_condition: 5,
    technical_execution: 5,
    tactical_awareness: 5,
    key_strengths: "",
    areas_to_improve: "",
    notes: ""
  });
  
  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        if (!playerId) {
          throw new Error("מזהה שחקן חסר");
        }
        
        setLoading(true);
        
        const { data, error } = await supabase
          .from("players")
          .select("id, full_name, profile_image")
          .eq("id", playerId)
          .single();
          
        if (error) throw error;
        
        setPlayer(data);
      } catch (error: any) {
        console.error("Error loading player data:", error);
        toast.error("שגיאה בטעינת פרטי השחקן");
        navigate("/player/profile");
      } finally {
        setLoading(false);
      }
    };
    
    loadPlayerData();
  }, [playerId, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEvaluation(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSliderChange = (name: string, value: number[]) => {
    setEvaluation(prev => ({ ...prev, [name]: value[0] }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!evaluation.game_date || !evaluation.opponent) {
      toast.error("אנא מלא את כל השדות הנדרשים");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { data, error } = await supabase
        .from("player_game_evaluations")
        .insert({
          ...evaluation,
          player_id: playerId
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success("האיבחון נשמר בהצלחה");
      
      // Navigate back to profile page
      navigate("/player/profile");
    } catch (error: any) {
      console.error("Error saving evaluation:", error);
      toast.error("שגיאה בשמירת האיבחון");
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F2FCE2] to-[#E5DEFF]">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2FCE2] to-[#E5DEFF] py-6 px-4">
      <div className="container mx-auto max-w-3xl">
        <header className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/player/profile")}
            className="bg-white/80"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-primary" />
            איבחון משחק
          </h1>
          <div className="w-10"></div>
        </header>
        
        {player && (
          <Card className="shadow-lg mb-6">
            <CardHeader className="pb-3 bg-gradient-to-r from-[#F2FCE2]/50 to-[#E5DEFF]/50">
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200">
                  <img 
                    src={player.profile_image || `https://via.placeholder.com/40?text=${player.full_name[0]}`} 
                    alt={player.full_name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://via.placeholder.com/40?text=${player.full_name[0] || 'P'}`;
                    }}
                  />
                </div>
                <span>{player.full_name}</span>
              </CardTitle>
            </CardHeader>
          </Card>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="shadow-md">
            <CardHeader className="pb-3 bg-gradient-to-r from-[#F2FCE2]/50 to-[#E5DEFF]/50">
              <CardTitle className="text-lg">פרטי המשחק</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="game_date">תאריך המשחק</Label>
                  <input
                    type="date"
                    id="game_date"
                    name="game_date"
                    value={evaluation.game_date}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="opponent">קבוצה יריבה</Label>
                  <input
                    type="text"
                    id="opponent"
                    name="opponent"
                    value={evaluation.opponent}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="שם הקבוצה היריבה"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>איך היה המשחק בכללי?</Label>
                <RadioGroup 
                  className="flex gap-3 pt-2"
                  value={evaluation.performance_rating.toString()}
                  onValueChange={(value) => setEvaluation(prev => ({ ...prev, performance_rating: parseInt(value) }))}
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="1" id="r1" />
                    <Label htmlFor="r1">חלש מאוד</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="2" id="r2" />
                    <Label htmlFor="r2">חלש</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="3" id="r3" />
                    <Label htmlFor="r3">בינוני</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="4" id="r4" />
                    <Label htmlFor="r4">טוב</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="5" id="r5" />
                    <Label htmlFor="r5">מצוין</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader className="pb-3 bg-gradient-to-r from-[#F2FCE2]/50 to-[#E5DEFF]/50">
              <CardTitle className="text-lg">ביצועים</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="mental_state">מצב מנטלי</Label>
                    <span className="text-sm font-medium">{evaluation.mental_state}/10</span>
                  </div>
                  <Slider
                    id="mental_state"
                    min={1}
                    max={10}
                    step={1}
                    value={[evaluation.mental_state]}
                    onValueChange={(value) => handleSliderChange("mental_state", value)}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>חלש</span>
                    <span>מצוין</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="physical_condition">מצב גופני</Label>
                    <span className="text-sm font-medium">{evaluation.physical_condition}/10</span>
                  </div>
                  <Slider
                    id="physical_condition"
                    min={1}
                    max={10}
                    step={1}
                    value={[evaluation.physical_condition]}
                    onValueChange={(value) => handleSliderChange("physical_condition", value)}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>חלש</span>
                    <span>מצוין</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="technical_execution">ביצוע טכני</Label>
                    <span className="text-sm font-medium">{evaluation.technical_execution}/10</span>
                  </div>
                  <Slider
                    id="technical_execution"
                    min={1}
                    max={10}
                    step={1}
                    value={[evaluation.technical_execution]}
                    onValueChange={(value) => handleSliderChange("technical_execution", value)}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>חלש</span>
                    <span>מצוין</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="tactical_awareness">הבנה טקטית</Label>
                    <span className="text-sm font-medium">{evaluation.tactical_awareness}/10</span>
                  </div>
                  <Slider
                    id="tactical_awareness"
                    min={1}
                    max={10}
                    step={1}
                    value={[evaluation.tactical_awareness]}
                    onValueChange={(value) => handleSliderChange("tactical_awareness", value)}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>חלש</span>
                    <span>מצוין</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader className="pb-3 bg-gradient-to-r from-[#F2FCE2]/50 to-[#E5DEFF]/50">
              <CardTitle className="text-lg">פירוט והערות</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key_strengths">נקודות חוזק במשחק</Label>
                <Textarea
                  id="key_strengths"
                  name="key_strengths"
                  value={evaluation.key_strengths}
                  onChange={handleInputChange}
                  placeholder="מה עבד טוב במשחק?"
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="areas_to_improve">נקודות לשיפור</Label>
                <Textarea
                  id="areas_to_improve"
                  name="areas_to_improve"
                  value={evaluation.areas_to_improve}
                  onChange={handleInputChange}
                  placeholder="במה אתה צריך להשתפר?"
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">הערות נוספות</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={evaluation.notes}
                  onChange={handleInputChange}
                  placeholder="הערות כלליות על המשחק או הביצועים"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-center pt-4 pb-10">
            <Button 
              type="submit" 
              className="w-full max-w-md text-lg py-6 bg-primary hover:bg-primary/90"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  שומר...
                </>
              ) : (
                <>
                  <Save className="ml-2 h-5 w-5" />
                  שמור איבחון
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlayerGameEvaluation;
