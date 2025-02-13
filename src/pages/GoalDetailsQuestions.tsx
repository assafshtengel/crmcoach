
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface Question {
  id: string;
  text: string;
  type: 'radio' | 'scale' | 'text';
  options?: { value: string; label: string }[];
}

const questions: Record<string, Question[]> = {
  'accuracy': [
    {
      id: 'kick-type',
      text: 'איזה סוג בעיטה הכי חשוב לך לשפר?',
      type: 'radio',
      options: [
        { value: 'free', label: 'בעיטות חופשיות' },
        { value: 'movement', label: 'בעיטות תנועה' },
        { value: 'penalty', label: 'פנדלים' }
      ]
    },
    {
      id: 'current-accuracy',
      text: 'איך אתה מדרג את הדיוק שלך כיום מ-1 עד 10?',
      type: 'scale'
    },
    {
      id: 'main-factor',
      text: 'מה הדבר שהכי משפיע על הבעיטות שלך?',
      type: 'radio',
      options: [
        { value: 'power', label: 'כוח' },
        { value: 'technique', label: 'טכניקה' },
        { value: 'body-position', label: 'מיקום הגוף' }
      ]
    }
  ],
  'pressure': [
    {
      id: 'pressure-moments',
      text: 'באיזה רגעים במגרש אתה מרגיש הכי לחוץ?',
      type: 'radio',
      options: [
        { value: 'penalties', label: 'פנדלים' },
        { value: 'last-minutes', label: 'הדקות האחרונות' },
        { value: 'big-games', label: 'משחקים גדולים' }
      ]
    },
    {
      id: 'past-strategy',
      text: 'איזו אסטרטגיה עזרה לך להתמודד עם לחץ בעבר?',
      type: 'text'
    },
    {
      id: 'pressure-effect',
      text: 'איך לחץ משפיע עליך כיום?',
      type: 'radio',
      options: [
        { value: 'focus-loss', label: 'איבוד ריכוז' },
        { value: 'confidence-loss', label: 'חוסר ביטחון' },
        { value: 'nervousness', label: 'עצבים' }
      ]
    }
  ],
  // נוסיף שאלות דומות לכל קטגוריה
  'fitness': [
    {
      id: 'fitness-focus',
      text: 'איזה היבט של הכושר הגופני הכי חשוב לך לשפר?',
      type: 'radio',
      options: [
        { value: 'speed', label: 'מהירות' },
        { value: 'power', label: 'כוח מתפרץ' },
        { value: 'endurance', label: 'סיבולת' }
      ]
    },
    {
      id: 'current-fitness',
      text: 'איך אתה מדרג את הכושר הגופני שלך כיום מ-1 עד 10?',
      type: 'scale'
    },
    {
      id: 'training-preference',
      text: 'איזה סוג אימון אתה מעדיף?',
      type: 'radio',
      options: [
        { value: 'individual', label: 'אימון אישי' },
        { value: 'group', label: 'אימון קבוצתי' },
        { value: 'mixed', label: 'שילוב של השניים' }
      ]
    }
  ],
  'dribbling': [
    {
      id: 'dribbling-aspect',
      text: 'איזה היבט של הדריבל הכי חשוב לך לשפר?',
      type: 'radio',
      options: [
        { value: 'close-control', label: 'שליטה בכדור במרחק קצר' },
        { value: 'speed-dribbling', label: 'דריבל במהירות' },
        { value: 'skill-moves', label: 'תרגילי כדרור מתקדמים' }
      ]
    },
    {
      id: 'current-dribbling',
      text: 'איך אתה מדרג את יכולת הדריבל שלך כיום מ-1 עד 10?',
      type: 'scale'
    },
    {
      id: 'dribbling-challenge',
      text: 'מה האתגר הגדול ביותר שלך בדריבל?',
      type: 'text'
    }
  ],
  'focus': [
    {
      id: 'focus-challenge',
      text: 'באיזה מצבים אתה מאבד ריכוז?',
      type: 'radio',
      options: [
        { value: 'tired', label: 'כשאני עייף' },
        { value: 'pressure', label: 'במצבי לחץ' },
        { value: 'mistakes', label: 'אחרי טעויות' }
      ]
    },
    {
      id: 'current-focus',
      text: 'איך אתה מדרג את יכולת הריכוז שלך כיום מ-1 עד 10?',
      type: 'scale'
    },
    {
      id: 'focus-improvement',
      text: 'מה עוזר לך להישאר מרוכז במשחק?',
      type: 'text'
    }
  ],
  'confidence': [
    {
      id: 'confidence-situation',
      text: 'באיזה מצבים אתה מרגיש הכי בטוח בעצמך?',
      type: 'radio',
      options: [
        { value: 'practice', label: 'באימונים' },
        { value: 'home-games', label: 'במשחקי בית' },
        { value: 'success', label: 'אחרי הצלחות' }
      ]
    },
    {
      id: 'current-confidence',
      text: 'איך אתה מדרג את הביטחון העצמי שלך כיום מ-1 עד 10?',
      type: 'scale'
    },
    {
      id: 'confidence-boost',
      text: 'מה עוזר לך לחזק את הביטחון העצמי?',
      type: 'text'
    }
  ],
  'leadership': [
    {
      id: 'leadership-role',
      text: 'איזה תפקיד מנהיגותי אתה רוצה לקחת בקבוצה?',
      type: 'radio',
      options: [
        { value: 'captain', label: 'קפטן' },
        { value: 'mentor', label: 'חונך לשחקנים צעירים' },
        { value: 'motivator', label: 'מוטיבטור בקבוצה' }
      ]
    },
    {
      id: 'current-leadership',
      text: 'איך אתה מדרג את כישורי המנהיגות שלך כיום מ-1 עד 10?',
      type: 'scale'
    },
    {
      id: 'leadership-challenge',
      text: 'מה האתגר הגדול ביותר שלך בתחום המנהיגות?',
      type: 'text'
    }
  ],
  'decision-making': [
    {
      id: 'decision-challenge',
      text: 'באיזה מצבים אתה מתקשה לקבל החלטות מהירות?',
      type: 'radio',
      options: [
        { value: 'pressure', label: 'תחת לחץ' },
        { value: 'multiple-options', label: 'כשיש הרבה אפשרויות' },
        { value: 'tired', label: 'כשאני עייף' }
      ]
    },
    {
      id: 'current-decision',
      text: 'איך אתה מדרג את יכולת קבלת ההחלטות שלך כיום מ-1 עד 10?',
      type: 'scale'
    },
    {
      id: 'decision-improvement',
      text: 'מה עוזר לך לקבל החלטות טובות יותר במגרש?',
      type: 'text'
    }
  ]
};

const GoalDetailsQuestions = () => {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const customGoal = searchParams.get('customGoal');
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const categoryQuestions = categoryId && questions[categoryId] ? questions[categoryId] : [];
  
  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [categoryQuestions[currentQuestionIndex].id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < categoryQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // שמירת התשובות ומעבר לתוכנית הפעולה
      navigate('/action-plan', { 
        state: { 
          categoryId,
          customGoal,
          answers 
        } 
      });
    }
  };

  const currentQuestion = categoryQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / categoryQuestions.length) * 100;

  if (!categoryId || !categoryQuestions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 p-6">
        <Card className="max-w-2xl mx-auto p-6">
          <h2 className="text-xl font-semibold text-center text-gray-900">
            {customGoal ? 
              'נגדיר יחד את המטרה המותאמת אישית שלך' :
              'לא נמצאה קטגוריה מתאימה'
            }
          </h2>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            בוא נחדד את המטרה שלך
          </h2>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-500 text-center">
            שאלה {currentQuestionIndex + 1} מתוך {categoryQuestions.length}
          </p>
        </div>

        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{currentQuestion.text}</h3>

              {currentQuestion.type === 'radio' && currentQuestion.options && (
                <RadioGroup
                  value={answers[currentQuestion.id] || ''}
                  onValueChange={handleAnswerChange}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem 
                        value={option.value} 
                        id={option.value} 
                      />
                      <Label htmlFor={option.value}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.type === 'scale' && (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <Button
                        key={num}
                        variant={answers[currentQuestion.id] === num.toString() ? 'default' : 'outline'}
                        onClick={() => handleAnswerChange(num.toString())}
                        className="w-9 h-9 p-0"
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {currentQuestion.type === 'text' && (
                <Input
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="הקלד את תשובתך כאן..."
                  className="w-full"
                />
              )}
            </div>
          </Card>
        </motion.div>

        <div className="flex justify-end">
          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
            size="lg"
          >
            {currentQuestionIndex < categoryQuestions.length - 1 ? 'הבא' : 'סיום והכנת תוכנית'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GoalDetailsQuestions;
