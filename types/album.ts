import type { ProviderId } from "./provider";
import type { UnifiedArtistRef } from "./track";

export interface UnifiedAlbum {
  uid: string;
  provider: ProviderId;
  providerId: string;
  name: string;
  artists: UnifiedArtistRef[];
  coverUrl?: string;
  releaseDate?: string;
  totalTracks?: number;
  albumType?: "album" | "single" | "compilation" | "ep";
  permalinkUrl?: string;
}
