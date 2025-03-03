
import React from 'react';
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormValues } from "./types";
import { PlayerForm } from "./PlayerForm";
import { ClubInfo } from "./ClubInfo";
import { ParentInfo } from "./ParentInfo";
import { NotesSection } from "./NotesSection";
import { RegistrationTimeSection } from "./RegistrationTimeSection";
import { UseFormReturn } from "react-hook-form";

interface RegistrationFormContainerProps {
  form: UseFormReturn<FormValues>;
  isSubmitting: boolean;
  onSubmit: (values: FormValues) => Promise<void>;
  showOtherSportField: boolean;
  handleSportFieldChange: (value: string) => void;
}

export const RegistrationFormContainer = ({
  form,
  isSubmitting,
  onSubmit,
  showOtherSportField,
  handleSportFieldChange
}: RegistrationFormContainerProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
        <div className="space-y-4 sm:space-y-6">
          <PlayerForm 
            form={form} 
            showOtherSportField={showOtherSportField} 
            handleSportFieldChange={handleSportFieldChange} 
          />
          
          <ClubInfo form={form} />
          
          <ParentInfo form={form} />
          
          <NotesSection form={form} />
          
          <RegistrationTimeSection form={form} />
        </div>
        
        <div className="pt-2">
          <Button
            type="submit"
            className="w-full py-2 sm:py-3 text-base sm:text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "רושם..." : "שלח פרטים"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
