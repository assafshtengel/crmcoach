
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { gameGoals, quantifiableGoals } from '@/constants/mentalPrepConstants';
import { FormData } from '@/types/mentalPrep';
import { Card } from '@/components/ui/card';
import { Target, CheckCircle2, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface GameGoalsStepProps {
  formData: FormData;
  updateFormData: (field: string, value: any) => void;
}

export const GameGoalsStep = ({ formData, updateFormData }: GameGoalsStepProps) => {
  const [customGoal, setCustomGoal] = useState('');
  const [customMetric, setCustomMetric] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleAddCustomGoal = () => {
    if (customGoal.trim()) {
      // Add the custom goal to the selected goals
      updateFormData('selectedGoals', [
        ...formData.selectedGoals,
        { goal: customGoal, metric: customMetric, isCustom: true },
      ]);
      
      // Reset the custom goal input
      setCustomGoal('');
      setCustomMetric('');
      setShowCustomInput(false);
    }
  };

  return (
    <div className="form-step space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-right">מטרות משחק</h2>
      </div>
      
      <p className="text-gray-600 mb-4 text-right">
        בחר את המטרות שלך למשחק הקרוב. ניתן להוסיף מדדים כמותיים למטרות מסוימות.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gameGoals.map((goal, index) => (
          <motion.div
            key={goal}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-md ${
                formData.selectedGoals.some(g => g.goal === goal)
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-primary/50'
              }`}
              onClick={() => {
                if (!formData.selectedGoals.some(g => g.goal === goal)) {
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
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CheckCircle2 
                    className={`w-5 h-5 transition-colors ${
                      formData.selectedGoals.some(g => g.goal === goal)
                        ? 'text-primary'
                        : 'text-gray-300'
                    }`}
                  />
                </div>
                <div className="flex-1 text-right">
                  <Label className="text-base font-medium">{goal}</Label>
                  
                  {formData.selectedGoals.some(g => g.goal === goal) && 
                   quantifiableGoals.includes(goal) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.2 }}
                      className="mt-3"
                    >
                      <Input
                        placeholder="כמה פעמים? (לדוגמה: 5)"
                        value={formData.selectedGoals.find(g => g.goal === goal)?.metric || ''}
                        onChange={(e) => {
                          updateFormData(
                            'selectedGoals',
                            formData.selectedGoals.map(g =>
                              g.goal === goal ? { ...g, metric: e.target.value } : g
                            )
                          );
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white focus:ring-2 focus:ring-primary/30 text-right"
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {/* Custom goal option card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gameGoals.length * 0.1 }}
        >
          <Card 
            className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-md ${
              showCustomInput
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-primary/50'
            }`}
            onClick={() => {
              if (!showCustomInput) {
                setShowCustomInput(true);
                setTimeout(() => {
                  const customInputField = document.getElementById('customGoalInput');
                  if (customInputField) {
                    customInputField.focus();
                  }
                }, 100);
              }
            }}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <PlusCircle className={`w-5 h-5 ${showCustomInput ? 'text-primary' : 'text-gray-500'}`} />
              </div>
              <div className="flex-1 text-right">
                <Label className="text-base font-medium">הוסף מטרה משלך...</Label>
                
                {showCustomInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 space-y-2"
                  >
                    <Input
                      id="customGoalInput"
                      placeholder="הקלד מטרה חדשה..."
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white focus:ring-2 focus:ring-primary/30 text-right"
                    />
                    
                    <Input
                      placeholder="מדידה כמותית (כמה פעמים?)"
                      value={customMetric}
                      onChange={(e) => setCustomMetric(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white focus:ring-2 focus:ring-primary/30 text-right"
                    />
                    
                    <div className="flex justify-between">
                      <Button 
                        type="button" 
                        size="sm"
                        disabled={!customGoal.trim()} 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddCustomGoal();
                        }}
                        className="mt-1"
                      >
                        הוסף מטרה
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCustomInput(false);
                          setCustomGoal('');
                          setCustomMetric('');
                        }}
                        className="mt-1"
                      >
                        ביטול
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Display custom goals section */}
      {formData.selectedGoals.some(g => g.isCustom) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10"
        >
          <p className="text-sm text-primary font-medium text-right mb-2">
            מטרות מותאמות אישית:
          </p>
          <div className="space-y-2">
            {formData.selectedGoals
              .filter(g => g.isCustom)
              .map((goal, index) => (
                <div key={index} className="flex justify-between items-center bg-white p-2 rounded border border-primary/20">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      updateFormData(
                        'selectedGoals',
                        formData.selectedGoals.filter(g => g.goal !== goal.goal)
                      );
                    }}
                  >
                    הסר
                  </Button>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-right">{goal.goal}</p>
                    {goal.metric && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {goal.metric} פעמים
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      )}

      {formData.selectedGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10"
        >
          <p className="text-sm text-primary font-medium text-right">
            נבחרו {formData.selectedGoals.length} מטרות למשחק
          </p>
        </motion.div>
      )}
    </div>
  );
};
