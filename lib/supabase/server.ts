import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

export async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (entries) => {
          try {
            for (const { name, value, options } of entries) {
              cookieStore.set(name, value, options);
            }
          } catch {
            /* called from RSC where cookies are read-only */
          }
        },
      },
    },
  );
}

export async function getServerUser() {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function requireServerUser() {
  const { supabase, user } = await getServerUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return { supabase, user };
}

/**
 * Service-role client for privileged server operations (bypasses RLS).
 * Use sparingly; most work should go through the user's anon session.
 */
export async function getServiceSupabase() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
