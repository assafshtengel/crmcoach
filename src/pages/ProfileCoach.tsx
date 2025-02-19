
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Pencil, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface Coach {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  profile_picture?: string;
  description?: string;
  created_at: string;
}

const ProfileCoach = () => {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePictureURL, setProfilePictureURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isSignUpMode = location.pathname === '/coach-signup';

  useEffect(() => {
    if (!isSignUpMode) {
      fetchCoachData();
    }
  }, [isSignUpMode]);

  const fetchCoachData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user && !isSignUpMode) {
        navigate('/auth');
        return;
      }

      if (user) {
        const { data: coachData, error } = await supabase
          .from('coaches')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (coachData) {
          setCoach(coachData as Coach);
          setFullName(coachData.full_name);
          setEmail(coachData.email);
          setPhone(coachData.phone || '');
          setDescription(coachData.description || '');
          setProfilePictureURL(coachData.profile_picture || null);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUpMode) {
        // מצב הרשמה חדשה
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
      } else {
        // מצב עדכון פרופיל קיים
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        let profilePicturePath = coach?.profile_picture;

        if (profilePicture) {
          const fileExt = profilePicture.name.split('.').pop();
          const filePath = `coaches/${user.id}/profile.${fileExt}`;

          const { data, error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, profilePicture, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) throw uploadError;

          profilePicturePath = `https://hntgzgrlyfhojcaofbjv.supabase.co/storage/v1/object/public/images/${filePath}`;
        }

        const { error: updateError } = await supabase
          .from('coaches')
          .upsert({
            id: user.id,
            full_name: fullName,
            phone: phone,
            description: description,
            profile_picture: profilePicturePath,
          }, { onConflict: 'id' });

        if (updateError) throw updateError;

        toast.success('הפרופיל עודכן בהצלחה!');
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isSignUpMode) {
    return <div>טוען...</div>;
  }

  return (
    <div className="container mx-auto mt-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          {isSignUpMode ? 'הרשמת מאמן חדש' : 'הפרופיל שלי'}
        </h1>
        {!isSignUpMode && (
          <Button variant="outline" onClick={() => navigate('/dashboard-coach')}>
            <Home className="w-4 h-4 ml-2" />
            דשבורד
          </Button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName">שם מלא</Label>
            <Input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          
          {isSignUpMode && (
            <>
              <div>
                <Label htmlFor="email">אימייל</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="phone">טלפון</Label>
            <Input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="description">תיאור ורקע מקצועי</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ספר על הניסיון המקצועי שלך..."
            />
          </div>

          {!isSignUpMode && (
            <div>
              <Label htmlFor="profilePicture">תמונת פרופיל</Label>
              <Input
                type="file"
                id="profilePicture"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setProfilePicture(file);
                    setProfilePictureURL(URL.createObjectURL(file));
                  }
                }}
              />
              {profilePictureURL && (
                <img
                  src={profilePictureURL}
                  alt="תצוגה מקדימה"
                  className="mt-2 h-20 w-20 rounded-full object-cover"
                />
              )}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              'מעבד...'
            ) : isSignUpMode ? (
              'הרשמה'
            ) : (
              <>
                <Pencil className="w-4 h-4 ml-2" />
                עדכון פרופיל
              </>
            )}
          </Button>

          {isSignUpMode && (
            <div className="text-center mt-4">
              <Button
                variant="link"
                type="button"
                onClick={() => navigate('/auth')}
              >
                יש לך כבר חשבון? התחבר
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileCoach;
