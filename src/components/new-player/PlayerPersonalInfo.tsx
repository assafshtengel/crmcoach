
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { positions } from './PlayerFormSchema';
import { UseFormReturn } from 'react-hook-form';
import { PlayerFormValues } from './PlayerFormSchema';

interface PlayerPersonalInfoProps {
  form: UseFormReturn<PlayerFormValues>;
}

export const PlayerPersonalInfo: React.FC<PlayerPersonalInfoProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <Input placeholder="(000) 000-0000" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="position"
        render={({ field }) => (
          <FormItem>
            <FormLabel>עמדה</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="בחר עמדה" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {positions.map((position) => (
                  <SelectItem key={position.value} value={position.value}>
                    {position.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
