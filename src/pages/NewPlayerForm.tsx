import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { usePlayers } from '@/contexts/PlayersContext';

interface PlayerFormData {
  name: string;
  phone: string;
  email: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
}

const NewPlayerForm = () => {
  const navigate = useNavigate();
  const { addPlayer } = usePlayers();
  
  const [formData, setFormData] = useState<PlayerFormData>({
    name: '',
    phone: '',
    email: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'נא למלא שם שחקן';
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

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      addPlayer(formData);
      console.log('Form submitted with data:', formData);
      toast.success('השחקן נשמר בהצלחה!');
      navigate('/');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
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
                <Label htmlFor="name">שם השחקן</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'border-red-500' : ''}
                  required
                  placeholder="הכנס את שם השחקן"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
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
                  required
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
                  required
                  placeholder="הכנס כתובת אימייל"
                  dir="ltr"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => navigate(-1)}
                >
                  ביטול
                </Button>
                <Button type="submit">שמירה</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewPlayerForm;
