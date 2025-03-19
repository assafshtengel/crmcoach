
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "כותרת חייבת להכיל לפחות 2 תווים",
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
});

type FormValues = z.infer<typeof formSchema>;

interface LandingPageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LandingPageDialog({ open, onOpenChange }: LandingPageDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      contactEmail: "",
      contactPhone: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Here you would handle the actual form submission
      console.log("Form values:", values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "עמוד הנחיתה נוצר בהצלחה!",
        description: "עמוד הנחיתה שלך נוצר ויהיה זמין בקרוב",
      });
      
      // Close the dialog and reset form
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error creating landing page:", error);
      toast({
        title: "שגיאה ביצירת עמוד הנחיתה",
        description: "אירעה שגיאה בעת יצירת עמוד הנחיתה. נסה שוב מאוחר יותר.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl">יצירת עמוד נחיתה אישי</DialogTitle>
          <DialogDescription>
            מלא את הפרטים כדי ליצור עמוד נחיתה מותאם אישית
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>כותרת עמוד הנחיתה</FormLabel>
                  <FormControl>
                    <Input placeholder="הזן כותרת..." {...field} />
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תיאור</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="תאר את השירות או המוצר שלך..." 
                      {...field} 
                      className="min-h-[120px]"
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
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
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
      </DialogContent>
    </Dialog>
  );
}
