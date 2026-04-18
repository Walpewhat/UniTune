"use client";

import { useTranslations } from "next-intl";
import { Volume2, VolumeX, Volume1, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePlayer } from "@/lib/hooks/usePlayer";
import { useQueueStore } from "@/stores/queue";

export function VolumeControl() {
  const t = useTranslations("player");
  const { volume, muted, setVolume, toggleMute } = usePlayer();
  const toggleQueue = useQueueStore((s) => s.toggleQueuePanel);

  const Icon = muted ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleQueue}
            aria-label={t("queue")}
          >
            <ListMusic />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("queue")}</TooltipContent>
      </Tooltip>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleMute}
            aria-label={muted ? t("unmute") : t("mute")}
          >
            <Icon />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" className="w-64" align="end">
          <div className="flex items-center gap-3">
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <Slider
              value={[muted ? 0 : volume * 100]}
              min={0}
              max={100}
              step={1}
              aria-label={t("volume")}
              onValueChange={(v) => setVolume((v[0] ?? 0) / 100)}
              className="flex-1"
            />
            <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
              {Math.round((muted ? 0 : volume) * 100)}
            </span>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
