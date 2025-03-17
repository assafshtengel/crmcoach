
import React from 'react';
import { MentalPrepForm } from '@/components/MentalPrepForm';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const GamePreparation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            title="חזור לדף הקודם"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
            title="חזור לדשבורד"
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>
        
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
