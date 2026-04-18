"use client";

import * as React from "react";
import { usePlayerStore } from "@/stores/player";
import { useQueueStore } from "@/stores/queue";
import { getPlayerController } from "@/lib/player/controller";
import type { UnifiedTrack } from "@/types/track";

export function usePlayer() {
  const snapshot = usePlayerStore();
  const controller = React.useMemo(() => getPlayerController(), []);

  const playTrack = React.useCallback(
    (track: UnifiedTrack) => controller.playTrack(track),
    [controller],
  );
  const playQueue = React.useCallback(
    (items: UnifiedTrack[], startIndex?: number) =>
      controller.playQueue(items, startIndex),
    [controller],
  );

  const playPause = React.useCallback(() => {
    if (snapshot.isPlaying) return controller.pause();
    return controller.play();
  }, [controller, snapshot.isPlaying]);

  const next = React.useCallback(() => controller.next(), [controller]);
  const previous = React.useCallback(
    () => controller.previous(),
    [controller],
  );
  const seek = React.useCallback(
    (ms: number) => controller.seek(ms),
    [controller],
  );
  const setVolume = React.useCallback(
    (v: number) => controller.setVolume(v),
    [controller],
  );
  const toggleMute = React.useCallback(
    () => controller.toggleMute(),
    [controller],
  );

  return {
    ...snapshot,
    playTrack,
    playQueue,
    playPause,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
  };
}

export function useQueue() {
  return useQueueStore();
}
