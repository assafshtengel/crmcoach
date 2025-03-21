
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
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
  coach_id?: string;
  game_date: string;
  opponent: string;
  overall_rating: number;
  
  // The 12 evaluation areas
  body_language: number;
  error_response: number;
  player_communication: number;
  initiative_activity: number;
  focus_attention: number;
  substitution_reaction: number;
  pressure_response: number;
  coach_feedback_response: number;
  confidence_presence: number;
  mental_routines: number;
  consistency: number;
  postgame_behavior: number;
  
  // Notes fields
  body_language_notes?: string;
  error_response_notes?: string;
  player_communication_notes?: string;
  initiative_activity_notes?: string;
  focus_attention_notes?: string;
  substitution_reaction_notes?: string;
  pressure_response_notes?: string;
  coach_feedback_notes?: string;
  confidence_presence_notes?: string;
  mental_routines_notes?: string;
  consistency_notes?: string;
  postgame_behavior_notes?: string;
  general_notes?: string;
}

const evaluationCategories = [
  {
    id: "body_language",
    title: "שפת גוף לאורך המשחק",
    description: "יציבה, הבעות פנים, שפת ידיים – מעיד המון על ביטחון, מוטיבציה ומוכנות."
  },
  {
    id: "error_response",
    title: "תגובה לאחר טעות / כישלון",
    description: "איך הוא מגיב? מתרסק? מתאושש מהר? מחפש פתרונות? מעביר אחריות?"
  },
  {
    id: "player_communication",
    title: "תקשורת עם שחקנים אחרים",
    description: "האם הוא מעודד? נוזף? מתנתק? נוכח חברתית או מנותק?"
  },
  {
    id: "initiative_activity",
    title: "יוזמה ואקטיביות",
    description: "האם הוא מחפש את הכדור? בורח? מציע את עצמו לפתרונות?"
  },
  {
    id: "focus_attention",
    title: "מיקוד וקשב בזמן אמת",
    description: "כמה הוא קשוב למשחק? לנעשה סביבו? האם יש \"נפילות\" בריכוז?"
  },
  {
    id: "substitution_reaction",
    title: "שפת גוף כאשר הוא מוחלף / לא מצליח / מאוכזב",
    description: "זו נקודת זהב להבנה כמה הוא שולט ברגשות מול קהל ומאמן."
  },
  {
    id: "pressure_response",
    title: "תגובה למצבי לחץ",
    description: "פנדלים, דקות אחרונות, פיגור – איך הוא מגיב כש\"סופרים את הלחם\"?"
  },
  {
    id: "coach_feedback_response",
    title: "יכולת להכיל ביקורת או הוראות מהמאמן",
    description: "האם הוא מקשיב? מתנגד? מוריד את הראש? ממשיך הלאה?"
  },
  {
    id: "confidence_presence",
    title: "נוכחות וביטחון מול שחקנים אחרים",
    description: "האם הוא מרגיש שייך? נראה נעלם? דומיננטי?"
  },
  {
    id: "mental_routines",
    title: "שגרות מנטליות או טקסים אישיים",
    description: "לפני בעיטה, אחרי טעות, בזמן פסק זמן – יש לו \"עוגנים\"? טכניקות?"
  },
  {
    id: "consistency",
    title: "עקביות לאורך המשחק",
    description: "האם יש עליות וירידות? איך הוא מתמודד עם עייפות נפשית?"
  },
  {
    id: "postgame_behavior",
    title: "התנהגות בסיום המשחק",
    description: "כבוד ליריב, מגע עם קהל/צוות, איך הוא מסכם את המשחק לעצמו?"
  }
];

const PlayerGameEvaluationForm = () => {
  const navigate = useNavigate();
  const { playerId } = useParams();
  const { isMobile } = useScreenSize();
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const defaultEvaluation: GameEvaluation = {
    player_id: playerId || "",
    game_date: new Date().toISOString().split('T')[0],
    opponent: "",
    overall_rating: 3,
    body_language: 5,
    error_response: 5,
    player_communication: 5,
    initiative_activity: 5,
    focus_attention: 5,
    substitution_reaction: 5,
    pressure_response: 5,
    coach_feedback_response: 5,
    confidence_presence: 5,
    mental_routines: 5,
    consistency: 5,
    postgame_behavior: 5,
    general_notes: ""
  };
  
  const [evaluation, setEvaluation] = useState<GameEvaluation>(defaultEvaluation);
  const [currentCategory, setCurrentCategory] = useState(0);
  
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
      // Get the player session to get the player ID
      const playerSession = localStorage.getItem("playerSession");
      if (!playerSession) {
        toast.error("לא נמצאה התחברות תקפה");
        navigate("/player-auth");
        return;
      }
      
      const sessionData = JSON.parse(playerSession);
      
      const { data, error } = await supabase
        .from("player_game_evaluations")
        .insert({
          ...evaluation,
          player_id: playerId || sessionData.id
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
  
  const moveToNextCategory = () => {
    if (currentCategory < evaluationCategories.length - 1) {
      setCurrentCategory(prev => prev + 1);
    }
  };
  
  const moveToPreviousCategory = () => {
    if (currentCategory > 0) {
      setCurrentCategory(prev => prev - 1);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F2FCE2] to-[#E5DEFF]">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  const currentCat = evaluationCategories[currentCategory];
  
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
                <Label>הערכה כללית של המשחק (1-5)</Label>
                <div className="flex justify-between items-center">
                  <span className="text-sm">חלש</span>
                  <div className="flex-1 mx-4">
                    <Slider
                      value={[evaluation.overall_rating]}
                      min={1}
                      max={5}
                      step={1}
                      onValueChange={(value) => handleSliderChange("overall_rating", value)}
                    />
                  </div>
                  <span className="text-sm">מצוין</span>
                </div>
                <div className="text-center mt-1">
                  <span className="font-medium">{evaluation.overall_rating}/5</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader className="pb-3 bg-gradient-to-r from-[#F2FCE2]/50 to-[#E5DEFF]/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{currentCat.title}</CardTitle>
                <div className="text-sm text-gray-500">
                  {currentCategory + 1} / {evaluationCategories.length}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{currentCat.description}</p>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>ציון (1-10)</Label>
                    <span className="text-sm font-medium">{evaluation[currentCat.id as keyof GameEvaluation] as number}/10</span>
                  </div>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[evaluation[currentCat.id as keyof GameEvaluation] as number]}
                    onValueChange={(value) => handleSliderChange(currentCat.id, value)}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>נמוך</span>
                    <span>גבוה</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`${currentCat.id}_notes`}>הערות</Label>
                  <Textarea
                    id={`${currentCat.id}_notes`}
                    name={`${currentCat.id}_notes`}
                    value={evaluation[`${currentCat.id}_notes` as keyof GameEvaluation] as string || ""}
                    onChange={handleInputChange}
                    placeholder="הוסף הערות ותובנות לגבי קטגוריה זו"
                    className="min-h-[120px]"
                  />
                </div>
              </div>
              
              <div className="flex justify-between pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={moveToPreviousCategory}
                  disabled={currentCategory === 0}
                >
                  הקודם
                </Button>
                
                <Button
                  type="button"
                  onClick={moveToNextCategory}
                  disabled={currentCategory === evaluationCategories.length - 1}
                >
                  הבא
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader className="pb-3 bg-gradient-to-r from-[#F2FCE2]/50 to-[#E5DEFF]/50">
              <CardTitle className="text-lg">הערות נוספות</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-2">
                <Label htmlFor="general_notes">הערות כלליות</Label>
                <Textarea
                  id="general_notes"
                  name="general_notes"
                  value={evaluation.general_notes || ""}
                  onChange={handleInputChange}
                  placeholder="הוסף הערות כלליות והתרשמות מהשחקן במהלך המשחק"
                  className="min-h-[150px]"
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

export default PlayerGameEvaluationForm;
