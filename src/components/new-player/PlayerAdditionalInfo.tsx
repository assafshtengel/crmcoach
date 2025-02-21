
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from 'react-hook-form';
import { PlayerFormValues } from './PlayerFormSchema';

interface PlayerAdditionalInfoProps {
  form: UseFormReturn<PlayerFormValues>;
}

export const PlayerAdditionalInfo: React.FC<PlayerAdditionalInfoProps> = ({ form }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="injuries"
        render={({ field }) => (
          <FormItem>
            <FormLabel>פציעות עבר</FormLabel>
            <FormControl>
              <Textarea
                placeholder="פרט את פציעות העבר של השחקן"
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>הערות נוספות</FormLabel>
            <FormControl>
              <Textarea
                placeholder="הוסף הערות נוספות על השחקן"
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
