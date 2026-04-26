"use client";

import type { UnifiedTrack } from "@/types/track";
import {
  mapSoundcloudOEmbedToTrack,
  type SoundcloudOEmbed,
} from "./mapper";

/** Client-side helper: fetch oEmbed via our proxy and map to UnifiedTrack. */
export async function trackFromSoundcloudOEmbed(
  url: string,
): Promise<UnifiedTrack> {
  const proxy = new URL("/api/auth/soundcloud/oembed", window.location.origin);
  proxy.searchParams.set("url", url);
  const res = await fetch(proxy.toString());
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || `oEmbed failed (${res.status})`);
  }
  const embed = (await res.json()) as SoundcloudOEmbed;
  return mapSoundcloudOEmbedToTrack(embed, url);
}
