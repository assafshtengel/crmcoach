
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface ParentInfoProps {
  form: UseFormReturn<FormValues>;
}

export const ParentInfo = ({ form }: ParentInfoProps) => {
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900">פרטי הורה (לשחקנים מתחת לגיל 18)</h2>
      <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
        <div>
          <Label htmlFor="parentName">שם מלא</Label>
          <Input 
            id="parentName" 
            className="mt-1"
            placeholder="הכנס שם מלא של ההורה" 
            {...form.register("parentName")} 
          />
          {form.formState.errors.parentName && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.parentName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="parentPhone">טלפון</Label>
          <Input 
            id="parentPhone" 
            className="mt-1"
            placeholder="050-0000000" 
            {...form.register("parentPhone")} 
          />
          {form.formState.errors.parentPhone && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.parentPhone.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="parentEmail">אימייל</Label>
          <Input 
            id="parentEmail" 
            type="email" 
            className="mt-1"
            placeholder="example@example.com" 
            {...form.register("parentEmail")} 
          />
          {form.formState.errors.parentEmail && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.parentEmail.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};
