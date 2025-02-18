
import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Target, Calendar, Flag, ChevronRight, Home } from 'lucide-react';

const GoalDetailsQuestions = () => {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const customGoal = searchParams.get('customGoal');
  
  const [formData, setFormData] = useState({
    specificGoal: '',
    successMetric: '',
    timeframe: '',
    mainChallenge: ''
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    navigate('/action-plan', { 
      state: { 
        categoryId,
        customGoal,
        answers: formData
      } 
    });
  };

  const isFormValid = Object.values(formData).every(value => value.trim() !== '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-2">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">
                בוא נגדיר את המטרה שלך
              </h1>
              <p className="text-gray-600">
                כדי ליצור תוכנית אפקטיבית, נצטרך כמה פרטים על המטרה שלך
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <Label className="text-lg font-semibold">מה אתה רוצה לשפר בדיוק?</Label>
                </div>
                <Input
                  placeholder="לדוגמה: לשפר את הדיוק בבעיטות חופשיות"
                  value={formData.specificGoal}
                  onChange={(e) => handleInputChange('specificGoal', e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-primary" />
                  <Label className="text-lg font-semibold">איך תדע שהצלחת?</Label>
                </div>
                <Input
                  placeholder="לדוגמה: להבקיע 8/10 בעיטות חופשיות"
                  value={formData.successMetric}
                  onChange={(e) => handleInputChange('successMetric', e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <Label className="text-lg font-semibold">תוך כמה זמן תרצה להשיג את המטרה?</Label>
                </div>
                <Select
                  value={formData.timeframe}
                  onValueChange={(value) => handleInputChange('timeframe', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="בחר את משך הזמן" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 יום</SelectItem>
                    <SelectItem value="60">60 יום</SelectItem>
                    <SelectItem value="90">90 יום</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-lg font-semibold">מה הכי מקשה עליך בתחום הזה כרגע?</Label>
                <Input
                  placeholder="לדוגמה: חוסר יציבות בבעיטות"
                  value={formData.mainChallenge}
                  onChange={(e) => handleInputChange('mainChallenge', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={!isFormValid}
                className="min-w-[200px]"
              >
                הגדרתי מטרה – עכשיו הזמן לעבור למשימות!
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default GoalDetailsQuestions;
