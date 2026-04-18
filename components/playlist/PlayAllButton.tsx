"use client";

import { Play, Shuffle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/lib/hooks/usePlayer";
import { useQueueStore } from "@/stores/queue";
import type { UnifiedTrack } from "@/types/track";

export function PlayAllButton({ tracks }: { tracks: UnifiedTrack[] }) {
  const t = useTranslations("player");
  const { playQueue } = usePlayer();
  const toggleShuffle = useQueueStore((s) => s.toggleShuffle);

  const onPlay = () => {
    if (tracks.length === 0) return;
    playQueue(tracks, 0);
  };

  const onShuffle = () => {
    if (tracks.length === 0) return;
    toggleShuffle();
    const start = Math.floor(Math.random() * tracks.length);
    playQueue(tracks, start);
  };

  return (
    <div className="flex items-center gap-2 pt-2">
      <Button onClick={onPlay} disabled={tracks.length === 0}>
        <Play className="mr-1.5 size-4" />
        {t("play")}
      </Button>
      <Button
        variant="outline"
        onClick={onShuffle}
        disabled={tracks.length === 0}
      >
        <Shuffle className="mr-1.5 size-4" />
        {t("shuffle")}
      </Button>
    </div>
  );
}
