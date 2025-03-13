
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

// Define form schema
const trainingSummarySchema = z.object({
  trainingName: z.string().min(1, { message: "נדרש שם אימון" }),
  trainingDate: z.string().min(1, { message: "נדרש תאריך אימון" }),
  trainingGoal: z.string().min(1, { message: "נדרשת מטרת אימון" }),
  challenges: z.string().optional(),
  insights: z.string().min(1, { message: "נדרשות תובנות עיקריות" }),
  nextSteps: z.string().optional(),
});

type TrainingSummaryFormValues = z.infer<typeof trainingSummarySchema>;

interface TrainingSummary {
  id: string;
  player_id: string;
  training_name: string;
  training_date: string;
  training_goal: string;
  challenges: string;
  insights: string;
  next_steps: string;
  created_at: string;
  media_urls?: string[];
}

const PlayerTrainingSummary = () => {
  const [trainingSummaries, setTrainingSummaries] = useState<TrainingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const navigate = useNavigate();

  const form = useForm<TrainingSummaryFormValues>({
    resolver: zodResolver(trainingSummarySchema),
    defaultValues: {
      trainingName: "",
      trainingDate: new Date().toISOString().split('T')[0],
      trainingGoal: "",
      challenges: "",
      insights: "",
      nextSteps: "",
    },
  });

  useEffect(() => {
    const fetchTrainingSummaries = async () => {
      try {
        const playerSessionStr = localStorage.getItem('playerSession');
        
        if (!playerSessionStr) {
          navigate('/player-auth');
          return;
        }
        
        const playerSession = JSON.parse(playerSessionStr);
        
        const { data, error } = await supabase
          .from('training_summaries')
          .select('*')
          .eq('player_id', playerSession.id)
          .order('training_date', { ascending: false });
        
        if (error) throw error;
        
        setTrainingSummaries(data || []);
      } catch (error: any) {
        console.error('Error loading training summaries:', error);
        toast.error(error.message || "אירעה שגיאה בטעינת סיכומי האימונים");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrainingSummaries();
  }, [navigate]);

  const onSubmit = async (values: TrainingSummaryFormValues) => {
    try {
      setLoading(true);
      
      const playerSessionStr = localStorage.getItem('playerSession');
      if (!playerSessionStr) {
        navigate('/player-auth');
        return;
      }
      
      const playerSession = JSON.parse(playerSessionStr);
      
      // Mock implementation - in a real app we would upload files to storage
      const mediaUrls = selectedFiles.length > 0 
        ? selectedFiles.map(file => URL.createObjectURL(file)) 
        : [];
      
      const newSummary = {
        player_id: playerSession.id,
        training_name: values.trainingName,
        training_date: values.trainingDate,
        training_goal: values.trainingGoal,
        challenges: values.challenges || "",
        insights: values.insights,
        next_steps: values.nextSteps || "",
        media_urls: mediaUrls,
      };
      
      // In a real implementation, this would save to the database
      // For now, we'll just add it to our state and pretend it saved
      const mockSavedSummary = {
        ...newSummary,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };
      
      setTrainingSummaries(prev => [mockSavedSummary, ...prev]);
      
      toast.success("סיכום האימון נשמר בהצלחה");
      setShowForm(false);
      form.reset();
      setSelectedFiles([]);
    } catch (error: any) {
      console.error('Error saving training summary:', error);
      toast.error(error.message || "אירעה שגיאה בשמירת סיכום האימון");
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

  const filteredSummaries = trainingSummaries.filter(summary => 
    summary.training_name.includes(searchQuery) || 
    summary.training_goal.includes(searchQuery) ||
    summary.insights.includes(searchQuery)
  );

  if (loading && trainingSummaries.length === 0) {
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
          <h1 className="text-2xl font-bold">סיכומי אימונים</h1>
        </div>

        {!showForm ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-full max-w-md">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="חיפוש סיכומי אימונים..."
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
                  <p className="text-xl text-gray-500 mb-4">אין סיכומי אימונים עדיין</p>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="ml-2 h-4 w-4" />
                    הוסף סיכום אימון ראשון
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredSummaries.map((summary) => (
                  <Card key={summary.id} className="shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                    <CardHeader className="pb-2 bg-emerald-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{summary.training_name}</CardTitle>
                          <CardDescription>
                            {new Date(summary.training_date).toLocaleDateString('he-IL')}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-medium text-emerald-600 mb-1">מטרת האימון</h3>
                          <p className="text-sm">{summary.training_goal}</p>
                        </div>
                        
                        {summary.challenges && (
                          <div>
                            <h3 className="font-medium text-emerald-600 mb-1">אתגרים שעלו</h3>
                            <p className="text-sm">{summary.challenges}</p>
                          </div>
                        )}
                        
                        <div>
                          <h3 className="font-medium text-emerald-600 mb-1">תובנות עיקריות</h3>
                          <p className="text-sm">{summary.insights}</p>
                        </div>
                        
                        {summary.next_steps && (
                          <div>
                            <h3 className="font-medium text-emerald-600 mb-1">משימות להמשך</h3>
                            <p className="text-sm">{summary.next_steps}</p>
                          </div>
                        )}
                        
                        {summary.media_urls && summary.media_urls.length > 0 && (
                          <div>
                            <h3 className="font-medium text-emerald-600 mb-1">קבצי מדיה</h3>
                            <div className="flex flex-wrap gap-2">
                              {summary.media_urls.map((url, index) => (
                                <a 
                                  key={index} 
                                  href={url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-500 underline"
                                >
                                  קובץ {index + 1}
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
              <CardTitle className="text-xl">הוסף סיכום אימון חדש</CardTitle>
              <CardDescription>מלא את הפרטים הבאים לתיעוד האימון</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="trainingName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>שם האימון</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="שם האימון" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="trainingDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>תאריך האימון</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="trainingGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>מטרת האימון</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="תאר את מטרת האימון" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="challenges"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>אתגרים שעלו</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="תאר אתגרים שעלו במהלך האימון" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="insights"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>תובנות עיקריות</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="תאר את התובנות העיקריות מהאימון" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="nextSteps"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>משימות להמשך</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="תאר משימות להמשך לאחר האימון" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-2">
                    <Label htmlFor="media-upload">הוספת קבצי מדיה (תמונות, סרטונים)</Label>
                    <div className="border border-dashed rounded-lg p-6 text-center">
                      <label htmlFor="media-upload" className="cursor-pointer">
                        <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500 mb-1">לחץ להעלאת קבצים</p>
                        <p className="text-xs text-gray-400">ניתן להעלות תמונות, סרטונים או קבצי אודיו</p>
                        <Input
                          id="media-upload"
                          type="file"
                          multiple
                          accept="image/*,video/*,audio/*"
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

export default PlayerTrainingSummary;
