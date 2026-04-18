import { NextResponse, type NextRequest } from "next/server";
import { getProviderAccessToken } from "@/lib/providers/connections";
import { isProviderId } from "@/lib/providers/registry";
import { requireServerUser } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ provider: string }> },
) {
  try {
    await requireServerUser();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { provider } = await ctx.params;
  if (!isProviderId(provider)) {
    return NextResponse.json({ error: "unknown_provider" }, { status: 400 });
  }
  const token = await getProviderAccessToken(provider);
  if (!token) {
    return NextResponse.json({ error: "not_connected" }, { status: 404 });
  }
  return NextResponse.json({ accessToken: token });
}
