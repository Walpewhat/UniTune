import { notFound } from "next/navigation";
import { ListMusic } from "lucide-react";
import Image from "next/image";
import { getServerSupabase } from "@/lib/supabase/server";
import { TrackList } from "@/components/track/TrackList";
import { PlaylistHeader } from "@/components/playlist/PlaylistHeader";
import { makeUid } from "@/lib/utils/unified-id";
import type { UnifiedTrack } from "@/types/track";
import type { ProviderId } from "@/types/provider";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface TrackRow {
  id: string;
  provider: string;
  provider_track_id: string;
  title: string;
  artists: string[] | null;
  album: string | null;
  cover_url: string | null;
  duration_ms: number | null;
  position: number;
}

function rowToTrack(r: TrackRow): UnifiedTrack {
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

export default async function SuperPlaylistPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await getServerSupabase();

  const { data: playlist } = await supabase
    .from("super_playlists")
    .select("id, name, description, cover_path, is_public, created_at, updated_at")
    .eq("id", id)
    .maybeSingle<{
      id: string;
      name: string;
      description: string | null;
      cover_path: string | null;
      is_public: boolean;
      created_at: string;
      updated_at: string;
    }>();

  if (!playlist) notFound();

  const { data: trackRows } = await supabase
    .from("super_playlist_tracks")
    .select(
      "id, provider, provider_track_id, title, artists, album, cover_url, duration_ms, position",
    )
    .eq("playlist_id", id)
    .order("position", { ascending: true })
    .returns<TrackRow[]>();

  const tracks = (trackRows ?? []).map(rowToTrack);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-6">
      <PlaylistHeader
        playlistId={playlist.id}
        name={playlist.name}
        description={playlist.description}
        trackCount={tracks.length}
        tracks={tracks}
        cover={
          <div className="relative grid h-48 w-48 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl">
            {playlist.cover_path ? (
              <Image
                src={playlist.cover_path}
                alt=""
                fill
                sizes="192px"
                className="object-cover"
              />
            ) : (
              <ListMusic className="size-16" />
            )}
          </div>
        }
      />

      <TrackList tracks={tracks} showAlbum={false} />
    </div>
  );
}
