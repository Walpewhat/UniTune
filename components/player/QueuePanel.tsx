"use client";

import { useTranslations } from "next-intl";
import { X, GripVertical, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useQueueStore } from "@/stores/queue";
import { usePlayer } from "@/lib/hooks/usePlayer";
import { ProviderBadge } from "@/components/track/ProviderBadge";
import { formatDuration, joinArtists } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function QueuePanel() {
  const t = useTranslations("queue");
  const open = useQueueStore((s) => s.isQueuePanelOpen);
  const setOpen = useQueueStore((s) => s.closePanel);
  const items = useQueueStore((s) => s.items);
  const currentIndex = useQueueStore((s) => s.currentIndex);
  const removeAt = useQueueStore((s) => s.removeAt);
  const clear = useQueueStore((s) => s.clear);
  const { playTrack } = usePlayer();

  const current = currentIndex >= 0 ? items[currentIndex] : undefined;
  const upNext = items.slice(currentIndex + 1);

  return (
    <Sheet open={open} onOpenChange={(v) => (v ? null : setOpen())}>
      <SheetContent side="right" className="w-[400px] sm:w-[480px] p-0">
        <SheetHeader className="px-6 py-4 flex-row items-center justify-between border-b">
          <SheetTitle>{t("title")}</SheetTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              disabled={items.length === 0}
            >
              <Trash2 className="mr-1 size-3.5" />
              {t("clear")}
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={setOpen}>
              <X />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100dvh-72px)]">
          <div className="px-3 py-2">
            {current && (
              <>
                <div className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("nowPlaying")}
                </div>
                <QueueRow
                  track={current}
                  active
                  index={currentIndex}
                  onPlay={() => playTrack(current)}
                  onRemove={() => removeAt(currentIndex)}
                />
                <Separator className="my-2" />
              </>
            )}

            <div className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("upNext")}
            </div>
            {upNext.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">
                {t("empty")}
              </p>
            ) : (
              upNext.map((tr, i) => {
                const absIdx = currentIndex + 1 + i;
                return (
                  <QueueRow
                    key={`${tr.uid}-${absIdx}`}
                    track={tr}
                    index={absIdx}
                    onPlay={() => playTrack(tr)}
                    onRemove={() => removeAt(absIdx)}
                  />
                );
              })
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function QueueRow({
  track,
  active = false,
  onPlay,
  onRemove,
}: {
  track: import("@/types/track").UnifiedTrack;
  active?: boolean;
  index: number;
  onPlay: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={cn(
        "group flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/60 cursor-pointer",
        active && "bg-accent/50",
      )}
      onDoubleClick={onPlay}
    >
      <GripVertical className="size-4 text-muted-foreground/60 opacity-0 group-hover:opacity-100" />
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "truncate text-sm",
            active && "text-[color:var(--color-brand-spotify)] font-medium",
          )}
        >
          {track.title}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ProviderBadge provider={track.provider} />
          <span className="truncate">
            {joinArtists(track.artists.map((a) => a.name))}
          </span>
        </div>
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">
        {formatDuration(track.durationMs)}
      </span>
      <Button
        size="icon-sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label="Remove"
        className="opacity-0 group-hover:opacity-100"
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}
