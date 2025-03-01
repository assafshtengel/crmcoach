
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface RegistrationTimeSectionProps {
  form: UseFormReturn<FormValues>;
}

export const RegistrationTimeSection = ({ form }: RegistrationTimeSectionProps) => {
  return (
    <div className="mb-2">
      <FormField
        control={form.control}
        name="registrationTimestamp"
        render={({ field }) => (
          <FormItem className="mb-2">
            <FormLabel className="text-xs text-gray-500">מועד רישום</FormLabel>
            <FormControl>
              <Input readOnly disabled className="bg-gray-50 text-xs text-gray-500" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
