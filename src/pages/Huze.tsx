
import { ArrowRight, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Huze = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Navigation */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
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

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate('/')}
                  >
                    <Home className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>חזור לדף הבית</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

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
        <div className="text-center space-y-8 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent animate-fade-in leading-relaxed">
            אתה בדרך להפוך לשחקן מקצועני
            <br />
            עכשיו זה הזמן לכתוב את החזון שלך!
          </h1>

          <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
            חזון הוא הצעד הראשון להצלחה. כאן תוכל להגדיר את המטרות שלך ולתכנן את הדרך להגשמת החלום.
          </p>

          <div className="pt-8">
            <Button 
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg transform transition-all hover:scale-105"
              onClick={() => navigate("/player-form")}
            >
              בוא נתחיל לבנות את החזון
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Huze;
