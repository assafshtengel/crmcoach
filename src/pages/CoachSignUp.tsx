
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
          // ביטול העברה לאחר הרשמה כדי לאפשר התחברות מיידית
        },
      });

      if (error) {
        console.error("Signup error:", error);
        throw error;
      }

      if (data.user) {
        console.log("User created successfully:", data.user);
        
        try {
          // בדיקה אם המאמן כבר קיים
          const { data: existingCoach } = await supabase
            .from('coaches')
            .select('id')
            .eq('id', data.user.id)
            .single();
            
          // יצירת רשומת מאמן רק אם היא לא קיימת
          if (!existingCoach) {
            const { error: coachError } = await supabase
              .from('coaches')
              .insert([{ 
                id: data.user.id,
                full_name: fullName,
                email: email
              }]);

            if (coachError) {
              console.error("Error creating coach record:", coachError);
              
              // בדיקה אם יש צורך ליצור רשומת תפקיד
              const { data: roleExists } = await supabase
                .from('user_roles')
                .select('id')
                .eq('id', data.user.id)
                .single();
                
              if (!roleExists) {
                const { error: roleError } = await supabase
                  .from('user_roles')
                  .insert([{ 
                    id: data.user.id,
                    role: 'coach'
                  }]);
                  
                if (roleError) {
                  console.error("Error creating role record:", roleError);
                }
              }
            }
          }
        
          // שליחת אימייל התראה למנהל המערכת על מאמן חדש
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
            // לא נחסום את תהליך ההרשמה אם ההתראה נכשלה
          }
        } catch (insertError) {
          console.error("Database operation error:", insertError);
          // לא נזרוק שגיאה כאן, עדיין נרצה להציג הצלחה למשתמש
        }
        
        // התחברות אוטומטית מיד לאחר הרשמה
        try {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (signInError) {
            console.error("Error signing in automatically:", signInError);
            throw signInError;
          }
          
          toast({
            title: "הרשמה והתחברות בוצעו בהצלחה!",
            description: "ברוך הבא למערכת",
          });
          
          navigate('/');
          return;
        } catch (signInError) {
          console.error("Auto sign-in failed:", signInError);
          // אם ההתחברות האוטומטית נכשלה, נמשיך לברירת המחדל
        }

        toast({
          title: "הרשמה בוצעה בהצלחה!",
          description: "אנא התחבר למערכת",
        });

        navigate('/auth');
      }
    } catch (error: any) {
      console.error("Signup error details:", error);
      
      // בדיקה אם זו שגיאת "User already registered"
      if (error.message && error.message.includes("User already registered")) {
        toast({
          variant: "destructive",
          title: "כתובת האימייל כבר רשומה במערכת",
          description: "נא להשתמש בכתובת אימייל אחרת או להתחבר עם החשבון הקיים",
        });
      } else {
        toast({
          variant: "destructive",
          title: "שגיאה בהרשמה",
          description: error.message,
        });
      }
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
