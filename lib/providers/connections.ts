import "server-only";

import { getServerSupabase } from "@/lib/supabase/server";
import { decryptToken, encryptToken } from "@/lib/crypto/token-cipher";
import { spotifyAuth } from "@/lib/providers/spotify/auth";
import type { ProviderAuth } from "@/lib/providers/types";
import type { ProviderId, TokenSet } from "@/types/provider";

// Server-only auth registry. Kept separate from the client-facing
// `registry.ts` so "server-only" imports don't leak into client bundles.
const authRegistry: Record<ProviderId, ProviderAuth | null> = {
  spotify: spotifyAuth,
  soundcloud: null,
};

export interface ProviderConnection {
  userId: string;
  provider: ProviderId;
  providerUserId: string | null;
  providerDisplayName: string | null;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number | null;
  scopes: string[];
}

const REFRESH_THRESHOLD_MS = 60_000;

export interface ProviderConnectionSummary {
  provider: ProviderId;
  provider_user_id: string | null;
  provider_display_name: string | null;
  expires_at: string | null;
  scopes: string[] | null;
}

export async function listConnectionsForCurrentUser(): Promise<
  ProviderConnectionSummary[]
> {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("provider_connections")
    .select(
      "provider, provider_user_id, provider_display_name, expires_at, scopes",
    )
    .eq("user_id", user.id);
  // Supabase's `.select(string)` overload returns `never[]` because it can't
  // statically parse the column list at compile time. Runtime shape matches
  // the explicit interface above — the cast just restores what TS should have
  // inferred.
  return (data ?? []) as ProviderConnectionSummary[];
}

async function getConnectionRow(userId: string, provider: ProviderId) {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("provider_connections")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", provider)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Returns a decrypted, non-expired access token (refreshing when needed). */
export async function getProviderAccessToken(
  provider: ProviderId,
): Promise<string | null> {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const row = await getConnectionRow(user.id, provider);
  if (!row) return null;

  const expiresAt = row.expires_at ? new Date(row.expires_at).getTime() : null;
  const needsRefresh =
    expiresAt !== null && expiresAt - Date.now() < REFRESH_THRESHOLD_MS;

  if (!needsRefresh) {
    return decryptToken(row.access_token_encrypted);
  }

  if (!row.refresh_token_encrypted) {
    // No refresh token (e.g., unsupported scope); return whatever we have.
    return decryptToken(row.access_token_encrypted);
  }

  const authImpl = authRegistry[provider];
  if (!authImpl) {
    return decryptToken(row.access_token_encrypted);
  }

  const refreshed = await authImpl.refresh(
    decryptToken(row.refresh_token_encrypted),
  );
  await saveConnection({
    userId: user.id,
    provider,
    tokenSet: refreshed,
    providerUserId: row.provider_user_id,
    providerDisplayName: row.provider_display_name,
  });
  return refreshed.accessToken;
}

export async function saveConnection(params: {
  userId: string;
  provider: ProviderId;
  tokenSet: TokenSet;
  providerUserId?: string | null;
  providerDisplayName?: string | null;
}) {
  const supabase = await getServerSupabase();
  const { error } = await supabase.from("provider_connections").upsert(
    {
      user_id: params.userId,
      provider: params.provider,
      provider_user_id: params.providerUserId ?? null,
      provider_display_name: params.providerDisplayName ?? null,
      access_token_encrypted: encryptToken(params.tokenSet.accessToken),
      refresh_token_encrypted: params.tokenSet.refreshToken
        ? encryptToken(params.tokenSet.refreshToken)
        : null,
      expires_at: new Date(params.tokenSet.expiresAt).toISOString(),
      scopes: params.tokenSet.scope?.split(" ").filter(Boolean) ?? null,
      connected_at: new Date().toISOString(),
    },
    { onConflict: "user_id,provider" },
  );
  if (error) throw error;
}

export async function deleteConnection(provider: ProviderId) {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("provider_connections")
    .delete()
    .eq("user_id", user.id)
    .eq("provider", provider);
}
