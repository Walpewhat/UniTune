import { NextResponse } from "next/server";

export async function GET() {
  // SoundCloud closed its Developer Program to new apps in 2021.
  // Until a CLIENT_ID is configured, we do not attempt OAuth.
  // Users can still play tracks by pasting SoundCloud URLs (see /search).
  if (process.env.SOUNDCLOUD_CLIENT_ID) {
    return NextResponse.redirect(
      new URL("/settings/connections?error=soundcloud_oauth_tbd", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    );
  }
  return NextResponse.json(
    {
      error: "soundcloud_api_closed",
      message:
        "SoundCloud is not available via OAuth: their Developer Program is closed. Paste SoundCloud URLs in the Search page to play tracks.",
    },
    { status: 501 },
  );
}
