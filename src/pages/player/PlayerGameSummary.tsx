
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Plus, Search, Upload } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define form schema
const gameSummarySchema = z.object({
  gameName: z.string().min(1, { message: "נדרש שם משחק" }),
  gameDate: z.string().min(1, { message: "נדרש תאריך משחק" }),
  gameType: z.enum(["official", "training"], { 
    required_error: "יש לבחור סוג משחק" 
  }),
  opponent: z.string().min(1, { message: "נדרש שם היריב" }),
  strengths: z.string().min(1, { message: "נדרש פירוט של נקודות חוזק" }),
  improvements: z.string().min(1, { message: "נדרש פירוט של נקודות לשיפור" }),
  keyMoments: z.string().optional(),
  preGameFeelings: z.string().optional(),
  duringGameFeelings: z.string().optional(),
  postGameFeelings: z.string().optional(),
  coachNotes: z.string().optional(),
});

type GameSummaryFormValues = z.infer<typeof gameSummarySchema>;

interface GameSummary {
  id: string;
  player_id: string;
  game_name: string;
  game_date: string;
  game_type: "official" | "training";
  opponent: string;
  strengths: string;
  improvements: string;
  key_moments: string;
  pre_game_feelings: string;
  during_game_feelings: string;
  post_game_feelings: string;
  coach_notes: string;
  created_at: string;
  video_urls?: string[];
}

const PlayerGameSummary = () => {
  const [gameSummaries, setGameSummaries] = useState<GameSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const navigate = useNavigate();

  const form = useForm<GameSummaryFormValues>({
    resolver: zodResolver(gameSummarySchema),
    defaultValues: {
      gameName: "",
      gameDate: new Date().toISOString().split('T')[0],
      gameType: "official",
      opponent: "",
      strengths: "",
      improvements: "",
      keyMoments: "",
      preGameFeelings: "",
      duringGameFeelings: "",
      postGameFeelings: "",
      coachNotes: "",
    },
  });

  useEffect(() => {
    const fetchGameSummaries = async () => {
      try {
        const playerSessionStr = localStorage.getItem('playerSession');
        
        if (!playerSessionStr) {
          navigate('/player-auth');
          return;
        }
        
        const playerSession = JSON.parse(playerSessionStr);
        
        const { data, error } = await supabase
          .from('game_summaries')
          .select('*')
          .eq('player_id', playerSession.id)
          .order('game_date', { ascending: false });
        
        if (error) throw error;
        
        setGameSummaries(data || []);
      } catch (error: any) {
        console.error('Error loading game summaries:', error);
        toast.error(error.message || "אירעה שגיאה בטעינת סיכומי המשחקים");
      } finally {
        setLoading(false);
      }
    };
    
    fetchGameSummaries();
  }, [navigate]);

  const onSubmit = async (values: GameSummaryFormValues) => {
    try {
      setLoading(true);
      
      const playerSessionStr = localStorage.getItem('playerSession');
      if (!playerSessionStr) {
        navigate('/player-auth');
        return;
      }
      
      const playerSession = JSON.parse(playerSessionStr);
      
      // Mock implementation - in a real app we would upload files to storage
      const videoUrls = selectedFiles.length > 0 
        ? selectedFiles.map(file => URL.createObjectURL(file)) 
        : [];
      
      const newSummary = {
        player_id: playerSession.id,
        game_name: values.gameName,
        game_date: values.gameDate,
        game_type: values.gameType,
        opponent: values.opponent,
        strengths: values.strengths,
        improvements: values.improvements,
        key_moments: values.keyMoments || "",
        pre_game_feelings: values.preGameFeelings || "",
        during_game_feelings: values.duringGameFeelings || "",
        post_game_feelings: values.postGameFeelings || "",
        coach_notes: values.coachNotes || "",
        video_urls: videoUrls,
      };
      
      // In a real implementation, this would save to the database
      // For now, we'll just add it to our state and pretend it saved
      const mockSavedSummary = {
        ...newSummary,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };
      
      setGameSummaries(prev => [mockSavedSummary, ...prev]);
      
      toast.success("סיכום המשחק נשמר בהצלחה");
      setShowForm(false);
      form.reset();
      setSelectedFiles([]);
    } catch (error: any) {
      console.error('Error saving game summary:', error);
      toast.error(error.message || "אירעה שגיאה בשמירת סיכום המשחק");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const filteredSummaries = gameSummaries.filter(summary => 
    summary.game_name.includes(searchQuery) || 
    summary.opponent.includes(searchQuery)
  );

  if (loading && gameSummaries.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/player-profile')}
            className="ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">סיכומי משחקים</h1>
        </div>

        {!showForm ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-full max-w-md">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="חיפוש סיכומי משחקים..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
              </div>
              <Button onClick={() => setShowForm(true)} className="mr-2 whitespace-nowrap">
                <Plus className="ml-2 h-4 w-4" />
                הוסף סיכום חדש
              </Button>
            </div>

            {filteredSummaries.length === 0 ? (
              <Card className="text-center p-8 bg-white shadow-md">
                <CardContent className="pt-6">
                  <p className="text-xl text-gray-500 mb-4">אין סיכומי משחקים עדיין</p>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="ml-2 h-4 w-4" />
                    הוסף סיכום משחק ראשון
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredSummaries.map((summary) => (
                  <Card key={summary.id} className="shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                    <CardHeader className="pb-2 bg-blue-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{summary.game_name}</CardTitle>
                          <CardDescription>
                            <span className="ml-2">
                              {new Date(summary.game_date).toLocaleDateString('he-IL')}
                            </span>
                            <span className="mx-2">•</span>
                            <span>
                              יריב: {summary.opponent}
                            </span>
                            <span className="mx-2">•</span>
                            <span>
                              {summary.game_type === "official" ? "משחק רשמי" : "משחק אימון"}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-medium text-blue-600 mb-1">נקודות חוזק</h3>
                          <p className="text-sm">{summary.strengths}</p>
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-blue-600 mb-1">נקודות לשיפור</h3>
                          <p className="text-sm">{summary.improvements}</p>
                        </div>
                        
                        {summary.key_moments && (
                          <div>
                            <h3 className="font-medium text-blue-600 mb-1">רגעי מפתח</h3>
                            <p className="text-sm">{summary.key_moments}</p>
                          </div>
                        )}
                        
                        {(summary.pre_game_feelings || summary.during_game_feelings || summary.post_game_feelings) && (
                          <div>
                            <h3 className="font-medium text-blue-600 mb-1">תחושות</h3>
                            {summary.pre_game_feelings && (
                              <div className="mb-1">
                                <span className="text-sm font-medium">לפני המשחק: </span>
                                <span className="text-sm">{summary.pre_game_feelings}</span>
                              </div>
                            )}
                            {summary.during_game_feelings && (
                              <div className="mb-1">
                                <span className="text-sm font-medium">במהלך המשחק: </span>
                                <span className="text-sm">{summary.during_game_feelings}</span>
                              </div>
                            )}
                            {summary.post_game_feelings && (
                              <div>
                                <span className="text-sm font-medium">אחרי המשחק: </span>
                                <span className="text-sm">{summary.post_game_feelings}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {summary.coach_notes && (
                          <div>
                            <h3 className="font-medium text-blue-600 mb-1">הערות המאמן</h3>
                            <p className="text-sm">{summary.coach_notes}</p>
                          </div>
                        )}
                        
                        {summary.video_urls && summary.video_urls.length > 0 && (
                          <div>
                            <h3 className="font-medium text-blue-600 mb-1">סרטוני ניתוח</h3>
                            <div className="flex flex-wrap gap-2">
                              {summary.video_urls.map((url, index) => (
                                <a 
                                  key={index} 
                                  href={url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-500 underline"
                                >
                                  סרטון {index + 1}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-xl">הוסף סיכום משחק חדש</CardTitle>
              <CardDescription>מלא את הפרטים הבאים לתיעוד המשחק</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="gameName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>שם המשחק</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="שם המשחק" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="gameDate"
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
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="opponent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>יריב</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="שם היריב" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="gameType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>סוג המשחק</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="בחר סוג משחק" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="official">משחק רשמי</SelectItem>
                              <SelectItem value="training">משחק אימון</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="strengths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>נקודות חוזק</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="פרט את נקודות החוזק במשחק" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="improvements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>נקודות לשיפור</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="פרט את הנקודות לשיפור במשחק" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="keyMoments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>רגעי מפתח</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="תאר רגעי מפתח משמעותיים במשחק" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">תחושות במשחק</h3>
                    
                    <FormField
                      control={form.control}
                      name="preGameFeelings"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>תחושות לפני המשחק</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="תאר את תחושותיך לפני המשחק" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="duringGameFeelings"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>תחושות במהלך המשחק</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="תאר את תחושותיך במהלך המשחק" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="postGameFeelings"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>תחושות אחרי המשחק</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="תאר את תחושותיך לאחר המשחק" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="coachNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>הערות מאמן</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="הערות נוספות מהמאמן" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-2">
                    <Label htmlFor="video-upload">העלאת סרטוני ניתוח</Label>
                    <div className="border border-dashed rounded-lg p-6 text-center">
                      <label htmlFor="video-upload" className="cursor-pointer">
                        <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500 mb-1">לחץ להעלאת סרטוני ניתוח</p>
                        <p className="text-xs text-gray-400">ניתן להעלות קבצי וידאו</p>
                        <Input
                          id="video-upload"
                          type="file"
                          multiple
                          accept="video/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    
                    {selectedFiles.length > 0 && (
                      <div className="space-y-2 mt-2">
                        <p className="text-sm font-medium">קבצים שנבחרו:</p>
                        <div className="space-y-1">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-sm truncate max-w-[80%]">{file.name}</span>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeFile(index)}
                              >
                                הסר
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-6">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        form.reset();
                        setSelectedFiles([]);
                      }}
                    >
                      ביטול
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "שומר..." : "שמור סיכום"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PlayerGameSummary;
