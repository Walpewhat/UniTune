import { NextResponse } from "next/server";
import { z } from "zod";
import { requireServerUser } from "@/lib/supabase/server";

const UpdateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  description: z.string().max(240).nullable().optional(),
  is_public: z.boolean().optional(),
});

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const { supabase, user } = await requireServerUser();
    const { data: playlist, error } = await supabase
      .from("super_playlists")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (error || !playlist)
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    const { data: tracks } = await supabase
      .from("super_playlist_tracks")
      .select("*")
      .eq("playlist_id", id)
      .order("position", { ascending: true });
    return NextResponse.json({ playlist, tracks: tracks ?? [] });
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = UpdateSchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  try {
    const { supabase, user } = await requireServerUser();
    const { error } = await supabase
      .from("super_playlists")
      .update({ ...body.data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const { supabase, user } = await requireServerUser();
    const { error } = await supabase
      .from("super_playlists")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}
