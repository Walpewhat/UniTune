"use client";

import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { usePlayer } from "@/lib/hooks/usePlayer";
import { formatDuration } from "@/lib/utils/format";

export function ProgressBar() {
  const { positionMs, durationMs, seek, currentTrack } = usePlayer();
  const [isScrubbing, setScrubbing] = React.useState(false);
  const [scrubValue, setScrubValue] = React.useState(0);

  const duration = durationMs || currentTrack?.durationMs || 0;
  const displayValue = isScrubbing ? scrubValue : positionMs;

  return (
    <div className="flex items-center gap-2 text-[11px] text-muted-foreground w-full">
      <span className="tabular-nums w-10 text-right">
        {formatDuration(displayValue)}
      </span>
      <Slider
        value={[displayValue]}
        min={0}
        max={Math.max(1, duration)}
        step={1000}
        aria-label="Progress"
        disabled={!currentTrack}
        onValueChange={(v) => {
          setScrubbing(true);
          setScrubValue(v[0] ?? 0);
        }}
        onValueCommit={(v) => {
          setScrubbing(false);
          void seek(v[0] ?? 0);
        }}
        className="flex-1"
      />
      <span className="tabular-nums w-10">{formatDuration(duration)}</span>
    </div>
  );
}
