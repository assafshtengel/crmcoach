
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, FilePlus, FileText, MessageSquare } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

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
  emotions: z.array(z.string()).optional(),
  sleep_quality: z.string().optional(),
  nutrition_plan: z.string().optional(),
  pre_game_routine: z.string().optional(),
});

type GamePreparationForm = z.infer<typeof gamePreparationSchema>;

// List of emotions for selection
const emotionsList = [
  'התרגשות', 'שמחה', 'אופטימיות', 'ביטחון', 'מוטיבציה',
  'חרדה', 'לחץ', 'פחד', 'ספק', 'תסכול',
  'רוגע', 'ריכוז', 'נחישות', 'אדישות', 'עייפות'
];

// Group emotions by type
const emotionGroups = {
  positive: ['התרגשות', 'שמחה', 'אופטימיות', 'ביטחון', 'מוטיבציה'],
  negative: ['חרדה', 'לחץ', 'פחד', 'ספק', 'תסכול'],
  neutral: ['רוגע', 'ריכוז', 'נחישות', 'אדישות', 'עייפות']
};

const GamePreparation = () => {
  const navigate = useNavigate();
  const [previousForms, setPreviousForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [isAiSummaryOpen, setIsAiSummaryOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

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
      emotions: [],
      sleep_quality: '',
      nutrition_plan: '',
      pre_game_routine: '',
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

  // Update emotions field when selectedEmotions changes
  useEffect(() => {
    form.setValue('emotions', selectedEmotions);
  }, [selectedEmotions, form]);

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
          emotions: data.emotions,
          sleep_quality: data.sleep_quality,
          nutrition_plan: data.nutrition_plan,
          pre_game_routine: data.pre_game_routine,
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
      setSelectedEmotions([]);
      
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
    setSelectedEmotions([]);
  };

  const toggleEmotion = (emotion) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion)
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const generateAiSummary = async () => {
    try {
      setIsGeneratingSummary(true);
      const formData = form.getValues();
      
      // Simulating AI summary generation
      // In a real implementation, you would call an AI service here
      setTimeout(() => {
        const emotionsText = selectedEmotions.length > 0 
          ? `אתה מרגיש ${selectedEmotions.join(', ')} לקראת המשחק.` 
          : 'לא ציינת תחושות ספציפיות לקראת המשחק.';
        
        const confidenceText = {
          '1': 'רמת הביטחון שלך נמוכה מאוד.',
          '2': 'רמת הביטחון שלך נמוכה.',
          '3': 'רמת הביטחון שלך בינונית.',
          '4': 'רמת הביטחון שלך גבוהה.',
          '5': 'רמת הביטחון שלך גבוהה מאוד.',
        }[formData.confidence_level] || '';
        
        // Generate a personalized summary
        const summary = `
# סיכום הכנה למשחק נגד ${formData.opponent}

## תחושות ומצב רוח
${emotionsText}
${confidenceText}

## מטרות למשחק
${formData.personal_goals}

## תוכנית הכנה
עליך להתמקד בהכנה מנטלית הכוללת ${formData.mental_preparation}.

## המלצות לשיפור הביצועים
1. הקפד על שינה טובה לפני המשחק
2. בצע תרגילי נשימה ודמיון מודרך
3. חזור על ההצלחות האחרונות שלך במשחקים קודמים
4. התמקד במטרות הספציפיות שהצבת לעצמך

## טיפים נוספים
התייחס לחששות שציינת: "${formData.concerns || 'לא צוינו חששות ספציפיים'}" - נסה להפוך אותם לאתגרים חיוביים ומוטיבציה.

בהצלחה במשחק!
        `;
        
        setAiSummary(summary);
        setIsAiSummaryOpen(true);
        setIsGeneratingSummary(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error generating AI summary:', error);
      toast.error('שגיאה ביצירת סיכום AI');
      setIsGeneratingSummary(false);
    }
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

                    {/* Emotions Selection */}
                    <div>
                      <FormLabel>תחושות לקראת המשחק</FormLabel>
                      <FormDescription className="mb-2">
                        בחר את התחושות שמתארות את מצבך לקראת המשחק
                      </FormDescription>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">תחושות חיוביות:</h4>
                          <div className="flex flex-wrap gap-2">
                            {emotionGroups.positive.map((emotion) => (
                              <Badge 
                                key={emotion}
                                variant={selectedEmotions.includes(emotion) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => toggleEmotion(emotion)}
                              >
                                {emotion}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">תחושות שליליות:</h4>
                          <div className="flex flex-wrap gap-2">
                            {emotionGroups.negative.map((emotion) => (
                              <Badge 
                                key={emotion}
                                variant={selectedEmotions.includes(emotion) ? "destructive" : "outline"}
                                className="cursor-pointer"
                                onClick={() => toggleEmotion(emotion)}
                              >
                                {emotion}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">תחושות נייטרליות:</h4>
                          <div className="flex flex-wrap gap-2">
                            {emotionGroups.neutral.map((emotion) => (
                              <Badge 
                                key={emotion}
                                variant={selectedEmotions.includes(emotion) ? "secondary" : "outline"}
                                className="cursor-pointer"
                                onClick={() => toggleEmotion(emotion)}
                              >
                                {emotion}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="sleep_quality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>איכות השינה שלך בימים האחרונים</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="בחר את איכות השינה" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="excellent">מצוינת</SelectItem>
                              <SelectItem value="good">טובה</SelectItem>
                              <SelectItem value="average">בינונית</SelectItem>
                              <SelectItem value="poor">לא טובה</SelectItem>
                              <SelectItem value="very_poor">גרועה</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                      name="nutrition_plan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>תכנון תזונה לפני המשחק</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="מה התכנון התזונתי שלך לפני המשחק?"
                              className="min-h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            פרט את התכנון התזונתי שלך ב-24 השעות שלפני המשחק
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pre_game_routine"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>שגרה לפני משחק</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="תאר את השגרה שלך בשעות שלפני המשחק"
                              className="min-h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            התייחס לפעולות ספציפיות שאתה מבצע כדי להתכונן (לדוגמה: האזנה למוזיקה, מתיחות, וכו')
                          </FormDescription>
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

                    <div className="flex flex-col md:flex-row justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateAiSummary}
                        disabled={isGeneratingSummary}
                        className="flex items-center gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        {isGeneratingSummary ? 'מייצר סיכום...' : 'קבל סיכום AI'}
                      </Button>
                      
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
                              
                              {form.emotions && form.emotions.length > 0 && (
                                <div className="mt-1">
                                  <p className="text-sm font-medium">תחושות:</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {form.emotions.map(emotion => (
                                      <Badge key={emotion} variant="secondary" className="text-xs">
                                        {emotion}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
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

                      {selectedForm.emotions && selectedForm.emotions.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-1">תחושות לקראת המשחק</h3>
                          <div className="flex flex-wrap gap-1">
                            {selectedForm.emotions.map(emotion => (
                              <Badge 
                                key={emotion} 
                                variant={
                                  emotionGroups.positive.includes(emotion) ? "default" :
                                  emotionGroups.negative.includes(emotion) ? "destructive" : 
                                  "secondary"
                                }
                              >
                                {emotion}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

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

                      {selectedForm.pre_game_routine && (
                        <div>
                          <h3 className="font-medium mb-1">שגרה לפני משחק</h3>
                          <p className="whitespace-pre-line">{selectedForm.pre_game_routine}</p>
                        </div>
                      )}

                      {selectedForm.nutrition_plan && (
                        <div>
                          <h3 className="font-medium mb-1">תכנון תזונה</h3>
                          <p className="whitespace-pre-line">{selectedForm.nutrition_plan}</p>
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
                      
                      <div className="flex justify-center mt-4">
                        <Button 
                          variant="outline" 
                          className="flex items-center gap-2"
                          onClick={generateAiSummary}
                        >
                          <MessageSquare className="h-4 w-4" />
                          קבל סיכום AI למשחק זה
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* AI Summary Dialog */}
      <Dialog open={isAiSummaryOpen} onOpenChange={setIsAiSummaryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>סיכום AI - הכנה למשחק</DialogTitle>
            <DialogDescription>
              סיכום אישי המבוסס על המידע שהזנת
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <div 
              className="prose max-w-none" 
              dangerouslySetInnerHTML={{ 
                __html: aiSummary.replace(/\n/g, '<br>').replace(/^# (.*)/gm, '<h2>$1</h2>').replace(/^## (.*)/gm, '<h3>$1</h3>') 
              }}
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => setIsAiSummaryOpen(false)}
            >
              סגור
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GamePreparation;
