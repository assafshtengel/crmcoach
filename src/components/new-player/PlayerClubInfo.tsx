
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from 'react-hook-form';
import { PlayerFormValues } from './PlayerFormSchema';

interface PlayerClubInfoProps {
  form: UseFormReturn<PlayerFormValues>;
}

export const PlayerClubInfo: React.FC<PlayerClubInfoProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>עיר מגורים</FormLabel>
            <FormControl>
              <Input placeholder="תל אביב" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="club"
        render={({ field }) => (
          <FormItem>
            <FormLabel>מועדון</FormLabel>
            <FormControl>
              <Input placeholder="הפועל/מכבי" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="yearGroup"
        render={({ field }) => (
          <FormItem>
            <FormLabel>שנתון</FormLabel>
            <FormControl>
              <Input placeholder="2010" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
