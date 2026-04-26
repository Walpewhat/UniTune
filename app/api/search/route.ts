import { NextResponse } from "next/server";
import { z } from "zod";
import { listProviders } from "@/lib/providers/registry";
import { getProviderAccessToken } from "@/lib/providers/connections";
import { emptySearchResult, type SearchResult } from "@/lib/providers/types";
import type { ProviderId } from "@/types/provider";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const QuerySchema = z.object({
  q: z.string().min(1).max(200),
  providers: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(",").filter(Boolean) : undefined)),
  types: z
    .string()
    .optional()
    .transform((v) =>
      v ? v.split(",").filter(Boolean) : ["track", "album", "artist", "playlist"],
    ),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

interface ProviderResult {
  provider: ProviderId;
  ok: boolean;
  error?: string;
  result: SearchResult;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = QuerySchema.safeParse({
    q: searchParams.get("q") ?? "",
    providers: searchParams.get("providers") ?? undefined,
    types: searchParams.get("types") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_query", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { q, limit } = parsed.data;
  const requestedProviders = parsed.data.providers;
  const types = parsed.data.types as (
    | "track"
    | "album"
    | "artist"
    | "playlist"
  )[];

  const providers = listProviders().filter(
    (p) =>
      p.capabilities.search &&
      (!requestedProviders || requestedProviders.includes(p.id)),
  );

  const settled = await Promise.allSettled<ProviderResult>(
    providers.map(async (p) => {
      const token = await getProviderAccessToken(p.id);
      if (!token) {
        return {
          provider: p.id,
          ok: false,
          error: "not_connected",
          result: emptySearchResult(),
        };
      }
      try {
        const result = await p.api.search({ q, types, token, limit });
        return { provider: p.id, ok: true, result };
      } catch (err) {
        return {
          provider: p.id,
          ok: false,
          error: err instanceof Error ? err.message : String(err),
          result: emptySearchResult(),
        };
      }
    }),
  );

  const results: ProviderResult[] = settled.map((s, i) => {
    if (s.status === "fulfilled") return s.value;
    return {
      provider: providers[i]!.id,
      ok: false,
      error: s.reason instanceof Error ? s.reason.message : String(s.reason),
      result: emptySearchResult(),
    };
  });

  return NextResponse.json(
    {
      q,
      providers: results.map((r) => ({
        provider: r.provider,
        ok: r.ok,
        error: r.error,
      })),
      tracks: results.flatMap((r) => r.result.tracks),
      albums: results.flatMap((r) => r.result.albums),
      artists: results.flatMap((r) => r.result.artists),
      playlists: results.flatMap((r) => r.result.playlists),
    },
    { headers: { "Cache-Control": "private, max-age=30" } },
  );
}
