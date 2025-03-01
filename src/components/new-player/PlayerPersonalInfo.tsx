
import React, { useState } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sportFields } from './PlayerFormSchema';
import { UseFormReturn } from 'react-hook-form';
import { PlayerFormValues } from './PlayerFormSchema';

interface PlayerPersonalInfoProps {
  form: UseFormReturn<PlayerFormValues>;
}

export const PlayerPersonalInfo: React.FC<PlayerPersonalInfoProps> = ({ form }) => {
  const [showOtherSportField, setShowOtherSportField] = useState(form.getValues().sportField === 'other');

  const handleSportFieldChange = (value: string) => {
    form.setValue('sportField', value);
    setShowOtherSportField(value === 'other');
    if (value !== 'other') {
      form.setValue('otherSportField', '');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="sportField"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ענף ספורט</FormLabel>
            <Select 
              onValueChange={handleSportFieldChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="בחר ענף ספורט" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="text-right">
                {sportFields.map((sport) => (
                  <SelectItem key={sport.value} value={sport.value}>
                    {sport.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {showOtherSportField && (
        <FormField
          control={form.control}
          name="otherSportField"
          render={({ field }) => (
            <FormItem>
              <FormLabel>פרט ענף ספורט</FormLabel>
              <FormControl>
                <Input placeholder="הקלד ענף ספורט" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>שם פרטי</FormLabel>
            <FormControl>
              <Input placeholder="ישראל" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>שם משפחה</FormLabel>
            <FormControl>
              <Input placeholder="ישראלי" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="playerEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>אימייל שחקן</FormLabel>
            <FormControl>
              <Input type="email" placeholder="example@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="playerPhone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>טלפון שחקן</FormLabel>
            <FormControl>
              <Input placeholder="050-0000000" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="birthDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>תאריך לידה</FormLabel>
            <FormControl>
              <Input placeholder="DD-MM-YYYY" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
