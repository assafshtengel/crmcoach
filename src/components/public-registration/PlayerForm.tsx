
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";
import { RegistrationTimeSection } from "./RegistrationTimeSection";
import { SportFieldSection } from "./SportFieldSection";
import { PersonalDetailsSection } from "./PersonalDetailsSection";

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
        <RegistrationTimeSection form={form} />
        <SportFieldSection 
          form={form} 
          showOtherSportField={showOtherSportField} 
          handleSportFieldChange={handleSportFieldChange} 
        />
        <PersonalDetailsSection form={form} />
      </div>
    </div>
  );
};
