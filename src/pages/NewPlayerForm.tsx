
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';

interface PlayerFormData {
  full_name: string;
  phone: string;
  email: string;
  position: string;
  notes: string;
}

interface FormErrors {
  full_name?: string;
  phone?: string;
  email?: string;
  position?: string;
}

const positions = [
  { value: "goalkeeper", label: "שוער" },
  { value: "defender", label: "בלם" },
  { value: "fullback", label: "מגן" },
  { value: "midfielder", label: "קשר" },
  { value: "winger", label: "כנף" },
  { value: "striker", label: "חלוץ" },
];

const NewPlayerForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<PlayerFormData>({
    full_name: '',
    phone: '',
    email: '',
    position: '',
    notes: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'נא למלא שם שחקן';
      isValid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'נא למלא מספר טלפון';
      isValid = false;
    }

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!formData.email.trim()) {
      newErrors.email = 'נא למלא כתובת אימייל';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'כתובת אימייל לא תקינה';
      isValid = false;
    }

    if (!formData.position) {
      newErrors.position = 'נא לבחור עמדה';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error('לא נמצא משתמש מחובר');
          navigate('/auth');
          return;
        }

        const { data, error } = await supabase.from('players').insert({
          coach_id: user.id,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          position: formData.position,
          notes: formData.notes
        });

        if (error) throw error;

        toast.success(`השחקן ${formData.full_name} נוסף בהצלחה!`);
        
        // נקה את הטופס
        setFormData({
          full_name: '',
          phone: '',
          email: '',
          position: '',
          notes: ''
        });
        
        navigate('/players-list');
      } catch (error: any) {
        toast.error(error.message || 'אירעה שגיאה בהוספת השחקן');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePositionChange = (value: string) => {
    setFormData(prev => ({ ...prev, position: value }));
    if (errors.position) {
      setErrors(prev => ({ ...prev, position: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-md mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">רישום שחקן חדש</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">שם השחקן</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className={errors.full_name ? 'border-red-500' : ''}
                  placeholder="הכנס את שם השחקן"
                />
                {errors.full_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">טלפון</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={errors.phone ? 'border-red-500' : ''}
                  placeholder="הכנס מספר טלפון"
                  dir="ltr"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">אימייל</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'border-red-500' : ''}
                  placeholder="הכנס כתובת אימייל"
                  dir="ltr"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">עמדה במגרש</Label>
                <Select value={formData.position} onValueChange={handlePositionChange}>
                  <SelectTrigger className={errors.position ? 'border-red-500' : ''}>
                    <SelectValue placeholder="בחר עמדה" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map(pos => (
                      <SelectItem key={pos.value} value={pos.value}>
                        {pos.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.position && (
                  <p className="text-red-500 text-sm mt-1">{errors.position}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">הערות</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="הערות נוספות על השחקן"
                  className="h-24"
                />
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => navigate(-1)}
                >
                  ביטול
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'שומר...' : 'שמירה'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewPlayerForm;
