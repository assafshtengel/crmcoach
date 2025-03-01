
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormData } from '@/types/mentalPrep';
import { cn } from '@/lib/utils';

interface GameDetailsStepProps {
  formData: FormData;
  updateFormData: (field: string, value: any) => void;
}

export const GameDetailsStep = ({ formData, updateFormData }: GameDetailsStepProps) => {
  const gameTypes = [
    { value: 'league', label: 'ליגה' },
    { value: 'cup', label: 'גביע' },
    { value: 'friendly', label: 'ידידות' },
    { value: 'other', label: 'אחר' }
  ];

  return (
    <div className="form-step space-y-4">
      <h2 className="text-2xl font-bold mb-6 text-right">פרטי המשחק</h2>
      <div>
        <Label htmlFor="matchDate" className="text-right block">תאריך המשחק</Label>
        <Input
          id="matchDate"
          type="date"
          value={formData.matchDate}
          onChange={(e) => updateFormData('matchDate', e.target.value)}
          className="input-field"
        />
      </div>
      <div>
        <Label htmlFor="opposingTeam" className="text-right block">קבוצה יריבה</Label>
        <Input
          id="opposingTeam"
          value={formData.opposingTeam}
          onChange={(e) => updateFormData('opposingTeam', e.target.value)}
          className="input-field"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-right block">סוג משחק</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {gameTypes.map((type) => (
            <div
              key={type.value}
              onClick={() => updateFormData('gameType', type.value)}
              className={cn(
                'cursor-pointer rounded-lg p-4 text-center transition-all duration-200',
                'hover:shadow-md border-2',
                formData.gameType === type.value
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-primary/50'
              )}
            >
              <span className="text-lg font-medium">{type.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
