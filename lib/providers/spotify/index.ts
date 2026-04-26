import type { MusicProvider } from "@/lib/providers/types";
import { spotifyApi } from "./api";
import { createSpotifyPlayer } from "./player";

// NOTE: `auth` is intentionally null on the client-facing provider shape.
// Server code that needs Spotify auth (token refresh, OAuth exchange) imports
// `spotifyAuth` directly from `./auth` so "server-only" never leaks into
// the client bundle via this barrel.
export const spotifyProvider: MusicProvider = {
  id: "spotify",
  displayName: "Spotify",
  brandColor: "#1db954",
  capabilities: {
    search: true,
    library: true,
    playlists: true,
    playback: "full",
    requiresPremium: true,
  },
  auth: null,
  api: spotifyApi,
  enabled: true,
  createPlayer: createSpotifyPlayer,
};
