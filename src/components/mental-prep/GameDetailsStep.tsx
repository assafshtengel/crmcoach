
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
      <div>
        <Label htmlFor="gameType">סוג משחק</Label>
        <Select onValueChange={(value) => updateFormData('gameType', value)}>
          <SelectTrigger>
            <SelectValue placeholder="בחר סוג משחק" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="league">ליגה</SelectItem>
            <SelectItem value="cup">גביע</SelectItem>
            <SelectItem value="friendly">ידידות</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
