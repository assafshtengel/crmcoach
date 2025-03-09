
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
            <FormLabel className="text-gray-700">ענף ספורט</FormLabel>
            <Select 
              onValueChange={handleSportFieldChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="text-right bg-white border-gray-200 rounded-lg h-11 focus:ring-primary">
                  <SelectValue placeholder="בחר ענף ספורט" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="text-right bg-white rounded-lg">
                {sportFields.map((sport) => (
                  <SelectItem key={sport.value} value={sport.value} className="focus:bg-primary/5 focus:text-primary">
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
              <FormLabel className="text-gray-700">פרט ענף ספורט</FormLabel>
              <FormControl>
                <Input 
                  placeholder="הקלד ענף ספורט" 
                  {...field} 
                  className="bg-white border-gray-200 rounded-lg h-11 focus:ring-primary"
                />
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
            <FormLabel className="text-gray-700">שם פרטי</FormLabel>
            <FormControl>
              <Input 
                placeholder="ישראל" 
                {...field} 
                className="bg-white border-gray-200 rounded-lg h-11 focus:ring-primary"
              />
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
            <FormLabel className="text-gray-700">שם משפחה</FormLabel>
            <FormControl>
              <Input 
                placeholder="ישראלי" 
                {...field} 
                className="bg-white border-gray-200 rounded-lg h-11 focus:ring-primary"
              />
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
            <FormLabel className="text-gray-700">אימייל שחקן</FormLabel>
            <FormControl>
              <Input 
                type="email" 
                placeholder="example@example.com" 
                {...field} 
                className="bg-white border-gray-200 rounded-lg h-11 focus:ring-primary"
              />
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
            <FormLabel className="text-gray-700">טלפון שחקן</FormLabel>
            <FormControl>
              <Input 
                placeholder="050-0000000" 
                {...field} 
                className="bg-white border-gray-200 rounded-lg h-11 focus:ring-primary"
              />
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
            <FormLabel className="text-gray-700">תאריך לידה</FormLabel>
            <FormControl>
              <Input 
                placeholder="DD-MM-YYYY" 
                {...field} 
                className="bg-white border-gray-200 rounded-lg h-11 focus:ring-primary"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
