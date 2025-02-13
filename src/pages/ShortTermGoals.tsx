
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Target,
  Dumbbell,
  Footprints,
  Gamepad,
  Brain,
  Focus,
  Award,
  Crown,
  Plus,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Category {
  id: string;
  title: string;
  type: 'professional' | 'mental';
  icon: React.ElementType;
  description: string;
  isCustom?: boolean;
}

const ShortTermGoals = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [customGoal, setCustomGoal] = useState('');
  const [categories, setCategories] = useState<Category[]>([
    // מקצועי (פיזי-טכני)
    {
      id: 'fitness',
      title: 'כושר גופני',
      type: 'professional',
      icon: Dumbbell,
      description: 'מהירות, כוח מתפרץ, סיבולת'
    },
    {
      id: 'accuracy',
      title: 'דיוק בבעיטות',
      type: 'professional',
      icon: Target,
      description: 'חופשיות, פנדלים, מסירות'
    },
    {
      id: 'dribbling',
      title: 'דריבל ושליטה בכדור',
      type: 'professional',
      icon: Footprints,
      description: 'טכניקה ושליטה'
    },
    {
      id: 'decision-making',
      title: 'קבלת החלטות מהירה',
      type: 'professional',
      icon: Gamepad,
      description: 'חשיבה מהירה במגרש'
    },
    {
      id: 'professional-other',
      title: 'אחר',
      type: 'professional',
      icon: Plus,
      description: 'הגדר מטרה מותאמת אישית',
      isCustom: true
    },
    // מנטאלי (חוסן ותודעה)
    {
      id: 'pressure',
      title: 'התמודדות עם לחץ',
      type: 'mental',
      icon: Brain,
      description: 'ניהול לחץ במשחקים'
    },
    {
      id: 'focus',
      title: 'ריכוז במשחק ובאימונים',
      type: 'mental',
      icon: Focus,
      description: 'שמירה על מיקוד'
    },
    {
      id: 'confidence',
      title: 'חיזוק הביטחון העצמי',
      type: 'mental',
      icon: Award,
      description: 'ביטחון על המגרש'
    },
    {
      id: 'leadership',
      title: 'מנהיגות ושפת גוף',
      type: 'mental',
      icon: Crown,
      description: 'התנהלות חיובית במגרש'
    },
    {
      id: 'mental-other',
      title: 'אחר',
      type: 'mental',
      icon: Plus,
      description: 'הגדר מטרה מותאמת אישית',
      isCustom: true
    }
  ]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleCustomGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomGoal(e.target.value);
  };

  const handleContinue = () => {
    if (selectedCategory) {
      const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
      if (selectedCategoryData?.isCustom && !customGoal) {
        return; // אל תמשיך אם נבחרה קטגוריית "אחר" ולא הוזן טקסט
      }
      // נווט לעמוד השאלות עם הקטגוריה שנבחרה
      navigate(`/goal-details/${selectedCategory}${customGoal ? `?customGoal=${encodeURIComponent(customGoal)}` : ''}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            זה הזמן להשתפר – מה תבחר לשדרג במשחק שלך?
          </h1>
          <p className="text-gray-600">
            בחר את התחום המרכזי בו תרצה להתמקד ולהשתפר
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">⚽</span> מקצועי (פיזי-טכני)
            </h2>
            <div className="grid gap-4">
              {categories
                .filter(cat => cat.type === 'professional')
                .map(category => (
                  <motion.div
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      className={`w-full h-auto p-4 flex items-center gap-4 text-right ${
                        selectedCategory === category.id
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      <category.icon className={`w-6 h-6 ${
                        selectedCategory === category.id
                          ? 'text-primary'
                          : 'text-gray-500'
                      }`} />
                      <div>
                        <div className="font-semibold">{category.title}</div>
                        <div className="text-sm text-gray-500">{category.description}</div>
                      </div>
                    </Button>
                    {category.isCustom && selectedCategory === category.id && (
                      <Input
                        type="text"
                        placeholder="הקלד את המטרה שלך כאן..."
                        className="mt-2"
                        value={customGoal}
                        onChange={handleCustomGoalChange}
                      />
                    )}
                  </motion.div>
                ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">🧠</span> מנטאלי (חוסן ותודעה)
            </h2>
            <div className="grid gap-4">
              {categories
                .filter(cat => cat.type === 'mental')
                .map(category => (
                  <motion.div
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      className={`w-full h-auto p-4 flex items-center gap-4 text-right ${
                        selectedCategory === category.id
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      <category.icon className={`w-6 h-6 ${
                        selectedCategory === category.id
                          ? 'text-primary'
                          : 'text-gray-500'
                      }`} />
                      <div>
                        <div className="font-semibold">{category.title}</div>
                        <div className="text-sm text-gray-500">{category.description}</div>
                      </div>
                    </Button>
                    {category.isCustom && selectedCategory === category.id && (
                      <Input
                        type="text"
                        placeholder="הקלד את המטרה שלך כאן..."
                        className="mt-2"
                        value={customGoal}
                        onChange={handleCustomGoalChange}
                      />
                    )}
                  </motion.div>
                ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            className="mt-8"
            onClick={handleContinue}
            disabled={!selectedCategory || (categories.find(cat => cat.id === selectedCategory)?.isCustom && !customGoal)}
          >
            המשך לדיוק המטרה שלי
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShortTermGoals;
