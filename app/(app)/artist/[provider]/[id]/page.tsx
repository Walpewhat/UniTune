import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Music2 } from "lucide-react";
import { getProvider, isProviderId } from "@/lib/providers/registry";
import { getProviderAccessToken } from "@/lib/providers/connections";
import { TrackList } from "@/components/track/TrackList";
import { ProviderBadge } from "@/components/track/ProviderBadge";
import { PlayAllButton } from "@/components/playlist/PlayAllButton";

interface PageProps {
  params: Promise<{ provider: string; id: string }>;
}

export default async function ArtistPage({ params }: PageProps) {
  const { provider, id } = await params;
  if (!isProviderId(provider)) notFound();

  const token = await getProviderAccessToken(provider);
  if (!token) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Connect {provider} to view this artist.
        </p>
      </div>
    );
  }

  const p = getProvider(provider);
  const { artist, topTracks, albums } = await p.api.getArtist({ id, token });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-6 py-6">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <div className="relative h-48 w-48 overflow-hidden rounded-full bg-muted shadow-xl">
          {artist.imageUrl ? (
            <Image
              src={artist.imageUrl}
              alt=""
              fill
              sizes="192px"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground">
              <Music2 className="size-16" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <ProviderBadge provider={artist.provider} showLabel />
          <h1 className="truncate text-5xl font-bold tracking-tight">
            {artist.name}
          </h1>
          {typeof artist.followers === "number" && (
            <p className="text-xs text-muted-foreground">
              {new Intl.NumberFormat().format(artist.followers)} followers
            </p>
          )}
          <PlayAllButton tracks={topTracks} />
        </div>
      </header>

      {topTracks.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">Top tracks</h2>
          <TrackList tracks={topTracks.slice(0, 10)} showAlbum={false} />
        </section>
      )}

      {albums.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">Discography</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {albums.map((a) => (
              <Link
                key={a.uid}
                href={`/album/${a.provider}/${a.providerId}`}
                className="group space-y-2"
              >
                <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                  {a.coverUrl ? (
                    <Image
                      src={a.coverUrl}
                      alt=""
                      fill
                      sizes="240px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-muted-foreground">
                      <Music2 className="size-8" />
                    </div>
                  )}
                </div>
                <p className="truncate text-sm font-medium group-hover:underline">
                  {a.name}
                </p>
                {a.releaseDate && (
                  <p className="truncate text-xs text-muted-foreground">
                    {a.releaseDate.slice(0, 4)}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
