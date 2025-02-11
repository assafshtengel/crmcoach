
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormData } from '@/types/mentalPrep';

interface GameDetailsStepProps {
  formData: FormData;
  updateFormData: (field: string, value: any) => void;
}

export const GameDetailsStep = ({ formData, updateFormData }: GameDetailsStepProps) => {
  return (
    <div className="form-step space-y-4">
      <h2 className="text-2xl font-bold mb-6">פרטי המשחק</h2>
      <div>
        <Label htmlFor="matchDate">תאריך המשחק</Label>
        <Input
          id="matchDate"
          type="date"
          value={formData.matchDate}
          onChange={(e) => updateFormData('matchDate', e.target.value)}
          className="input-field"
        />
      </div>
      <div>
        <Label htmlFor="opposingTeam">קבוצה יריבה</Label>
        <Input
          id="opposingTeam"
          value={formData.opposingTeam}
          onChange={(e) => updateFormData('opposingTeam', e.target.value)}
          className="input-field"
        />
      </div>
      <div className="space-y-2">
        <Label>סוג משחק</Label>
        <RadioGroup
          value={formData.gameType}
          onValueChange={(value) => updateFormData('gameType', value)}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="league" id="league" />
            <Label htmlFor="league" className="mr-2">ליגה</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cup" id="cup" />
            <Label htmlFor="cup" className="mr-2">גביע</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="friendly" id="friendly" />
            <Label htmlFor="friendly" className="mr-2">ידידות</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="other" id="other" />
            <Label htmlFor="other" className="mr-2">אחר</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};

