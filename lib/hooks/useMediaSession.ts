"use client";

import * as React from "react";
import { usePlayerStore } from "@/stores/player";
import { getPlayerController } from "@/lib/player/controller";

export function useMediaSession() {
  const track = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  React.useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator))
      return;
    if (!track) {
      navigator.mediaSession.metadata = null;
      return;
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artists.map((a) => a.name).join(", "),
      album: track.album?.name ?? "",
      artwork: track.coverUrl
        ? [{ src: track.coverUrl, sizes: "512x512", type: "image/jpeg" }]
        : [],
    });
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [track, isPlaying]);

  React.useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator))
      return;
    const ctrl = getPlayerController();
    navigator.mediaSession.setActionHandler("play", () => ctrl.play());
    navigator.mediaSession.setActionHandler("pause", () => ctrl.pause());
    navigator.mediaSession.setActionHandler("nexttrack", () => ctrl.next());
    navigator.mediaSession.setActionHandler("previoustrack", () =>
      ctrl.previous(),
    );
    navigator.mediaSession.setActionHandler("seekto", (d) => {
      if (typeof d.seekTime === "number") void ctrl.seek(d.seekTime * 1000);
    });
    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
      navigator.mediaSession.setActionHandler("seekto", null);
    };
  }, []);
}
