import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const Contract = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [playerDetails, setPlayerDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayerDetails = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/auth');
          return;
        }

        const { data, error } = await supabase
          .from('player_details')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching player details:', error);
          toast({
            title: "שגיאה בטעינת נתונים",
            description: "לא ניתן לטעון את פרטי השחקן",
            variant: "destructive",
          });
          return;
        }

        setPlayerDetails(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerDetails();
  }, [navigate, toast]);

  const handleContinue = () => {
    navigate('/mental-tools');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="outline"
          size="icon"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>

        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-orange-500">
              החוזה המקצועני הראשון שלך
            </h1>
            <p className="mt-2 text-gray-600">
              הנה החוזה שלך, {playerDetails?.full_name || 'שחקן'}! זה הזמן להתחייב למסע המנטלי שלך.
            </p>
          </div>

          <Card className="border-2 border-gray-200 shadow-lg">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex justify-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">FC</span>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-center">
                  חוזה מקצועני
                </h2>

                <div className="space-y-4 text-gray-700">
                  <p>
                    אני, <span className="font-bold">{playerDetails?.full_name || '_______'}</span>, 
                    {playerDetails?.position && (
                      <span> {playerDetails.position === 'goalkeeper' ? 'שוער' : 
                             playerDetails.position === 'defender' ? 'בלם' :
                             playerDetails.position === 'fullback' ? 'מגן' :
                             playerDetails.position === 'midfielder' ? 'קשר' :
                             playerDetails.position === 'winger' ? 'כנף' :
                             playerDetails.position === 'striker' ? 'חלוץ' : 
                             playerDetails.position}</span>
                    )} 
                    {playerDetails?.team && <span> בקבוצת {playerDetails.team}</span>}
                    {playerDetails?.league && <span> ב{playerDetails.league}</span>}, 
                    מתחייב בזאת להשקיע בהתפתחות המנטלית שלי כחלק בלתי נפרד מהקריירה המקצועית שלי.
                  </p>

                  <p>
                    אני מבין שכדי להגיע לרמות הגבוהות ביותר בספורט, עליי לפתח לא רק את היכולות הפיזיות והטכניות שלי, אלא גם את החוסן המנטלי, היכולת להתמודד עם לחץ, ואת המיקוד וההתמדה הנדרשים להצלחה.
                  </p>

                  <p>
                    אני מתחייב להקדיש זמן ומאמץ לאימון המנטלי שלי, לעבוד על נקודות החולשה שלי, ולהשתמש בכלים שאלמד כדי להפוך לשחקן טוב יותר.
                  </p>

                  <p>
                    אני מבין שהדרך להצלחה כוללת גם התמודדות עם אתגרים וכישלונות, ואני מתחייב ללמוד מהם ולהשתמש בהם כהזדמנויות לצמיחה.
                  </p>

                  <div className="pt-8 text-center">
                    <p className="font-bold">חתימה: ___________________</p>
                    <p className="text-sm text-gray-500 mt-2">
                      בחתימתי על חוזה זה, אני מתחייב לעצמי להשקיע במסע המנטלי שלי
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              onClick={handleContinue}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg"
            >
              אני מתחייב! המשך לכלים המנטליים
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contract;
