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

export function listProviders(): MusicProvider[] {
  return Object.values(registry);
}

export function isProviderId(x: string): x is ProviderId {
  return x === "spotify" || x === "soundcloud";
}
