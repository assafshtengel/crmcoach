
import React from 'react';
import { Slider } from '@/components/ui/slider';

interface ColorPickerProps {
  value: number;
  onChange: (value: number[]) => void;
  max?: number;
  step?: number;
}

export const ColorPicker = ({
  value,
  onChange,
  max = 100,
  step = 1
}: ColorPickerProps) => {
  return (
    <Slider
      value={[value]}
      onValueChange={onChange}
      max={max}
      step={step}
      className="flex-1"
    />
  )
}
