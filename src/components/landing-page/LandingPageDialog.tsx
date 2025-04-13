
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadImage } from "@/lib/uploadImage";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabaseClient } from "@/lib/supabaseClient";
import { Eye } from "lucide-react";
import { useCreateBucket } from '@/hooks/useCreateBucket';

const ADVANTAGE_OPTIONS = [
  { id: "mental-resilience", label: "חוסן מנטלי" },
  { id: "confidence", label: "שיפור ביטחון עצמי" },
  { id: "goal-setting", label: "הצבת מטרות והשגתן" },
  { id: "stress-management", label: "ניהול לחץ ומתח" },
  { id: "focus-improvement", label: "שיפור ריכוז ומיקוד" },
  { id: "teamwork", label: "עבודת צוות יעילה" },
  { id: "performance-boost", label: "שיפור ביצועים" },
  { id: "leadership", label: "פיתוח מנהיגות" },
];

const SUBTITLE_OPTIONS = [
  { value: "personal-training", label: "אימון אישי שיביא אותך לתוצאות" },
  { value: "professional-guidance", label: "ליווי מקצועי להצלחה ספורטיבית" },
  { value: "mental-coaching", label: "אימון מנטלי לשיפור הביצועים" },
  { value: "holistic-approach", label: "גישה הוליסטית לפיתוח ספורטאים" },
  { value: "performance-enhancement", label: "העצמת היכולות המנטליות שלך" }
];

const CTA_OPTIONS = [
  { value: "free-consultation", label: "שיחת ייעוץ חינם!" },
  { value: "start-now", label: "התחל עכשיו!" },
  { value: "join-program", label: "הצטרף לתוכנית האימון!" },
  { value: "contact-me", label: "צור קשר עוד היום!" },
  { value: "book-session", label: "קבע פגישה!" }
];

const formSchema = z.object({
  title: z.string().min(2, {
    message: "כותרת חייבת להכיל לפחות 2 תווים",
  }),
  subtitle: z.string({
    required_error: "נא לבחור תת-כותרת",
  }),
  description: z.string().min(10, {
    message: "תיאור חייב להכיל לפחות 10 תווים",
  }),
  contactEmail: z.string().email({
    message: "נא להזין כתובת אימייל תקינה",
  }),
  contactPhone: z.string().min(9, {
    message: "נא להזין מספר טלפון תקין",
  }),
  
  mainReason: z.string().min(5, {
    message: "נא להזין סיבה מרכזית לבחירה בך",
  }),
  advantages: z.array(z.string()).min(1, {
    message: "נא לבחור לפחות יתרון אחד",
  }).max(5, {
    message: "ניתן לבחור עד 5 יתרונות",
  }),
  workStep1: z.string().min(5, {
    message: "נא למלא את השלב הראשון בתהליך",
  }),
  workStep2: z.string().min(5, {
    message: "נא למלא את השלב השני בתהליך",
  }),
  workStep3: z.string().min(5, {
    message: "נא למלא את השלב השלישי בתהליך",
  }),
  ctaText: z.string({
    required_error: "נא לבחור טקסט לכפתור",
  }),
  bgColor: z.number().array().length(1),
  accentColor: z.number().array().length(1),
  buttonColor: z.number().array().length(1),
  isDarkText: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface LandingPageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPageCreated?: () => void;
}

export function LandingPageDialog({ open, onOpenChange, onPageCreated }: LandingPageDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("form");
  const [landingPageId, setLandingPageId] = useState<string | null>(null);
  const [publishUrl, setPublishUrl] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      contactEmail: "",
      contactPhone: "",
      mainReason: "",
      advantages: [],
      workStep1: "",
      workStep2: "",
      workStep3: "",
      ctaText: "",
      bgColor: [50],
      accentColor: [50],
      buttonColor: [50],
      isDarkText: true,
    },
  });

  const { createBucket } = useCreateBucket();
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    console.log("Form submission started");
    
    try {
      console.log("Form values:", values);
      
      const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
      
      if (sessionError) {
        console.error("Error getting session:", sessionError);
        throw new Error("שגיאה בקבלת נתוני המשתמש: " + sessionError.message);
      }
      
      if (!sessionData?.session) {
        console.error("No session found");
        toast({
          title: "שגיאה",
          description: "עליך להתחבר למערכת כדי ליצור עמוד נחיתה",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log("User session confirmed:", sessionData.session.user.id);
      
      // Try to create the bucket if it doesn't exist
      try {
        await createBucket('landing-pages');
        console.log("Bucket exists or was created successfully");
      } catch (bucketError) {
        // If the error is because the bucket already exists, that's fine
        console.log("Bucket creation error (might already exist):", bucketError);
      }
      
      let imageUrl = null;
      if (profileImage) {
        try {
          console.log("Starting image upload");
          const timestamp = new Date().getTime();
          const path = `${timestamp}_${profileImage.name}`;
          await uploadImage(profileImage, 'landing-pages', path);
          imageUrl = path;
          console.log("Image uploaded successfully:", imageUrl);
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast({
            title: "שגיאה בהעלאת התמונה",
            description: "לא הצלחנו להעלות את התמונה. אנא נסה שנית.",
            variant: "destructive",
          });
          // Continue without image
        }
      }
      
      const advantageLabels = values.advantages.map(id => {
        const advantage = ADVANTAGE_OPTIONS.find(a => a.id === id);
        return advantage ? advantage.label : id;
      });
      
      const ctaLabel = CTA_OPTIONS.find(option => option.value === values.ctaText)?.label || values.ctaText;
      
      const subtitleLabel = SUBTITLE_OPTIONS.find(option => option.value === values.subtitle)?.label || values.subtitle;
      
      const landingPageData = {
        coach_id: sessionData.session.user.id,
        title: values.title,
        subtitle: subtitleLabel,
        subtitle_id: values.subtitle,
        description: values.description,
        contact_email: values.contactEmail,
        contact_phone: values.contactPhone,
        main_reason: values.mainReason,
        advantages: advantageLabels,
        advantages_ids: values.advantages,
        work_steps: [values.workStep1, values.workStep2, values.workStep3],
        cta_text: ctaLabel,
        cta_id: values.ctaText,
        profile_image_path: imageUrl,
        bg_color: getColorFromValue(values.bgColor[0], 'bg'),
        accent_color: getColorFromValue(values.accentColor[0], 'accent'),
        button_color: getColorFromValue(values.buttonColor[0], 'button'),
        is_dark_text: values.isDarkText,
        is_published: false,
        styles: {
          bgColorValue: values.bgColor[0],
          accentColorValue: values.accentColor[0],
          buttonColorValue: values.buttonColor[0]
        }
      };
      
      console.log("Creating landing page with data:", landingPageData);
      
      const { data, error } = await supabaseClient
        .from('landing_pages')
        .insert(landingPageData)
        .select()
        .single();
      
      if (error) {
        console.error("Error creating landing page:", error);
        throw new Error("שגיאה ביצירת עמוד הנחיתה: " + error.message);
      }
      
      console.log("Landing page created successfully:", data);
      setLandingPageId(data.id);
      
      toast({
        title: "עמוד הנחיתה נוצר בהצלחה!",
        description: "עכשיו תוכל לבחון את העמוד לפני פרסום",
      });
      
      setActiveTab("preview");
      
      // Call onPageCreated callback if provided
      if (onPageCreated) {
        onPageCreated();
      }
      
    } catch (error: any) {
      console.error("Error creating landing page:", error);
      toast({
        title: "שגיאה ביצירת עמוד נחיתה",
        description: error.message || "אירעה שגיאה בעת יצירת עמוד הנחיתה. נסה שוב מאוחר יותר.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      console.log("Form submission completed");
    }
  };
  
  const handlePublish = async () => {
    if (!landingPageId) return;
    
    setIsSubmitting(true);
    console.log("Publishing landing page:", landingPageId);
    
    try {
      const { data, error } = await supabaseClient
        .from('landing_pages')
        .update({ is_published: true })
        .eq('id', landingPageId)
        .select()
        .single();
      
      if (error) {
        console.error("Error publishing landing page:", error);
        throw new Error("שגיאה בפרסום עמוד הנחיתה: " + error.message);
      }
      
      const publishedUrl = `/landing/${data.id}`;
      setPublishUrl(publishedUrl);
      console.log("Landing page published successfully:", publishedUrl);
      
      toast({
        title: "עמוד הנחיתה פורסם בהצלחה!",
        description: "כעת הוא זמין לצפייה באינטרנט",
      });
      
      // Call onPageCreated callback if provided
      if (onPageCreated) {
        onPageCreated();
      }
      
    } catch (error: any) {
      console.error("Error publishing landing page:", error);
      toast({
        title: "שגיאה בפרסום עמוד הנחיתה",
        description: error.message || "אירעה שגיאה בעת פרסום עמוד הנחיתה. נסה שוב מאוחר יותר.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      console.log("Publishing process completed");
    }
  };
  
  const getColorFromValue = (value: number, colorType: 'bg' | 'accent' | 'button') => {
    const colorMap = {
      bg: [
        "#ffffff", // לבן
        "#F1F0FB", // אפור בהיר
        "#E5DEFF", // סגול רך
        "#D3E4FD", // כחול רך
        "#FEF7CD", // צהוב רך
        "#F2FCE2", // ירוק רך
        "#FFDEE2", // ורוד רך
        "#FDE1D3"  // אפרסק
      ],
      accent: [
        "#1A1F2C", // סגול כהה
        "#8B5CF6", // סגול חי
        "#0EA5E9", // כחול אוקיינוס
        "#F97316", // כתום בהיר
        "#D946EF", // ורוד מגנטה
        "#403E43", // אפור פחם
        "#1EAEDB", // כחול בהיר
        "#EA384C"  // אדום
      ],
      button: [
        "#9b87f5", // סגול ראשי
        "#8B5CF6", // סגול חי
        "#0EA5E9", // כחול אוקיינוס
        "#F97316", // כתום בהיר
        "#D946EF", // ורוד מגנטה
        "#1EAEDB", // כחול בהיר
        "#EA384C", // אדום
        "#1A1F2C"  // שחור
      ]
    };

    const index = Math.min(Math.floor(value / 12.5), 7);
    return colorMap[colorType][index];
  };

  const handleCloseDialog = () => {
    form.reset();
    setActiveTab("form");
    setLandingPageId(null);
    setPublishUrl(null);
    setProfileImage(null);
    setImagePreview(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">יצירת עמוד נחיתה אישי</DialogTitle>
          <DialogDescription>
            מלא את הפרטים כדי ליצור עמוד נחיתה מותאם אישית
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">עריכת תוכן</TabsTrigger>
            <TabsTrigger value="preview" disabled={!landingPageId}>תצוגה מקדימה</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form" className="space-y-4 pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-4">
                  <h3 className="text-md font-semibold border-b pb-1">פרטים בסיסיים</h3>
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>כותרת ראשית</FormLabel>
                        <FormControl>
                          <Input placeholder="הדרך שלך להצלחה מתחילה כאן..." {...field} />
                        </FormControl>
                        <FormDescription>
                          הכותרת הראשית שתופיע בעמוד הנחיתה שלך
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>תת-כותרת</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="בחר תת-כותרת" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SUBTITLE_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          הסבר קצר שיופיע מתחת לכותרת הראשית
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="mainReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>סיבה מרכזית לבחור בך</FormLabel>
                        <FormControl>
                          <Input placeholder="7 שנות ניסיון בליווי להצלחה..." {...field} />
                        </FormControl>
                        <FormDescription>
                          הסבר קצר למה כדאי לבחור דווקא בך
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-md font-semibold border-b pb-1">יתרונות ותהליך עבודה</h3>
                  
                  <FormField
                    control={form.control}
                    name="advantages"
                    render={() => (
                      <FormItem>
                        <div className="mb-2">
                          <FormLabel>בחר 3-5 יתרונות מרכזיים</FormLabel>
                          <FormDescription>
                            הגורמים שמבדלים אותך משאר המאמנים
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {ADVANTAGE_OPTIONS.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="advantages"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-2 space-x-reverse"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="mr-2 font-normal cursor-pointer">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="workStep1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>שלב 1 בתהליך העבודה</FormLabel>
                          <FormControl>
                            <Input placeholder="פגישת היכרות ואבחון צרכים..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="workStep2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>שלב 2 בתהליך העבודה</FormLabel>
                          <FormControl>
                            <Input placeholder="בניית תוכנית אימון אישית..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="workStep3"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>שלב 3 בתהליך העבודה</FormLabel>
                          <FormControl>
                            <Input placeholder="מפגשי אימון והתקדמות מתמדת..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-md font-semibold border-b pb-1">תיאור, פרטי קשר וקריאה לפעולה</h3>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>תיאור</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="תאר את השירות או המוצר שלך..." 
                            {...field} 
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormDescription>
                          תיאור מפורט שיופיע בעמוד הנחיתה
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>אימייל ליצירת קשר</FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>טלפון ליצירת קשר</FormLabel>
                          <FormControl>
                            <Input placeholder="050-1234567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="ctaText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>טקסט לכפתור קריאה לפעולה</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="בחר טקסט לכפתור" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CTA_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          הטקסט שיופיע על הכפתור המרכזי בעמוד
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-md font-semibold border-b pb-1">עיצוב ותמונה</h3>
                  
                  <div className="space-y-4">
                    <FormItem>
                      <FormLabel>תמונה אישית</FormLabel>
                      <div className="flex items-center gap-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="max-w-[220px]"
                        />
                        {imagePreview && (
                          <div className="h-20 w-20 rounded-md overflow-hidden border">
                            <img 
                              src={imagePreview} 
                              alt="תצוגה מקדימה" 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <FormDescription>
                        העלה תמונה אישית שתופיע בעמוד הנחיתה
                      </FormDescription>
                    </FormItem>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="bgColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>צבע רקע עיקרי</FormLabel>
                          <div className="flex items-center gap-4">
                            <FormControl>
                              <Slider
                                value={field.value}
                                onValueChange={field.onChange}
                                max={100}
                                step={1}
                                className="flex-1"
                              />
                            </FormControl>
                            <div 
                              className="h-8 w-8 rounded-full border" 
                              style={{ backgroundColor: getColorFromValue(field.value[0], 'bg') }}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="accentColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>צבע הדגשה משני</FormLabel>
                          <div className="flex items-center gap-4">
                            <FormControl>
                              <Slider
                                value={field.value}
                                onValueChange={field.onChange}
                                max={100}
                                step={1}
                                className="flex-1"
                              />
                            </FormControl>
                            <div 
                              className="h-8 w-8 rounded-full border" 
                              style={{ backgroundColor: getColorFromValue(field.value[0], 'accent') }}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="buttonColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>צבע כפתורים</FormLabel>
                          <div className="flex items-center gap-4">
                            <FormControl>
                              <Slider
                                value={field.value}
                                onValueChange={field.onChange}
                                max={100}
                                step={1}
                                className="flex-1"
                              />
                            </FormControl>
                            <div 
                              className="h-8 w-8 rounded-full border" 
                              style={{ backgroundColor: getColorFromValue(field.value[0], 'button') }}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isDarkText"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-x-3 space-x-reverse">
                          <div className="space-y-0.5">
                            <FormLabel>צבע טקסט כהה</FormLabel>
                            <FormDescription>
                              השתמש בטקסט כהה (אחרת יהיה בצבע לבן)
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCloseDialog}
                    className="ml-2"
                  >
                    ביטול
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "יוצר עמוד..." : "צור עמוד נחיתה"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4 pt-4">
            <div className="rounded-lg border p-4 mb-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold">תצוגה מקדימה של עמוד הנחיתה</h2>
                <p className="text-sm text-gray-500">
                  כך ייראה עמוד הנחיתה שלך לאחר הפרסום
                </p>
              </div>
              
              {landingPageId && (
                <div className="aspect-video w-full bg-gray-100 border rounded-md overflow-hidden">
                  <iframe 
                    src={`/landing/preview/${landingPageId}`} 
                    className="w-full h-full" 
                    title="תצוגה מקדימה"
                  />
                </div>
              )}
              
              <div className="flex justify-between mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setActiveTab("form")}
                >
                  חזור לעריכה
                </Button>
                
                <Button 
                  type="button"
                  onClick={handlePublish}
                  disabled={isSubmitting || !landingPageId}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? "מפרסם..." : "פרסם עכשיו"}
                </Button>
              </div>
              
              {publishUrl && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="font-medium text-green-800 mb-2">עמוד הנחיתה פורסם בהצלחה!</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">הקישור לעמוד שלך:</span>
                    <a 
                      href={publishUrl}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {window.location.origin}{publishUrl}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
