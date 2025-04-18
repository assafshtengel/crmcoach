
import React from "react";
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";
import { Clock } from "lucide-react";
import { format } from "date-fns";

interface RegistrationTimeSectionProps {
  form: UseFormReturn<FormValues>;
}

export const RegistrationTimeSection = ({ form }: RegistrationTimeSectionProps) => {
  // Set the current timestamp when component mounts
  React.useEffect(() => {
    const currentDateTime = format(new Date(), 'dd/MM/yyyy HH:mm');
    form.setValue("registrationTimestamp", currentDateTime);
  }, [form]);

  return (
    <div className="mb-2">
      <FormField
        control={form.control}
        name="registrationTimestamp"
        render={({ field }) => (
          <FormItem className="mb-2">
            <FormLabel className="text-xs flex items-center gap-1 text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              מועד רישום
            </FormLabel>
            <FormControl>
              <Input 
                readOnly 
                disabled 
                className="bg-gray-50 text-xs text-gray-500 border-gray-200" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
