
import { Target, ArrowRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Goals = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Navigation */}
        <div className="flex justify-between items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate(-1)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>חזור לעמוד הקודם</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button 
            variant="outline" 
            size="icon"
            className="text-destructive hover:bg-destructive hover:text-white"
            onClick={() => navigate("/auth")}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-[#4A90E2] to-[#E67E22] bg-clip-text text-transparent animate-fade-in">
            🏆 אתה בדרך להפוך לשחקן מקצועני 🧠
            <br />
            עכשיו זה הזמן לכתוב את החזון שלך! ⚽
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-700 leading-relaxed px-4">
            אלוף לא נולד – הוא מתפתח! שחקנים גדולים התחילו מהיום שבו הם דמיינו את עצמם על המגרש הגדול. עכשיו זה הזמן שלך!
            <br />
            בעוד כמה דקות, תגדיר את החזון שלך, ובעוד 10 שנים – תקרא את החוזה שלך ותראה איך הגשמת אותו!
          </p>

          {/* CTA Button */}
          <Button 
            size="lg"
            className="bg-[#E67E22] hover:bg-[#E67E22]/90 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg transform transition-all hover:scale-105 hover:shadow-xl"
            onClick={() => navigate("/goals/create")}
          >
            בוא נתחיל – נכתוב את החזון שלי!
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Goals;
