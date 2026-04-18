import { notFound } from "next/navigation";
import Image from "next/image";
import { Disc3 } from "lucide-react";
import { getProvider, isProviderId } from "@/lib/providers/registry";
import { getProviderAccessToken } from "@/lib/providers/connections";
import { TrackList } from "@/components/track/TrackList";
import { ProviderBadge } from "@/components/track/ProviderBadge";
import { PlayAllButton } from "@/components/playlist/PlayAllButton";
import { formatDuration, joinArtists } from "@/lib/utils/format";

interface PageProps {
  params: Promise<{ provider: string; id: string }>;
}

export default async function AlbumPage({ params }: PageProps) {
  const { provider, id } = await params;
  if (!isProviderId(provider)) notFound();

  const token = await getProviderAccessToken(provider);
  if (!token) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Connect {provider} to view this album.
        </p>
      </div>
    );
  }

  const p = getProvider(provider);
  const { album, tracks } = await p.api.getAlbum({ id, token });

  const totalMs = tracks.reduce((acc, t) => acc + (t.durationMs || 0), 0);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-6">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <div className="relative h-48 w-48 overflow-hidden rounded-lg bg-muted shadow-xl">
          {album.coverUrl ? (
            <Image
              src={album.coverUrl}
              alt=""
              fill
              sizes="192px"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground">
              <Disc3 className="size-16" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <ProviderBadge provider={album.provider} showLabel />
            <p className="text-xs uppercase text-muted-foreground">
              {album.albumType ?? "Album"}
            </p>
          </div>
          <h1 className="truncate text-4xl font-bold tracking-tight">
            {album.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {joinArtists(album.artists.map((a) => a.name))}
          </p>
          <p className="text-xs text-muted-foreground">
            {tracks.length} tracks · {formatDuration(totalMs)}
          </p>
          <PlayAllButton tracks={tracks} />
        </div>
      </header>

      <TrackList tracks={tracks} showCover={false} showAlbum={false} />
    </div>
  );
}
