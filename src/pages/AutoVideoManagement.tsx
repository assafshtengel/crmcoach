import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowRight, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  videoTitle: z.string().min(2, {
    message: "שם הסרטון חייב להכיל לפחות 2 תווים.",
  }),
  videoDescription: z.string().optional(),
  isPublic: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const AutoVideoManagement = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoTitle: "",
      videoDescription: "",
      isPublic: false,
    },
  });

  const { control, handleSubmit, reset, setValue, formState: { errors } } = form;

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*');

      if (error) {
        console.error("Error fetching videos:", error);
        toast({
          variant: "destructive",
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת הסרטונים.",
        });
      } else {
        setVideos(data || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditMode && selectedVideo) {
        // Update existing video
        const { error } = await supabase
          .from('videos')
          .update({
            title: data.videoTitle,
            description: data.videoDescription,
            is_public: data.isPublic,
          })
          .eq('id', selectedVideo.id);

        if (error) {
          console.error("Error updating video:", error);
          toast({
            variant: "destructive",
            title: "שגיאה",
            description: "אירעה שגיאה בעדכון הסרטון.",
          });
        } else {
          toast({
            title: "הצלחה",
            description: "הסרטון עודכן בהצלחה.",
          });
          fetchVideos();
        }
      } else {
        // Create new video
        const { error } = await supabase
          .from('videos')
          .insert({
            title: data.videoTitle,
            description: data.videoDescription,
            is_public: data.isPublic,
          });

        if (error) {
          console.error("Error creating video:", error);
          toast({
            variant: "destructive",
            title: "שגיאה",
            description: "אירעה שגיאה ביצירת הסרטון.",
          });
        } else {
          toast({
            title: "הצלחה",
            description: "הסרטון נוצר בהצלחה.",
          });
          fetchVideos();
        }
      }
      reset();
      setSelectedVideo(null);
      setIsEditMode(false);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אירעה שגיאה לא צפויה.",
      });
    }
  };

  const handleEdit = (video) => {
    setSelectedVideo(video);
    setIsEditMode(true);
    setValue("videoTitle", video.title);
    setValue("videoDescription", video.description || "");
    setValue("isPublic", video.is_public || false);
  };

  const handleDelete = async (videoId) => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (error) {
        console.error("Error deleting video:", error);
        toast({
          variant: "destructive",
          title: "שגיאה",
          description: "אירעה שגיאה במחיקת הסרטון.",
        });
      } else {
        toast({
          title: "הצלחה",
          description: "הסרטון נמחק בהצלחה.",
        });
        fetchVideos();
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אירעה שגיאה לא צפויה.",
      });
    }
  };

  const handleCancel = () => {
    reset();
    setSelectedVideo(null);
    setIsEditMode(false);
  };

  return (
    <div className="container mx-auto p-4">
      <Button
        variant="outline"
        size="icon"
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
      <h1 className="text-2xl font-bold mb-4">ניהול סרטונים אוטומטי</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Video Form */}
        <div className="bg-white shadow-md rounded-md p-4">
          <h2 className="text-lg font-semibold mb-2">{isEditMode ? 'עריכת סרטון' : 'הוספת סרטון'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="videoTitle">שם הסרטון</Label>
              <Controller
                control={control}
                name="videoTitle"
                render={({ field }) => (
                  <Input
                    id="videoTitle"
                    placeholder="הכנס שם סרטון"
                    {...field}
                  />
                )}
              />
              {errors.videoTitle && (
                <p className="text-red-500 text-sm">{errors.videoTitle.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="videoDescription">תיאור הסרטון</Label>
              <Controller
                control={control}
                name="videoDescription"
                render={({ field }) => (
                  <Textarea
                    id="videoDescription"
                    placeholder="הכנס תיאור לסרטון"
                    {...field}
                  />
                )}
              />
            </div>
            <div>
              <Label htmlFor="isPublic">
                <div className="flex items-center">
                  <Controller
                    control={control}
                    name="isPublic"
                    defaultValue={false}
                    render={({ field }) => (
                      <Checkbox
                        id="isPublic"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <span className="ml-2">סרטון ציבורי</span>
                </div>
              </Label>
            </div>
            <div className="flex justify-end">
              {isEditMode && (
                <Button
                  type="button"
                  variant="ghost"
                  className="mr-2"
                  onClick={handleCancel}
                >
                  ביטול
                </Button>
              )}
              <Button type="submit">{isEditMode ? 'שמור שינויים' : 'הוסף סרטון'}</Button>
            </div>
          </form>
        </div>

        {/* Video List */}
        <div className="bg-white shadow-md rounded-md p-4">
          <h2 className="text-lg font-semibold mb-2">רשימת סרטונים</h2>
          {isLoading ? (
            <p>טוען סרטונים...</p>
          ) : (
            <div className="space-y-2">
              {videos.map((video) => (
                <div key={video.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100">
                  <span>{video.title}</span>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(video)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(video.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {videos.length === 0 && <p>אין סרטונים להצגה.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoVideoManagement;
