import { makeUid } from "@/lib/utils/unified-id";
import type { UnifiedTrack } from "@/types/track";
import type { UnifiedAlbum } from "@/types/album";
import type { UnifiedArtist } from "@/types/artist";
import type { UnifiedPlaylist } from "@/types/playlist";

interface SpotifyImage {
  url: string;
  width?: number | null;
  height?: number | null;
}

interface SpotifyArtistObject {
  id: string;
  name: string;
  images?: SpotifyImage[];
  followers?: { total?: number };
  genres?: string[];
  external_urls?: { spotify?: string };
}

interface SpotifyAlbumObject {
  id: string;
  name: string;
  images?: SpotifyImage[];
  artists: SpotifyArtistObject[];
  release_date?: string;
  total_tracks?: number;
  album_type?: string;
  external_urls?: { spotify?: string };
}

interface SpotifyTrackObject {
  id: string;
  name: string;
  duration_ms: number;
  explicit?: boolean;
  preview_url?: string | null;
  is_playable?: boolean;
  external_ids?: { isrc?: string };
  external_urls?: { spotify?: string };
  album?: SpotifyAlbumObject;
  artists: SpotifyArtistObject[];
}

interface SpotifyPlaylistObject {
  id: string;
  name: string;
  description?: string;
  public?: boolean;
  images?: SpotifyImage[];
  owner?: { display_name?: string };
  tracks?: { total?: number };
  external_urls?: { spotify?: string };
}

function pickImage(images?: SpotifyImage[]): string | undefined {
  if (!images || images.length === 0) return undefined;
  return (
    images.find((i) => (i.width ?? 0) >= 300)?.url ?? images[0]?.url ?? undefined
  );
}

export function mapSpotifyTrack(t: SpotifyTrackObject): UnifiedTrack {
  return {
    uid: makeUid("spotify", t.id),
    provider: "spotify",
    providerId: t.id,
    title: t.name,
    artists: t.artists.map((a) => ({ id: a.id, name: a.name })),
    album: t.album
      ? {
          id: t.album.id,
          name: t.album.name,
          coverUrl: pickImage(t.album.images),
        }
      : undefined,
    durationMs: t.duration_ms,
    previewUrl: t.preview_url ?? undefined,
    explicit: t.explicit ?? false,
    isrc: t.external_ids?.isrc,
    playable: t.is_playable !== false,
    permalinkUrl: t.external_urls?.spotify,
    coverUrl: pickImage(t.album?.images),
  };
}

export function mapSpotifyAlbum(a: SpotifyAlbumObject): UnifiedAlbum {
  return {
    uid: makeUid("spotify", a.id),
    provider: "spotify",
    providerId: a.id,
    name: a.name,
    artists: a.artists.map((x) => ({ id: x.id, name: x.name })),
    coverUrl: pickImage(a.images),
    releaseDate: a.release_date,
    totalTracks: a.total_tracks,
    albumType: (a.album_type as UnifiedAlbum["albumType"]) ?? undefined,
    permalinkUrl: a.external_urls?.spotify,
  };
}

export function mapSpotifyArtist(x: SpotifyArtistObject): UnifiedArtist {
  return {
    uid: makeUid("spotify", x.id),
    provider: "spotify",
    providerId: x.id,
    name: x.name,
    imageUrl: pickImage(x.images),
    followers: x.followers?.total,
    genres: x.genres,
    permalinkUrl: x.external_urls?.spotify,
  };
}

export function mapSpotifyPlaylist(p: SpotifyPlaylistObject): UnifiedPlaylist {
  return {
    uid: makeUid("spotify", p.id),
    provider: "spotify",
    providerId: p.id,
    name: p.name,
    description: p.description,
    coverUrl: pickImage(p.images),
    ownerName: p.owner?.display_name,
    trackCount: p.tracks?.total,
    isPublic: p.public ?? undefined,
    permalinkUrl: p.external_urls?.spotify,
  };
}
