export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          exam_track: string;
          rating_elo: number;
          total_matches: number;
          wins: number;
          losses: number;
          draws: number;
          best_streak: number;
          total_solved: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          exam_track?: string;
          rating_elo?: number;
          total_matches?: number;
          wins?: number;
          losses?: number;
          draws?: number;
          best_streak?: number;
          total_solved?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          exam_track?: string;
          rating_elo?: number;
          total_matches?: number;
          wins?: number;
          losses?: number;
          draws?: number;
          best_streak?: number;
          total_solved?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          text: string;
          options: Json;
          correct_index: number;
          category: string;
          difficulty: string;
          time_limit: number;
          exam_track: string;
          exam_tag: string | null;
          explanation: string | null;
          is_verified: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          text: string;
          options: Json;
          correct_index: number;
          category: string;
          difficulty?: string;
          time_limit?: number;
          exam_track?: string;
          exam_tag?: string | null;
          explanation?: string | null;
          is_verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          text?: string;
          options?: Json;
          correct_index?: number;
          category?: string;
          difficulty?: string;
          time_limit?: number;
          exam_track?: string;
          exam_tag?: string | null;
          explanation?: string | null;
          is_verified?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      rooms: {
        Row: {
          id: string;
          room_code: string;
          status: string;
          exam_track: string;
          difficulty: string;
          total_rounds: number;
          current_round: number;
          host_id: string;
          host_name: string;
          host_score: number;
          host_streak: number;
          host_ready: boolean;
          guest_id: string | null;
          guest_name: string | null;
          guest_score: number;
          guest_streak: number;
          guest_ready: boolean;
          current_question: Json | null;
          round_started_at: string | null;
          winner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_code: string;
          status?: string;
          exam_track?: string;
          difficulty?: string;
          total_rounds?: number;
          current_round?: number;
          host_id: string;
          host_name?: string;
          host_score?: number;
          host_streak?: number;
          host_ready?: boolean;
          guest_id?: string | null;
          guest_name?: string | null;
          guest_score?: number;
          guest_streak?: number;
          guest_ready?: boolean;
          current_question?: Json | null;
          round_started_at?: string | null;
          winner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_code?: string;
          status?: string;
          exam_track?: string;
          difficulty?: string;
          total_rounds?: number;
          current_round?: number;
          host_id?: string;
          host_name?: string;
          host_score?: number;
          host_streak?: number;
          host_ready?: boolean;
          guest_id?: string | null;
          guest_name?: string | null;
          guest_score?: number;
          guest_streak?: number;
          guest_ready?: boolean;
          current_question?: Json | null;
          round_started_at?: string | null;
          winner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      room_answers: {
        Row: {
          id: string;
          room_id: string;
          round_number: number;
          player_id: string;
          player_name: string;
          selected_option: number;
          is_correct: boolean;
          time_taken_ms: number;
          points_awarded: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          round_number: number;
          player_id: string;
          player_name: string;
          selected_option: number;
          is_correct: boolean;
          time_taken_ms?: number;
          points_awarded?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          round_number?: number;
          player_id?: string;
          player_name?: string;
          selected_option?: number;
          is_correct?: boolean;
          time_taken_ms?: number;
          points_awarded?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      solo_blitz_runs: {
        Row: {
          id: string;
          user_id: string | null;
          player_name: string;
          score: number;
          best_streak: number;
          total_solved: number;
          accuracy: number;
          exam_track: string;
          difficulty: string;
          duration_seconds: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          player_name: string;
          score?: number;
          best_streak?: number;
          total_solved?: number;
          accuracy?: number;
          exam_track?: string;
          difficulty?: string;
          duration_seconds?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          player_name?: string;
          score?: number;
          best_streak?: number;
          total_solved?: number;
          accuracy?: number;
          exam_track?: string;
          difficulty?: string;
          duration_seconds?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      record_match_outcome: {
        Args: {
          p_user_id: string;
          p_won: boolean;
          p_is_draw: boolean;
          p_solved_delta: number;
          p_streak_best: number;
        };
        Returns: void;
      };
      get_random_questions: {
        Args: {
          p_track: string;
          p_difficulty: string;
          p_limit?: number;
        };
        Returns: Database['public']['Tables']['questions']['Row'][];
      };
    };
    Enums: {
      exam_track_enum: 'all' | 'gate' | 'cat' | 'gre' | 'ese' | 'placement' | 'banking';
      difficulty_enum: 'easy' | 'medium' | 'hard';
      room_status_enum: 'lobby' | 'countdown' | 'playing' | 'round_result' | 'game_over' | 'abandoned';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
