export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      coaches: {
        Row: {
          created_at: string
          description: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          profile_picture: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          profile_picture?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          profile_picture?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          contract_value: number
          created_at: string | null
          followers: number
          id: string
          jersey_number: number
          league: string
          mental_commitment: string | null
          player_name: string
          position: string
          signature_date: string | null
          team: string
          user_id: string
        }
        Insert: {
          contract_value: number
          created_at?: string | null
          followers: number
          id?: string
          jersey_number: number
          league: string
          mental_commitment?: string | null
          player_name: string
          position: string
          signature_date?: string | null
          team: string
          user_id: string
        }
        Update: {
          contract_value?: number
          created_at?: string | null
          followers?: number
          id?: string
          jersey_number?: number
          league?: string
          mental_commitment?: string | null
          player_name?: string
          position?: string
          signature_date?: string | null
          team?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          created_at: string
          current_day: number | null
          custom_goal: string | null
          daily_tasks: Json
          goal_category: string
          id: string
          notes: string | null
          streak_count: number | null
          updated_at: string
          user_id: string
          weekly_tasks: Json
        }
        Insert: {
          created_at?: string
          current_day?: number | null
          custom_goal?: string | null
          daily_tasks?: Json
          goal_category: string
          id?: string
          notes?: string | null
          streak_count?: number | null
          updated_at?: string
          user_id: string
          weekly_tasks?: Json
        }
        Update: {
          created_at?: string
          current_day?: number | null
          custom_goal?: string | null
          daily_tasks?: Json
          goal_category?: string
          id?: string
          notes?: string | null
          streak_count?: number | null
          updated_at?: string
          user_id?: string
          weekly_tasks?: Json
        }
        Relationships: []
      }
      dashboard_cards: {
        Row: {
          card_content: string | null
          card_order: number
          card_title: string
          card_type: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_content?: string | null
          card_order: number
          card_title: string
          card_type: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_content?: string | null
          card_order?: number
          card_title?: string
          card_type?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      evaluation_daily_responses: {
        Row: {
          category_averages: Json | null
          completed_at: string | null
          day_number: number
          id: string
          scores: Json
          session_id: string
        }
        Insert: {
          category_averages?: Json | null
          completed_at?: string | null
          day_number: number
          id?: string
          scores?: Json
          session_id: string
        }
        Update: {
          category_averages?: Json | null
          completed_at?: string | null
          day_number?: number
          id?: string
          scores?: Json
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_daily_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "evaluation_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_sessions: {
        Row: {
          age: number
          completion_date: string | null
          created_at: string | null
          current_day: number
          id: string
          player_name: string
          start_date: string
          status: string
          team: string
          user_id: string
        }
        Insert: {
          age: number
          completion_date?: string | null
          created_at?: string | null
          current_day?: number
          id?: string
          player_name: string
          start_date?: string
          status?: string
          team: string
          user_id: string
        }
        Update: {
          age?: number
          completion_date?: string | null
          created_at?: string | null
          current_day?: number
          id?: string
          player_name?: string
          start_date?: string
          status?: string
          team?: string
          user_id?: string
        }
        Relationships: []
      }
      last_meetings: {
        Row: {
          created_at: string
          id: string
          meeting_date: string
          meeting_text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meeting_date?: string
          meeting_text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meeting_date?: string
          meeting_text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mental_commitments: {
        Row: {
          created_at: string
          id: string
          improvement_area: string
          motivational_quote: string
          unique_trait: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          improvement_area: string
          motivational_quote: string
          unique_trait: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          improvement_area?: string
          motivational_quote?: string
          unique_trait?: string
          user_id?: string
        }
        Relationships: []
      }
      mental_prep_forms: {
        Row: {
          answers: Json
          created_at: string
          current_pressure: string | null
          email: string
          full_name: string
          game_type: string
          id: string
          match_date: string
          opposing_team: string
          optimal_pressure: string | null
          phone: string
          selected_goals: Json
          selected_states: Json
        }
        Insert: {
          answers: Json
          created_at?: string
          current_pressure?: string | null
          email: string
          full_name: string
          game_type: string
          id?: string
          match_date: string
          opposing_team: string
          optimal_pressure?: string | null
          phone: string
          selected_goals: Json
          selected_states: Json
        }
        Update: {
          answers?: Json
          created_at?: string
          current_pressure?: string | null
          email?: string
          full_name?: string
          game_type?: string
          id?: string
          match_date?: string
          opposing_team?: string
          optimal_pressure?: string | null
          phone?: string
          selected_goals?: Json
          selected_states?: Json
        }
        Relationships: []
      }
      mental_tools: {
        Row: {
          created_at: string
          description: string
          id: string
          implementation: string
          key_points: string[]
          learned: string
          name: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          implementation: string
          key_points?: string[]
          learned: string
          name: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          implementation?: string
          key_points?: string[]
          learned?: string
          name?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      next_meetings: {
        Row: {
          created_at: string
          id: string
          meeting_text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meeting_text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meeting_text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          coach_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          timestamp: string
          type: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          timestamp?: string
          type: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          timestamp?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications_log: {
        Row: {
          coach_id: string
          error_message: string | null
          id: string
          message_content: string
          sent_at: string | null
          session_id: string | null
          status: string
        }
        Insert: {
          coach_id: string
          error_message?: string | null
          id?: string
          message_content: string
          sent_at?: string | null
          session_id?: string | null
          status: string
        }
        Update: {
          coach_id?: string
          error_message?: string | null
          id?: string
          message_content?: string
          sent_at?: string | null
          session_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_log_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_log_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      player_details: {
        Row: {
          contract_value: number | null
          created_at: string
          followers: number | null
          full_name: string
          id: string
          jersey_number: number
          league: string | null
          position: string
          team: string | null
        }
        Insert: {
          contract_value?: number | null
          created_at?: string
          followers?: number | null
          full_name: string
          id: string
          jersey_number: number
          league?: string | null
          position: string
          team?: string | null
        }
        Update: {
          contract_value?: number | null
          created_at?: string
          followers?: number | null
          full_name?: string
          id?: string
          jersey_number?: number
          league?: string | null
          position?: string
          team?: string | null
        }
        Relationships: []
      }
      player_evaluations: {
        Row: {
          age: number
          category_averages: Json | null
          created_at: string
          evaluation_date: string
          id: string
          player_name: string
          scores: Json
          team: string
          total_score: number | null
          user_id: string
        }
        Insert: {
          age: number
          category_averages?: Json | null
          created_at?: string
          evaluation_date: string
          id?: string
          player_name: string
          scores: Json
          team: string
          total_score?: number | null
          user_id: string
        }
        Update: {
          age?: number
          category_averages?: Json | null
          created_at?: string
          evaluation_date?: string
          id?: string
          player_name?: string
          scores?: Json
          team?: string
          total_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          coach_id: string
          created_at: string
          email: string
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          position: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          coach_id: string
          created_at: string
          id: string
          notes: string | null
          player_id: string
          reminder_sent: boolean | null
          session_date: string
          session_time: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          id?: string
          notes?: string | null
          player_id: string
          reminder_sent?: boolean | null
          session_date: string
          session_time: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          player_id?: string
          reminder_sent?: boolean | null
          session_date?: string
          session_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_coach_statistics: {
        Args: {
          coach_id: string
        }
        Returns: {
          totalsessions: number
          successfulreminders: number
          activeplayerscount: number
        }[]
      }
      get_monthly_reminders_count: {
        Args: {
          coach_id: string
        }
        Returns: {
          name: string
          reminders: number
        }[]
      }
      get_monthly_sessions_count: {
        Args: {
          coach_id: string
        }
        Returns: {
          name: string
          sessions: number
        }[]
      }
      get_player_session_distribution: {
        Args: {
          coach_id: string
        }
        Returns: {
          name: string
          value: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
