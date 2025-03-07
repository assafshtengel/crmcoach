
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from 'react-hook-form';
import { PlayerFormValues } from './PlayerFormSchema';

interface PlayerClubInfoProps {
  form: UseFormReturn<PlayerFormValues>;
}

export const PlayerClubInfo: React.FC<PlayerClubInfoProps> = ({
  form
}) => {
  return <div className="space-y-6">
      <FormField control={form.control} name="registrationTimestamp" render={({
      field
    }) => <FormItem className="mb-2">
            <FormLabel className="text-xs text-gray-500">מועד רישום</FormLabel>
            <FormControl>
              <Input readOnly disabled className="bg-gray-50 text-xs text-gray-500" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField control={form.control} name="city" render={({
        field
      }) => <FormItem>
              <FormLabel>עיר מגורים</FormLabel>
              <FormControl>
                <Input placeholder="תל אביב" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>} />

        <FormField control={form.control} name="club" render={({
        field
      }) => <FormItem>
              <FormLabel>מועדון</FormLabel>
              <FormControl>
                <Input placeholder="הפועל/מכבי" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>} />

        <FormField control={form.control} name="yearGroup" render={({
        field
      }) => <FormItem>
              <FormLabel>שנתון/קבוצת גיל (לדוגמא: ילדים א)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>} />
      </div>
    </div>;
};
