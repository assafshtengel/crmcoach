
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { Award, BookOpen, GraduationCap, Upload, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CoachProfile {
  full_name: string;
  email: string;
  phone: string;
  specialty: string;
  years_of_experience: number | null;
  certifications: string[];
  education: string;
  description: string;
  profile_picture: string | null;
}

const ProfileCoach = () => {
  const [profile, setProfile] = useState<CoachProfile>({
    full_name: '',
    email: '',
    phone: '',
    specialty: '',
    years_of_experience: null,
    certifications: [],
    education: '',
    description: '',
    profile_picture: null
  });
  const [loading, setLoading] = useState(false);
  const [newCertification, setNewCertification] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadCoachProfile();
  }, []);

  const loadCoachProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          specialty: data.specialty || '',
          years_of_experience: data.years_of_experience || null,
          certifications: data.certifications || [],
          education: data.education || '',
          description: data.description || '',
          profile_picture: data.profile_picture || null
        });
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast.error('שגיאה בטעינת הפרופיל');
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('לא נמצא משתמש מחובר');
        return;
      }

      const { error } = await supabase
        .from('coaches')
        .update({
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          specialty: profile.specialty,
          years_of_experience: profile.years_of_experience,
          certifications: profile.certifications,
          education: profile.education,
          description: profile.description,
          profile_picture: profile.profile_picture
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('הפרופיל עודכן בהצלחה');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000); // מחכה שניה אחת כדי שהמשתמש יראה את הודעת ההצלחה לפני הניווט

    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('שגיאה בעדכון הפרופיל');
    } finally {
      setLoading(false);
    }
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setProfile(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          חזרה לדשבורד
        </Button>

        <Card className="border-2 border-primary/10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">פרופיל מאמן</CardTitle>
            <CardDescription>ערוך את פרטי הפרופיל שלך</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* מידע אישי */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                מידע אישי
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">שם מלא</Label>
                  <Input
                    id="fullName"
                    value={profile.full_name}
                    onChange={e => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="הכנס את שמך המלא"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">דוא״ל</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">טלפון</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={e => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="מספר טלפון"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">תחום התמחות</Label>
                  <Input
                    id="specialty"
                    value={profile.specialty}
                    onChange={e => setProfile(prev => ({ ...prev, specialty: e.target.value }))}
                    placeholder="תחום התמחות עיקרי"
                  />
                </div>
              </div>
            </div>

            {/* מידע מקצועי */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                מידע מקצועי
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="years">שנות ניסיון</Label>
                  <Input
                    id="years"
                    type="number"
                    value={profile.years_of_experience || ''}
                    onChange={e => setProfile(prev => ({ ...prev, years_of_experience: parseInt(e.target.value) || null }))}
                    placeholder="מספר שנות ניסיון"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">השכלה</Label>
                  <Input
                    id="education"
                    value={profile.education}
                    onChange={e => setProfile(prev => ({ ...prev, education: e.target.value }))}
                    placeholder="פרטי השכלה והכשרה"
                  />
                </div>
                <div className="space-y-2">
                  <Label>תעודות והסמכות</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newCertification}
                      onChange={e => setNewCertification(e.target.value)}
                      placeholder="הוסף תעודה או הסמכה"
                    />
                    <Button type="button" onClick={addCertification}>הוסף</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.certifications.map((cert, index) => (
                      <div
                        key={index}
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        <span>{cert}</span>
                        <button
                          onClick={() => removeCertification(index)}
                          className="hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* תיאור */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                תיאור
              </h3>
              <div className="space-y-2">
                <Label htmlFor="description">תיאור מקצועי</Label>
                <Textarea
                  id="description"
                  value={profile.description}
                  onChange={e => setProfile(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="ספר על עצמך ועל הניסיון המקצועי שלך"
                  className="min-h-[150px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                ביטול
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'שומר...' : 'שמור שינויים'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileCoach;
