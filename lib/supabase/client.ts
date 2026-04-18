"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

let cached: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getBrowserSupabase() {
  if (cached) return cached;
  cached = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return cached;
}
