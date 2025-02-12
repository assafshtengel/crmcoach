
import { PlayerEvaluationForm } from '@/components/player-evaluation/PlayerEvaluationForm';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';

const PlayerEvaluationPage = () => {
  const isMobile = useIsMobile();

  return (
    <div className={`container mx-auto py-8 ${isMobile ? 'px-4' : 'px-8'}`}>
      <div className="space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">הערכת שחקן</h1>
          <p className="text-gray-600 leading-relaxed">
            בדף זה תוכל להעריך את הרמה שלך ב-9 אלמנטים חשובים בכדורגל. 
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
