import type { ProviderApi } from "@/lib/providers/types";
import { emptySearchResult } from "@/lib/providers/types";
import type { UnifiedTrack } from "@/types/track";
import { mapSoundcloudOEmbedToTrack, type SoundcloudOEmbed } from "./mapper";

const OEMBED_URL = "https://soundcloud.com/oembed";

/**
 * Fetch oEmbed metadata for any public SoundCloud URL.
 * Does NOT require an API key.
 */
export async function fetchOEmbed(url: string): Promise<SoundcloudOEmbed> {
  const params = new URLSearchParams({ url, format: "json" });
  const res = await fetch(`${OEMBED_URL}?${params}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`SoundCloud oEmbed ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as SoundcloudOEmbed;
}

export async function trackFromSoundcloudUrl(
  url: string,
): Promise<UnifiedTrack> {
  const embed = await fetchOEmbed(url);
  return mapSoundcloudOEmbedToTrack(embed, url);
}

const notImplemented = (what: string) => {
  throw new Error(
    `SoundCloud ${what} requires an API key (program closed). ` +
      `Set SOUNDCLOUD_CLIENT_ID in .env to enable.`,
  );
};

export const soundcloudApi: ProviderApi = {
  async search() {
    // Without a legacy SOUNDCLOUD_CLIENT_ID, search is not possible.
    return emptySearchResult();
  },
  async getTrack({ id }) {
    return trackFromSoundcloudUrl(id);
  },
  async getAlbum() {
    return notImplemented("getAlbum");
  },
  async getArtist() {
    return notImplemented("getArtist");
  },
  async getPlaylist() {
    return notImplemented("getPlaylist");
  },
  async getUserPlaylists() {
    return [];
  },
  async getUserLikedTracks() {
    return [];
  },
  async getRecentlyPlayed() {
    return [];
  },
};
