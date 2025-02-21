
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from 'react-hook-form';
import { PlayerFormValues } from './PlayerFormSchema';

interface PlayerParentInfoProps {
  form: UseFormReturn<PlayerFormValues>;
}

export const PlayerParentInfo: React.FC<PlayerParentInfoProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="parentName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>שם ההורה</FormLabel>
            <FormControl>
              <Input placeholder="שם מלא" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="parentPhone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>טלפון הורה</FormLabel>
            <FormControl>
              <Input placeholder="(000) 000-0000" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="parentEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>אימייל הורה</FormLabel>
            <FormControl>
              <Input type="email" placeholder="example@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
