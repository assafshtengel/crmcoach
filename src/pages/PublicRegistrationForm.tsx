
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

  // Make sure we have at least the coach_id from the link data
  if (!linkData || !linkData.coach_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">שגיאה בטעינת הטופס</h2>
          <p className="text-gray-600 mb-6">
            לא ניתן למצוא את הקישור המבוקש או שהוא אינו פעיל יותר. נא לפנות למאמן לקבלת קישור תקין.
          </p>
        </div>
      </div>
    );
  }

  // Get the coach name from the link data, default to "המאמן" if not available
  const coachName = linkData.coach?.full_name || "המאמן";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <FormHeader 
          coachName={coachName} 
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
        coachName={coachName}
        handleCloseWindow={handleCloseWindow}
        onFeedbackClose={() => setShowFeedbackDialog(false)}
        generatedPassword={generatedPassword}
      />
    </div>
  );
};

export default PublicRegistrationForm;
