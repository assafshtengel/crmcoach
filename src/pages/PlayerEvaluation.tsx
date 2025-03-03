
import { PlayerEvaluationForm } from '@/components/player-evaluation/PlayerEvaluationForm';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const PlayerEvaluationPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 px-4 sm:py-8 sm:px-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-6 flex-wrap">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)}
          title="חזור לדף הקודם"
          className="h-9 w-9 sm:h-10 sm:w-10"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/')}
          title="חזור לדשבורד"
          className="h-9 w-9 sm:h-10 sm:w-10"
        >
          <Home className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-4 sm:space-y-6">
        <Card className="p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">הערכת שחקן</h1>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
            בדף זה תוכל להעריך את הרמה שלך ב-11 אלמנטים חשובים בכדורגל. 
            ענה על כל השאלות בכנות, בסוף תקבל ציון לכל אלמנט + המלצות איך להשתפר. 
            עשה זאת אחת לכמה חודשים כדי לבדוק את ההתקדמות שלך!
          </p>
        </Card>
        <PlayerEvaluationForm />
      </div>
    </div>
  );
};

export default PlayerEvaluationPage;
