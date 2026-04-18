import { NextResponse } from "next/server";
import { requireServerUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; trackId: string }> },
) {
  const { id, trackId } = await params;
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
    const { error } = await supabase
      .from("super_playlist_tracks")
      .delete()
      .eq("id", trackId)
      .eq("playlist_id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
