import type { MusicProvider } from "@/lib/providers/types";
import { spotifyAuth } from "./auth";
import { spotifyApi } from "./api";
import { createSpotifyPlayer } from "./player";

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
  auth: spotifyAuth,
  api: spotifyApi,
  createPlayer: createSpotifyPlayer,
};
