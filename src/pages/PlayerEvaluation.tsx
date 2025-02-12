
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
    <div className={`container mx-auto py-8 ${isMobile ? 'px-4' : 'px-8'}`}>
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
      <div className="space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">הערכת שחקן</h1>
          <p className="text-gray-600 leading-relaxed">
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
