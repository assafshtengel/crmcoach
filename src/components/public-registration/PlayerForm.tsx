
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
          </div>

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
      </div>
    </div>
  );
};
