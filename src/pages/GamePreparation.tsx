
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, FilePlus, FileText } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Form schema for validation
const gamePreparationSchema = z.object({
  game_date: z.string().min(1, { message: 'תאריך המשחק הוא חובה' }),
  opponent: z.string().min(1, { message: 'יריב הוא חובה' }),
  location: z.string().min(1, { message: 'מיקום הוא חובה' }),
  personal_goals: z.string().min(3, { message: 'יש להזין לפחות 3 תווים' }),
  team_goals: z.string().optional(),
  preparation_steps: z.string().min(3, { message: 'יש להזין לפחות 3 תווים' }),
  mental_preparation: z.string().min(3, { message: 'יש להזין לפחות 3 תווים' }),
  confidence_level: z.string().min(1, { message: 'רמת ביטחון היא חובה' }),
  concerns: z.string().optional(),
  additional_notes: z.string().optional(),
});

type GamePreparationForm = z.infer<typeof gamePreparationSchema>;

const GamePreparation = () => {
  const navigate = useNavigate();
  const [previousForms, setPreviousForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Initialize form
  const form = useForm<GamePreparationForm>({
    resolver: zodResolver(gamePreparationSchema),
    defaultValues: {
      game_date: new Date().toISOString().split('T')[0],
      opponent: '',
      location: '',
      personal_goals: '',
      team_goals: '',
      preparation_steps: '',
      mental_preparation: '',
      confidence_level: '3',
      concerns: '',
      additional_notes: '',
    },
  });

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const playerSessionStr = localStorage.getItem('playerSession');
        
        if (!playerSessionStr) {
          navigate('/player-auth');
          return;
        }
        
        const playerSession = JSON.parse(playerSessionStr);
        
        // Fetch previous game preparation forms
        const { data, error } = await supabase
          .from('player_game_preparations')
          .select('*')
          .eq('player_id', playerSession.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setPreviousForms(data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('שגיאה בטעינת הנתונים');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlayerData();
  }, [navigate]);

  const onSubmit = async (data: GamePreparationForm) => {
    try {
      setSubmitting(true);
      
      const playerSessionStr = localStorage.getItem('playerSession');
      if (!playerSessionStr) {
        navigate('/player-auth');
        return;
      }
      
      const playerSession = JSON.parse(playerSessionStr);
      
      const { error } = await supabase
        .from('player_game_preparations')
        .insert({
          player_id: playerSession.id,
          game_date: data.game_date,
          opponent: data.opponent,
          location: data.location,
          personal_goals: data.personal_goals,
          team_goals: data.team_goals,
          preparation_steps: data.preparation_steps,
          mental_preparation: data.mental_preparation,
          confidence_level: data.confidence_level,
          concerns: data.concerns,
          additional_notes: data.additional_notes,
        });
      
      if (error) throw error;
      
      toast.success('טופס הכנה למשחק נשמר בהצלחה');
      
      // Refresh the list of forms
      const { data: updatedForms, error: fetchError } = await supabase
        .from('player_game_preparations')
        .select('*')
        .eq('player_id', playerSession.id)
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      setPreviousForms(updatedForms || []);
      form.reset();
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('שגיאה בשמירת הטופס');
    } finally {
      setSubmitting(false);
    }
  };

  const loadPreviousForm = (form) => {
    setSelectedForm(form);
  };

  const startNewForm = () => {
    setSelectedForm(null);
    form.reset();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/player/profile')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-center">טופס הכנה למשחק</h1>
          <div className="w-9"></div> {/* Spacer for alignment */}
        </div>

        <Tabs defaultValue="new">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="new" className="flex items-center gap-2">
              <FilePlus className="h-4 w-4" />
              טופס חדש
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              היסטוריה
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new">
            <Card>
              <CardHeader>
                <CardTitle>יצירת טופס הכנה למשחק חדש</CardTitle>
                <CardDescription>
                  מלא את הטופס כדי להתכונן למשחק הקרוב
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="game_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>תאריך המשחק</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="opponent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>יריב</FormLabel>
                            <FormControl>
                              <Input placeholder="שם היריב" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>מיקום</FormLabel>
                            <FormControl>
                              <Input placeholder="מיקום המשחק" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confidence_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>רמת ביטחון (1-5)</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="בחר רמת ביטחון" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">1 - נמוך מאוד</SelectItem>
                                <SelectItem value="2">2 - נמוך</SelectItem>
                                <SelectItem value="3">3 - בינוני</SelectItem>
                                <SelectItem value="4">4 - גבוה</SelectItem>
                                <SelectItem value="5">5 - גבוה מאוד</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="personal_goals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>מטרות אישיות למשחק</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="אילו מטרות אישיות תרצה להשיג במשחק זה?"
                              className="min-h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            הגדר 2-3 מטרות ספציפיות שתרצה להשיג במשחק
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="team_goals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>מטרות קבוצתיות</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="אילו מטרות קבוצתיות תרצו להשיג במשחק זה?"
                              className="min-h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preparation_steps"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>צעדי הכנה למשחק</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="אילו פעולות אתה מתכנן לעשות לפני המשחק?"
                              className="min-h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            שינה, תזונה, תרגילי חימום, הרפיה, הדמיה מנטלית, וכו'
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mental_preparation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>הכנה מנטלית</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="כיצד אתה מתכנן להתכונן מנטלית למשחק?"
                              className="min-h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            אסטרטגיות מנטליות, דיבור עצמי, שליטה בלחץ, וכו'
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="concerns"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>דאגות וחששות</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="האם יש דאגות או חששות לקראת המשחק?"
                              className="min-h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="additional_notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>הערות נוספות</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="מידע נוסף שחשוב לך לציין"
                              className="min-h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {submitting ? 'שומר...' : 'שמור טופס'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>היסטוריית טפסי הכנה למשחק</CardTitle>
                  <CardDescription>
                    צפה בטפסי הכנה למשחק שמילאת בעבר
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {previousForms.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      לא נמצאו טפסים קודמים
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {previousForms.map((form) => (
                        <Card key={form.id} className="hover:bg-gray-50 transition cursor-pointer">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">
                              משחק נגד {form.opponent} - {new Date(form.game_date).toLocaleDateString('he-IL')}
                            </CardTitle>
                            <CardDescription>
                              נוצר ב־{new Date(form.created_at).toLocaleDateString('he-IL')}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <p className="text-sm"><span className="font-medium">מיקום:</span> {form.location}</p>
                              <p className="text-sm"><span className="font-medium">רמת ביטחון:</span> {form.confidence_level}/5</p>
                              <div className="space-y-1 mt-2">
                                <p className="text-sm font-medium">מטרות אישיות:</p>
                                <p className="text-sm whitespace-pre-line">{form.personal_goals}</p>
                              </div>
                            </div>
                            
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-4 w-full"
                              onClick={() => loadPreviousForm(form)}
                            >
                              צפה בפרטים מלאים
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedForm && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>פרטי הטופס המלאים</CardTitle>
                      <Button variant="outline" size="sm" onClick={startNewForm}>
                        סגור
                      </Button>
                    </div>
                    <CardDescription>
                      {selectedForm.opponent} - {new Date(selectedForm.game_date).toLocaleDateString('he-IL')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-1">פרטי המשחק</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium">תאריך:</p>
                            <p>{new Date(selectedForm.game_date).toLocaleDateString('he-IL')}</p>
                          </div>
                          <div>
                            <p className="font-medium">יריב:</p>
                            <p>{selectedForm.opponent}</p>
                          </div>
                          <div>
                            <p className="font-medium">מיקום:</p>
                            <p>{selectedForm.location}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-1">מטרות אישיות</h3>
                        <p className="whitespace-pre-line">{selectedForm.personal_goals}</p>
                      </div>

                      {selectedForm.team_goals && (
                        <div>
                          <h3 className="font-medium mb-1">מטרות קבוצתיות</h3>
                          <p className="whitespace-pre-line">{selectedForm.team_goals}</p>
                        </div>
                      )}

                      <div>
                        <h3 className="font-medium mb-1">צעדי הכנה למשחק</h3>
                        <p className="whitespace-pre-line">{selectedForm.preparation_steps}</p>
                      </div>

                      <div>
                        <h3 className="font-medium mb-1">הכנה מנטלית</h3>
                        <p className="whitespace-pre-line">{selectedForm.mental_preparation}</p>
                      </div>

                      <div>
                        <h3 className="font-medium mb-1">רמת ביטחון</h3>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`h-4 w-4 rounded-full ${
                                i < parseInt(selectedForm.confidence_level)
                                  ? 'bg-emerald-500'
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                          <span className="ml-2">
                            {parseInt(selectedForm.confidence_level)}/5
                          </span>
                        </div>
                      </div>

                      {selectedForm.concerns && (
                        <div>
                          <h3 className="font-medium mb-1">דאגות וחששות</h3>
                          <p className="whitespace-pre-line">{selectedForm.concerns}</p>
                        </div>
                      )}

                      {selectedForm.additional_notes && (
                        <div>
                          <h3 className="font-medium mb-1">הערות נוספות</h3>
                          <p className="whitespace-pre-line">{selectedForm.additional_notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GamePreparation;
