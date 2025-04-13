
import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { allQuestions } from '@/constants/mentalPrepConstants';
import { FormData } from '@/types/mentalPrep';
import { PersonalInfoStep } from './mental-prep/PersonalInfoStep';
import { GameDetailsStep } from './mental-prep/GameDetailsStep';
import { MentalStatesStep } from './mental-prep/MentalStatesStep';
import { GameGoalsStep } from './mental-prep/GameGoalsStep';
import { QuestionsStep } from './mental-prep/QuestionsStep';
import { PreviewDialog } from './mental-prep/PreviewDialog';
import { SaveDialog } from './mental-prep/SaveDialog';
import html2canvas from 'html2canvas';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface MentalPrepFormProps {
  onFormSubmitted?: () => void;
}

export const MentalPrepForm = ({ onFormSubmitted }: MentalPrepFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    matchDate: '',
    opposingTeam: '',
    gameType: '',
    selectedStates: [],
    selectedGoals: [],
    answers: {},
    playerName: '', // Add playerName field
  });

  const [selectedQuestions] = useState(() => {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStateSelection = (state: string) => {
    setFormData(prev => {
      const current = [...prev.selectedStates];
      if (current.includes(state)) {
        return { ...prev, selectedStates: current.filter(s => s !== state) };
      }
      if (current.length < 4) {
        return { ...prev, selectedStates: [...current, state] };
      }
      return prev;
    });
  };

  const handleSubmit = async () => {
    // Validate the form data
    if (!formData.fullName || !formData.email || !formData.matchDate || !formData.opposingTeam) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות הנדרשים",
        variant: "destructive",
      });
      return;
    }
    
    // First save the data to Supabase
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session) {
        toast({
          title: "שגיאה",
          description: "יש להתחבר למערכת כדי לשמור את הדוח.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      console.log('Saving form with coach_id:', session.session.user.id);

      const { data, error } = await supabase
        .from('mental_prep_forms')
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          match_date: formData.matchDate,
          opposing_team: formData.opposingTeam,
          game_type: formData.gameType,
          selected_states: formData.selectedStates,
          selected_goals: formData.selectedGoals,
          answers: formData.answers,
          current_pressure: formData.currentPressure,
          optimal_pressure: formData.optimalPressure,
          player_name: formData.playerName,
          coach_id: session.session.user.id
        })
        .select();

      if (error) {
        console.error('Error saving form:', error);
        throw error;
      }

      console.log('Form saved successfully, data:', data);

      toast({
        title: "הדוח נשמר בהצלחה!",
        description: "ניתן לראות את הדוח בטאב 'צפייה בטפסים שמולאו'",
      });
      
      // Call the callback to refresh the completed forms list
      if (onFormSubmitted) {
        onFormSubmitted();
      }
      
      // Then show the preview dialog
      setShowPreviewDialog(true);
      
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת הדוח. אנא נסה שוב.",
        variant: "destructive",
      });
      console.error('Error in handleSubmit:', error);
    }
  };

  const handleDownload = async () => {
    if (previewRef.current) {
      try {
        const canvas = await html2canvas(previewRef.current, {
          scale: 2,
          logging: false,
          useCORS: true,
          scrollY: -window.scrollY,
          windowWidth: previewRef.current.scrollWidth,
          windowHeight: previewRef.current.scrollHeight,
        });
        
        const image = canvas.toDataURL("image/png", 1.0);
        const link = document.createElement('a');
        link.download = `דוח_הכנה_מנטלית_${formData.fullName}.png`;
        link.href = image;
        link.click();
        
        setShowPreviewDialog(false);
        setShowSaveDialog(true);
      } catch (error) {
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בשמירת התמונה. אנא נסה שוב.",
          variant: "destructive",
        });
      }
    }
  };

  const handleConfirmSave = async () => {
    // After confirming save, navigate to the completed-forms tab 
    navigate('/game-prep', { state: { activeTab: 'completed-forms' } });
    
    // Call the callback to refresh the completed forms list again if needed
    if (onFormSubmitted) {
      onFormSubmitted();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <PersonalInfoStep formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <GameDetailsStep formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <MentalStatesStep formData={formData} handleStateSelection={handleStateSelection} />;
      case 4:
        return <GameGoalsStep formData={formData} updateFormData={updateFormData} />;
      case 5:
        return (
          <QuestionsStep
            formData={formData}
            selectedQuestions={selectedQuestions}
            updateFormData={updateFormData}
          />
        );
      default:
        return null;
    }
  };

  const steps = [
    { title: 'פרטים אישיים', icon: '👤' },
    { title: 'פרטי משחק', icon: '⚽' },
    { title: 'מצב מנטלי', icon: '🧠' },
    { title: 'מטרות', icon: '🎯' },
    { title: 'שאלות', icon: '❓' },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto p-8 bg-white/90 backdrop-blur-sm border border-gray-100 shadow-xl rounded-xl">
      <div className="space-y-8">
        <div className="flex justify-between mb-8">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`flex flex-col items-center ${
                i + 1 === step ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-2 transition-all duration-300 ${
                  i + 1 === step
                    ? 'bg-primary text-white scale-110'
                    : i + 1 < step
                    ? 'bg-primary/20 text-primary'
                    : 'bg-gray-100'
                }`}
              >
                {s.icon}
              </div>
              <span className="text-xs hidden md:block">{s.title}</span>
            </div>
          ))}
        </div>

        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 5) * 100}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-50"
        >
          {renderStep()}
        </motion.div>

        <div className="flex justify-between pt-4 border-t border-gray-100">
          {step > 1 && (
            <Button 
              onClick={() => setStep(step - 1)} 
              variant="outline"
              className="hover:bg-gray-50 transition-all duration-300 hover:scale-105"
            >
              הקודם
            </Button>
          )}
          {step < 5 ? (
            <Button 
              onClick={() => setStep(step + 1)} 
              className="mr-auto bg-primary hover:bg-primary/90 text-white transition-all duration-300 hover:scale-105"
            >
              הבא
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              className="mr-auto bg-primary hover:bg-primary/90 text-white transition-all duration-300 hover:scale-105"
            >
              שלח
            </Button>
          )}
        </div>
      </div>

      <PreviewDialog
        open={showPreviewDialog}
        onOpenChange={setShowPreviewDialog}
        formData={formData}
        previewRef={previewRef}
        onDownload={handleDownload}
      />

      <SaveDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onConfirm={handleConfirmSave}
      />
    </Card>
  );
};
