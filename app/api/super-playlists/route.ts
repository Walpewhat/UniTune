import { NextResponse } from "next/server";
import { z } from "zod";
import { requireServerUser } from "@/lib/supabase/server";

const CreateSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(240).nullable().optional(),
});

export const runtime = "nodejs";

export async function GET() {
  try {
    const { supabase, user } = await requireServerUser();
    const { data, error } = await supabase
      .from("super_playlists")
      .select("id, name, description, cover_path, is_public, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ playlists: data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unauthorized";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}

export async function POST(request: Request) {
  const body = CreateSchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  try {
    const { supabase, user } = await requireServerUser();
    const { data, error } = await supabase
      .from("super_playlists")
      .insert({
        user_id: user.id,
        name: body.data.name,
        description: body.data.description ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;
    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
