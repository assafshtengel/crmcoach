
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { Brain, Target, Users, ClipboardList, LineChart, Rocket, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ProfileCoach = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const features = [
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "ניהול שחקנים",
      description: "ניהול קל ומהיר של כל השחקנים שלכם, כולל פרופילים אישיים"
    },
    {
      icon: <ClipboardList className="w-6 h-6 text-primary" />,
      title: "תיעוד אימונים",
      description: "תיעוד מפורט של כל אימון עם כלים וטכניקות"
    },
    {
      icon: <Target className="w-6 h-6 text-primary" />,
      title: "הגדרת מטרות",
      description: "תכנון וניהול מטרות לטווח הקצר והארוך"
    },
    {
      icon: <Brain className="w-6 h-6 text-primary" />,
      title: "כלים מנטליים",
      description: "מגוון רחב של כלים וטכניקות לאימון מנטלי"
    },
    {
      icon: <LineChart className="w-6 h-6 text-primary" />,
      title: "ניתוח ביצועים",
      description: "מעקב ואנליזה מתקדמת אחר התקדמות השחקנים"
    },
    {
      icon: <Rocket className="w-6 h-6 text-primary" />,
      title: "חדשנות מתמדת",
      description: "עדכונים שוטפים עם כלים ומחקרים חדשים"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            description,
          },
        },
      });

      if (signUpError) throw signUpError;

      toast.success('ההרשמה בוצעה בהצלחה! נשלח אליך מייל לאימות.');
      navigate('/auth');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ברוכים הבאים למערכת ה-CRM המתקדמת למאמנים מנטליים
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            הצטרפו למערכת החדשנית שתעזור לכם לנהל את האימונים ביעילות, לעקוב אחר התקדמות השחקנים ולהגיע לתוצאות מיטביות
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-6">
            <Card className="border-2 border-primary/10 hover:border-primary/20 transition-all">
              <CardHeader>
                <CardTitle>למה להצטרף למערכת?</CardTitle>
                <CardDescription>כל הכלים שמאמן מנטלי צריך במקום אחד</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-4 rtl:space-x-reverse p-4 rounded-lg bg-white shadow-sm">
                      {feature.icon}
                      <div>
                        <h3 className="font-semibold mb-1">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-center">הרשמה למערכת</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">שם מלא</Label>
                <Input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="הכנס את שמך המלא"
                />
              </div>

              <div>
                <Label htmlFor="email">אימייל</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <Label htmlFor="password">סיסמה</Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="mt-1"
                  placeholder="לפחות 6 תווים"
                />
              </div>

              <div>
                <Label htmlFor="phone">טלפון</Label>
                <Input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                  placeholder="מספר טלפון ליצירת קשר"
                />
              </div>

              <div>
                <Label htmlFor="description">רקע מקצועי</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                  placeholder="ספר לנו קצת על הניסיון המקצועי שלך..."
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'מעבד...' : 'הרשמה למערכת'}
              </Button>

              <div className="text-center mt-4">
                <Button
                  variant="link"
                  type="button"
                  onClick={() => navigate('/auth')}
                >
                  יש לך כבר חשבון? התחבר
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="text-center">
          <Card className="border-2 border-primary/10 max-w-2xl mx-auto">
            <CardHeader>
              <div className="mx-auto rounded-full bg-primary/10 p-3 w-fit">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>מערכת בטוחה ואמינה</CardTitle>
              <CardDescription>
                אנחנו מחויבים לאבטחת המידע שלכם ולשמירה על פרטיותכם.
                המערכת עומדת בתקני האבטחה המחמירים ביותר.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfileCoach;
