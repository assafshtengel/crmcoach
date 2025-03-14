
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface DateRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor="date-range">טווח תאריכים</Label>
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger id="date-range" className="w-[180px]">
          <SelectValue placeholder="בחר טווח תאריכים" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7days">7 ימים אחרונים</SelectItem>
          <SelectItem value="30days">30 ימים אחרונים</SelectItem>
          <SelectItem value="90days">90 ימים אחרונים</SelectItem>
          <SelectItem value="season">עונה נוכחית</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
