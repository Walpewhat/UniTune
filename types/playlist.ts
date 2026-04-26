import type { ProviderId } from "./provider";

export interface UnifiedPlaylist {
  uid: string;
  provider: ProviderId | "unitune";
  providerId: string;
  name: string;
  description?: string;
  coverUrl?: string;
  ownerName?: string;
  trackCount?: number;
  isPublic?: boolean;
  permalinkUrl?: string;
}

export interface SuperPlaylist {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  coverPath: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  trackCount: number;
}
