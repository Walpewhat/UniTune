/**
 * Generated types placeholder.
 *
 * Regenerate with:
 *   npm run db:types
 * (requires SUPABASE_PROJECT_ID and an authenticated Supabase CLI)
 *
 * This file is intentionally permissive until you run codegen, so TypeScript
 * compiles against a fresh checkout.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          locale: string | null;
          theme: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          locale?: string | null;
          theme?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      provider_connections: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          provider_user_id: string | null;
          provider_display_name: string | null;
          access_token_encrypted: string;
          refresh_token_encrypted: string | null;
          expires_at: string | null;
          scopes: string[] | null;
          connected_at: string;
          meta: Json | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["provider_connections"]["Row"],
          "id" | "connected_at"
        > & {
          id?: string;
          connected_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["provider_connections"]["Insert"]
        >;
      };
      super_playlists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          cover_path: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["super_playlists"]["Row"],
          "id" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["super_playlists"]["Insert"]
        >;
      };
      super_playlist_tracks: {
        Row: {
          id: string;
          playlist_id: string;
          provider: string;
          provider_track_id: string;
          title: string;
          artists: string[];
          album: string | null;
          cover_url: string | null;
          duration_ms: number;
          position: number;
          added_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["super_playlist_tracks"]["Row"],
          "id" | "added_at"
        > & {
          id?: string;
          added_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["super_playlist_tracks"]["Insert"]
        >;
      };
      liked_tracks: {
        Row: {
          user_id: string;
          provider: string;
          provider_track_id: string;
          title: string;
          artists: string[];
          album: string | null;
          cover_url: string | null;
          duration_ms: number;
          liked_at: string;
        };
        Insert: Database["public"]["Tables"]["liked_tracks"]["Row"];
        Update: Partial<Database["public"]["Tables"]["liked_tracks"]["Row"]>;
      };
      play_history: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          provider_track_id: string;
          title: string;
          artists: string[];
          duration_ms: number;
          played_at: string;
          completion_pct: number;
        };
        Insert: Omit<
          Database["public"]["Tables"]["play_history"]["Row"],
          "id" | "played_at"
        > & {
          id?: string;
          played_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["play_history"]["Insert"]
        >;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
