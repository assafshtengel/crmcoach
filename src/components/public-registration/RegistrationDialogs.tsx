
import React from 'react';
import { SuccessDialog } from './SuccessDialog';
import { FeedbackDialog } from './FeedbackDialog';

interface RegistrationDialogsProps {
  showFeedbackDialog: boolean;
  setShowFeedbackDialog: (open: boolean) => void;
  feedbackMessage: { title: string; message: string; isError: boolean };
  showSuccessDialog: boolean;
  setShowSuccessDialog: (open: boolean) => void;
  coachName: string;
  handleCloseWindow: () => void;
  onFeedbackClose?: () => void;
  generatedPassword: string;
}

export const RegistrationDialogs = ({
  showFeedbackDialog,
  setShowFeedbackDialog,
  feedbackMessage,
  showSuccessDialog,
  setShowSuccessDialog,
  coachName,
  handleCloseWindow,
  onFeedbackClose,
  generatedPassword
}: RegistrationDialogsProps) => {
  return (
    <>
      <FeedbackDialog
        open={showFeedbackDialog}
        setOpen={setShowFeedbackDialog}
        title={feedbackMessage.title}
        message={feedbackMessage.message}
        isError={feedbackMessage.isError}
        onClose={!feedbackMessage.isError ? onFeedbackClose : undefined}
      />
      
      <SuccessDialog
        open={showSuccessDialog}
        setOpen={setShowSuccessDialog}
        coachName={coachName || "המאמן"}
        handleCloseWindow={handleCloseWindow}
        generatedPassword={generatedPassword}
      />
    </>
  );
};
