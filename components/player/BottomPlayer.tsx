"use client";

import { NowPlaying } from "./NowPlaying";
import { PlaybackControls } from "./PlaybackControls";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";
import { useMediaSession } from "@/lib/hooks/useMediaSession";

export function BottomPlayer() {
  useMediaSession();

  return (
    <footer
      aria-label="Player"
      className="sticky bottom-0 left-0 right-0 z-40 border-t bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/70"
    >
      <div className="mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-2 h-[88px]">
        <NowPlaying />
        <div className="flex flex-col items-center gap-1.5 min-w-[420px] w-full max-w-xl">
          <PlaybackControls />
          <ProgressBar />
        </div>
        <div className="flex items-center justify-end">
          <VolumeControl />
        </div>
      </div>
    </footer>
  );
}
