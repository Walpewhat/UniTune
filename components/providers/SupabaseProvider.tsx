"use client";

import * as React from "react";
import type { SupabaseClient, Session, User } from "@supabase/supabase-js";
import { getBrowserSupabase } from "@/lib/supabase/client";

interface SupabaseContextValue {
  supabase: SupabaseClient;
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const SupabaseContext = React.createContext<SupabaseContextValue | null>(null);

export function SupabaseProvider({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession: Session | null;
}) {
  const [supabase] = React.useState(() => getBrowserSupabase());
  const [session, setSession] = React.useState<Session | null>(initialSession);
  const [loading, setLoading] = React.useState(initialSession === null);

  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const value = React.useMemo<SupabaseContextValue>(
    () => ({ supabase, session, user: session?.user ?? null, loading }),
    [supabase, session, loading],
  );

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const ctx = React.useContext(SupabaseContext);
  if (!ctx) throw new Error("useSupabase must be used inside SupabaseProvider");
  return ctx;
}
