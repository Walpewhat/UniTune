/**
 * Generated types placeholder.
 *
 * Regenerate with:
 *   npm run db:types
 * (requires SUPABASE_PROJECT_ID and an authenticated Supabase CLI)
 *
 * This file is intentionally permissive until you run codegen, so TypeScript
 * compiles against a fresh checkout.
 *
 * NOTE: Every table must include `Relationships: []` (or the actual FK list).
 * `@supabase/supabase-js` v2.103+ narrows `Insert` / `Update` / `Row` to
 * `never` if this field is missing, which breaks every `.insert()` /
 * `.upsert()` / `.select()` call site with opaque errors.
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
    };
    // `{ [_ in never]: never }` is the "empty record" idiom used by
    // Supabase codegen. Unlike `Record<string, never>`, it satisfies
    // `Record<string, GenericView>` / `Record<string, GenericFunction>`
    // extends-checks (because a table with zero keys trivially matches
    // any value type). Using `Record<string, never>` here makes
    // `Database["public"]` fail to extend `GenericSchema`, which makes
    // `.insert()` / `.upsert()` payloads collapse to `never`.
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
