"use client";

import { create } from "zustand";
import type { UnifiedTrack } from "@/types/track";
import { DEFAULT_VOLUME } from "@/lib/constants";

export interface PlayerSnapshot {
  currentTrack: UnifiedTrack | null;
  isPlaying: boolean;
  isBuffering: boolean;
  positionMs: number;
  durationMs: number;
  volume: number;
  muted: boolean;
  error: string | null;
}

interface PlayerStore extends PlayerSnapshot {
  applySnapshot(patch: Partial<PlayerSnapshot>): void;
  reset(): void;
}

const initial: PlayerSnapshot = {
  currentTrack: null,
  isPlaying: false,
  isBuffering: false,
  positionMs: 0,
  durationMs: 0,
  volume: DEFAULT_VOLUME,
  muted: false,
  error: null,
};

export const usePlayerStore = create<PlayerStore>((set) => ({
  ...initial,
  applySnapshot: (patch) => set((prev) => ({ ...prev, ...patch })),
  reset: () => set({ ...initial }),
}));
