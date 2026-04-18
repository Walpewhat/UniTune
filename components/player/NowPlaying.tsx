"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Music2 } from "lucide-react";
import { usePlayer } from "@/lib/hooks/usePlayer";
import { joinArtists } from "@/lib/utils/format";
import { ProviderBadge } from "@/components/track/ProviderBadge";

export function NowPlaying() {
  const t = useTranslations("player");
  const { currentTrack } = usePlayer();

  if (!currentTrack) {
    return (
      <div className="flex items-center gap-3 min-w-0 w-64">
        <div className="h-12 w-12 rounded-md bg-muted grid place-items-center text-muted-foreground">
          <Music2 className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{t("nothingPlaying")}</p>
          <p className="text-xs text-muted-foreground truncate">
            {t("connectToPlay")}
          </p>
        </div>
      </div>
    );
  }

  const cover = currentTrack.coverUrl;
  const href = currentTrack.album
    ? `/album/${currentTrack.provider}/${currentTrack.album.id}`
    : "#";

  return (
    <div className="flex items-center gap-3 min-w-0 w-72">
      <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted shrink-0">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-muted-foreground">
            <Music2 className="size-5" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Link
          href={href}
          className="block text-sm font-medium truncate hover:underline"
        >
          {currentTrack.title}
        </Link>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
          <ProviderBadge provider={currentTrack.provider} />
          <span className="truncate">
            {joinArtists(currentTrack.artists.map((a) => a.name))}
          </span>
        </p>
      </div>
    </div>
  );
}
