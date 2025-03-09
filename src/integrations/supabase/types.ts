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
      coach_tools: {
        Row: {
          coach_id: string
          created_at: string
          description: string
          id: string
          name: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          description: string
          id?: string
          name: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          description?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      coaches: {
        Row: {
          certifications: string[] | null
          created_at: string
          description: string | null
          education: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          profile_picture: string | null
          specialty: string | null
          years_of_experience: number | null
        }
        Insert: {
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          education?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          profile_picture?: string | null
          specialty?: string | null
          years_of_experience?: number | null
        }
        Update: {
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          education?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          profile_picture?: string | null
          specialty?: string | null
          years_of_experience?: number | null
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
      dashboard_content: {
        Row: {
          content: string
          content_type: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          content_type: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          content_type?: string
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
      goal_messages: {
        Row: {
          created_at: string | null
          goal_id: string | null
          id: string
          message: string
          read_at: string | null
          recipient_id: string | null
          sender_id: string | null
        }
        Insert: {
          created_at?: string | null
          goal_id?: string | null
          id?: string
          message: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
        }
        Update: {
          created_at?: string | null
          goal_id?: string | null
          id?: string
          message?: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_messages_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_progress: {
        Row: {
          goal_id: string | null
          id: string
          progress_percentage: number | null
          recorded_at: string | null
          tasks_completed: number | null
          total_tasks: number | null
        }
        Insert: {
          goal_id?: string | null
          id?: string
          progress_percentage?: number | null
          recorded_at?: string | null
          tasks_completed?: number | null
          total_tasks?: number | null
        }
        Update: {
          goal_id?: string | null
          id?: string
          progress_percentage?: number | null
          recorded_at?: string | null
          tasks_completed?: number | null
          total_tasks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_progress_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_tasks: {
        Row: {
          completed: boolean | null
          created_at: string | null
          description: string | null
          difficulty_level: number | null
          due_date: string | null
          goal_id: string | null
          id: string
          is_ai_generated: boolean | null
          title: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          due_date?: string | null
          goal_id?: string | null
          id?: string
          is_ai_generated?: boolean | null
          title: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          due_date?: string | null
          goal_id?: string | null
          id?: string
          is_ai_generated?: boolean | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          coach_id: string | null
          completed: boolean | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          success_criteria: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          coach_id?: string | null
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          success_criteria?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          coach_id?: string | null
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          success_criteria?: string | null
          title?: string
          type?: string
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
          coach_id: string | null
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
          player_id: string | null
          selected_goals: Json
          selected_states: Json
        }
        Insert: {
          answers: Json
          coach_id?: string | null
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
          player_id?: string | null
          selected_goals: Json
          selected_states: Json
        }
        Update: {
          answers?: Json
          coach_id?: string | null
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
          player_id?: string | null
          selected_goals?: Json
          selected_states?: Json
        }
        Relationships: [
          {
            foreignKeyName: "mental_prep_forms_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mental_prep_forms_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
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
      player_videos: {
        Row: {
          assigned_by: string | null
          created_at: string
          id: string
          player_id: string | null
          video_id: string | null
          watched: boolean | null
          watched_at: string | null
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          player_id?: string | null
          video_id?: string | null
          watched?: boolean | null
          watched_at?: string | null
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          player_id?: string | null
          video_id?: string | null
          watched?: boolean | null
          watched_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_videos_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_videos_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          birthdate: string | null
          city: string | null
          club: string | null
          coach_id: string | null
          contact_status: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          injuries: string | null
          notes: string | null
          parent_email: string | null
          parent_name: string | null
          parent_phone: string | null
          password: string | null
          phone: string | null
          profile_image: string | null
          registration_link_id: string | null
          registration_timestamp: string | null
          sport_field: string | null
          video_count: number | null
          year_group: string | null
        }
        Insert: {
          birthdate?: string | null
          city?: string | null
          club?: string | null
          coach_id?: string | null
          contact_status?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          injuries?: string | null
          notes?: string | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          password?: string | null
          phone?: string | null
          profile_image?: string | null
          registration_link_id?: string | null
          registration_timestamp?: string | null
          sport_field?: string | null
          video_count?: number | null
          year_group?: string | null
        }
        Update: {
          birthdate?: string | null
          city?: string | null
          club?: string | null
          coach_id?: string | null
          contact_status?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          injuries?: string | null
          notes?: string | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          password?: string | null
          phone?: string | null
          profile_image?: string | null
          registration_link_id?: string | null
          registration_timestamp?: string | null
          sport_field?: string | null
          video_count?: number | null
          year_group?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_registration_link_id_fkey"
            columns: ["registration_link_id"]
            isOneToOne: false
            referencedRelation: "registration_links"
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
      registration_links: {
        Row: {
          coach_id: string
          created_at: string
          custom_message: string | null
          expires_at: string | null
          id: string
          is_active: boolean
        }
        Insert: {
          coach_id: string
          created_at?: string
          custom_message?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
        }
        Update: {
          coach_id?: string
          created_at?: string
          custom_message?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "registration_links_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      session_summaries: {
        Row: {
          achieved_goals: string[] | null
          additional_notes: string | null
          coach_id: string
          created_at: string
          future_goals: string[] | null
          id: string
          next_session_focus: string | null
          progress_rating: number | null
          session_id: string
          summary_text: string
          tools_used: Json | null
        }
        Insert: {
          achieved_goals?: string[] | null
          additional_notes?: string | null
          coach_id: string
          created_at?: string
          future_goals?: string[] | null
          id?: string
          next_session_focus?: string | null
          progress_rating?: number | null
          session_id: string
          summary_text: string
          tools_used?: Json | null
        }
        Update: {
          achieved_goals?: string[] | null
          additional_notes?: string | null
          coach_id?: string
          created_at?: string
          future_goals?: string[] | null
          id?: string
          next_session_focus?: string | null
          progress_rating?: number | null
          session_id?: string
          summary_text?: string
          tools_used?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "session_summaries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          coach_id: string
          created_at: string
          id: string
          location: string | null
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
          location?: string | null
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
          location?: string | null
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
      short_term_goals: {
        Row: {
          created_at: string
          goals: string[]
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goals?: string[]
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goals?: string[]
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      training_videos: {
        Row: {
          created_at: string
          id: string
          title: string
          unlock_date: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
          unlock_date?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          unlock_date?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          category: string | null
          coach_id: string | null
          created_at: string
          description: string | null
          id: string
          is_admin_video: boolean | null
          tags: string[] | null
          title: string
          url: string
        }
        Insert: {
          category?: string | null
          coach_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_admin_video?: boolean | null
          tags?: string[] | null
          title: string
          url: string
        }
        Update: {
          category?: string | null
          coach_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_admin_video?: boolean | null
          tags?: string[] | null
          title?: string
          url?: string
        }
        Relationships: []
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
      get_user_role: {
        Args: {
          user_id: string
        }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      notification_type:
        | "session_reminder"
        | "mental_prep_submission"
        | "player_registration"
      user_role: "coach" | "player"
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
