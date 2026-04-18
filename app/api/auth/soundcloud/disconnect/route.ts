import { NextResponse } from "next/server";
import { deleteConnection } from "@/lib/providers/connections";
import { requireServerUser } from "@/lib/supabase/server";

export async function POST() {
  try {
    await requireServerUser();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  await deleteConnection("soundcloud");
  return NextResponse.json({ ok: true });
}
