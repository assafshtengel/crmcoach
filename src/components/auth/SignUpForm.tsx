
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
        throw error;
      }

      if (data.user) {
        console.log("User created successfully:", data.user);
        
        // בדיקה שהתפקיד נוצר בהצלחה
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        if (roleError) {
          console.error("Error verifying coach role:", roleError);
        } else {
          console.log("User role verified:", roleData);
        }
        
        // וידוא שהמאמן נרשם בטבלת המאמנים
        const { data: coachData, error: coachError } = await supabase
          .from('coaches')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();
          
        if (coachError) {
          console.error("Error verifying coach entry:", coachError);
        } else {
          console.log("Coach entry verified:", coachData);
          
          // אם לא קיים, ניצור אותו באופן מפורש
          if (!coachData) {
            console.log("Creating coach entry explicitly");
            
            const { error: insertError } = await supabase
              .from('coaches')
              .insert({
                id: data.user.id,
                full_name: fullName,
                email: email,
                specialty: specialty
              });
              
            if (insertError) {
              console.error("Error creating coach entry:", insertError);
            } else {
              console.log("Coach entry created successfully");
            }
          }
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
