import { NextResponse } from "next/server";
import { listProviders } from "@/lib/providers/registry";
import { getProviderAccessToken } from "@/lib/providers/connections";
import type { UnifiedTrack } from "@/types/track";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface HomeSection {
  provider: string;
  title: string;
  tracks: UnifiedTrack[];
}

export async function GET() {
  const providers = listProviders();
  const sections: HomeSection[] = [];

  await Promise.allSettled(
    providers.map(async (p) => {
      const token = await getProviderAccessToken(p.id);
      if (!token) return;
      try {
        const [recent, liked] = await Promise.allSettled([
          p.api.getRecentlyPlayed({ token, limit: 10 }),
          p.api.getUserLikedTracks({ token, limit: 10 }),
        ]);
        if (recent.status === "fulfilled" && recent.value.length > 0) {
          sections.push({
            provider: p.id,
            title: `Recently played · ${p.displayName}`,
            tracks: recent.value,
          });
        }
        if (liked.status === "fulfilled" && liked.value.length > 0) {
          sections.push({
            provider: p.id,
            title: `Liked · ${p.displayName}`,
            tracks: liked.value,
          });
        }
      } catch {
        /* swallow per-provider errors */
      }
    }),
  );

  return NextResponse.json(
    { sections },
    { headers: { "Cache-Control": "private, max-age=30" } },
  );
}
