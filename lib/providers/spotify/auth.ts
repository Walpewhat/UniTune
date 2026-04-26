import "server-only";

import crypto from "node:crypto";
import type { ProviderAuth } from "@/lib/providers/types";
import type { TokenSet } from "@/types/provider";
import { SPOTIFY_SCOPE_STRING } from "./scopes";

const AUTHORIZE_URL = "https://accounts.spotify.com/authorize";
const TOKEN_URL = "https://accounts.spotify.com/api/token";

function base64UrlEncode(input: Buffer): string {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generatePkcePair() {
  const verifier = base64UrlEncode(crypto.randomBytes(48));
  const challenge = base64UrlEncode(
    crypto.createHash("sha256").update(verifier).digest(),
  );
  return { verifier, challenge };
}

export function generateState(): string {
  return base64UrlEncode(crypto.randomBytes(24));
}

function getClientId(): string {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId) {
    throw new Error("SPOTIFY_CLIENT_ID missing. See .env.example.");
  }
  return clientId;
}

export const spotifyAuth: ProviderAuth = {
  buildAuthUrl({ state, codeChallenge, redirectUri }) {
    const clientId = getClientId();
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: SPOTIFY_SCOPE_STRING,
      redirect_uri: redirectUri,
      state,
      show_dialog: "false",
    });
    if (codeChallenge) {
      params.set("code_challenge_method", "S256");
      params.set("code_challenge", codeChallenge);
    }
    return `${AUTHORIZE_URL}?${params.toString()}`;
  },

  async exchangeCode({ code, codeVerifier, redirectUri }) {
    const clientId = getClientId();
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
    });
    if (codeVerifier) body.set("code_verifier", codeVerifier);

    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(
        `Spotify token exchange failed: ${res.status} ${await res.text()}`,
      );
    }
    const data = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      token_type: string;
      scope: string;
    };
    const tokenSet: TokenSet = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
      scope: data.scope,
      tokenType: data.token_type,
    };

    // Fetch identity for display name
    let providerUserId: string | undefined;
    let displayName: string | undefined;
    try {
      const me = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${data.access_token}` },
        cache: "no-store",
      });
      if (me.ok) {
        const profile = (await me.json()) as {
          id: string;
          display_name?: string;
          email?: string;
        };
        providerUserId = profile.id;
        displayName = profile.display_name || profile.email;
      }
    } catch {
      /* profile fetch is best-effort */
    }
    return { ...tokenSet, providerUserId, displayName };
  },

  async refresh(refreshToken) {
    const clientId = getClientId();
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
    });
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Spotify token refresh failed: ${res.status}`);
    }
    const data = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      token_type: string;
      scope: string;
    };
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? refreshToken,
      expiresAt: Date.now() + data.expires_in * 1000,
      scope: data.scope,
      tokenType: data.token_type,
    };
  },
};
