
import React from 'react';
import { mentalStates } from '@/constants/mentalPrepConstants';
import { FormData } from '@/types/mentalPrep';

interface MentalStatesStepProps {
  formData: FormData;
  handleStateSelection: (state: string) => void;
}

export const MentalStatesStep = ({ formData, handleStateSelection }: MentalStatesStepProps) => {
  return (
    <div className="form-step space-y-4">
      <h2 className="text-2xl font-bold mb-6">מצבים מנטליים</h2>
      <p className="text-gray-600 mb-4">בחר 4 מצבים מנטליים שמתארים את המצב הרצוי שלך במשחק</p>
      <div className="grid grid-cols-3 gap-2">
        {mentalStates.map((state) => (
          <div
            key={state}
            onClick={() => handleStateSelection(state)}
            className={`mental-state-tag ${
              formData.selectedStates.includes(state) ? 'selected' : ''
            }`}
          >
            {state}
          </div>
        ))}
      </div>
    </div>
  );
};
