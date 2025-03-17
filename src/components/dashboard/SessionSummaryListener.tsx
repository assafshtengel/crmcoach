
import React, { useEffect } from 'react';
import { UpcomingSession } from './types';

interface SessionSummaryListenerProps {
  pastSessionsToSummarize: UpcomingSession[];
  setPastSessionsToSummarize: React.Dispatch<React.SetStateAction<UpcomingSession[]>>;
  setSummarizedSessions: React.Dispatch<React.SetStateAction<UpcomingSession[]>>;
}

export const SessionSummaryListener: React.FC<SessionSummaryListenerProps> = ({
  pastSessionsToSummarize,
  setPastSessionsToSummarize,
  setSummarizedSessions
}) => {
  useEffect(() => {
    const handleSessionSummarized = (event: any) => {
      const { sessionId } = event.detail;
      console.log("Session summarized event received for session:", sessionId);

      setPastSessionsToSummarize(prev => prev.filter(session => session.id !== sessionId));
      
      const summarizedSession = pastSessionsToSummarize.find(s => s.id === sessionId);
      
      if (summarizedSession) {
        const updatedSession = { ...summarizedSession, has_summary: true };
        setSummarizedSessions(prev => [updatedSession, ...prev]);
      }
    };

    window.addEventListener('sessionSummarized', handleSessionSummarized);
    
    return () => {
      window.removeEventListener('sessionSummarized', handleSessionSummarized);
    };
  }, [pastSessionsToSummarize, setPastSessionsToSummarize, setSummarizedSessions]);

  return null; // This is a non-rendering component
};
