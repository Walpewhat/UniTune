import type { ProviderId } from "@/types/provider";
import type { MusicProvider } from "./types";
import { spotifyProvider } from "./spotify";
import { soundcloudProvider } from "./soundcloud";

const registry: Record<ProviderId, MusicProvider> = {
  spotify: spotifyProvider,
  soundcloud: soundcloudProvider,
};

export function getProvider(id: ProviderId): MusicProvider {
  return registry[id];
}

/**
 * Visible providers for UI surfaces: connection cards, search filter chips,
 * home-page empty-state chips, sidebar chooser. Hides providers with
 * `enabled: false` (e.g. SoundCloud while the API access is closed).
 * Use `listAllProviders()` when you need every registered provider
 * regardless of UI visibility.
 */
export function listProviders(): MusicProvider[] {
  return Object.values(registry).filter((p) => p.enabled);
}

/** All providers regardless of `enabled` — use for schema/admin code only. */
export function listAllProviders(): MusicProvider[] {
  return Object.values(registry);
}

export function isProviderId(x: string): x is ProviderId {
  return x === "spotify" || x === "soundcloud";
}
