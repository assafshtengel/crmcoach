
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { gameGoals, quantifiableGoals } from '@/constants/mentalPrepConstants';
import { FormData } from '@/types/mentalPrep';

interface GameGoalsStepProps {
  formData: FormData;
  updateFormData: (field: string, value: any) => void;
}

export const GameGoalsStep = ({ formData, updateFormData }: GameGoalsStepProps) => {
  return (
    <div className="form-step space-y-4">
      <h2 className="text-2xl font-bold mb-6">מטרות משחק</h2>
      {gameGoals.map((goal, index) => (
        <div key={goal} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`goal-${index}`}
              checked={formData.selectedGoals.some(g => g.goal === goal)}
              onChange={(e) => {
                if (e.target.checked) {
                  updateFormData('selectedGoals', [
                    ...formData.selectedGoals,
                    { goal, metric: '' },
                  ]);
                } else {
                  updateFormData(
                    'selectedGoals',
                    formData.selectedGoals.filter(g => g.goal !== goal)
                  );
                }
              }}
            />
            <Label htmlFor={`goal-${index}`}>{goal}</Label>
          </div>
          {formData.selectedGoals.some(g => g.goal === goal) && quantifiableGoals.includes(goal) && (
            <Input
              placeholder="מספר הפעולות אותן תרצה לבצע במשחק (לדוגמה: 5)"
              value={formData.selectedGoals.find(g => g.goal === goal)?.metric || ''}
              onChange={(e) => {
                updateFormData(
                  'selectedGoals',
                  formData.selectedGoals.map(g =>
                    g.goal === goal ? { ...g, metric: e.target.value } : g
                  )
                );
              }}
              className="input-field"
            />
          )}
        </div>
      ))}
    </div>
  );
};
