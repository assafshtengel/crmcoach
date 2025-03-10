
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SignUpFormProps {
  onLoginClick: () => void;
}

export const SignUpForm = ({ onLoginClick }: SignUpFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Starting coach signup process");
      
      // הרשמת המשתמש עם metadata שכולל את תפקיד המאמן
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            specialty,
            role: 'coach' // מסמן את המשתמש כמאמן
          },
        },
      });

      if (error) {
        console.error("Signup error:", error);
        
        // Check if it's a "User already registered" error
        if (error.message && error.message.includes("User already registered")) {
          throw new Error("כתובת האימייל כבר רשומה במערכת. נא להשתמש בכתובת אימייל אחרת או להתחבר עם החשבון הקיים");
        }
        
        throw error;
      }

      if (data.user) {
        console.log("User created successfully:", data.user);
        
        try {
          // Check if coach already exists first
          const { data: existingCoach } = await supabase
            .from('coaches')
            .select('id')
            .eq('id', data.user.id)
            .single();
            
          // Only insert if not exists
          if (!existingCoach) {
            // וידוא שהמאמן נרשם בטבלת המאמנים
            const { error: coachError } = await supabase
              .from('coaches')
              .insert({
                id: data.user.id,
                full_name: fullName,
                email: email,
                specialty: specialty
              });
                
            if (coachError) {
              console.error("Error creating coach entry:", coachError);
            } else {
              console.log("Coach entry created successfully");
            }
          }

          // Send notification email about the new coach
          try {
            console.log("Sending notification email for new coach");
            const response = await supabase.functions.invoke('notify-new-coach', {
              body: { coachId: data.user.id }
            });

            if (response.error) {
              console.error("Error sending notification email:", response.error);
            } else {
              console.log("Notification email sent successfully");
            }
          } catch (emailError) {
            console.error("Failed to send notification email:", emailError);
            // We don't want to block the signup process if notification fails
          }
        } catch (dbError) {
          console.error("Database operation error:", dbError);
          // Don't throw here so signup can still proceed
        }
      }

      toast({
        title: "הרשמה בוצעה בהצלחה",
        description: "נשלח אליך מייל לאימות החשבון. אנא בדוק את תיבת הדואר שלך ולחץ על הקישור לאימות המייל לפני שתנסה להתחבר.",
        duration: 6000,
      });
      
      onLoginClick();
    } catch (error: any) {
      console.error("Signup error details:", error);
      
      toast({
        variant: "destructive",
        title: "שגיאה בהרשמה",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">שם מלא</Label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">אימייל</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">סיסמה</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialty">תחום התמחות</Label>
        <Textarea
          id="specialty"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          placeholder="תאר את תחום ההתמחות שלך..."
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? "יוצר חשבון..." : "הרשמה"}
      </Button>
      
      <div className="text-center">
        <button
          type="button"
          onClick={onLoginClick}
          className="text-primary hover:underline text-sm"
        >
          יש לך כבר חשבון? התחבר
        </button>
      </div>
    </form>
  );
};
