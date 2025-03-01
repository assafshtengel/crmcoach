
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sportFields } from "./constants";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface SportFieldSectionProps {
  form: UseFormReturn<FormValues>;
  showOtherSportField: boolean;
  handleSportFieldChange: (value: string) => void;
}

export const SportFieldSection = ({ form, showOtherSportField, handleSportFieldChange }: SportFieldSectionProps) => {
  return (
    <div className="sm:col-span-2">
      <FormField
        control={form.control}
        name="sportField"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ענף ספורט</FormLabel>
            <Select 
              onValueChange={(value) => {
                field.onChange(value);
                handleSportFieldChange(value);
              }}
              value={field.value || ""}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="בחר ענף ספורט" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
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
        <div>
          <FormField
            control={form.control}
            name="otherSportField"
            render={({ field }) => (
              <FormItem>
                <FormLabel>פרט ענף ספורט</FormLabel>
                <FormControl>
                  <Input 
                    className="mt-1"
                    placeholder="הקלד ענף ספורט" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};
