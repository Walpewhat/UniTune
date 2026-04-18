import { getTranslations } from "next-intl/server";
import { Heart } from "lucide-react";
import { getServerSupabase } from "@/lib/supabase/server";
import { TrackList } from "@/components/track/TrackList";
import { Card, CardContent } from "@/components/ui/card";
import type { UnifiedTrack } from "@/types/track";
import { makeUid } from "@/lib/utils/unified-id";
import type { ProviderId } from "@/types/provider";

interface LikedRow {
  provider: string;
  provider_track_id: string;
  title: string;
  artists: string[] | null;
  album: string | null;
  cover_url: string | null;
  duration_ms: number | null;
}

function rowToTrack(r: LikedRow): UnifiedTrack {
  return {
    uid: makeUid(r.provider as ProviderId, r.provider_track_id),
    provider: r.provider as ProviderId,
    providerId: r.provider_track_id,
    title: r.title,
    artists: (r.artists ?? []).map((name) => ({ id: name, name })),
    album: r.album ? { id: r.album, name: r.album } : undefined,
    coverUrl: r.cover_url ?? undefined,
    durationMs: r.duration_ms ?? 0,
    playable: true,
  };
}

export default async function LikedPage() {
  const t = await getTranslations("library");
  const tNav = await getTranslations("nav");
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from("liked_tracks")
    .select(
      "provider, provider_track_id, title, artists, album, cover_url, duration_ms, liked_at",
    )
    .order("liked_at", { ascending: false })
    .limit(500);

  const tracks = (data ?? []).map(rowToTrack);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="grid h-20 w-20 place-items-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white shadow">
          <Heart className="size-8" />
        </div>
        <div>
          <p className="text-xs uppercase text-muted-foreground">
            {t("tabs.liked")}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">{tNav("liked")}</h1>
          <p className="text-sm text-muted-foreground">
            {tracks.length} {tracks.length === 1 ? "song" : "songs"}
          </p>
        </div>
      </div>

      {tracks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            {t("emptyLiked")}
          </CardContent>
        </Card>
      ) : (
        <TrackList tracks={tracks} />
      )}
    </section>
  );
}
