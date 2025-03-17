
export interface DashboardStats {
  totalPlayers: number;
  upcomingSessions: number;
  currentMonthPastSessions: number;
  currentMonthFutureSessions: number;
  lastMonthSessions: number;
  twoMonthsAgoSessions: number;
  totalReminders: number;
}

export interface UpcomingSession {
  id: string;
  session_date: string;
  session_time: string;
  notes: string;
  reminder_sent: boolean;
  location: string;
  player: {
    full_name: string;
    id?: string;
  };
  has_summary?: boolean;
}

export interface SessionResponse {
  id: string;
  session_date: string;
  session_time: string;
  location: string | null;
  notes: string | null;
  reminder_sent: boolean | null;
  player: {
    full_name: string;
  };
}

export interface Notification {
  id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  type: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  location?: string;
  extendedProps: {
    playerName: string;
    location?: string;
    reminderSent: boolean;
    notes?: string;
  };
}

export interface EventFormData {
  title: string;
  date: string;
  time: string;
  notes?: string;
}
