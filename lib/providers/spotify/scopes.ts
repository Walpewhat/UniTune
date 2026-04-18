export const SPOTIFY_SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-library-read",
  "user-library-modify",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-private",
  "playlist-modify-public",
  "streaming",
  "user-top-read",
  "user-read-recently-played",
  "user-follow-read",
] as const;

export const SPOTIFY_SCOPE_STRING = SPOTIFY_SCOPES.join(" ");
