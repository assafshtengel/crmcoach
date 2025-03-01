
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface PersonalDetailsSectionProps {
  form: UseFormReturn<FormValues>;
}

export const PersonalDetailsSection = ({ form }: PersonalDetailsSectionProps) => {
  return (
    <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
      <div>
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>שם פרטי</FormLabel>
              <FormControl>
                <Input 
                  className="mt-1"
                  placeholder="הכנס שם פרטי" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div>
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>שם משפחה</FormLabel>
              <FormControl>
                <Input 
                  className="mt-1"
                  placeholder="הכנס שם משפחה" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>אימייל</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  className="mt-1"
                  placeholder="example@example.com" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div>
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>טלפון</FormLabel>
              <FormControl>
                <Input 
                  className="mt-1"
                  placeholder="050-0000000" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div>
        <FormField
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>תאריך לידה</FormLabel>
              <FormControl>
                <Input 
                  placeholder="DD/MM/YYYY" 
                  className="mt-1" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div>
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>עיר מגורים</FormLabel>
              <FormControl>
                <Input 
                  className="mt-1"
                  placeholder="הכנס עיר מגורים" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
