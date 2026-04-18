import type { ProviderId } from "./provider";

export interface UnifiedArtistRef {
  id: string;
  name: string;
}

export interface UnifiedAlbumRef {
  id: string;
  name: string;
  coverUrl?: string;
}

export interface UnifiedTrack {
  uid: string;
  provider: ProviderId;
  providerId: string;
  title: string;
  artists: UnifiedArtistRef[];
  album?: UnifiedAlbumRef;
  durationMs: number;
  previewUrl?: string;
  explicit?: boolean;
  isrc?: string;
  playable: boolean;
  permalinkUrl?: string;
  coverUrl?: string;
}
