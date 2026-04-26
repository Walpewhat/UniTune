import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrackList } from "@/components/track/TrackList";
import { getProviderAccessToken } from "@/lib/providers/connections";
import { spotifyApi } from "@/lib/providers/spotify/api";

// Always hit Spotify — this reflects the user's live saved library.
export const dynamic = "force-dynamic";

export default async function SpotifyLikedPage() {
  const t = await getTranslations("library");
  const token = await getProviderAccessToken("spotify");

  if (!token) {
    return (
      <section className="space-y-4">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              {t("emptySpotifyLiked.notConnected")}
            </p>
            <Button asChild>
              <Link href="/settings/connections">{t("connectSpotify")}</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  let tracks: Awaited<ReturnType<typeof spotifyApi.getUserLikedTracks>> = [];
  let loadError: string | null = null;
  try {
    tracks = await spotifyApi.getUserLikedTracks({ token, limit: 50 });
  } catch (err) {
    loadError = err instanceof Error ? err.message : String(err);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-4">
        <div
          className="grid h-20 w-20 place-items-center rounded-lg text-white shadow"
          style={{
            background:
              "linear-gradient(135deg, #1db954 0%, #17a34a 50%, #14532d 100%)",
          }}
        >
          <Heart className="size-8" fill="currentColor" />
        </div>
        <div>
          <p className="text-xs uppercase text-muted-foreground">
            {t("tabs.spotifyLiked")}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("spotifyLikedTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tracks.length} {tracks.length === 1 ? "song" : "songs"}
          </p>
        </div>
      </div>

      {loadError ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-6 text-sm">
            <p className="font-medium">{t("spotifyLikedError")}</p>
            <p className="mt-1 text-muted-foreground">{loadError}</p>
          </CardContent>
        </Card>
      ) : tracks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            {t("emptySpotifyLiked.empty")}
          </CardContent>
        </Card>
      ) : (
        <TrackList tracks={tracks} />
      )}
    </section>
  );
}
