import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import {
  generatePkcePair,
  generateState,
  spotifyAuth,
} from "@/lib/providers/spotify/auth";

const STATE_COOKIE = "spotify_oauth_state";
const VERIFIER_COOKIE = "spotify_pkce_verifier";
const COOKIE_OPTS = {
  httpOnly: true as const,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 10 * 60,
};

export async function GET(_request: NextRequest) {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?next=/settings/connections`,
    );
  }

  const redirectUri = process.env.SPOTIFY_REDIRECT_URI!;
  const state = generateState();
  const { verifier, challenge } = generatePkcePair();

  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, COOKIE_OPTS);
  cookieStore.set(VERIFIER_COOKIE, verifier, COOKIE_OPTS);

  const url = spotifyAuth.buildAuthUrl({
    state,
    codeChallenge: challenge,
    redirectUri,
  });
  return NextResponse.redirect(url);
}
