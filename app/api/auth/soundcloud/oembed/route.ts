import { NextResponse, type NextRequest } from "next/server";
import { fetchOEmbed } from "@/lib/providers/soundcloud/api";

export async function GET(request: NextRequest) {
  const url = new URL(request.url).searchParams.get("url");
  if (!url || !/^https?:\/\/(www\.)?(m\.)?soundcloud\.com\//.test(url)) {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }
  try {
    const data = await fetchOEmbed(url);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "oembed_failed" },
      { status: 502 },
    );
  }
}
