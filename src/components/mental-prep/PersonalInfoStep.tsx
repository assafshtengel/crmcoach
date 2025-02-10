
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormData } from '@/types/mentalPrep';

interface PersonalInfoStepProps {
  formData: FormData;
  updateFormData: (field: string, value: any) => void;
}

export const PersonalInfoStep = ({ formData, updateFormData }: PersonalInfoStepProps) => {
  return (
    <div className="form-step space-y-4">
      <h2 className="text-2xl font-bold mb-6">פרטים אישיים</h2>
      <div>
        <Label htmlFor="fullName">שם מלא</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => updateFormData('fullName', e.target.value)}
          className="input-field"
        />
      </div>
      <div>
        <Label htmlFor="email">אימייל</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData('email', e.target.value)}
          className="input-field"
        />
      </div>
      <div>
        <Label htmlFor="phone">טלפון</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => updateFormData('phone', e.target.value)}
          className="input-field"
        />
      </div>
    </div>
  );
};
