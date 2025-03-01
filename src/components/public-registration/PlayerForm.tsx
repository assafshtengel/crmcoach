
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { sportFields } from "./constants";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface PlayerFormProps {
  form: UseFormReturn<FormValues>;
  showOtherSportField: boolean;
  handleSportFieldChange: (value: string) => void;
}

export const PlayerForm = ({ form, showOtherSportField, handleSportFieldChange }: PlayerFormProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">פרטים אישיים</h2>
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
        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          <div className="sm:col-span-2">
            <Label htmlFor="sportField">ענף ספורט</Label>
            <Select 
              onValueChange={handleSportFieldChange}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="בחר ענף ספורט" />
              </SelectTrigger>
              <SelectContent>
                {sportFields.map((sport) => (
                  <SelectItem key={sport.value} value={sport.value}>
                    {sport.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.sportField && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.sportField.message}</p>
            )}
          </div>

          {showOtherSportField && (
            <div>
              <Label htmlFor="otherSportField">פרט ענף ספורט</Label>
              <Input 
                id="otherSportField" 
                className="mt-1"
                placeholder="הקלד ענף ספורט" 
                {...form.register("otherSportField")} 
              />
              {form.formState.errors.otherSportField && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.otherSportField.message}</p>
              )}
            </div>
          )}
          
          <div>
            <Label htmlFor="firstName">שם פרטי</Label>
            <Input 
              id="firstName" 
              className="mt-1"
              placeholder="הכנס שם פרטי" 
              {...form.register("firstName")} 
            />
            {form.formState.errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.firstName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="lastName">שם משפחה</Label>
            <Input 
              id="lastName" 
              className="mt-1"
              placeholder="הכנס שם משפחה" 
              {...form.register("lastName")} 
            />
            {form.formState.errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.lastName.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="email">אימייל</Label>
            <Input 
              id="email" 
              type="email" 
              className="mt-1"
              placeholder="example@example.com" 
              {...form.register("email")} 
            />
            {form.formState.errors.email && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">טלפון</Label>
            <Input 
              id="phone" 
              className="mt-1"
              placeholder="050-0000000" 
              {...form.register("phone")} 
            />
            {form.formState.errors.phone && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="birthDate">תאריך לידה</Label>
            <Input 
              id="birthDate" 
              placeholder="DD/MM/YYYY" 
              className="mt-1" 
              {...form.register("birthDate")} 
            />
            {form.formState.errors.birthDate && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.birthDate.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="city">עיר מגורים</Label>
            <Input 
              id="city" 
              className="mt-1"
              placeholder="הכנס עיר מגורים" 
              {...form.register("city")} 
            />
            {form.formState.errors.city && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.city.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
