import { NextResponse } from "next/server";
import { z } from "zod";
import { requireServerUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

const TrackSchema = z.object({
  provider: z.enum(["spotify", "soundcloud"]),
  provider_track_id: z.string().min(1),
  title: z.string().min(1),
  artists: z.array(z.string()).default([]),
  album: z.string().nullable().optional(),
  cover_url: z.string().url().nullable().optional(),
  duration_ms: z.number().int().nonnegative().default(0),
});

export async function GET() {
  try {
    const { supabase, user } = await requireServerUser();
    const { data, error } = await supabase
      .from("liked_tracks")
      .select("*")
      .eq("user_id", user.id)
      .order("liked_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    return NextResponse.json({ tracks: data });
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  const body = TrackSchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  try {
    const { supabase, user } = await requireServerUser();
    const { error } = await supabase.from("liked_tracks").upsert(
      {
        user_id: user.id,
        provider: body.data.provider,
        provider_track_id: body.data.provider_track_id,
        title: body.data.title,
        artists: body.data.artists,
        album: body.data.album ?? null,
        cover_url: body.data.cover_url ?? null,
        duration_ms: body.data.duration_ms,
        liked_at: new Date().toISOString(),
      },
      { onConflict: "user_id,provider,provider_track_id" },
    );
    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider");
  const trackId = searchParams.get("provider_track_id");
  if (!provider || !trackId)
    return NextResponse.json({ error: "invalid_params" }, { status: 400 });
  try {
    const { supabase, user } = await requireServerUser();
    const { error } = await supabase
      .from("liked_tracks")
      .delete()
      .eq("user_id", user.id)
      .eq("provider", provider)
      .eq("provider_track_id", trackId);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
