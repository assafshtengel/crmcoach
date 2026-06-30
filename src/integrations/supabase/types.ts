export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      assigned_questionnaires: {
        Row: {
          assigned_at: string
          coach_id: string
          id: string
          player_id: string
          questionnaire_id: string | null
          status: string
          template_id: string | null
        }
        Insert: {
          assigned_at?: string
          coach_id: string
          id?: string
          player_id: string
          questionnaire_id?: string | null
          status?: string
          template_id?: string | null
        }
        Update: {
          assigned_at?: string
          coach_id?: string
          id?: string
          player_id?: string
          questionnaire_id?: string | null
          status?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_coach_id"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_questionnaire_id"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string
          booking_time: string
          branch: string | null
          created_at: string | null
          id: string
          phone_number: string
          sent_reminder: boolean
          session_at: string | null
          user_name: string
        }
        Insert: {
          booking_date: string
          booking_time: string
          branch?: string | null
          created_at?: string | null
          id?: string
          phone_number: string
          sent_reminder?: boolean
          session_at?: string | null
          user_name: string
        }
        Update: {
          booking_date?: string
          booking_time?: string
          branch?: string | null
          created_at?: string | null
          id?: string
          phone_number?: string
          sent_reminder?: boolean
          session_at?: string | null
          user_name?: string
        }
        Relationships: []
      }
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
      exercises: {
        Row: {
          age_range: string | null
          difficulty: string | null
          exercise_name: string | null
          id: string
          instructions: string | null
          mental_focus: string | null
          technical_notes: string | null
        }
        Insert: {
          age_range?: string | null
          difficulty?: string | null
          exercise_name?: string | null
          id?: string
          instructions?: string | null
          mental_focus?: string | null
          technical_notes?: string | null
        }
        Update: {
          age_range?: string | null
          difficulty?: string | null
          exercise_name?: string | null
          id?: string
          instructions?: string | null
          mental_focus?: string | null
          technical_notes?: string | null
        }
        Relationships: []
      }
      families: {
        Row: {
          created_at: string
          creator_email: string | null
          family_email: string
          family_name: string
          family_password: string
          id: string
          invite_token: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_email?: string | null
          family_email: string
          family_name: string
          family_password: string
          id?: string
          invite_token?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_email?: string | null
          family_email?: string
          family_name?: string
          family_password?: string
          id?: string
          invite_token?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          family_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          family_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          family_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_milestones: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          goal_id: string
          id: string
          is_completed: boolean | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          goal_id: string
          id?: string
          is_completed?: boolean | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          goal_id?: string
          id?: string
          is_completed?: boolean | null
          title?: string
        }
        Relationships: []
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
      group_messages: {
        Row: {
          coach_id: string
          content: string
          created_at: string | null
          id: string
        }
        Insert: {
          coach_id: string
          content: string
          created_at?: string | null
          id?: string
        }
        Update: {
          coach_id?: string
          content?: string
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      imbody: {
        Row: {
          bonus_given: boolean | null
          check_end_date: string | null
          check_start_date: string | null
          created_at: string | null
          current_credits: number
          current_credits_next_week: number
          default_credits: number
          id: string
          next_week_credits: number
          training_count: number | null
          updated_at: string | null
          username: string
        }
        Insert: {
          bonus_given?: boolean | null
          check_end_date?: string | null
          check_start_date?: string | null
          created_at?: string | null
          current_credits?: number
          current_credits_next_week?: number
          default_credits?: number
          id?: string
          next_week_credits?: number
          training_count?: number | null
          updated_at?: string | null
          username: string
        }
        Update: {
          bonus_given?: boolean | null
          check_end_date?: string | null
          check_start_date?: string | null
          created_at?: string | null
          current_credits?: number
          current_credits_next_week?: number
          default_credits?: number
          id?: string
          next_week_credits?: number
          training_count?: number | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      imbody_telaviv: {
        Row: {
          bonus_given: boolean | null
          check_end_date: string | null
          check_start_date: string | null
          created_at: string
          current_credits: number
          current_credits_next_week: number
          default_credits: number
          id: string
          next_week_credits: number
          phone_number: string
          training_count: number | null
          updated_at: string
          username: string
          weekly_credits: number
        }
        Insert: {
          bonus_given?: boolean | null
          check_end_date?: string | null
          check_start_date?: string | null
          created_at?: string
          current_credits?: number
          current_credits_next_week?: number
          default_credits?: number
          id?: string
          next_week_credits?: number
          phone_number: string
          training_count?: number | null
          updated_at?: string
          username: string
          weekly_credits?: number
        }
        Update: {
          bonus_given?: boolean | null
          check_end_date?: string | null
          check_start_date?: string | null
          created_at?: string
          current_credits?: number
          current_credits_next_week?: number
          default_credits?: number
          id?: string
          next_week_credits?: number
          phone_number?: string
          training_count?: number | null
          updated_at?: string
          username?: string
          weekly_credits?: number
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
          player_name: string | null
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
          player_name?: string | null
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
          player_name?: string | null
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
      message_recipients: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message_id: string
          player_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_id: string
          player_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_id?: string
          player_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_recipients_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "group_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id?: string
          sender_id?: string
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
          player_id: string | null
          timestamp: string
          type: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          player_id?: string | null
          timestamp?: string
          type: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          player_id?: string | null
          timestamp?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_player"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
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
      plan_feedback: {
        Row: {
          created_at: string
          feedback: string
          id: string
          plan_data: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback: string
          id?: string
          plan_data?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          feedback?: string
          id?: string
          plan_data?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      player_access_tokens: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          player_id: string | null
          token: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          player_id?: string | null
          token: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          player_id?: string | null
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_access_tokens_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
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
      player_game_evaluations: {
        Row: {
          body_language: number | null
          body_language_notes: string | null
          coach_feedback_notes: string | null
          coach_feedback_response: number | null
          coach_id: string | null
          confidence_presence: number | null
          confidence_presence_notes: string | null
          consistency: number | null
          consistency_notes: string | null
          created_at: string
          error_response: number | null
          error_response_notes: string | null
          focus_attention: number | null
          focus_attention_notes: string | null
          game_date: string
          general_notes: string | null
          id: string
          initiative_activity: number | null
          initiative_activity_notes: string | null
          mental_routines: number | null
          mental_routines_notes: string | null
          opponent: string
          overall_rating: number | null
          player_communication: number | null
          player_communication_notes: string | null
          player_id: string
          postgame_behavior: number | null
          postgame_behavior_notes: string | null
          pressure_response: number | null
          pressure_response_notes: string | null
          substitution_reaction: number | null
          substitution_reaction_notes: string | null
          updated_at: string
        }
        Insert: {
          body_language?: number | null
          body_language_notes?: string | null
          coach_feedback_notes?: string | null
          coach_feedback_response?: number | null
          coach_id?: string | null
          confidence_presence?: number | null
          confidence_presence_notes?: string | null
          consistency?: number | null
          consistency_notes?: string | null
          created_at?: string
          error_response?: number | null
          error_response_notes?: string | null
          focus_attention?: number | null
          focus_attention_notes?: string | null
          game_date: string
          general_notes?: string | null
          id?: string
          initiative_activity?: number | null
          initiative_activity_notes?: string | null
          mental_routines?: number | null
          mental_routines_notes?: string | null
          opponent: string
          overall_rating?: number | null
          player_communication?: number | null
          player_communication_notes?: string | null
          player_id: string
          postgame_behavior?: number | null
          postgame_behavior_notes?: string | null
          pressure_response?: number | null
          pressure_response_notes?: string | null
          substitution_reaction?: number | null
          substitution_reaction_notes?: string | null
          updated_at?: string
        }
        Update: {
          body_language?: number | null
          body_language_notes?: string | null
          coach_feedback_notes?: string | null
          coach_feedback_response?: number | null
          coach_id?: string | null
          confidence_presence?: number | null
          confidence_presence_notes?: string | null
          consistency?: number | null
          consistency_notes?: string | null
          created_at?: string
          error_response?: number | null
          error_response_notes?: string | null
          focus_attention?: number | null
          focus_attention_notes?: string | null
          game_date?: string
          general_notes?: string | null
          id?: string
          initiative_activity?: number | null
          initiative_activity_notes?: string | null
          mental_routines?: number | null
          mental_routines_notes?: string | null
          opponent?: string
          overall_rating?: number | null
          player_communication?: number | null
          player_communication_notes?: string | null
          player_id?: string
          postgame_behavior?: number | null
          postgame_behavior_notes?: string | null
          pressure_response?: number | null
          pressure_response_notes?: string | null
          substitution_reaction?: number | null
          substitution_reaction_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_game_evaluations_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_game_evaluations_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_goals: {
        Row: {
          created_at: string | null
          id: string
          long_term_goals: Json | null
          player_id: string
          short_term_goals: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          long_term_goals?: Json | null
          player_id: string
          short_term_goals?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          long_term_goals?: Json | null
          player_id?: string
          short_term_goals?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_goals_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_meetings: {
        Row: {
          coach_id: string | null
          created_at: string
          id: string
          is_completed: boolean
          location: string | null
          meeting_date: string
          meeting_time: string
          meeting_type: string
          notes: string | null
          player_id: string
          updated_at: string
        }
        Insert: {
          coach_id?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          location?: string | null
          meeting_date: string
          meeting_time: string
          meeting_type?: string
          notes?: string | null
          player_id: string
          updated_at?: string
        }
        Update: {
          coach_id?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          location?: string | null
          meeting_date?: string
          meeting_time?: string
          meeting_type?: string
          notes?: string | null
          player_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_meetings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_meetings_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_mental_states: {
        Row: {
          coach_id: string | null
          concerns_details: string | null
          created_at: string
          feeling_score: number
          has_concerns: boolean
          id: string
          improvement_focus: string | null
          mental_fatigue_level: number
          motivation_level: number
          player_id: string
        }
        Insert: {
          coach_id?: string | null
          concerns_details?: string | null
          created_at?: string
          feeling_score: number
          has_concerns?: boolean
          id?: string
          improvement_focus?: string | null
          mental_fatigue_level: number
          motivation_level: number
          player_id: string
        }
        Update: {
          coach_id?: string | null
          concerns_details?: string | null
          created_at?: string
          feeling_score?: number
          has_concerns?: boolean
          id?: string
          improvement_focus?: string | null
          mental_fatigue_level?: number
          motivation_level?: number
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_mental_states_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_mental_states_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_profiles: {
        Row: {
          age: number
          commitment_level: string
          created_at: string
          id: string
          username: string
        }
        Insert: {
          age: number
          commitment_level: string
          created_at?: string
          id: string
          username: string
        }
        Update: {
          age?: number
          commitment_level?: string
          created_at?: string
          id?: string
          username?: string
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
      pre_lecture_surveys: {
        Row: {
          additional_comments: string | null
          ai_subscription: string
          ai_tools_usage: string
          comfort_with_ai: string
          created_at: string
          email: string | null
          id: string
          llm_understanding: string
          name: string | null
          submitted_at: string | null
          which_ai_tool: string | null
        }
        Insert: {
          additional_comments?: string | null
          ai_subscription: string
          ai_tools_usage: string
          comfort_with_ai: string
          created_at?: string
          email?: string | null
          id?: string
          llm_understanding: string
          name?: string | null
          submitted_at?: string | null
          which_ai_tool?: string | null
        }
        Update: {
          additional_comments?: string | null
          ai_subscription?: string
          ai_tools_usage?: string
          comfort_with_ai?: string
          created_at?: string
          email?: string | null
          id?: string
          llm_understanding?: string
          name?: string | null
          submitted_at?: string | null
          which_ai_tool?: string | null
        }
        Relationships: []
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
      questionnaire_answers: {
        Row: {
          answers: Json
          assigned_questionnaire_id: string
          coach_id: string
          id: string
          player_id: string
          questionnaire_id: string
          status: string
          submitted_at: string | null
        }
        Insert: {
          answers: Json
          assigned_questionnaire_id: string
          coach_id: string
          id?: string
          player_id: string
          questionnaire_id: string
          status?: string
          submitted_at?: string | null
        }
        Update: {
          answers?: Json
          assigned_questionnaire_id?: string
          coach_id?: string
          id?: string
          player_id?: string
          questionnaire_id?: string
          status?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_coach_id_answers"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_player_id"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_questionnaire_id_answers"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_answers_assigned_questionnaire_id_fkey"
            columns: ["assigned_questionnaire_id"]
            isOneToOne: false
            referencedRelation: "assigned_questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_templates: {
        Row: {
          coach_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_system_template: boolean | null
          order: number | null
          questions: Json
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          coach_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_system_template?: boolean | null
          order?: number | null
          questions: Json
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          coach_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_system_template?: boolean | null
          order?: number | null
          questions?: Json
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      questionnaires: {
        Row: {
          coach_id: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          player_id: string | null
          questions: Json | null
          template_id: string | null
          title: string | null
          type: string | null
        }
        Insert: {
          coach_id?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          player_id?: string | null
          questions?: Json | null
          template_id?: string | null
          title?: string | null
          type?: string | null
        }
        Update: {
          coach_id?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          player_id?: string | null
          questions?: Json | null
          template_id?: string | null
          title?: string | null
          type?: string | null
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
          audio_url: string | null
          coach_id: string
          created_at: string
          future_goals: string[] | null
          id: string
          is_deleted: boolean | null
          next_session_focus: string | null
          player_id: string | null
          progress_rating: number | null
          session_id: string
          summary_text: string
          tools_used: Json | null
        }
        Insert: {
          achieved_goals?: string[] | null
          additional_notes?: string | null
          audio_url?: string | null
          coach_id: string
          created_at?: string
          future_goals?: string[] | null
          id?: string
          is_deleted?: boolean | null
          next_session_focus?: string | null
          player_id?: string | null
          progress_rating?: number | null
          session_id: string
          summary_text: string
          tools_used?: Json | null
        }
        Update: {
          achieved_goals?: string[] | null
          additional_notes?: string | null
          audio_url?: string | null
          coach_id?: string
          created_at?: string
          future_goals?: string[] | null
          id?: string
          is_deleted?: boolean | null
          next_session_focus?: string | null
          player_id?: string | null
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
          has_started: boolean | null
          id: string
          location: string | null
          meeting_type: string
          notes: string | null
          player_id: string
          reminder_sent: boolean | null
          session_date: string
          session_time: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          has_started?: boolean | null
          id?: string
          location?: string | null
          meeting_type?: string
          notes?: string | null
          player_id: string
          reminder_sent?: boolean | null
          session_date: string
          session_time: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          has_started?: boolean | null
          id?: string
          location?: string | null
          meeting_type?: string
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
      shopping_history: {
        Row: {
          completed_at: string
          id: string
          installments_count: number | null
          list_data: Json
          purchase_amount: number | null
          purchased_items: number
          store_name: string | null
          total_items: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          installments_count?: number | null
          list_data: Json
          purchase_amount?: number | null
          purchased_items?: number
          store_name?: string | null
          total_items?: number
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          installments_count?: number | null
          list_data?: Json
          purchase_amount?: number | null
          purchased_items?: number
          store_name?: string | null
          total_items?: number
          user_id?: string
        }
        Relationships: []
      }
      shopping_items: {
        Row: {
          added_at: string
          category: string
          company: string | null
          id: string
          image_url: string | null
          name: string
          not_found: boolean
          notes: string | null
          purchased: boolean
          purchased_at: string | null
          quantity: number
          shopping_list_id: string
        }
        Insert: {
          added_at?: string
          category: string
          company?: string | null
          id?: string
          image_url?: string | null
          name: string
          not_found?: boolean
          notes?: string | null
          purchased?: boolean
          purchased_at?: string | null
          quantity?: number
          shopping_list_id: string
        }
        Update: {
          added_at?: string
          category?: string
          company?: string | null
          id?: string
          image_url?: string | null
          name?: string
          not_found?: boolean
          notes?: string | null
          purchased?: boolean
          purchased_at?: string | null
          quantity?: number
          shopping_list_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_items_shopping_list_id_fkey"
            columns: ["shopping_list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
      training_summaries: {
        Row: {
          achievements: string
          coach_id: string | null
          created_at: string | null
          effort_level: number
          fatigue_level: number
          id: string
          improvement_areas: string
          notes: string | null
          performance_rating: number
          player_id: string
          techniques_practiced: string
        }
        Insert: {
          achievements: string
          coach_id?: string | null
          created_at?: string | null
          effort_level: number
          fatigue_level: number
          id?: string
          improvement_areas: string
          notes?: string | null
          performance_rating: number
          player_id: string
          techniques_practiced: string
        }
        Update: {
          achievements?: string
          coach_id?: string | null
          created_at?: string | null
          effort_level?: number
          fatigue_level?: number
          id?: string
          improvement_areas?: string
          notes?: string | null
          performance_rating?: number
          player_id?: string
          techniques_practiced?: string
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
      user_families: {
        Row: {
          family_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          family_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          family_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_families_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      user_family_links: {
        Row: {
          created_at: string | null
          family_id: string
          id: string
          user_email: string
        }
        Insert: {
          created_at?: string | null
          family_id: string
          id?: string
          user_email: string
        }
        Update: {
          created_at?: string | null
          family_id?: string
          id?: string
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_family_links_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      user_journal_entries: {
        Row: {
          action: string
          created_at: string
          date: string
          id: string
          thoughts: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          date: string
          id?: string
          thoughts: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          date?: string
          id?: string
          thoughts?: string
          user_id?: string
        }
        Relationships: []
      }
      user_plans: {
        Row: {
          analysis_data: Json | null
          created_at: string
          plan_data: Json | null
          updated_at: string
          user_id: string
          user_input: string | null
        }
        Insert: {
          analysis_data?: Json | null
          created_at?: string
          plan_data?: Json | null
          updated_at?: string
          user_id: string
          user_input?: string | null
        }
        Update: {
          analysis_data?: Json | null
          created_at?: string
          plan_data?: Json | null
          updated_at?: string
          user_id?: string
          user_input?: string | null
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
      user_stats: {
        Row: {
          completed_actions: number
          created_at: string
          current_streak: number
          last_completed_date: string | null
          longest_streak: number
          success_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_actions?: number
          created_at?: string
          current_streak?: number
          last_completed_date?: string | null
          longest_streak?: number
          success_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_actions?: number
          created_at?: string
          current_streak?: number
          last_completed_date?: string | null
          longest_streak?: number
          success_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
        }
        Insert: {
          id: string
        }
        Update: {
          id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          assigned_player_ids: string[] | null
          auto_sequence_order: number | null
          category: string | null
          coach_id: string | null
          created_at: string
          days_after_registration: number | null
          description: string | null
          id: string
          is_admin_video: boolean | null
          is_auto_scheduled: boolean | null
          tags: string[] | null
          title: string
          url: string
        }
        Insert: {
          assigned_player_ids?: string[] | null
          auto_sequence_order?: number | null
          category?: string | null
          coach_id?: string | null
          created_at?: string
          days_after_registration?: number | null
          description?: string | null
          id?: string
          is_admin_video?: boolean | null
          is_auto_scheduled?: boolean | null
          tags?: string[] | null
          title: string
          url: string
        }
        Update: {
          assigned_player_ids?: string[] | null
          auto_sequence_order?: number | null
          category?: string | null
          coach_id?: string | null
          created_at?: string
          days_after_registration?: number | null
          description?: string | null
          id?: string
          is_admin_video?: boolean | null
          is_auto_scheduled?: boolean | null
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
      check_and_transition_sessions: { Args: never; Returns: undefined }
      cron_job_exists: {
        Args: { job_name: string }
        Returns: {
          command: string
          jobid: number
          schedule: string
        }[]
      }
      decrement_player_video_count: {
        Args: { player_id_param: string }
        Returns: undefined
      }
      get_coach_statistics: {
        Args: { coach_id: string }
        Returns: {
          activeplayerscount: number
          successfulreminders: number
          totalsessions: number
        }[]
      }
      get_monthly_reminders_count: {
        Args: { coach_id: string }
        Returns: {
          name: string
          reminders: number
        }[]
      }
      get_monthly_sessions_count: {
        Args: { coach_id: string }
        Returns: {
          name: string
          sessions: number
        }[]
      }
      get_or_create_user_family: {
        Args: { user_email: string }
        Returns: string
      }
      get_player_session_distribution: {
        Args: { coach_id: string }
        Returns: {
          name: string
          value: number
        }[]
      }
      get_user_family: {
        Args: { user_id_param: string }
        Returns: {
          family_id: string
          family_name: string
          invite_token: string
          role: string
        }[]
      }
      get_user_family_id: { Args: { user_id_param: string }; Returns: string }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      increment_player_video_count: {
        Args: { player_id_param: string }
        Returns: undefined
      }
      process_auto_video_assignments: { Args: never; Returns: undefined }
      reset_all_credits: { Args: never; Returns: number }
      schedule_session_transition_checks: { Args: never; Returns: string }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      notification_type: [
        "session_reminder",
        "mental_prep_submission",
        "player_registration",
      ],
      user_role: ["coach", "player"],
    },
  },
} as const
