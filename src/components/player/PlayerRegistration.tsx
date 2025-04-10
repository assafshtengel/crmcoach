
import { useEffect } from 'react';
import { usePlayerRegistration } from '@/hooks/usePlayerRegistration';
import { useToast } from '@/hooks/use-toast';

/**
 * A component that ensures a player record exists when a user logs in.
 * This component doesn't render anything visible but handles the player
 * registration process in the background.
 */
const PlayerRegistration = () => {
  const { player, isLoading, error, isNewPlayer } = usePlayerRegistration();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "שגיאה ברישום פרופיל",
        description: error,
        variant: "destructive",
      });
    }

    if (isNewPlayer && player) {
      toast({
        title: "ברוך הבא!",
        description: "פרופיל השחקן שלך נוצר בהצלחה",
      });
    }
  }, [error, isNewPlayer, player, toast]);

  return null; // This component doesn't render anything visible
};

export default PlayerRegistration;
