
import { PlayerEvaluationForm } from '@/components/player-evaluation/PlayerEvaluationForm';
import { useIsMobile } from '@/hooks/use-mobile';

const PlayerEvaluationPage = () => {
  const isMobile = useIsMobile();

  return (
    <div className={`container mx-auto py-8 ${isMobile ? 'px-4' : 'px-8'}`}>
      <PlayerEvaluationForm />
    </div>
  );
};

export default PlayerEvaluationPage;

