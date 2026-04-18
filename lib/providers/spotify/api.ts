import type {
  ProviderApi,
  SearchResult,
  SearchType,
} from "@/lib/providers/types";
import { emptySearchResult } from "@/lib/providers/types";
import type { UnifiedTrack } from "@/types/track";
import {
  mapSpotifyAlbum,
  mapSpotifyArtist,
  mapSpotifyPlaylist,
  mapSpotifyTrack,
} from "./mapper";

const BASE = "https://api.spotify.com/v1";

async function spotifyFetch(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string> | undefined),
    },
    cache: "no-store",
  });
  return res;
}

async function spotifyJson<T>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<T> {
  const res = await spotifyFetch(path, token, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Spotify ${path} → ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export const spotifyApi: ProviderApi = {
  async search({ q, types, token, limit = 20 }) {
    if (!q.trim()) return emptySearchResult();
    const spotifyTypes = types
      .map(mapTypeToSpotify)
      .filter((t): t is string => Boolean(t));
    if (spotifyTypes.length === 0) return emptySearchResult();
    const params = new URLSearchParams({
      q,
      type: spotifyTypes.join(","),
      limit: String(limit),
    });
    const data = await spotifyJson<{
      tracks?: { items: Parameters<typeof mapSpotifyTrack>[0][] };
      albums?: { items: Parameters<typeof mapSpotifyAlbum>[0][] };
      artists?: { items: Parameters<typeof mapSpotifyArtist>[0][] };
      playlists?: { items: Parameters<typeof mapSpotifyPlaylist>[0][] };
    }>(`/search?${params}`, token);
    const result: SearchResult = emptySearchResult();
    result.tracks = (data.tracks?.items ?? []).map(mapSpotifyTrack);
    result.albums = (data.albums?.items ?? []).map(mapSpotifyAlbum);
    result.artists = (data.artists?.items ?? []).map(mapSpotifyArtist);
    result.playlists = (data.playlists?.items ?? [])
      .filter(Boolean)
      .map(mapSpotifyPlaylist);
    return result;
  },

  async getTrack({ id, token }) {
    const data = await spotifyJson<Parameters<typeof mapSpotifyTrack>[0]>(
      `/tracks/${id}`,
      token,
    );
    return mapSpotifyTrack(data);
  },

  async getAlbum({ id, token }) {
    const album = await spotifyJson<
      Parameters<typeof mapSpotifyAlbum>[0] & {
        tracks?: { items: Parameters<typeof mapSpotifyTrack>[0][] };
      }
    >(`/albums/${id}`, token);
    const mappedAlbum = mapSpotifyAlbum(album);
    const tracks = (album.tracks?.items ?? []).map((t) =>
      mapSpotifyTrack({ ...t, album }),
    );
    return { album: mappedAlbum, tracks };
  },

  async getArtist({ id, token }) {
    const [artist, topTracks, albums] = await Promise.all([
      spotifyJson<Parameters<typeof mapSpotifyArtist>[0]>(
        `/artists/${id}`,
        token,
      ),
      spotifyJson<{ tracks: Parameters<typeof mapSpotifyTrack>[0][] }>(
        `/artists/${id}/top-tracks?market=from_token`,
        token,
      ),
      spotifyJson<{ items: Parameters<typeof mapSpotifyAlbum>[0][] }>(
        `/artists/${id}/albums?include_groups=album,single&limit=20&market=from_token`,
        token,
      ),
    ]);
    return {
      artist: mapSpotifyArtist(artist),
      topTracks: topTracks.tracks.map(mapSpotifyTrack),
      albums: albums.items.map(mapSpotifyAlbum),
    };
  },

  async getPlaylist({ id, token }) {
    const data = await spotifyJson<
      Parameters<typeof mapSpotifyPlaylist>[0] & {
        tracks: {
          items: { track: Parameters<typeof mapSpotifyTrack>[0] | null }[];
        };
      }
    >(`/playlists/${id}`, token);
    const playlist = mapSpotifyPlaylist(data);
    const tracks = (data.tracks.items ?? [])
      .map((item) => item.track)
      .filter((t): t is Parameters<typeof mapSpotifyTrack>[0] => Boolean(t))
      .map(mapSpotifyTrack);
    return { playlist, tracks };
  },

  async getUserPlaylists({ token, limit = 50 }) {
    const data = await spotifyJson<{
      items: Parameters<typeof mapSpotifyPlaylist>[0][];
    }>(`/me/playlists?limit=${limit}`, token);
    return (data.items ?? []).filter(Boolean).map(mapSpotifyPlaylist);
  },

  async getUserLikedTracks({ token, limit = 50 }) {
    const data = await spotifyJson<{
      items: { track: Parameters<typeof mapSpotifyTrack>[0] }[];
    }>(`/me/tracks?limit=${limit}`, token);
    return data.items.map((i) => mapSpotifyTrack(i.track));
  },

  async getRecentlyPlayed({ token, limit = 20 }) {
    const data = await spotifyJson<{
      items: { track: Parameters<typeof mapSpotifyTrack>[0] }[];
    }>(`/me/player/recently-played?limit=${limit}`, token);
    return data.items.map((i) => mapSpotifyTrack(i.track));
  },
};

function mapTypeToSpotify(t: SearchType): string | null {
  switch (t) {
    case "track":
      return "track";
    case "album":
      return "album";
    case "artist":
      return "artist";
    case "playlist":
      return "playlist";
    default:
      return null;
  }
}

export async function getSpotifyMe(token: string) {
  return spotifyJson<{
    id: string;
    display_name?: string;
    email?: string;
    product?: "free" | "premium" | "open";
    images?: { url: string }[];
  }>("/me", token);
}

export async function playOnDevice(
  token: string,
  deviceId: string,
  trackUri: string,
  positionMs = 0,
) {
  const res = await spotifyFetch(`/me/player/play?device_id=${deviceId}`, token, {
    method: "PUT",
    body: JSON.stringify({ uris: [trackUri], position_ms: positionMs }),
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`playOnDevice ${res.status}: ${await res.text()}`);
  }
}

export async function transferPlayback(token: string, deviceId: string) {
  await spotifyFetch("/me/player", token, {
    method: "PUT",
    body: JSON.stringify({ device_ids: [deviceId], play: false }),
  });
}

export function trackUri(providerTrackId: string): string {
  return `spotify:track:${providerTrackId}`;
}

export const isUnifiedTrackPlayable = (t: UnifiedTrack) => t.playable;
