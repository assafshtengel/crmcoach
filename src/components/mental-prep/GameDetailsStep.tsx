
import React, { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormData } from '@/types/mentalPrep';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface GameDetailsStepProps {
  formData: FormData;
  updateFormData: (field: string, value: any) => void;
}

export const GameDetailsStep = ({ formData, updateFormData }: GameDetailsStepProps) => {
  const opposingTeamRef = useRef<HTMLInputElement>(null);
  const [showCustomOptions, setShowCustomOptions] = useState(false);
  const [customGameType, setCustomGameType] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const gameTypes = [
    { value: 'league', label: 'ליגה' },
    { value: 'cup', label: 'גביע' },
    { value: 'friendly', label: 'ידידות' },
    { value: 'other', label: 'אחר' }
  ];

  const customOptions = [
    { value: 'tournament', label: 'טורניר' },
    { value: 'training_match', label: 'משחק אימון' },
    { value: 'regional', label: 'אזורי' },
    { value: 'custom', label: 'הוסף משחק אחר...' }
  ];

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      updateFormData('matchDate', formattedDate);
      
      setTimeout(() => {
        if (opposingTeamRef.current) {
          opposingTeamRef.current.focus();
        }
      }, 100);
    }
  };

  const handleGameTypeSelect = (type: string) => {
    updateFormData('gameType', type);
    
    if (type === 'other') {
      setShowCustomOptions(true);
      setShowCustomInput(false);
    } else {
      setShowCustomOptions(false);
      setShowCustomInput(false);
      setCustomGameType('');
    }
  };

  const handleCustomTypeSelect = (type: string) => {
    if (type === 'custom') {
      setShowCustomInput(true);
      setCustomGameType('');
    } else {
      updateFormData('gameType', type);
      setCustomGameType(type);
      setShowCustomInput(false);
    }
  };

  const handleCustomTypeInput = (value: string) => {
    setCustomGameType(value);
    updateFormData('gameType', value);
  };

  const addCustomGameType = () => {
    if (customGameType.trim()) {
      updateFormData('gameType', customGameType);
      setShowCustomInput(false);
    }
  };

  return (
    <div className="form-step space-y-4">
      <h2 className="text-2xl font-bold mb-6 text-right">פרטי המשחק</h2>
      <div>
        <Label htmlFor="matchDate" className="text-right block">תאריך המשחק</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-right font-normal",
                !formData.matchDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.matchDate ? (
                format(new Date(formData.matchDate), 'dd/MM/yyyy')
              ) : (
                <span>בחר תאריך...</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.matchDate ? new Date(formData.matchDate) : undefined}
              onSelect={handleDateSelect}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <Label htmlFor="opposingTeam" className="text-right block">קבוצה יריבה</Label>
        <Input
          id="opposingTeam"
          value={formData.opposingTeam}
          onChange={(e) => updateFormData('opposingTeam', e.target.value)}
          className="input-field"
          ref={opposingTeamRef}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-right block">סוג משחק</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {gameTypes.map((type) => (
            <div
              key={type.value}
              onClick={() => handleGameTypeSelect(type.value)}
              className={cn(
                'cursor-pointer rounded-lg p-4 text-center transition-all duration-200',
                'hover:shadow-md border-2',
                formData.gameType === type.value
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : (showCustomOptions && type.value === 'other')
                    ? 'border-primary/50 bg-white'
                    : 'border-gray-200 bg-white hover:border-primary/50'
              )}
            >
              <span className="text-lg font-medium">{type.label}</span>
            </div>
          ))}
        </div>
        
        {/* Custom options panel */}
        {showCustomOptions && (
          <div className="mt-4 space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Label className="text-right block text-sm text-gray-600">בחר סוג משחק מותאם אישית</Label>
            
            <div className="grid grid-cols-2 gap-3">
              {customOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleCustomTypeSelect(option.value)}
                  className={cn(
                    'cursor-pointer rounded-lg p-3 text-center transition-all duration-200',
                    'hover:shadow-sm border',
                    (customGameType === option.value || (option.value === 'custom' && showCustomInput))
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 bg-white hover:border-primary/30'
                  )}
                >
                  {option.value === 'custom' ? (
                    <div className="flex items-center justify-center gap-1">
                      <PlusCircle className="h-4 w-4" />
                      <span className="text-md font-medium">{option.label}</span>
                    </div>
                  ) : (
                    <span className="text-md font-medium">{option.label}</span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Custom input field */}
            {showCustomInput && (
              <div className="mt-3">
                <Label htmlFor="customGameType" className="text-right block text-sm">הקלד סוג משחק אחר</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="customGameType"
                    value={customGameType}
                    onChange={(e) => handleCustomTypeInput(e.target.value)}
                    placeholder="הקלד סוג משחק..."
                    className="mt-1 flex-grow"
                    autoFocus
                  />
                  <Button 
                    type="button" 
                    className="mt-1" 
                    size="sm"
                    disabled={!customGameType.trim()}
                    onClick={addCustomGameType}
                  >
                    אישור
                  </Button>
                </div>
              </div>
            )}
            
            {/* Display selected custom type if chosen */}
            {formData.gameType && !['league', 'cup', 'friendly', 'tournament', 'training_match', 'regional', ''].includes(formData.gameType) && !showCustomInput && (
              <div className="mt-3 p-2 bg-primary/5 rounded border border-primary/20">
                <p className="text-sm text-right">
                  <strong>סוג משחק נבחר:</strong> {formData.gameType}
                </p>
                <Button 
                  variant="ghost" 
                  className="text-xs mt-1 h-7 px-2" 
                  onClick={() => { 
                    setShowCustomInput(true); 
                    setCustomGameType(formData.gameType);
                  }}
                >
                  ערוך
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
