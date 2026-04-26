import { makeUid } from "@/lib/utils/unified-id";
import type { UnifiedTrack } from "@/types/track";

export interface SoundcloudOEmbed {
  version: number;
  type: string;
  provider_name: string;
  provider_url: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  html: string;
  author_name?: string;
  author_url?: string;
}

/** Create a best-effort UnifiedTrack from an oEmbed response + original URL. */
export function mapSoundcloudOEmbedToTrack(
  embed: SoundcloudOEmbed,
  sourceUrl: string,
): UnifiedTrack {
  const providerId = sourceUrl;
  const artists = embed.author_name
    ? [{ id: embed.author_url ?? "", name: embed.author_name }]
    : [];
  return {
    uid: makeUid("soundcloud", providerId),
    provider: "soundcloud",
    providerId,
    title: embed.title ?? "SoundCloud track",
    artists,
    durationMs: 0,
    playable: true,
    permalinkUrl: sourceUrl,
    coverUrl: embed.thumbnail_url,
  };
}
