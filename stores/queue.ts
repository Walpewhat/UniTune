"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UnifiedTrack } from "@/types/track";

export type RepeatMode = "off" | "all" | "one";

export interface QueueState {
  items: UnifiedTrack[];
  history: UnifiedTrack[];
  currentIndex: number;
  shuffle: boolean;
  repeat: RepeatMode;
  isQueuePanelOpen: boolean;
}

interface QueueActions {
  setQueue(items: UnifiedTrack[], startIndex?: number): void;
  enqueue(track: UnifiedTrack): void;
  enqueueNext(track: UnifiedTrack): void;
  removeAt(index: number): void;
  clear(): void;
  moveItem(from: number, to: number): void;
  setCurrentIndex(index: number): void;
  nextIndex(): number | null;
  previousIndex(): number | null;
  toggleShuffle(): void;
  cycleRepeat(): void;
  openPanel(): void;
  closePanel(): void;
  toggleQueuePanel(): void;
}

type QueueStore = QueueState & QueueActions;

export const useQueueStore = create<QueueStore>()(
  persist(
    (set, get) => ({
      items: [],
      history: [],
      currentIndex: -1,
      shuffle: false,
      repeat: "off",
      isQueuePanelOpen: false,

      setQueue(items, startIndex = 0) {
        set({ items, currentIndex: items.length ? startIndex : -1 });
      },

      enqueue(track) {
        set((s) => ({ items: [...s.items, track] }));
      },

      enqueueNext(track) {
        set((s) => {
          const next = [...s.items];
          const insertAt = Math.max(0, s.currentIndex + 1);
          next.splice(insertAt, 0, track);
          return { items: next };
        });
      },

      removeAt(index) {
        set((s) => {
          const items = s.items.filter((_, i) => i !== index);
          let currentIndex = s.currentIndex;
          if (index < currentIndex) currentIndex -= 1;
          if (index === currentIndex) currentIndex = Math.min(currentIndex, items.length - 1);
          return { items, currentIndex };
        });
      },

      clear() {
        set({ items: [], currentIndex: -1 });
      },

      moveItem(from, to) {
        set((s) => {
          const items = [...s.items];
          const [moved] = items.splice(from, 1);
          if (!moved) return s;
          items.splice(to, 0, moved);
          let currentIndex = s.currentIndex;
          if (from === currentIndex) currentIndex = to;
          else if (from < currentIndex && to >= currentIndex) currentIndex -= 1;
          else if (from > currentIndex && to <= currentIndex) currentIndex += 1;
          return { items, currentIndex };
        });
      },

      setCurrentIndex(index) {
        set({ currentIndex: index });
      },

      nextIndex() {
        const { items, currentIndex, repeat, shuffle } = get();
        if (items.length === 0) return null;
        if (repeat === "one") return currentIndex;
        if (shuffle) {
          if (items.length === 1) return 0;
          let next = currentIndex;
          while (next === currentIndex) {
            next = Math.floor(Math.random() * items.length);
          }
          return next;
        }
        if (currentIndex + 1 < items.length) return currentIndex + 1;
        if (repeat === "all") return 0;
        return null;
      },

      previousIndex() {
        const { items, currentIndex } = get();
        if (items.length === 0) return null;
        if (currentIndex - 1 >= 0) return currentIndex - 1;
        return 0;
      },

      toggleShuffle() {
        set((s) => ({ shuffle: !s.shuffle }));
      },

      cycleRepeat() {
        set((s) => ({
          repeat:
            s.repeat === "off" ? "all" : s.repeat === "all" ? "one" : "off",
        }));
      },

      openPanel() {
        set({ isQueuePanelOpen: true });
      },
      closePanel() {
        set({ isQueuePanelOpen: false });
      },
      toggleQueuePanel() {
        set((s) => ({ isQueuePanelOpen: !s.isQueuePanelOpen }));
      },
    }),
    {
      name: "unitune.queue",
      partialize: (s) => ({
        shuffle: s.shuffle,
        repeat: s.repeat,
      }),
    },
  ),
);
