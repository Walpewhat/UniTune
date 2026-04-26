import type { ProviderId, ProviderCapabilities, TokenSet } from "@/types/provider";
import type { UnifiedTrack } from "@/types/track";
import type { UnifiedAlbum } from "@/types/album";
import type { UnifiedArtist } from "@/types/artist";
import type { UnifiedPlaylist } from "@/types/playlist";

export type SearchType = "track" | "album" | "artist" | "playlist";

export interface SearchResult {
  tracks: UnifiedTrack[];
  albums: UnifiedAlbum[];
  artists: UnifiedArtist[];
  playlists: UnifiedPlaylist[];
}

export const emptySearchResult = (): SearchResult => ({
  tracks: [],
  albums: [],
  artists: [],
  playlists: [],
});

export interface ProviderAuth {
  /** Build the provider's authorize URL for the OAuth flow. */
  buildAuthUrl(params: {
    state: string;
    codeChallenge?: string;
    redirectUri: string;
  }): string;

  /** Exchange an authorization code for a token set (server-side). */
  exchangeCode(params: {
    code: string;
    codeVerifier?: string;
    redirectUri: string;
  }): Promise<TokenSet & { providerUserId?: string; displayName?: string }>;

  /** Refresh an access token (server-side). */
  refresh(refreshToken: string): Promise<TokenSet>;
}

export interface ProviderApi {
  search(params: {
    q: string;
    types: SearchType[];
    token: string;
    limit?: number;
  }): Promise<SearchResult>;

  getTrack(params: { id: string; token: string }): Promise<UnifiedTrack>;
  getAlbum(params: {
    id: string;
    token: string;
  }): Promise<{ album: UnifiedAlbum; tracks: UnifiedTrack[] }>;
  getArtist(params: {
    id: string;
    token: string;
  }): Promise<{
    artist: UnifiedArtist;
    topTracks: UnifiedTrack[];
    albums: UnifiedAlbum[];
  }>;
  getPlaylist(params: {
    id: string;
    token: string;
  }): Promise<{ playlist: UnifiedPlaylist; tracks: UnifiedTrack[] }>;

  getUserPlaylists(params: {
    token: string;
    limit?: number;
  }): Promise<UnifiedPlaylist[]>;

  getUserLikedTracks(params: {
    token: string;
    limit?: number;
  }): Promise<UnifiedTrack[]>;

  getRecentlyPlayed(params: {
    token: string;
    limit?: number;
  }): Promise<UnifiedTrack[]>;
}

export interface ProviderPlayerEvents {
  ready: { deviceId?: string };
  progress: { positionMs: number; durationMs: number };
  ended: undefined;
  error: { message: string };
  stateChange: { isPlaying: boolean };
}

export type ProviderPlayerEventName = keyof ProviderPlayerEvents;
export type Unsubscribe = () => void;

export interface ProviderPlayer {
  readonly provider: ProviderId;
  init(): Promise<void>;
  load(track: UnifiedTrack): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  seek(ms: number): Promise<void>;
  setVolume(v: number): Promise<void>;
  getPosition(): Promise<number>;
  on<E extends ProviderPlayerEventName>(
    event: E,
    cb: (data: ProviderPlayerEvents[E]) => void,
  ): Unsubscribe;
  destroy(): Promise<void>;
}

export interface PlayerFactoryOptions {
  getAccessToken: () => Promise<string>;
  onRequirePremium?: () => void;
}

export interface MusicProvider {
  readonly id: ProviderId;
  readonly displayName: string;
  readonly brandColor: string;
  readonly capabilities: ProviderCapabilities;
  readonly auth: ProviderAuth | null;
  readonly api: ProviderApi;
  /**
   * Whether the provider is visible in the UI. Set to `false` to hide
   * connection cards, search filter chips, paste cards, etc. The provider
   * can still be referenced by id in stored connections and API routes —
   * this only controls UI surfaces that enumerate providers.
   */
  readonly enabled: boolean;
  createPlayer(opts: PlayerFactoryOptions): ProviderPlayer;
}
