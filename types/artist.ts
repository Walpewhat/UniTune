import type { ProviderId } from "./provider";

export interface UnifiedArtist {
  uid: string;
  provider: ProviderId;
  providerId: string;
  name: string;
  imageUrl?: string;
  followers?: number;
  genres?: string[];
  permalinkUrl?: string;
}
