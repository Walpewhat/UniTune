"use client";

import { TrackRow } from "./TrackRow";
import type { UnifiedTrack } from "@/types/track";

export function TrackList({
  tracks,
  showAlbum = true,
  showCover = true,
}: {
  tracks: UnifiedTrack[];
  showAlbum?: boolean;
  showCover?: boolean;
}) {
  if (tracks.length === 0) return null;
  return (
    <div className="flex flex-col gap-0.5">
      {tracks.map((t, i) => (
        <TrackRow
          key={t.uid}
          track={t}
          index={i}
          showAlbum={showAlbum}
          showCover={showCover}
        />
      ))}
    </div>
  );
}
