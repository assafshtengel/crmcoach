
import React from 'react';
import { usePublicRegistration } from '@/hooks/usePublicRegistration';
import { RegistrationFormContainer } from '@/components/public-registration/RegistrationFormContainer';
import { RegistrationDialogs } from '@/components/public-registration/RegistrationDialogs';
import { FormHeader } from "@/components/public-registration/FormHeader";
import { LoadingSpinner } from "@/components/public-registration/LoadingSpinner";

const PublicRegistrationForm = () => {
  const {
    form,
    linkData,
    isLoading,
    isSubmitting,
    showSuccessDialog,
    setShowSuccessDialog,
    showFeedbackDialog,
    setShowFeedbackDialog,
    feedbackMessage,
    showOtherSportField,
    handleSportFieldChange,
    handleCloseWindow,
    onSubmit,
    generatedPassword
  } = usePublicRegistration();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!linkData || !linkData.coach) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">שגיאה בטעינת הטופס</h2>
          <p className="text-gray-600 mb-6">
            לא ניתן למצוא את המאמן המשויך לקישור זה. נא לפנות למאמן לקבלת קישור תקין.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <FormHeader 
          coachName={linkData.coach.full_name} 
          customMessage={linkData.custom_message} 
        />

        <div className="px-4 py-6 sm:p-10">
          <RegistrationFormContainer 
            form={form}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            showOtherSportField={showOtherSportField}
            handleSportFieldChange={handleSportFieldChange}
          />
        </div>
      </div>

      <RegistrationDialogs 
        showFeedbackDialog={showFeedbackDialog}
        setShowFeedbackDialog={setShowFeedbackDialog}
        feedbackMessage={feedbackMessage}
        showSuccessDialog={showSuccessDialog}
        setShowSuccessDialog={setShowSuccessDialog}
        coachName={linkData.coach.full_name}
        handleCloseWindow={handleCloseWindow}
        onFeedbackClose={() => setShowSuccessDialog(true)}
        generatedPassword={generatedPassword}
      />
    </div>
  );
};

export default PublicRegistrationForm;
