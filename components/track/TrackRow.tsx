"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Pause, MoreHorizontal, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProviderBadge } from "./ProviderBadge";
import { formatDuration, joinArtists } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { UnifiedTrack } from "@/types/track";
import { usePlayer } from "@/lib/hooks/usePlayer";
import { useQueueStore } from "@/stores/queue";
import { useTranslations } from "next-intl";

interface TrackRowProps {
  track: UnifiedTrack;
  index?: number;
  showAlbum?: boolean;
  showCover?: boolean;
}

export function TrackRow({
  track,
  index,
  showAlbum = true,
  showCover = true,
}: TrackRowProps) {
  const t = useTranslations("track");
  const { playTrack, currentTrack, isPlaying, playPause } = usePlayer();
  const enqueue = useQueueStore((s) => s.enqueue);
  const enqueueNext = useQueueStore((s) => s.enqueueNext);

  const isCurrent = currentTrack?.uid === track.uid;
  const active = isCurrent && isPlaying;

  const onPlay = () => {
    if (isCurrent) {
      playPause();
    } else {
      playTrack(track);
    }
  };

  return (
    <div
      className={cn(
        "group grid grid-cols-[32px_1fr_auto_32px] sm:grid-cols-[32px_48px_1fr_1fr_auto_32px] items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent/50",
        !track.playable && "opacity-60",
      )}
    >
      <div className="grid place-items-center text-xs text-muted-foreground tabular-nums">
        <span className="group-hover:hidden">
          {typeof index === "number" ? index + 1 : ""}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onPlay}
          className="hidden group-hover:inline-flex"
          aria-label={active ? "Pause" : "Play"}
        >
          {active ? <Pause /> : <Play />}
        </Button>
      </div>

      {showCover && (
        <div className="relative hidden size-12 shrink-0 overflow-hidden rounded bg-muted sm:block">
          {track.coverUrl ? (
            <Image
              src={track.coverUrl}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground">
              <Music2 className="size-5" />
            </div>
          )}
        </div>
      )}

      <div className="min-w-0">
        <div
          className={cn(
            "truncate text-sm font-medium",
            active && "text-[color:var(--color-brand-spotify)]",
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

      {showAlbum && (
        <div className="hidden min-w-0 text-sm text-muted-foreground sm:block">
          {track.album ? (
            <Link
              href={`/album/${track.provider}/${track.album.id}`}
              className="truncate hover:underline"
            >
              {track.album.name}
            </Link>
          ) : (
            <span className="truncate">—</span>
          )}
        </div>
      )}

      <span className="text-xs tabular-nums text-muted-foreground">
        {formatDuration(track.durationMs)}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="More"
            className="opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => enqueueNext(track)}>
            {t("playNext")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => enqueue(track)}>
            {t("addToQueue")}
          </DropdownMenuItem>
          {track.permalinkUrl && (
            <DropdownMenuItem asChild>
              <a
                href={track.permalinkUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("openInProvider", {
                  provider: track.provider === "spotify" ? "Spotify" : "SoundCloud",
                })}
              </a>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
