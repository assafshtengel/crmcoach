
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CoachSignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Starting coach signup process from CoachSignUp page");
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'coach'
          },
        },
      });

      if (error) {
        console.error("Signup error:", error);
        throw error;
      }

      if (data.user) {
        console.log("User created successfully:", data.user);
        
        // יצירת רשומת מאמן מפורשת
        const { error: coachError } = await supabase
          .from('coaches')
          .insert([{ 
            id: data.user.id,
            full_name: fullName,
            email: email
          }]);

        if (coachError) {
          console.error("Error creating coach record:", coachError);
          
          // אם יש שגיאה בשמירת המאמן, ננסה ליצור את רשומת התפקיד
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert([{ 
              id: data.user.id,
              role: 'coach'
            }]);
            
          if (roleError) {
            console.error("Error creating role record:", roleError);
          }
          
          throw new Error("שגיאה בשמירת נתוני המאמן");
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

        toast({
          title: "הרשמה בוצעה בהצלחה!",
          description: "נא לאמת את כתובת המייל שלך ולהתחבר למערכת",
        });

        navigate('/auth');
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">הרשמה כמאמן</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <Input
                placeholder="שם מלא"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            
            <div>
              <Input
                placeholder="אימייל"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Input
                placeholder="סיסמה"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "מבצע רישום..." : "הרשמה"}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => navigate('/auth')}
              >
                כבר יש לך חשבון? התחבר כאן
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
