
import React from 'react';
import { MentalPrepForm } from '@/components/MentalPrepForm';

const GamePreparation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">הכנה למשחק</h1>
          <p className="text-gray-600 mt-2">
            מלא את הטופס הבא כדי להתכונן למשחק בצורה הטובה ביותר
          </p>
        </div>
        <MentalPrepForm />
      </div>
    </div>
  );
};

export default GamePreparation;
