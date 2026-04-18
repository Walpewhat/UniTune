import "server-only";

import { getServerSupabase } from "@/lib/supabase/server";
import { decryptToken, encryptToken } from "@/lib/crypto/token-cipher";
import { getProvider } from "@/lib/providers/registry";
import type { ProviderId, TokenSet } from "@/types/provider";

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

export async function listConnectionsForCurrentUser() {
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
  return data ?? [];
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

  const providerImpl = getProvider(provider);
  if (!providerImpl.auth) {
    return decryptToken(row.access_token_encrypted);
  }

  const refreshed = await providerImpl.auth.refresh(
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
