
import React from 'react';
import { FeedbackDialog } from "./FeedbackDialog";
import { SuccessDialog } from "./SuccessDialog";

interface RegistrationDialogsProps {
  showFeedbackDialog: boolean;
  setShowFeedbackDialog: (show: boolean) => void;
  feedbackMessage: {
    title: string;
    message: string;
    isError: boolean;
  };
  showSuccessDialog: boolean;
  setShowSuccessDialog: (show: boolean) => void;
  coachName?: string;
  handleCloseWindow: () => void;
  onFeedbackClose?: () => void;
}

export const RegistrationDialogs = ({
  showFeedbackDialog,
  setShowFeedbackDialog,
  feedbackMessage,
  showSuccessDialog,
  setShowSuccessDialog,
  coachName,
  handleCloseWindow,
  onFeedbackClose
}: RegistrationDialogsProps) => {
  // Handle feedback dialog close
  const handleFeedbackClose = () => {
    setShowFeedbackDialog(false);
    
    // Only show success dialog if this was not an error message
    if (onFeedbackClose && !feedbackMessage.isError) {
      onFeedbackClose();
    }
  };
  
  return (
    <>
      <FeedbackDialog 
        open={showFeedbackDialog}
        setOpen={setShowFeedbackDialog}
        title={feedbackMessage.title}
        message={feedbackMessage.message}
        isError={feedbackMessage.isError}
        onClose={handleFeedbackClose}
      />

      <SuccessDialog 
        showSuccessDialog={showSuccessDialog} 
        setShowSuccessDialog={setShowSuccessDialog} 
        coachName={coachName} 
        handleCloseWindow={handleCloseWindow} 
      />
    </>
  );
};
