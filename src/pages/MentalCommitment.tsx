import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Edit, Star, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

const motivationalQuotes = [
  "הכל בראש – והראש שלי בלתי ניתן לעצירה",
  "אם אני יכול לדמיין את זה, אני יכול להשיג את זה!",
  "אני לא מבטיח שאנצח – אני מבטיח שלא אפסיק להילחם!"
];

const MentalCommitment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const playerName = location.state?.playerName || "";

  const [formData, setFormData] = useState({
    improvementArea: "",
    uniqueTrait: "",
    motivationalQuote: "",
    customQuote: "",
  });

  useEffect(() => {
    const loadExistingCommitment = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('mental_commitments')
          .select('improvement_area, unique_trait, motivational_quote')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('Error loading commitment:', error);
          return;
        }

        setFormData({
          improvementArea: data.improvement_area,
          uniqueTrait: data.unique_trait,
          motivationalQuote: motivationalQuotes.includes(data.motivational_quote) 
            ? data.motivational_quote 
            : 'custom',
          customQuote: !motivationalQuotes.includes(data.motivational_quote) 
            ? data.motivational_quote 
            : '',
        });
      } catch (error) {
        console.error('Error in loadExistingCommitment:', error);
      }
    };

    loadExistingCommitment();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "שגיאה",
          description: "יש להתחבר מחדש",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const finalQuote = formData.motivationalQuote === 'custom' 
        ? formData.customQuote 
        : formData.motivationalQuote;

      const { data: existingData, error: queryError } = await supabase
        .from('mental_commitments')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (queryError && queryError.code !== 'PGRST116') {
        console.error('Error querying commitment:', queryError);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בשמירת הפרטים",
          variant: "destructive",
        });
        return;
      }

      let error;
      
      if (existingData?.id) {
        const { error: updateError } = await supabase
          .from('mental_commitments')
          .update({
            improvement_area: formData.improvementArea,
            unique_trait: formData.uniqueTrait,
            motivational_quote: finalQuote,
          })
          .eq('id', existingData.id);
        
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('mental_commitments')
          .insert({
            user_id: user.id,
            improvement_area: formData.improvementArea,
            unique_trait: formData.uniqueTrait,
            motivational_quote: finalQuote,
          });
        
        error = insertError;
      }

      if (error) {
        console.error('Error:', error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בשמירת הפרטים",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "התחייבות נשמרה בהצלחה",
        description: "בוא נמשיך לשלב הבא",
      });
      navigate("/contract");
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת הפרטים",
        variant: "destructive",
      });
    }
  };

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

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
                  מה הופך שחקנים רגילים לאלופים? ההתחייבות שלהם לעצמם!
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  כדי להפוך לשחקן גדול, אתה צריך להתחייב לדרך שלך. אלופים הם אלה שעובדים כשהאחרים נחים, שממשיכים כשהאחרים מוותרים. עכשיו זה הזמן לנסח את ההתחייבות שלך!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="improvementArea">
                      מה הדבר הכי חשוב שאתה מתחייב לשפר ב-12 החודשים הקרובים?
                    </Label>
                    <Input
                      id="improvementArea"
                      placeholder="טכניקה, כושר גופני, מנטליות, מנהיגות, יציבות וכו'"
                      value={formData.improvementArea}
                      onChange={(e) =>
                        setFormData({ ...formData, improvementArea: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="uniqueTrait">
                      איזו תכונה מייחדת אותך והופכת אותך לשחקן שונה מהאחרים?
                    </Label>
                    <Input
                      id="uniqueTrait"
                      placeholder="התמדה, חוכמת משחק, לחימה, קור רוח וכו'"
                      value={formData.uniqueTrait}
                      onChange={(e) =>
                        setFormData({ ...formData, uniqueTrait: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motivationalQuote">
                      מה המשפט שמלווה אותך בדרך להצלחה?
                    </Label>
                    <Select
                      value={formData.motivationalQuote}
                      onValueChange={(value) =>
                        setFormData({ ...formData, motivationalQuote: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר משפט מוטיבציה" />
                      </SelectTrigger>
                      <SelectContent>
                        {motivationalQuotes.map((quote) => (
                          <SelectItem key={quote} value={quote}>
                            {quote}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">כתוב משפט משלך</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.motivationalQuote === 'custom' && (
                    <div className="space-y-2">
                      <Label htmlFor="customQuote">המשפט שלך:</Label>
                      <Textarea
                        id="customQuote"
                        placeholder="כתוב את המשפט שמלווה אותך..."
                        value={formData.customQuote}
                        onChange={(e) =>
                          setFormData({ ...formData, customQuote: e.target.value })
                        }
                        required
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    size="lg"
                  >
                    יצירת החוזה הסופי
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="hidden md:block">
            <div className="bg-white p-8 rounded-xl shadow-xl border-2 border-gray-100 min-h-[600px] relative">
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <h2 className="text-xl font-bold mb-4">ההתחייבות המנטלית שלי</h2>
                <p>
                  {`כדי להגיע לפסגה, ${playerName || '_________'} מתחייב לשפר את ${
                    formData.improvementArea || '_________'
                  } ולהפוך לשחקן בלתי ניתן לעצירה.`}
                </p>
                <p>
                  {`הכוח המייחד אותו על המגרש הוא ${
                    formData.uniqueTrait || '_________'
                  }, וזה מה שהופך אותו לשחקן יוצא דופן.`}
                </p>
                <p>המשפט שמלווה אותו בדרך להצלחה:</p>
                <p className="font-bold text-lg text-center my-4">
                  {formData.motivationalQuote === 'custom'
                    ? formData.customQuote || '"_________"'
                    : formData.motivationalQuote
                    ? `"${formData.motivationalQuote}"`
                    : '"_________"'}
                </p>
              </div>

              {/* Signature Section */}
              <div className="absolute bottom-8 right-8 left-8">
                <div className="border-t-2 border-gray-200 pt-6">
                  <p className="font-semibold">
                    {playerName || '_________'} – השחקן המקצועני
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    "אני חותם על החוזה הזה מתוך מחויבות מוחלטת לדרך שלי!"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentalCommitment;
