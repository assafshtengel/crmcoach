
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { SecurityCodeDialog } from "./SecurityCodeDialog";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  onSignUpClick: () => void;
  onForgotPasswordClick: () => void;
}

export const LoginForm = ({ onForgotPasswordClick }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Attempting to login with:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        
        if (error.message.includes("Invalid login credentials")) {
          toast({
            variant: "destructive",
            title: "שגיאת התחברות",
            description: "האימייל או הסיסמה שגויים",
          });
        } else {
          toast({
            variant: "destructive",
            title: "שגיאת התחברות",
            description: error.message,
          });
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log("User authenticated:", data.user.id);
        
        // בדוק אם למשתמש יש רשומת מאמן
        const { data: coachData, error: coachError } = await supabase
          .from('coaches')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();
        
        if (coachError) {
          console.error("Error checking coach record:", coachError);
        }
        
        // אם אין רשומת מאמן, בדוק אם הוא רשום בתפקיד מאמן
        if (!coachData) {
          // בדוק אם משתמש רשום בתפקיד מאמן
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle();
            
          if (roleError) {
            console.error("Error checking user role:", roleError);
          }
          
          // אם יש לו תפקיד מאמן, נוסיף רשומת מאמן
          if (roleData && roleData.role === 'coach') {
            const { error: insertError } = await supabase
              .from('coaches')
              .insert({
                id: data.user.id,
                email: data.user.email,
                full_name: data.user.user_metadata.full_name || data.user.email.split('@')[0]
              });
              
            if (insertError) {
              console.error("Error creating coach record:", insertError);
              // נמשיך בכל זאת כי התפקיד כבר רשום
            }
          } else {
            // אם אין גם תפקיד, נוסיף גם תפקיד וגם רשומת מאמן
            const { error: insertRoleError } = await supabase
              .from('user_roles')
              .insert({
                id: data.user.id,
                role: 'coach'
              });
              
            if (insertRoleError) {
              console.error("Error adding coach role:", insertRoleError);
            }
            
            const { error: insertCoachError } = await supabase
              .from('coaches')
              .insert({
                id: data.user.id,
                email: data.user.email,
                full_name: data.user.user_metadata.full_name || data.user.email.split('@')[0]
              });
              
            if (insertCoachError) {
              console.error("Error creating coach record:", insertCoachError);
            }
          }
        }
        
        // נווט לעמוד הדשבורד של המאמן
        navigate('/dashboard-coach');
        
        toast({
          title: "התחברות בוצעה בהצלחה",
          description: "ברוך הבא למערכת",
        });
      }

    } catch (error: any) {
      console.error("Unexpected error during login:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בהתחברות",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityDialogSuccess = () => {
    setShowSecurityDialog(false);
    navigate('/signup-coach');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <div className="relative">
          <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="email"
            placeholder="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pr-10"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="relative">
          <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10 pl-10"
            required
          />
          <button 
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? 
              <EyeOff size={18} aria-label="הסתר סיסמה" /> : 
              <Eye size={18} aria-label="הצג סיסמה" />
            }
          </button>
        </div>
      </div>
      
      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? "מתחבר..." : "התחבר"}
      </Button>
      <div className="flex flex-col space-y-2 text-center text-sm">
        <button
          type="button"
          onClick={onForgotPasswordClick}
          className="text-primary hover:underline"
        >
          שכחת סיסמה?
        </button>
        <button
          type="button"
          onClick={() => setShowSecurityDialog(true)}
          className="text-primary hover:underline"
        >
          אין לך חשבון? הירשם עכשיו
        </button>
      </div>
      
      {/* Security Code Dialog */}
      <SecurityCodeDialog 
        open={showSecurityDialog} 
        onClose={() => setShowSecurityDialog(false)} 
        onSuccess={handleSecurityDialogSuccess}
      />
    </form>
  );
};
