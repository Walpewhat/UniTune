import { NextResponse } from "next/server";
import { z } from "zod";
import { requireServerUser } from "@/lib/supabase/server";

const TrackSchema = z.object({
  provider: z.enum(["spotify", "soundcloud"]),
  provider_track_id: z.string().min(1),
  title: z.string().min(1),
  artists: z.array(z.string()).default([]),
  album: z.string().nullable().optional(),
  cover_url: z.string().url().nullable().optional(),
  duration_ms: z.number().int().nonnegative().default(0),
});

const AddSchema = z.object({
  tracks: z.array(TrackSchema).min(1),
});

const ReorderSchema = z.object({
  order: z.array(z.string().uuid()),
});

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = AddSchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  try {
    const { supabase, user } = await requireServerUser();
    const { data: playlist } = await supabase
      .from("super_playlists")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!playlist)
      return NextResponse.json({ error: "not_found" }, { status: 404 });

    const { data: last } = await supabase
      .from("super_playlist_tracks")
      .select("position")
      .eq("playlist_id", id)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle<{ position: number }>();
    const nextPosStart = (last?.position ?? -1) + 1;

    const rows = body.data.tracks.map((t, i) => ({
      playlist_id: id,
      provider: t.provider,
      provider_track_id: t.provider_track_id,
      title: t.title,
      artists: t.artists,
      album: t.album ?? null,
      cover_url: t.cover_url ?? null,
      duration_ms: t.duration_ms,
      position: nextPosStart + i,
    }));
    const { error } = await supabase.from("super_playlist_tracks").insert(rows);
    if (error) throw error;

    await supabase
      .from("super_playlists")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({ added: rows.length }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = ReorderSchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  try {
    const { supabase, user } = await requireServerUser();
    const { data: playlist } = await supabase
      .from("super_playlists")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!playlist)
      return NextResponse.json({ error: "not_found" }, { status: 404 });

    const updates = body.data.order.map((trackId, position) =>
      supabase
        .from("super_playlist_tracks")
        .update({ position })
        .eq("id", trackId)
        .eq("playlist_id", id),
    );
    const results = await Promise.all(updates);
    const first = results.find((r) => r.error);
    if (first?.error) throw first.error;

    await supabase
      .from("super_playlists")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
