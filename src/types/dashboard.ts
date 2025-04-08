
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
    player_id?: string;
    eventType?: 'reminder' | 'task' | 'other';
  };
}

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
  location: string;
  reminder_sent: boolean;
  player: {
    id?: string;
    full_name: string;
  };
  has_summary: boolean;
}

export interface Notification {
  id: string;
  coach_id: string;
  timestamp: string;
  is_read: boolean;
  created_at: string;
  type: string;
  message: string;
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
