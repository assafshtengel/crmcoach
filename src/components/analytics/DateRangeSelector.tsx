
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';

interface DateRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor="date-range" className="text-sm text-muted-foreground">טווח תאריכים</Label>
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger id="date-range" className="w-[180px] bg-white border-blue-200 shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <SelectValue placeholder="בחר טווח תאריכים" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-white border-blue-100">
          <SelectItem value="7days" className="hover:bg-blue-50">7 ימים אחרונים</SelectItem>
          <SelectItem value="30days" className="hover:bg-blue-50">30 ימים אחרונים</SelectItem>
          <SelectItem value="90days" className="hover:bg-blue-50">90 ימים אחרונים</SelectItem>
          <SelectItem value="season" className="hover:bg-blue-50">עונה נוכחית</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
