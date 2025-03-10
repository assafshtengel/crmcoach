import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Starting coach signup process");
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            specialty,
            role: 'coach'
          },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) {
        console.error("Signup error:", error);
        
        if (error.message && error.message.includes("User already registered")) {
          throw new Error("כתובת האימייל כבר רשומה במערכת. נא להשתמש בכתובת אימייל אחרת או להתחבר עם החשבון הקיים");
        }
        
        throw error;
      }

      if (data.user) {
        console.log("User created successfully:", data.user);
        
        try {
          // Try to sign in immediately after signup
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) {
            console.error("Auto sign-in error:", signInError);
            throw signInError;
          }

          // If sign in successful, navigate to home
          navigate('/');
          
        } catch (signInError) {
          console.error("Error in auto sign-in:", signInError);
          // Even if auto sign-in fails, we still show success message
          toast({
            title: "הרשמה בוצעה בהצלחה",
            description: "אנא התחבר עם האימייל והסיסמה שלך",
          });
          onLoginClick();
        }
      }
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
