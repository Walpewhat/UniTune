import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { saveConnection } from "@/lib/providers/connections";
import { spotifyAuth } from "@/lib/providers/spotify/auth";

const STATE_COOKIE = "spotify_oauth_state";
const VERIFIER_COOKIE = "spotify_pkce_verifier";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const app = process.env.NEXT_PUBLIC_APP_URL!;
  const settings = `${app}/settings/connections`;

  if (error) {
    return NextResponse.redirect(
      `${settings}?error=${encodeURIComponent(error)}`,
    );
  }
  if (!code || !state) {
    return NextResponse.redirect(`${settings}?error=missing_params`);
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get(STATE_COOKIE)?.value;
  const verifier = cookieStore.get(VERIFIER_COOKIE)?.value;

  cookieStore.delete(STATE_COOKIE);
  cookieStore.delete(VERIFIER_COOKIE);

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${settings}?error=invalid_state`);
  }
  if (!verifier) {
    return NextResponse.redirect(`${settings}?error=missing_verifier`);
  }

  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${app}/login?next=/settings/connections`);
  }

  try {
    const tokenSet = await spotifyAuth.exchangeCode({
      code,
      codeVerifier: verifier,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI!,
    });
    await saveConnection({
      userId: user.id,
      provider: "spotify",
      tokenSet,
      providerUserId: tokenSet.providerUserId,
      providerDisplayName: tokenSet.displayName,
    });
    return NextResponse.redirect(`${settings}?connected=spotify`);
  } catch (err) {
    console.error("[spotify callback]", err);
    return NextResponse.redirect(`${settings}?error=exchange_failed`);
  }
}
