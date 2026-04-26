import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieEntry = { name: string; value: string; options: CookieOptions };

// NOTE: intentionally NOT passing `<Database>` generic here.
// @supabase/supabase-js 2.103+ tightened its Database-type extends-check,
// and our hand-written types/supabase.ts (which is a placeholder until
// `npm run db:types` is run with Supabase CLI auth) doesn't satisfy it
// on every table. That makes `.insert()` / `.upsert()` / `.update()`
// payloads collapse to `never` and breaks the build. Dropping the
// generic gives us an untyped client at the call sites; we keep return
// typing where it matters via `.returns<T>()` / `.maybeSingle<T>()`
// (see app/(app)/library/*/page.tsx, app/(app)/playlist/[id]/page.tsx,
// lib/providers/connections.ts). Runtime safety is still enforced by
// zod schemas in the API routes.
export async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (entries: CookieEntry[]) => {
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
