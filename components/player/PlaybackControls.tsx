"use client";

import { useTranslations } from "next-intl";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/cn";
import { usePlayer } from "@/lib/hooks/usePlayer";
import { useQueueStore } from "@/stores/queue";

export function PlaybackControls() {
  const { isPlaying, playPause, next, previous, currentTrack } = usePlayer();
  const t = useTranslations("player");
  const shuffle = useQueueStore((s) => s.shuffle);
  const repeat = useQueueStore((s) => s.repeat);
  const toggleShuffle = useQueueStore((s) => s.toggleShuffle);
  const cycleRepeat = useQueueStore((s) => s.cycleRepeat);

  const disabled = !currentTrack;
  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;

  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={t("shuffle")}
            aria-pressed={shuffle}
            onClick={toggleShuffle}
            className={cn(
              shuffle &&
                "text-[color:var(--color-brand-spotify)] hover:text-[color:var(--color-brand-spotify)]",
            )}
          >
            <Shuffle />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("shuffle")}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={t("previous")}
            onClick={previous}
            disabled={disabled}
          >
            <SkipBack />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("previous")}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="default"
            className="rounded-full bg-foreground text-background hover:bg-foreground/90"
            aria-label={isPlaying ? t("pause") : t("play")}
            onClick={playPause}
            disabled={disabled}
          >
            {isPlaying ? <Pause /> : <Play />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isPlaying ? t("pause") : t("play")}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={t("next")}
            onClick={next}
            disabled={disabled}
          >
            <SkipForward />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("next")}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={repeat === "one" ? t("repeatOne") : t("repeat")}
            aria-pressed={repeat !== "off"}
            onClick={cycleRepeat}
            className={cn(
              repeat !== "off" &&
                "text-[color:var(--color-brand-spotify)] hover:text-[color:var(--color-brand-spotify)]",
            )}
          >
            <RepeatIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {repeat === "one" ? t("repeatOne") : t("repeat")}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
