export type ProviderId = "spotify" | "soundcloud";

export const ALL_PROVIDERS: ProviderId[] = ["spotify", "soundcloud"];

export interface ProviderCapabilities {
  search: boolean;
  library: boolean;
  playlists: boolean;
  playback: "full" | "preview" | "embed" | "none";
  requiresPremium: boolean;
}

export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope?: string;
  tokenType?: string;
}
