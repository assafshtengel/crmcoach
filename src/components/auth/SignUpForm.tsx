
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [education, setEducation] = useState("");
  const [certifications, setCertifications] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            specialty,
            years_of_experience: parseInt(yearsOfExperience),
            education,
            certifications,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "הרשמה בוצעה בהצלחה",
        description: "נשלח אליך מייל לאימות החשבון. אנא בדוק את תיבת הדואר שלך ולחץ על הקישור לאימות המייל לפני שתנסה להתחבר.",
        duration: 6000,
      });
      
      onLoginClick(); // חזרה למסך ההתחברות
    } catch (error: any) {
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
        <Label htmlFor="specialty">התמחות</Label>
        <Input
          id="specialty"
          type="text"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="yearsOfExperience">שנות ניסיון</Label>
        <Input
          id="yearsOfExperience"
          type="number"
          value={yearsOfExperience}
          onChange={(e) => setYearsOfExperience(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="education">השכלה</Label>
        <Textarea
          id="education"
          value={education}
          onChange={(e) => setEducation(e.target.value)}
          placeholder="פרט את השכלתך..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="certifications">תעודות והסמכות</Label>
        <Textarea
          id="certifications"
          value={certifications}
          onChange={(e) => setCertifications(e.target.value)}
          placeholder="פרט את התעודות וההסמכות שלך..."
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
