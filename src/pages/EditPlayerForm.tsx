import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { positions } from '@/components/new-player/PlayerFormSchema';
import { ChevronRight } from 'lucide-react';

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

const EditPlayerForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlayerData = async () => {
      const playerId = location.state?.playerId;
      if (!playerId) {
        toast.error('לא נמצא מזהה שחקן');
        navigate(-1);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerId)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            full_name: data.full_name || '',
            email: data.email || '',
            phone: data.phone || '',
            birthdate: data.birthdate || '',
            city: data.city || '',
            club: data.club || '',
            year_group: data.year_group || '',
            position: data.position || '',
            injuries: data.injuries || '',
            parent_name: data.parent_name || '',
            parent_phone: data.parent_phone || '',
            parent_email: data.parent_email || '',
            notes: data.notes || ''
          });
        }
      } catch (error) {
        console.error('Error fetching player data:', error);
        toast.error('שגיאה בטעינת פרטי השחקן');
        navigate(-1);
      }
    };

    fetchPlayerData();
  }, [location.state, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const playerId = location.state?.playerId;
      if (!playerId) throw new Error('No player ID provided');

      const { error } = await supabase
        .from('players')
        .update(formData)
        .eq('id', playerId);

      if (error) throw error;

      toast.success('פרטי השחקן עודכנו בהצלחה!');
      navigate(`/player-profile/${playerId}`);
    } catch (error) {
      console.error('Error updating player:', error);
      toast.error('שגיאה בעדכון פרטי השחקן');
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            <ChevronRight className="h-4 w-4 ml-2" />
            חזרה
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">עריכת פרטי שחקן</CardTitle>
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

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  ביטול
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'שומר שינויים...' : 'שמור שינויים'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditPlayerForm;
