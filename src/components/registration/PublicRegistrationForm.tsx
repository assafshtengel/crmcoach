
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { positions } from '@/components/new-player/PlayerFormSchema';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PlayerFormData {
  full_name: string;
  email: string;
  phone: string;
  birthdate: string;
  city: string;
  club: string;
  year_group: string;
  position: string;
  injuries?: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  notes?: string;
}

const PublicRegistrationForm = () => {
  const { linkId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [coachData, setCoachData] = useState<{ id: string; full_name: string; custom_message?: string } | null>(null);
  const [formData, setFormData] = useState<PlayerFormData>({
    full_name: '',
    email: '',
    phone: '',
    birthdate: '',
    city: '',
    club: '',
    year_group: '',
    position: '',
    injuries: '',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    notes: ''
  });

  useEffect(() => {
    const verifyLink = async () => {
      if (!linkId) {
        toast.error('לינק לא תקין');
        return;
      }

      const { data: linkData, error: linkError } = await supabase
        .from('registration_links')
        .select('coach_id, custom_message, coaches(id, full_name)')
        .eq('id', linkId)
        .single();

      if (linkError || !linkData) {
        toast.error('הלינק אינו תקין או שפג תוקפו');
        return;
      }

      setCoachData({
        id: linkData.coaches.id,
        full_name: linkData.coaches.full_name,
        custom_message: linkData.custom_message
      });
    };

    verifyLink();
  }, [linkId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachData) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('players')
        .insert([{ ...formData, coach_id: coachData.id }]);

      if (error) throw error;

      toast.success('הרישום בוצע בהצלחה!');
      // ניתן להוסיף כאן הפניה לדף תודה
      navigate('/registration-success');
    } catch (error: any) {
      toast.error('שגיאה בתהליך הרישום: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
    field: keyof PlayerFormData
  ) => {
    if (typeof e === 'string') {
      setFormData(prev => ({ ...prev, [field]: e }));
    } else {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (!coachData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">טוען...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">הרשמה לאימונים אצל {coachData.full_name}</CardTitle>
            {coachData.custom_message && (
              <p className="mt-2 text-gray-600">{coachData.custom_message}</p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* פרטים אישיים */}
              <section>
                <h3 className="text-lg font-semibold mb-4">פרטים אישיים</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="full_name">שם מלא</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange(e, 'full_name')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="birthdate">תאריך לידה</Label>
                    <Input
                      id="birthdate"
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={(e) => handleInputChange(e, 'birthdate')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">אימייל</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange(e, 'email')}
                      dir="ltr"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">טלפון</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange(e, 'phone')}
                      dir="ltr"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">עמדה</Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) => handleInputChange(value, 'position')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר עמדה" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((position) => (
                          <SelectItem key={position.value} value={position.value}>
                            {position.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              {/* פרטי מועדון */}
              <section>
                <h3 className="text-lg font-semibold mb-4">פרטי מועדון</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="city">עיר</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange(e, 'city')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="club">מועדון</Label>
                    <Input
                      id="club"
                      name="club"
                      value={formData.club}
                      onChange={(e) => handleInputChange(e, 'club')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="year_group">שנתון</Label>
                    <Input
                      id="year_group"
                      name="year_group"
                      value={formData.year_group}
                      onChange={(e) => handleInputChange(e, 'year_group')}
                      required
                    />
                  </div>
                </div>
              </section>

              {/* פרטי הורה */}
              <section>
                <h3 className="text-lg font-semibold mb-4">פרטי הורה</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="parent_name">שם ההורה</Label>
                    <Input
                      id="parent_name"
                      name="parent_name"
                      value={formData.parent_name}
                      onChange={(e) => handleInputChange(e, 'parent_name')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="parent_phone">טלפון הורה</Label>
                    <Input
                      id="parent_phone"
                      name="parent_phone"
                      value={formData.parent_phone}
                      onChange={(e) => handleInputChange(e, 'parent_phone')}
                      dir="ltr"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="parent_email">אימייל הורה</Label>
                    <Input
                      id="parent_email"
                      name="parent_email"
                      type="email"
                      value={formData.parent_email}
                      onChange={(e) => handleInputChange(e, 'parent_email')}
                      dir="ltr"
                      required
                    />
                  </div>
                </div>
              </section>

              {/* מידע נוסף */}
              <section>
                <h3 className="text-lg font-semibold mb-4">מידע נוסף</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="injuries">פציעות עבר</Label>
                    <Textarea
                      id="injuries"
                      name="injuries"
                      value={formData.injuries}
                      onChange={(e) => handleInputChange(e, 'injuries')}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">הערות נוספות</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange(e, 'notes')}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </section>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'שולח טופס...' : 'שלח טופס'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicRegistrationForm;
