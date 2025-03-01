
import React from "react";
import { format } from "date-fns";
import { he } from 'date-fns/locale';

interface SessionHeaderProps {
  playerName: string;
  sessionDate: string;
}

export function SessionHeader({ playerName, sessionDate }: SessionHeaderProps) {
  const formattedDate = format(new Date(sessionDate), 'dd/MM/yyyy', { locale: he });

  return (
    <div className="mb-6 text-center">
      <h2 className="text-xl font-semibold mb-2">{playerName}</h2>
      <p className="text-gray-600">{formattedDate}</p>
    </div>
  );
}
